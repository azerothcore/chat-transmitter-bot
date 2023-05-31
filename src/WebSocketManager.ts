import { Config } from "./Config";
import { IpBan } from "./entity/IpBan";
import { EDatabase } from "./entity/Query";
import { IEvent } from "./controller/Event";
import { WebSocketWrapper } from "./WebSocketWrapper";
import { WebSocketServerWrapper } from "./WebSocketServerWrapper";

import { ChatController } from "./controller/ChatController";
import { QueryController } from "./controller/QueryController";
import { ElunaController } from "./controller/ElunaController";
import { CommandController } from "./controller/CommandController";
import { AnticheatController } from "./controller/AnticheatController";

export class WebSocketManager {
	public static instance: WebSocketManager;

	private config: Config;
	private connection: WebSocketWrapper | null;

	public constructor(config: Config) {
		WebSocketManager.instance = this;
		this.config = config;
	}

	public run(): void {
		const keyInvalidCharacters = ["&", "#", "\""];
		for (const char of keyInvalidCharacters) {
			if (this.config.secretKey.includes(char)) {
				throw new Error(`"secretKey" configuration field contains invalid character '${char}'`);
			}
		}

		const wss = new WebSocketServerWrapper({
			host: "0.0.0.0",
			port: this.config.wsPort,
			maxPayload: 50 * 1024 * 1024, // 50 MB
		}, () => {
			console.log(`WebSocket server is listening on 0.0.0.0:${this.config.wsPort}.`);
		});

		const controllers = [ChatController, CommandController, QueryController, AnticheatController, ElunaController].map(controller => new controller());
		const handlers: { [key: string]: (data) => void } = {};
		for (const controller of controllers) {
			const events: IEvent[] = Reflect.getMetadata("events", controller.constructor);

			if (events) {
				for (const event of events) {
					handlers[event.eventName] = (data) => controller[event.methodName](data);
				}
			}
		}

		wss.onConnection(async (ws, connData) => {
			if (!connData) {
				return;
			}
			const ipBan = await IpBan.find(ws.remoteAddress);
			if (ipBan?.banned) {
				ws.close(4001, "Access denied");
				return;
			}

			if (connData.key === undefined || (connData.key as string) !== this.config.secretKey) {
				ws.close(4000, "Incorrect key");
				IpBan.addConnectionAttempt(ws.remoteAddress);
				return;
			}

			this.connection = ws;
			console.log("Accepted WebSocket connection from " + ws.remoteAddress);

			ws.on("message", (name: string, data) => {
				handlers[name]?.(data);
			});
			ws.on("close", () => {
				this.connection = null;
			});
		});
	}

	public sendCommand(id: string, command: string): boolean {
		if (!this.connection) {
			return false;
		}

		this.connection.send("command", {
			id,
			command,
		});
		return true;
	}

	public sendQuery(id: string, query: string, database: EDatabase): boolean {
		if (!this.connection) {
			return false;
		}

		this.connection.send("query", {
			id,
			query,
			database,
		});
		return true;
	}
}
