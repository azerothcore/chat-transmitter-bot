import { Bot } from "../Bot";
import { Event } from "./Event";
import { INotification } from "../model/INotification";

export class NotificationController {
	@Event("notification")
	public notification(data: INotification): void {
		Bot.instance.onNotification(data);
	}
}
