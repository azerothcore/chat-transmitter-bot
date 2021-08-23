import { Config } from "./Config";
import { IpBan } from "./entity/IpBan";
import { ChatController } from "./controller/ChatController";
import { WebSocketServerWrapper } from "./WebSocketServerWrapper";

export function start(config: Config): void {
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

	const chatController = new ChatController();

	wss.onConnection(async (ws, data) => {
		const ipBan = await IpBan.find(ws.remoteAddress);
		if (ipBan?.banned) {
			ws.close(4001, "Access denied");
			return;
		}

		if (data.key === undefined || (data.key as string) !== config.secretKey) {
			ws.close(4000, "Incorrect key");
			IpBan.addConnectionAttempt(ws.remoteAddress);
			return;
		}

		ws.on("message", (message, data) => {
			if (message === "localChat") {
				chatController.localChat(data);
			} else if (message === "channelChat") {
				chatController.channelChat(data);
			}
		});
	});
}
