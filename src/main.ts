import cron from "node-cron";
import "source-map-support/register";

import { Bot } from "./Bot";
import { Config } from "./Config";
import { HttpServer } from "./HttpServer";
import { QueryResult } from "./entity/QueryResult";
import { WebSocketManager } from "./WebSocketManager";

const main = async () => {
	const config = await Config.load();
	const bot = new Bot(config);
	const wsManager = new WebSocketManager(config);
	const httpServer = new HttpServer(config);

	cron.schedule("0 */6 * * *", async () => {
		await cleanup(config);
	});

	wsManager.run();
	httpServer.run();
	await bot.run();
};

const cleanup = async (config: Config) => {
	const now = new Date();
	const results = await QueryResult.findAll();

	for (const result of results) {
		const d = new Date(result.created);
		d.setDate(d.getDate() + config.queryResultsKeepDuration);

		if (d > now) {
			await result.delete();
		}
	}
};

main();
