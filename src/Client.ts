import WebSocket from "ws";
import Http from "./Http";
import { v4 as uuidv4 } from "uuid";
import type Config from "./Config";

class Client {
	private readonly ws: WebSocket;
	public readonly socketId: string;
	private http: Http;

	constructor(ws: WebSocket, config: Config) {
		this.ws = ws;
		this.socketId = uuidv4();
		this.http = new Http(config, this.socketId);
		this.send({
			socket_id: this.socketId
		});
	}

	public send(message: string | object) {
		try {
			const sendMessage = typeof message === 'string' ? message : JSON.stringify(message);
			this.ws.send(sendMessage);
		}catch(e){}
	}

	public setToken(token: string) {
		this.http.setToken(token);
	}

	public async trigger(channel: string, event: string, message: unknown) {
		return await this.http.trigger(channel, event, message);
	}

	public async check(channel: string) {
		return await this.http.check(channel);
	}
}

export default Client;