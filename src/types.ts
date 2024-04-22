import type WebSocket from "ws";
export type TChannels = {
	[name: string]: WebSocket[];
};

export type TConfig = {
	token: string;
	port: number;
	controllPort: number;
	appHost: string;
};

export type TChannelAccess = 'private' | 'public' | 'protected';