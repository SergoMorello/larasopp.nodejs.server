import axios from "axios";
import type Config from "./Config";

class Http {
	private readonly config: Config;
	private token?: string;
	private readonly socketId: string;

	constructor(config: Config, socketId: string) {
		this.config = config;
		this.socketId = socketId;
	}

	public async request(path: string, data: unknown) {
		try {
			const result = await axios.post(this.config.appHost + '/broadcasting/' + path, data ,{
				headers: {
					'Content-Type': 'application/json',
					'X-Socket-ID': this.socketId,
					'Controll-Token': this.config.key,
					'Authorization': 'Bearer ' + this.token
				}
			});
			return result.data;
		}catch(e) {}
	}

	public async trigger(channel: string, event: string, message: unknown) {
		return await this.request('trigger', {
			channel,
			event,
			message
		});
	}

	public async check(channel: string) {
		return (await this.request('auth', {
			channel
		}))?.success ?? false;
	}

	public setToken(token: string) {
		this.token = token;
	}

}

export default Http;