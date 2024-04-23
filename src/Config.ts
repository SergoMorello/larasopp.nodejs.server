import FS from "fs";
import type { TConfig } from "./types";

class Config {
	private readonly configFile = 'larasopp-server.json';
	private config: TConfig;

	constructor() {
		this.config = {
			appHost: 'http://127.0.0.1:8000',
			token: '',
			port: 3001
		};
		this.readConfig();
	}

	private readConfig() {
		try {
			this.config = JSON.parse(FS.readFileSync(this.configFile, 'utf-8'));
		}catch(e){}
	}

	public get appHost() {
		return this.config.appHost;
	}

	public get host() {
		return this.config.host;
	}

	public get port() {
		return this.config.port;
	}

	public get token() {
		return this.config.token;
	}

	public getConfig(): TConfig {
		return this.config;
	}
}

export default Config;