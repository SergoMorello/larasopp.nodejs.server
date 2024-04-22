import WebSocket from "ws";
import axios from "axios";

type TChannels = {
	[name: string]: WebSocket[];
};

type TConfig = {
	token: string;
	port: number;
	controllPort: number;
	appHost: string;
};

type TChannelAccess = 'private' | 'public' | 'protected';

class App {
	private wss: WebSocket.Server;
	private channels: TChannels;
	private token?: string;
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
	
		this.wss.on('connection', (ws, request) => {
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

			this.token = new URLSearchParams(request.url ?? '').get('/token')?.toString();

			console.log('new client');
			ws.on('close', () => {
				console.log('client leave');
				Object.keys(this.channels).forEach((channel) => {
					this.unsubscribe(channel, ws);
				});
			});

			ws.on('message', (val) => {
				const message = val.toString();
				const data = JSON.parse(message);

				if (data.subscribe) this.subscribe(data.subscribe, ws);

				if (data.unsubscribe) this.unsubscribe(data.unsubscribe, ws);

				if (data.channel && data.event && data.message && data.type) this.message(data.channel, message, data.type, ws);
			});
		});

	}

	private async authChannel(channel: string) {

		try {
			const result = await axios.post(this.config.appHost + '/broadcasting/auth', {
				channel
			},{
				headers: {
					"Content-Type": "application/json"
				}
			});
			return result.data.success ?? false;
		}catch(e) {
			return false;
		}
		
	}

	private async subscribe(channel: string, socket: WebSocket) {
		if (!(await this.authChannel(channel))) return;
		if (!this.channels[channel]) {
			this.channels[channel] = [];
		}
		if (!this.hasChannelClient(channel, socket)) {
			this.channels[channel].push(socket);
		}
	}

	private unsubscribe(channel: string, socket: WebSocket) {
		if (this.channels[channel]) {
			this.channels[channel] = this.channels[channel].filter((client) => client !== socket);
		}
	}

	private message(channel: string, message: string, access: TChannelAccess, socket: WebSocket) {
		if (this.channels[channel] && this.hasChannelClient(channel, socket)) {
			if (access === 'public' || access === 'protected') {
				this.channels[channel].forEach((client) => {
					client.send(message);
				});
			}
		}
	}

	private hasChannelClient(channel: string, socket: WebSocket) {
		return this.channels[channel].includes(socket);
	}

};

export default App;