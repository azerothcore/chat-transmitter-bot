import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import { Config } from "./Config";

interface IArgs {
	guild?: string;
}

const parseArgs = () => {
	const args: IArgs = {};

	for (let i = 0; i < process.argv.length; ++i) {
		const arg = process.argv[i];
		const lowerCaseArg = arg.toLowerCase();
		const next = process.argv[i + 1];

		if (lowerCaseArg === "--guild" || lowerCaseArg === "-g") {
			args.guild = next;
		}
	}

	return args;
};

const main = async () => {
	const config = await Config.load();
	const args = parseArgs();

	const rest = new REST({ version: "9" }).setToken(config.discordToken);

	if (args.guild !== undefined) {
		const data = await rest.get(Routes.applicationGuildCommands(config.discordClientId, args.guild)) as { id: string }[];
		for (const command of data) {
			await rest.delete(`${Routes.applicationGuildCommands(config.discordClientId, args.guild)}/${command.id}`);
		}
		console.log(`Successfully unregistered application commands from guild ${args.guild}.`);
	} else {
		const data = await rest.get(Routes.applicationCommands(config.discordClientId)) as { id: string }[];
		for (const command of data) {
			await rest.delete(`${Routes.applicationCommands(config.discordClientId)}/${command.id}`);
		}
		console.log("Successfully unregistered application commands globally.");
	}
};

main();
