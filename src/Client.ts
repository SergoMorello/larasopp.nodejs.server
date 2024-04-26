import WebSocket from "ws";
import Http from "./Http";
import { v4 as uuidv4 } from "uuid";
import type { TChannelAccess, TChannelsData } from "./types";
import Core from "./Core";

class Client extends Core {
	private readonly ws: WebSocket;
	public readonly socketId: string;
	private http: Http;
	private presenceChannels: TChannelsData;

	constructor(ws: WebSocket) {
		super();
		this.ws = ws;
		this.presenceChannels = {};
		this.socketId = uuidv4();
		this.http = new Http(this.socketId);
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

	public getPresenceChannelData(channel: string) {
		return this.presenceChannels[channel];
	}

	public getPresenceChannels() {
		return Object.entries(this.presenceChannels);
	}

	public trigger(channel: string, event: string, message: string | object, access: TChannelAccess = 'public') {
		if (access !== 'private') {
			this.send({
				channel,
				event,
				message
			});
		}
		if (access === 'public' || access === 'private') {
			this.http.trigger(channel, event, message);
		}
	}

	public async auth(channel: string) {
		const result = await this.http.auth(channel);
		this.presenceChannels[channel] = result;
		return result ? true : false;
	}
}

export default Client;