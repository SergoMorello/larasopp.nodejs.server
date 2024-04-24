import type Config from "./Config";
import FS from "fs";

class Log {
	private config: Config;

	constructor(config: Config) {
		this.config = config;
	}

	private writeFile(message: string) {
		if (!this.config.log) return;
		try {
			FS.appendFile(this.config.logPath + 'larasopp-server.log', this.message(message) + "\n", err => {
				if (err) console.error(err);
			});
		}catch(e){
			console.error(e);
		}
	}

	private message(message: string) {
		const date = new Date();
		return date.toLocaleString() + "\t" + message;
	}

	public debug(messageData: string | object) {
		if (!this.config.debug) return;
		const message = typeof messageData === 'string' ? messageData : JSON.stringify(messageData);
		console.debug(message);
		this.writeFile(message);
	}

	public info(message: string) {
		console.info(message);
		this.writeFile(message);
	}

	public warn(message: string) {
		console.warn(message);
		this.writeFile(message);
	}

	public error(message: string) {
		console.error(message);
		this.writeFile(message);
	}

}

export default Log;