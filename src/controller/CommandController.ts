import { Event } from "./Event";

export interface ICommandResult {
	commandId: string;
	output: string;
	success: boolean;
}

export class CommandController {
	public static instance: CommandController;
	private callbacks: ((data) => void)[];

	public constructor() {
		CommandController.instance = this;
		this.callbacks = [];
	}

	public onCommandResult(cb: (data) => void) {
		this.callbacks.push(cb);
	}

	@Event("commandResult")
	public commandResult(data): void {
		for (const cb of this.callbacks) {
			cb?.(data);
		}
	}
}
