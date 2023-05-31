import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, CommandInteraction } from "discord.js";

import { Command } from "../Command";
import { Guild } from "../entity/Guild";

export default class ElunaChannel implements Command {
	public commandName = "elunachannel";
	public description = "Post Eluna notifications in the current text channel";

	public build(builder: SlashCommandBuilder): void {
		builder
			.addChannelOption(option => option
				.addChannelTypes(ChannelType.GuildText)
				.setName("channel")
				.setDescription("The channel to post Eluna notifications in, uses current channel if omitted")
				.setRequired(false)
			);
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand() || !interaction.guild) {
			return;
		}

		const guild = await Guild.findOrCreate(interaction.guild.id);
		guild.elunaChannel = interaction.options.getChannel("channel", false)?.id ?? interaction.channelId;
		await guild.save();
		await interaction.reply(`✅ <#${guild.elunaChannel}> is now set as the Eluna channel.`);
	}
}
