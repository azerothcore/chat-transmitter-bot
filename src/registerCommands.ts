import "source-map-support/register";
import { REST } from "@discordjs/rest";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v9";

import { Config } from "./Config";
import { getAllCommands } from "./Command";

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

	const promises = (await getAllCommands())
		.map(async (cmd) => {
			const builder = new SlashCommandBuilder()
				.setName(cmd.commandName)
				.setDescription(cmd.description)
				.setDefaultMemberPermissions("0")
				.setDMPermission(false);
			await cmd.build?.(builder);
			return builder;
		})
		.map(async (builder) => {
			const cmd = await builder;
			return cmd.toJSON();
		});
	const commands = await Promise.all(promises);

	const rest = new REST({ version: "9" }).setToken(config.discordToken);

	if (args.guild !== undefined) {
		await rest.put(Routes.applicationGuildCommands(config.discordClientId, args.guild), { body: commands });
		console.log(`Successfully registered application commands to guild ${args.guild}.`);
	} else {
		await rest.put(Routes.applicationCommands(config.discordClientId), { body: commands });
		console.log("Successfully registered application commands globally.");
	}
};

main();
