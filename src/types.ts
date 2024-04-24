import type Client from "./Client";
export type TChannels = {
	[name: string]: Client[];
};

export type TConfig = {
	key: string;
	host?: string;
	port: number;
	appHost: string;
	debug?: boolean;
	log?: boolean;
	logPath?: string;
};

export type TChannelAccess = 'private' | 'public' | 'protected';