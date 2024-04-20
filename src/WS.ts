import WebSocket from "ws";

type TWSConfig = {
	port: number;
	host?: string;
};

class WS {
	private wss: WebSocket.Server;
	private ws?: WebSocket;

	constructor({port = 3000, host}: TWSConfig) {
		this.wss = new WebSocket.Server({
			port,
			host
		});
		
	}


}

export default WS;