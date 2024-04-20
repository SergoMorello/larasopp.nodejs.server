import WebSocket from "ws";
import axios from "axios";

type TChannels = {
	[name: string]: WebSocket[];
};

type TChannelAccess = 'private' | 'public' | 'protected';

class App {
	private wss: WebSocket.Server;
	private channels: TChannels;
	private token?: string;
	
	constructor() {
		this.channels = {};
		this.wss = new WebSocket.Server({
			port: 3001
		});
	
		this.wss.on('connection', (ws, request) => {
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
			const result = await axios.post('http://127.0.0.1:8000/broadcasting/auth', {
				channel
			},{
				headers: {
					"Content-Type": "application/json"
				}
			});
			console.log(result.data)
		}catch(e) {
			console.error(e);
		}
		
	}

	private subscribe(channel: string, socket: WebSocket) {
		this.authChannel(channel);
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