import Client from "./Client";

export type TChannelsData = {
	[name: string]: object;
};

export type TConfig = {
	key: string;
	host?: string;
	port: number;
	appHost: string;
	debug?: boolean;
	log?: boolean;
	logPath?: string;
	ssl?: {
		cert: string;
		key: string;
		ca: string;
	};
};


export type TChannelAccess = 'private' | 'public' | 'protected';

export type TChannel = {
	type: TChannelAccess;
	clients: Set<Client>;
};