import { SlashCommandBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, ChannelType, CommandInteraction } from "discord.js";

import { Command } from "../Command";
import { Area } from "../entity/Area";
import { Guild } from "../entity/Guild";

export default class ZoneChannel implements Command {
	public commandName = "zonechannel";
	public description = "Synchronize the current text channel with the chat from an in-game zone";

	public async build(builder: SlashCommandBuilder) {
		builder
			.addStringOption(option => option
				.setName("zone")
				.setDescription("The name of the zone")
				.setRequired(true)
				.setAutocomplete(true)
			)
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
		const name = interaction.options.getString("zone", true);
		const channel = interaction.options.getChannel("channel", false)?.id ?? interaction.channelId;
		await guild.addZoneChannel(channel, name);
		await interaction.reply(`✅ <#${channel}> is now set as the channel for the zone \`${name}\`.`);
	}

	public async autocomplete(interaction: AutocompleteInteraction) {
		if (!interaction) {
			return;
		}

		const input = interaction.options.getFocused();
		let zones = await Area.find(input);
		zones = zones.slice(0, 25);
		await interaction.respond(zones.map(zone => {
			return {
				name: zone.name,
				value: zone.name,
			};
		}));
	}
}
