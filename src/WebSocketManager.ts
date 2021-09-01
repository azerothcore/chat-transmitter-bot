import { Config } from "./Config";
import { IpBan } from "./entity/IpBan";
import { IEvent } from "./controller/Event";
import { ChatController } from "./controller/ChatController";
import { CommandController } from "./controller/CommandController";
import { WebSocketWrapper } from "./WebSocketWrapper";
import { WebSocketServerWrapper } from "./WebSocketServerWrapper";

export class WebSocketManager {
	public static instance: WebSocketManager;

	private connection: WebSocketWrapper;

	public constructor() {
		WebSocketManager.instance = this;
	}

	public start(config: Config): void {
		const keyInvalidCharacters = ["&", "#", "\""];
		for (const char of keyInvalidCharacters) {
			if (config.secretKey.includes(char)) {
				throw new Error(`"secretKey" configuration field contains invalid character '${char}'`);
			}
		}

		const wss = new WebSocketServerWrapper({
			host: "0.0.0.0",
			port: config.listenPort,
		}, () => {
			console.log(`WebSocket server is listening on 0.0.0.0:${config.listenPort}.`);
		});

		const controllers = [ChatController, CommandController].map(controller => new controller());
		const handlers: { [key: string]: (data: any) => void } = { };
		for (const controller of controllers) {
			const events: IEvent[] = Reflect.getMetadata("events", controller.constructor);

			if (events) {
				for (const event of events) {
					handlers[event.eventName] = (data: any) => controller[event.methodName](data);
				}
			}
		}

		wss.onConnection(async (ws, connData) => {
			const ipBan = await IpBan.find(ws.remoteAddress);
			if (ipBan?.banned) {
				ws.close(4001, "Access denied");
				return;
			}

			if (connData.key === undefined || (connData.key as string) !== config.secretKey) {
				ws.close(4000, "Incorrect key");
				IpBan.addConnectionAttempt(ws.remoteAddress);
				return;
			}

			this.connection = ws;

			ws.on("message", (name: string, data: any) => {
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
};
