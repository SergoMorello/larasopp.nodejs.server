import WebSocket from "ws";
import Https from "https";
import FS from "fs";
import Core from "./Core";
import Client from "./Client";
import type {
	TChannelAccess,
	TChannels
} from "./types";


class Server extends Core {
	private wss: WebSocket.Server;
	private channels: TChannels;
	
	constructor() {
		super();
		this.channels = {};

		if (this.config.ssl) {
			const server =  Https.createServer({
				cert: this.config.ssl.cert ? FS.readFileSync(this.config.ssl.cert) : undefined,
				key: this.config.ssl.key ? FS.readFileSync(this.config.ssl.key) : undefined,
				ca: this.config.ssl.ca ? FS.readFileSync(this.config.ssl.ca) : undefined
			});
			
			this.wss = new WebSocket.Server({
				host: this.config.host,
				server
			});

			server.listen(this.config.port);
		}else{
			this.wss = new WebSocket.Server({
				port: this.config.port,
				host: this.config.host
			});
		}

		
		this.run();
	}

	private run() {
		this.log.info('Larasopp Server');
		this.log.info('SSL: ' + (this.config.ssl ? true : false));
		this.log.info('Host: ' + (this.config.host ?? '0.0.0.0'));
		this.log.info('Port: ' + this.config.port);
		this.log.info('Api Host: ' + this.config.appHost);

		this.wss.on('listening', () => {
			this.log.info('listening...');
		});

		this.wss.on('connection', (ws, request) => {
			const client = new Client(ws);
			this.log.debug('new client ' + client.socketId);
			this.log.debug('IP ' + request.socket.remoteAddress);

			const key = new URLSearchParams(request.url ?? '').get('/key')?.toString();
			if (key) this.log.debug('try entry with key: ' + key);

			if (key === this.config.key) {
				this.log.debug('auth key: ' + key);
				ws.on('message', (val) => {
					const message = val.toString();
					this.log.debug('command message: ' + message);
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

			ws.on('close', () => {
				this.log.info('leave ' + client.socketId);
				Object.keys(this.channels).forEach((channel) => {
					this.unsubscribe(channel, client);
				});
			});

			ws.on('message', (val) => {
				const message = val.toString();
				const data = JSON.parse(message);
				this.log.debug('client message: ' + message);

				if (data.token) client.setToken(data.token);

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
			this.log.debug('client subscribe: ' + client.socketId);
			this.channels[channel].push(client);
		}
	}

	private unsubscribe(channel: string, client: Client) {
		if (this.channels[channel]) {
			this.log.debug('client unsubscribe: ' + client.socketId);
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