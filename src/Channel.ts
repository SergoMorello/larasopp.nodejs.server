import Client from "./Client";
import Core from "./Core";
import { TChannelAccess } from "./types";

class Channel extends Core {
	private name: string;
	private type: TChannelAccess = 'public';
	private clients: Set<Client>;

	constructor(name: string) {
		super();
		this.name = name;
		this.clients = new Set();
	}
	
	public get isPrivate() {
		return this.type === 'private';
	}

	public getType() {
		return this.type;
	}

	public getClients() {
		return this.clients;
	}

	public async makePrivate() {
		if (this.type === 'public') {
			for(const client of this.clients) {
				if (!await client.auth(this.name)) {
					this.clients.delete(client);
				}
			}
		}
		this.type = 'private';
	}

	public async subscribe(client: Client) {
		if (this.isPrivate) {
			if (!await client.auth(this.name)) return;
		}

		if (this.hasClient(client)) return;
		
		const here = Array.from(this.clients, c => c.getUser());
		client.trigger(this.name, '__HERE', here, 'protected');
		
		this.clients.add(client);

		this.message('__JOIN', client.getUser(), 'protected', client);
		this.log.debug(`client subscribe: ${client.socketId}`);
	}

	public unsubscribe(client: Client) {

		if (!this.clients.delete(client)) return;
		
		this.clients.forEach((channelClient) => channelClient.trigger(this.name, '__LEAVE', client.getUser(), 'protected'));
		
		this.log.debug(`client unsubscribe: ${client.socketId}`);
	}

	public message(event: string, message: object, access: TChannelAccess, client: Client) {
		if (this.hasClient(client)) {
			if (access === 'public' || access === 'protected') {
				this.clients.forEach((channelClient) => {
					if (channelClient.socketId !== client.socketId) channelClient.trigger(this.name, event, message, 'protected');
				});
			}
			if (access === 'public' || access === 'private') {
				client.trigger(this.name, event, message, access);
			}
		}
	}

	public hasClient(client: Client) {
		return this.clients.has(client);
	}
};

export default Channel;