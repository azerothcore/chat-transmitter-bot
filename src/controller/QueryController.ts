import { Event } from "./Event";

export interface IQueryResult {
	queryId: string;
	data: unknown[];
	columns: string[];
	success: boolean;
	error: string;
	affectedRows: number;
}

export class QueryController {
	public static instance: QueryController;
	private callbacks: ((data) => void)[];

	public constructor() {
		QueryController.instance = this;
		this.callbacks = [];
	}

	public onQueryResult(cb: (data) => void) {
		this.callbacks.push(cb);
	}

	@Event("queryResult")
	public queryResult(data): void {
		for (const cb of this.callbacks) {
			cb?.(data);
		}
	}
}
