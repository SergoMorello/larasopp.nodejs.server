import type Client from "./Client";
export type TChannels = {
	[name: string]: Client[];
};

export type TConfig = {
	token: string;
	port: number;
	controllPort: number;
	appHost: string;
};

export type TChannelAccess = 'private' | 'public' | 'protected';