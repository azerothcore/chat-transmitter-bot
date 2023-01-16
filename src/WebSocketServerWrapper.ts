import * as WebSocket from "ws";
import * as queryString from "query-string";

import { WebSocketWrapper } from "./WebSocketWrapper";

type OnConnectionCallback = (ws: WebSocketWrapper, handshakeData?: queryString.ParsedQuery) => void;

export class WebSocketServerWrapper {
	private wss: WebSocket.Server;
	private callbacks: {
		connection: OnConnectionCallback[];
	};

	public constructor(options?: WebSocket.ServerOptions, callback?: () => void) {
		this.callbacks = {
			connection: [],
		};
		this.wss = new WebSocket.Server(options, callback);
		this.setEvents();
	}

	public onConnection(callback: OnConnectionCallback) {
		if (!callback) {
			return;
		}
		this.callbacks.connection.push(callback);
	}

	private setEvents(): void {
		this.wss.on("connection", (ws: WebSocket, request) => {
			if (!request || !request.url || !request.socket) {
				return;
			}

			const query = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
			const data = queryString.parse(query);

			const wsw = new WebSocketWrapper(ws, request.socket.remoteAddress ?? "");
			for (const cb of this.callbacks.connection) {
				if (typeof cb === "function") {
					cb(wsw, data);
				}
			}
		});

		this.wss.on("error", (err) => {
			console.error(err);
		});
	}
}
