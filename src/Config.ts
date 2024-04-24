import FS from "fs";
import type { TConfig } from "./types";

class Config {
	private readonly configFile = 'larasopp-server.json';
	private config: TConfig;

	constructor() {
		this.config = {
			appHost: 'http://127.0.0.1:8000',
			key: '',
			port: 3001,
			debug: false,
			log: false,
			logPath: './'
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

	public get key() {
		return this.config.key;
	}

	public get debug() {
		return this.config.debug;
	}

	public get log() {
		return this.config.log;
	}

	public get logPath() {
		return this.config.logPath;
	}

	public get ssl() {
		return this.config.ssl;
	}

	public getConfig(): TConfig {
		return this.config;
	}
}

export default Config;