import { Bot } from "../Bot";
import { Event } from "./Event";

export class ChatController {
	@Event("localChat")
	public localChat(data): void {
		Bot.instance.onLocalChat(data);
	}

	@Event("channelChat")
	public channelChat(data): void {
		Bot.instance.onChannelChat(data);
	}
}
