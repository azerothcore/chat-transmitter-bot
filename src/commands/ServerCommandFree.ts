import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import ServerCommand from "./ServerCommand";
import { CommandController } from "../controller/CommandController";

export default class ServerCommandFree implements Command {
	public commandName = "commandfree";
	public description = "Run a server command without selecting from the list of arguments";

	public async build(builder: SlashCommandBuilder) {
		builder
			.addStringOption(option => option
				.setName("command")
				.setDescription("The command to run")
				.setRequired(true)
			);
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand()) {
			return;
		}

		const command = interaction.options.getString("command", true).trim();
		if (command === "") {
			await interaction.reply("❌ Empty command.");
			return;
		}

		await interaction.deferReply();

		const res = CommandController.instance.runCommand(command, async (result) => {
			await ServerCommand.onCommandResult(interaction, result);
		});
		if (res === false) {
			await interaction.editReply("❌ Could not execute command.");
		}
	}
}
