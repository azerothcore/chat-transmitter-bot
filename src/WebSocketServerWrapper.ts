import * as queryString from "query-string";
import WebSocket = require("ws");

import { WebSocketWrapper } from "./WebSocketWrapper";

export class WebSocketServerWrapper {
	private wss: WebSocket.Server;
	private callbacks = {
		"connection": [],
	};

	public constructor(options?: WebSocket.ServerOptions, callback?: () => void) {
		this.wss = new WebSocket.Server(options, callback);
		this.setEvents();
	}

	public onConnection(callback: (ws: WebSocketWrapper, handshakeData?: queryString.ParsedQuery) => void) {
		this.callbacks["connection"].push(callback);
	}

	private setEvents(): void {
		this.wss.on("connection", (ws: WebSocket, request) => {
			const query = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
			const data = queryString.parse(query);

			const wsw = new WebSocketWrapper(ws, request.socket.remoteAddress);
			for (const cb of this.callbacks["connection"]) {
				if (typeof cb === "function") {
					cb(wsw, data);
				}
			}
		});
	}
};
