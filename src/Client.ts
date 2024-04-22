import WebSocket from "ws";
import Http from "./Http";
import type { TConfig } from "./types";

class Client {
	private readonly ws: WebSocket;
	private http: Http;

	constructor(ws: WebSocket, config: TConfig) {
		this.ws = ws;
		this.http = new Http(config);
	}

	public send(message: string) {
		this.ws.send(message);
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