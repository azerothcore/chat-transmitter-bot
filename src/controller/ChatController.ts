import { Bot } from "../Bot";
import { Event } from "./Event";

export class ChatController {
	@Event("localChat")
	public localChat(data: any): void {
		Bot.instance.transmitMessage(data);
	}

	@Event("channelChat")
	public channelChat(data: any): void {
		Bot.instance.transmitChannelMessage(data);
	}
};
