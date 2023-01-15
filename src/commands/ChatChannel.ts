import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, CommandInteraction } from "discord.js";

import { Command } from "../Command";
import { Guild } from "../entity/Guild";

export default class ChatChannel implements Command {
	public commandName = "chatchannel";
	public description = "Synchronize the current text channel with an in-game channel (\"world\" for example)";

	public async build(builder: SlashCommandBuilder) {
		builder
			.addStringOption(option => option
				.setName("chat")
				.setDescription("The name of the in-game channel (\"world\" or \"global\" for example)")
				.setRequired(true)
			)
			.addChannelOption(option => option
				.addChannelTypes(ChannelType.GuildText)
				.setName("channel")
				.setDescription("The Discord channel to post messages in, uses current channel if omitted")
				.setRequired(false)
			);
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand() || !interaction.guild) {
			return;
		}

		const guild = await Guild.findOrCreate(interaction.guild.id);
		const name = interaction.options.getString("chat", true);
		const channel = interaction.options.getChannel("channel", false)?.id ?? interaction.channelId;
		await guild.addChannel(channel, name);
		await interaction.reply(`✅ <#${channel}> is now set as the channel for \`/${name}\`.`);
	}
}
