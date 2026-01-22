import Channel from "./Channel";

class Channels {
	private channels = new Map<string, Channel>();

	public getChannels() {
		return this.channels;
	}

	public getChannel(name: string) {
		const channel = this.channels.get(name);

		if (!channel) {
			const newChannel = new Channel(name);
			this.channels.set(name, newChannel);
			return newChannel;
		}

		return channel;
	}
}

const channels = new Channels;

export default channels;