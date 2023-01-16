import * as WebSocket from "ws";

type Callback = (event: string | null, data) => void;

export class WebSocketWrapper {
	private ws: WebSocket;
	private address: string;
	private callbacks: {
		message: Callback[];
		close: Callback[];
	};

	public constructor(ws: WebSocket, address: string) {
		this.ws = ws;
		this.address = address;
		this.callbacks = {
			message: [],
			close: [],
		};
		this.setEvents();
	}

	public on(event: "message" | "close", callback: Callback) {
		this.callbacks[event].push(callback);
	}

	public send(message: string, data): void {
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
				for (const cb of this.callbacks.message) {
					if (typeof cb === "function") {
						cb(message, data);
					}
				}
			} catch (error) {
				console.error(error);
			}
		});

		this.ws.on("close", (ws: WebSocket) => {
			for (const cb of this.callbacks.close) {
				if (typeof cb === "function") {
					cb(null, null);
				}
			}
		});

		this.ws.on("error", (err) => {
			console.error(err);
		});
	}
}
