import { Bot } from "../Bot";
import { Event } from "./Event";

export interface ICommandResult {
	commandId: string;
	output: string;
	success: boolean;
};

export class CommandController {
	@Event("commandResult")
	public commandResult(data: any): void {
		Bot.instance.onCommandResultReceived(data);
	}
};
