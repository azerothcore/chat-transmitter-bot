import WebSocket = require("ws");

export class WebSocketWrapper {
	private ws: WebSocket;
	private address: string;
	private callbacks = {
		"message": [],
		"close": [],
	};

	public constructor(ws: WebSocket, address: string) {
		this.ws = ws;
		this.address = address;
		this.setEvents();
	}

	public on(event: "message" | "close", callback: (event: string, data: any) => void) {
		this.callbacks[event].push(callback);
	}

	public send(message: string, data: any): void {
		this.ws.send(JSON.stringify({
			message,
			data,
		}));
	}

	public close(code?: number, data?: string): void {
		this.ws.close(code, data);
	}

	public get remoteAddress(): string {
		return this.address;
	}

	private setEvents(): void {
		this.ws.on("message", (payload: string) => {
			try {
				const parsed = JSON.parse(payload);
				const { message, data } = parsed;
				for (const cb of this.callbacks["message"]) {
					if (typeof cb === "function") {
						cb(message, data);
					}
				}
			} catch (error) {
				console.error(error);
			}
		});

		this.ws.on("close", (ws: WebSocket) => {
			for (const cb of this.callbacks["close"]) {
				if (typeof cb === "function") {
					cb();
				}
			}
		});
	}
};
