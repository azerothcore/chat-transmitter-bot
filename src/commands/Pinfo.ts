import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Bot } from "../Bot";
import { Command } from "../Command";
import { Guild } from "../entity/Guild";
import { Player } from "../entity/Player";

export default class Pinfo implements Command {
	public commandName = "pinfo";
	public description = "Print info about a player from the cache (data might not be up to date!)";

	public async build(builder: SlashCommandBuilder) {
		builder
			.addStringOption(option => option
				.setName("player")
				.setDescription("The name of the player")
				.setRequired(true)
				.setAutocomplete(true)
			);
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand()) {
			return;
		}

		const guild = await Guild.findOrCreate(interaction.guildId ?? "");
		const name = interaction.options.getString("player", true);
		const player = await Player.findOne(name, guild);
		if (!player) {
			await interaction.reply(`Could not find any data in cache for player \`${name}\`.`);
			return;
		}

		await interaction.reply(`${player.name}: level ${player.level} ${Bot.instance.getRaceString(player.raceId, player.gender)} ${Bot.instance.getClassString(player.classId)}. Character GUID: \`${player.guid}\`\r\nAccount: \`${player.accountName}\` (ID: \`${player.accountGuid}\`). Last IP address used: \`${player.lastIpAddr}\``);
	}

	public async autocomplete(interaction: AutocompleteInteraction) {
		if (!interaction) {
			return;
		}

		const guild = await Guild.findOrCreate(interaction.guildId ?? "");
		const input = interaction.options.getFocused();
		let players = await Player.find(input, guild);
		players = players.slice(0, 25);
		await interaction.respond(players.map(player => {
			return {
				name: player.name,
				value: player.name,
			};
		}));
	}
}
