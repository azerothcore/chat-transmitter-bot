import { nanoid } from "nanoid";

import { Event } from "./Event";
import { EDatabase } from "../entity/Query";
import { WebSocketManager } from "../WebSocketManager";

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
	private callbacks: { [key: string]: (result: IQueryResult) => void };

	public constructor() {
		QueryController.instance = this;
		this.callbacks = {};
	}

	public runQuery(query: string, database: EDatabase, cb: (result: IQueryResult) => void): string | false {
		const id = nanoid();
		if (!WebSocketManager.instance.sendQuery(id, query, database)) {
			return false;
		}
		this.callbacks[id] = cb;
		return id;
	}

	@Event("queryResult")
	public queryResult(result: IQueryResult): void {
		if (!(result.queryId in this.callbacks)) {
			return;
		}

		const cb = this.callbacks[result.queryId];
		cb(result);
		delete this.callbacks[result.queryId];
	}
}
