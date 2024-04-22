import WebSocket from "ws";
import Client from "./Client";
import type {
	TConfig,
	TChannelAccess,
	TChannels
} from "./types";

class App {
	private wss: WebSocket.Server;
	private channels: TChannels;
	private config: TConfig;
	
	constructor() {
		this.channels = {};
		this.config = {
			appHost: 'http://127.0.0.1:8000',
			token: '1234',
			port: 3001,
			controllPort: 8123
		};

		this.wss = new WebSocket.Server({
			port: this.config.port
		});
		
		this.run();
	}

	private run() {

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

			console.log('new client');
			ws.on('close', () => {
				console.log('client leave');
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

export default App;