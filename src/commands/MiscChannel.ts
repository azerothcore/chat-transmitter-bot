import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, CommandInteraction } from "discord.js";

import { Command } from "../Command";
import { Guild } from "../entity/Guild";

export default class MiscChannel implements Command {
	public commandName = "miscchannel";
	public description = "Synchronize the current text channel with any chat channel not registered with /chatchannel";

	public build(builder: SlashCommandBuilder): void {
		builder
			.addChannelOption(option => option
				.addChannelTypes(ChannelType.GuildText)
				.setName("channel")
				.setDescription("The channel to post messages in, uses current channel if omitted")
				.setRequired(false)
			);
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand() || !interaction.guild) {
			return;
		}

		const guild = await Guild.findOrCreate(interaction.guild.id);
		guild.miscChannel = interaction.options.getChannel("channel", false)?.id ?? interaction.channelId;
		await guild.save();
		await interaction.reply(`✅ <#${guild.miscChannel}> is now set as the misc channel.`);
	}
}
