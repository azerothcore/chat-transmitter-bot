import { Bot } from "../Bot";
import { Event } from "./Event";
import { IElunaError } from "../model/IElunaError";

export class ElunaController {
	@Event("elunaError")
	public elunaError(data: IElunaError): void {
		Bot.instance.onElunaError(data);
	}
}
