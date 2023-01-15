import path from "path";
import fs from "fs-extra";
import express from "express";
import { Express } from "express";

import { Bot } from "./Bot";
import { Config } from "./Config";

export class HttpServer {
	public static instance: HttpServer;

	private config: Config;

	public constructor(config: Config) {
		HttpServer.instance = this;
		this.config = config;
	}

	public async run() {
		const app: Express = express();

		app.use("/css", express.static(path.join(__dirname, "..", "static", "css")));
		app.use("/js", express.static(path.join(__dirname, "..", "static", "js")));

		app.use("/query", express.static(Bot.instance.tmpQueryResultsDir));
		app.use("/query/:queryId", this.wrapRoute(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			const queryId = req.params.queryId;
			const filePath = path.join(Bot.instance.tmpQueryResultsDir, `${queryId}.json`);
			if (!(await fs.pathExists(filePath))) {
				res.sendStatus(404);
				return;
			}

			res.sendFile(path.join(__dirname, "..", "static", "query.html"));
		}));

		app.use((err, req: express.Request, res: express.Response, next: express.NextFunction) => {
			// Error handler

			if (err instanceof Error) {
				const contents = err.stack ?? `${err.name}: ${err.message}`;
				console.error(`Error on HTTP request: ${contents}`);
			}

			let status = 500;
			if (typeof err === "number") {
				status = err;
			}

			res.sendStatus(status);
		});

		app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
			// 404 handler
			res.sendStatus(404);
		});

		app.listen(this.config.httpPort, "0.0.0.0", () => {
			console.log(`HTTP Server is listening on 0.0.0.0:${this.config.httpPort}.`);
		});
	}

	private wrapRoute(fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>) {
		// Adds error handling for promise-based controller methods
		return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			try {
				await fn(req, res, next);
			} catch (e) {
				next(e);
			}
		};
	}
}
