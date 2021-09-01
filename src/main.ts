import "reflect-metadata";
import * as path from "path";
import { Client } from "@typeit/discord";
import { createConnection } from "typeorm";

import { Config } from "./Config";
import { WebSocketManager } from "./WebSocketManager";

async function main(): Promise<void> {
	const conn = await createConnection();
	const config = await Config.load();
	const wsManager = new WebSocketManager();

	wsManager.start(config);
	const client = new Client({
		classes: [
			path.join(path.resolve("build"), "Bot.js"),
		],
		silent: false,
		variablesChar: ":",
	});

	await client.login(config.discordToken);
}

main();
