import WebSocket from "ws";
import Client from "./Client";
import Config from "./Config";
import type {
	TChannelAccess,
	TChannels
} from "./types";

class Server {
	private wss: WebSocket.Server;
	private channels: TChannels;
	private config: Config;
	
	constructor() {
		this.channels = {};
		this.config = new Config();

		this.wss = new WebSocket.Server({
			port: this.config.port,
			host: this.config.host
		});
		
		this.run();
	}

	private run() {
		console.log('Larasopp Server');
		console.log('Host: ' + (this.config.host ?? '0.0.0.0'));
		console.log('Port: ' + this.config.port);
		console.log('Api Host: ' + this.config.appHost);

		this.wss.on('listening', () => {
			console.info('listening...');
		});

		this.wss.on('connection', (ws, request) => {
			const client = new Client(ws, this.config);
			const controllToken = new URLSearchParams(request.url ?? '').get('/controll_token')?.toString();
			
			if (controllToken === this.config.token) {
				ws.on('message', (val) => {
					const message = val.toString();
					const data = JSON.parse(message);
					if (data.channel && data.event && data.message) {
						if (this.channels[data.channel]) {
							this.channels[data.channel].forEach((client) => {
								client.send(message);
							});
						}
					}
				});
				return;
			}

			const token = new URLSearchParams(request.url ?? '').get('/token')?.toString();
			if (token) {
				client.setToken(token);
			}

			console.log('join ' + client.socketId);
			ws.on('close', () => {
				console.log('leave ' + client.socketId);
				Object.keys(this.channels).forEach((channel) => {
					this.unsubscribe(channel, client);
				});
			});

			ws.on('message', (val) => {
				const message = val.toString();
				const data = JSON.parse(message);

				if (data.subscribe) this.subscribe(data.subscribe, client);

				if (data.unsubscribe) this.unsubscribe(data.unsubscribe, client);

				if (data.channel && data.event && data.message && data.type) this.message(data.channel, data.event, message, data.type, client);
			});
		});
	}

	private async subscribe(channel: string, client: Client) {
		if (!(await client.check(channel))) return;
		if (!this.channels[channel]) {
			this.channels[channel] = [];
		}
		if (!this.hasChannelClient(channel, client)) {
			this.channels[channel].push(client);
		}
	}

	private unsubscribe(channel: string, client: Client) {
		if (this.channels[channel]) {
			this.channels[channel] = this.channels[channel].filter((currentClient) => currentClient !== client);
		}
	}

	private message(channel: string, event: string, message: string, access: TChannelAccess, client: Client) {
		if (this.channels[channel] && this.hasChannelClient(channel, client)) {
			if (access === 'public' || access === 'protected') {
				this.channels[channel].forEach((client) => {
					client.send(message);
				});
			}
			if (access === 'public' || access === 'private') {
				const data = JSON.parse(message);
				client.trigger(channel, event, data.message);
			}
		}
	}

	private hasChannelClient(channel: string, client: Client) {
		return this.channels[channel].includes(client);
	}

};

export default Server;