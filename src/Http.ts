import axios from "axios";
import type {
	TConfig,
	TChannelAccess,
	TChannels
} from "./types";

class Http {
	private config: TConfig;
	private token?: string;

	constructor(config: TConfig) {
		this.config = config;
	}

	public async request(path: string, data: unknown) {
		try {
			const result = await axios.post(this.config.appHost + '/broadcasting/' + path, data ,{
				headers: {
					'Content-Type': 'application/json',
					'X-Socket-ID': this.config.token,
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
			channel,
			token: this.config.token
		}))?.success ?? false;
	}

	public setToken(token: string) {
		this.token = token;
	}

}

export default Http;