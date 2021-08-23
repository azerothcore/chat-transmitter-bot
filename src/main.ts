import "reflect-metadata";
import * as path from "path";
import { Client } from "@typeit/discord";
import { createConnection } from "typeorm";

import * as server from "./server";
import { Config } from "./Config";

async function main(): Promise<void> {
	const conn = await createConnection();
	const config = await Config.load();

	server.start(config);
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
