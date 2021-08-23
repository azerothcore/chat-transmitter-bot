import { Bot } from "../Bot";

export class ChatController {
	public localChat(data: any): void {
		Bot.instance.transmitMessage(data);
	}

	public channelChat(data: any): void {
		Bot.instance.transmitChannelMessage(data);
	}
}
