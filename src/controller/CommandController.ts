import { nanoid } from "nanoid";

import { Event } from "./Event";
import { WebSocketManager } from "../WebSocketManager";

export interface ICommandResult {
	commandId: string;
	output: string;
	success: boolean;
}

export class CommandController {
	public static instance: CommandController;

	private callbacks: { [key: string]: (result: ICommandResult) => void };

	public constructor() {
		CommandController.instance = this;
		this.callbacks = {};
	}

	public runCommand(command: string, cb: (result: ICommandResult) => void): string | false {
		const id = nanoid();
		if (!WebSocketManager.instance.sendCommand(id, command)) {
			return false;
		}
		this.callbacks[id] = cb;
		return id;
	}

	@Event("commandResult")
	public commandResult(result: ICommandResult): void {
		if (!(result.commandId in this.callbacks)) {
			return;
		}

		const cb = this.callbacks[result.commandId];
		cb(result);
		delete this.callbacks[result.commandId];
	}
}
