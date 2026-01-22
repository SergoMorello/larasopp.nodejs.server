import axios from "axios";
import Core from "./Core";

type THttpRequestData = {
	socket_id?: string;
	[index: string]: unknown;
};

class Http extends Core {
	private token?: string;
	private readonly socketId: string;

	constructor(socketId: string) {
		super();
		this.socketId = socketId;
	}

	public async request(path: string, data: THttpRequestData) {
		data['socket_id'] = this.socketId;
		this.log.debug('HTTP request');
		this.log.debug('HTTP path: ' + path);
		this.log.debug('HTTP data: ' + JSON.stringify(data));
		try {
			const result = await axios.post(`${this.config.appHost}/broadcasting/${path}`, data ,{
				headers: {
					'Content-Type': 'application/json',
					'X-Socket-ID': this.socketId,
					'Controll-Key': this.config.key,
					'Authorization': `Bearer ${this.token}`
				}
			});
			
			this.log.debug(`HTTP response: ${JSON.stringify(result.data)}`);
			return result.data;
		}catch(e) {
			this.log.debug(`HTTP error: ${JSON.stringify(e)}`);
		}
	}

	public async trigger(channel: string, event: string, message: unknown) {
		return await this.request('trigger', {
			channel,
			event,
			message
		});
	}

	public async userAuth() {
		try {
			return (await this.request('connect', {}));
		}catch(e){}
	}

	public async auth(channel: string) {
		return (await this.request('auth', {
			channel
		}));
	}

	public setToken(token: string) {
		this.token = token;
	}

}

export default Http;