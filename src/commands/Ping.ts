import { CommandInteraction } from "discord.js";

import { Command } from "../Command";

export default class Ping implements Command {
	public commandName = "ping";
	public description = "Check if the bot is responding properly";

	public async execute(interaction: CommandInteraction) {
		await interaction.reply("🏓 Pong!");
	}
}
