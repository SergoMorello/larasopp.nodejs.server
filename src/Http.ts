import axios from "axios";
import type {
	TConfig,
	TChannelAccess,
	TChannels
} from "./types";

class Http {
	private config;

	constructor(config: TConfig) {
		this.config = config;
	}

	public async request(path: string, data: unknown) {
		try {
			const result = await axios.post(this.config.appHost + '/broadcasting/' + path, data ,{
				headers: {
					'Content-Type': 'application/json',
					'Controll-Token': this.config.token
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

}

export default Http;