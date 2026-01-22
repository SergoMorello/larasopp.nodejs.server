import WebSocket from "ws";
import Https from "https";
import FS from "fs";
import Core from "./Core";
import Client from "./Client";
import channels from "./Channels";


class Server extends Core {
	private wss: WebSocket.Server;
	
	constructor() {
		super();

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
		this.log.info(`SSL: ${(this.config.ssl ? true : false)}`);
		this.log.info(`Host: ${(this.config.host ?? '0.0.0.0')}`);
		this.log.info(`Port: ${this.config.port}`);
		this.log.info(`Api Host: ${this.config.appHost}`);

		this.wss.on('listening', () => {
			this.log.info('listening...');
		});

		this.wss.on('connection', (ws, request) => {
			this.log.debug(`New connect`);
			this.log.debug(`ip: ${request.socket.remoteAddress}`);

			const urlParams = new URLSearchParams(request.url ?? '');
			const key = urlParams.get('/key');
			const token = urlParams.get('/token');
			
			this.connectControll(ws, key);

			this.connectClient(ws, token);

		});
	}

	private connectControll(ws: WebSocket, key: string | null) {
		if (key) this.log.debug(`try entry with key: ${key}`);
		if (key === this.config.key) {
			this.log.debug(`auth key: ${key}`);
			ws.on('message', async (val) => {
				try {
					const message = val.toString();
					this.log.debug(`command message: ${message}`);
					const data = JSON.parse(message);
					if (data.channel && data.event && data.message) {
						const channel = channels.getChannel(data.channel);
						if (data.type === 'private') {
							await channel.makePrivate();
						}
						channel.getClients().forEach((client) => {
							client.send(message);
						});
					}
				}catch(e){
					this.log.error(String(e));
				}
			});
		}
	}

	private async connectClient(ws: WebSocket, token: string | null) {
		if (!token) return;
		
		const client = new Client(ws, token);
		const user = await client.userAuth();

		if (!user) {
			client.error('auth fail');
			client.disconnect();
			this.log.debug(`client auth fail: ${client.socketId}`);
			return;
		};
		this.log.debug(`client id: ${client.socketId}`);

		ws.on('close', () => {
			this.log.debug(`Disconnected: ${client.socketId}`);
			channels.getChannels().forEach((channel) => {
				channel.unsubscribe(client);
			});
		});

		ws.on('message', async (val) => {
			try {
				const message = val.toString();
				const data = JSON.parse(message);
				this.log.debug(`client message: ${message}`);

				if (data.token) client.setToken(data.token);

				if (data.me === true) client.send({
					channel: '__SYSTEM',
					event: 'user',
					message: client.getUser()
				});

				if (data.me === 'refresh') client.send({
					channel: '__SYSTEM',
					event: 'user-refresh',
					message: await client.userAuth()
				});

				if (data.subscribe) this.subscribe(data.subscribe, client);

				if (data.unsubscribe) this.unsubscribe(data.unsubscribe, client);

				if (data.channel && data.event && data.message && data.type) {
					const channel = channels.getChannel(data.channel);
					channel.message(data.event, data.message, data.type, client);
				}
			}catch(e){
				this.log.error(String(e));
			}
		});
	}

	private async subscribe(name: string, client: Client) {
		const channel = channels.getChannel(name);
		await channel.subscribe(client);
	}

	private unsubscribe(name: string, client: Client) {
		const channel = channels.getChannel(name);
		channel.unsubscribe(client);
	}

};

export default Server;