import axios from "axios";
import Core from "./Core";

class Http extends Core {
	private token?: string;
	private readonly socketId: string;

	constructor(socketId: string) {
		super();
		this.socketId = socketId;
	}

	public async request(path: string, data: unknown) {
		this.log.debug('HTTP request');
		this.log.debug('path: ' + path);
		this.log.debug('data: ' + data);
		try {
			const result = await axios.post(this.config.appHost + '/broadcasting/' + path, data ,{
				headers: {
					'Content-Type': 'application/json',
					'X-Socket-ID': this.socketId,
					'Controll-Token': this.config.key,
					'Authorization': 'Bearer ' + this.token
				}
			});
			this.log.debug('HTTP response: ' + result.data);
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