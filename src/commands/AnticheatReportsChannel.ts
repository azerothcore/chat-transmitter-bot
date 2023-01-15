import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, CommandInteraction } from "discord.js";

import { Command } from "../Command";
import { Guild } from "../entity/Guild";

export default class AnticheatReportsChannel implements Command {
	public commandName = "anticheatreportschannel";
	public description = "Post reports from the anticheat module in the current text channel";

	public build(builder: SlashCommandBuilder): void {
		builder
			.addChannelOption(option => option
				.addChannelTypes(ChannelType.GuildText)
				.setName("channel")
				.setDescription("The channel to post reports in, uses current channel if omitted")
				.setRequired(false)
			);
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand() || !interaction.guild) {
			return;
		}

		const guild = await Guild.findOrCreate(interaction.guild.id);
		guild.anticheatReportsChannel = interaction.options.getChannel("channel", false)?.id ?? interaction.channelId;
		await guild.save();
		await interaction.reply(`✅ <#${guild.anticheatReportsChannel}> is now set as the anticheat reports channel.`);
	}
}
