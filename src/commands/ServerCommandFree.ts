import { nanoid } from "nanoid";
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import ServerCommand from "./ServerCommand";
import { WebSocketManager } from "../WebSocketManager";
import { CommandController, ICommandResult } from "../controller/CommandController";

interface ICommandState {
	id: string;
	interaction: CommandInteraction;
}

export default class ServerCommandFree implements Command {
	public commandName = "commandfree";
	public description = "Run a server command without selecting from the list of arguments";

	private commands: { [key: string]: ICommandState } = {};

	public constructor() {
		CommandController.instance?.onCommandResult(this.onCommandResult.bind(this));
	}

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

		const id = nanoid();
		const success = WebSocketManager.instance.sendCommand(id, command);
		if (!success) {
			await interaction.editReply("❌ Could not execute command.");
		} else {
			this.commands[id] = {
				id,
				interaction,
			};
		}
	}

	private async onCommandResult(result: ICommandResult) {
		const command = this.commands[result.commandId];
		if (!command) {
			return;
		}

		ServerCommand.onCommandResult(command, result);
	}
}
