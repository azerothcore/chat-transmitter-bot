import fetch from "node-fetch";
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Bot } from "../Bot";
import { Command } from "../Command";
import { Area } from "../entity/Area";
import { IPlayer } from "../model/chromiecraft-api/IPlayer";

export default class Who implements Command {
	public commandName = "who";
	public description = "Query info about players from the web API, equivalent to the in-game /who command";

	public async build(builder: SlashCommandBuilder) {
		builder
			.addStringOption(option => option
				.setName("query")
				.setDescription("The /who query to run")
				.setRequired(true)
			);
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand()) {
			return;
		}

		let query = interaction.options.getString("query", true);
		await interaction.deferReply();
		const res = await fetch(`${Bot.instance.config.apiBaseUrl}/characters/online`);
		let players = await res.json() as IPlayer[];
		const removeMatch = (q: string, regexMatch: RegExpExecArray): string => {
			return q.slice(0, regexMatch.index) + q.slice(regexMatch.index + regexMatch[0].length);
		};
		const characterNamePredicate = (player: IPlayer, name: string) => player.name.toLowerCase().includes(name);
		const guildNamePredicate = (player: IPlayer, guild: string) => player.guildName?.toLowerCase().includes(guild);

		let match = /n-"?([a-zÀ-ÿ]+)"?/i.exec(query);
		if (match !== null) {
			query = removeMatch(query, match);
			const name = match[1].toLowerCase();
			players = players.filter((player) => characterNamePredicate(player, name));
		}

		match = /g-"?([ a-zÀ-ÿ]+)"?/i.exec(query);
		if (match !== null) {
			query = removeMatch(query, match);
			const guild = match[1].toLowerCase();
			players = players.filter((player) => guildNamePredicate(player, guild));
		}

		match = /z-"?([0-9a-z ()'-]+)"?/i.exec(query);
		if (match !== null) {
			query = removeMatch(query, match);
			const name = match[1];
			const areas = await Area.find(name);
			const areaIds = areas.map((area) => area.id);
			if (areas.length > 0) {
				players = players.filter((player) => areaIds.includes(player.zone));
			} else {
				players = [];
			}
		}

		match = /c-"?(Warrior|Paladin|Hunter|Rogue|Priest|Death ?Knight|Shaman|Mage|Warlock|Druid)"?/i.exec(query);
		if (match !== null) {
			query = removeMatch(query, match);
			const className = match[1].toLowerCase().replace(" ", "");
			const classes = ["warrior", "paladin", "hunter", "rogue", "priest", "deathknight", "shaman", "mage", "warlock", null, "druid"];
			const classIdx = classes.indexOf(className) + 1;
			players = players.filter((player) => player.class === classIdx);
		}

		match = /r-"?(Human|Orc|Dwarf|Night ?Elf|Undead|Tauren|Gnome|Troll|Draenei|Blood ?Elf)"?/i.exec(query);
		if (match !== null) {
			query = removeMatch(query, match);
			const raceName = match[1].toLowerCase().replace(" ", "");
			const races = ["human", "orc", "dwarf", "nightelf", "undead", "tauren", "gnome", "troll", null, "bloodelf", "draenei"];
			const raceIdx = races.indexOf(raceName) + 1;
			players = players.filter((player) => player.race === raceIdx);
		}

		query = query.trim();
		if (query.length > 0) {
			const split = query.split(/\s/);
			for (let part of split) {
				if (part.match(/(\d+-\d+|\d+)/)) {
					// Level query
					const lowerBound = parseInt(part.includes("-") ? part.split("-")[0] : part, 10);
					const upperBound = parseInt(part.includes("-") ? part.split("-")[1] : part, 10);

					players = players.filter((player) => player.level >= lowerBound && player.level <= upperBound);
				} else {
					// Character name / guild name / zone query
					part = part.toLowerCase();
					const areas = await Area.find(part);
					const areaIds = areas.map((area) => area.id);

					players = players.filter((player) => {
						return characterNamePredicate(player, part) ||
							guildNamePredicate(player, part) ||
							areaIds.includes(player.zone);
					});
				}
			}
		}

		players.sort((b, a) => b.level - a.level);

		const maxResults = 15;
		const numResultsBeforeFiltered = players.length;
		if (players.length > maxResults) {
			players.splice(maxResults);
		}

		const filteredString = numResultsBeforeFiltered !== players.length ? ` (${players.length} displayed)` : "";
		const list = await Promise.all(players.map(async (player) => {
			const zone = await Area.findById(player.zone);
			const guild = player.guildName ? ("    <" + player.guildName + ">") : "";
			return `${player.name}    ${zone?.name ?? "Unknown"}    level ${player.level} ${Bot.instance.getRaceString(player.race)} ${Bot.instance.getClassString(player.class)}${guild}`;
		}));
		await interaction.editReply(`${numResultsBeforeFiltered} result${players.length === 1 ? "" : "s"}${filteredString}.\n${list.join("\n")}`);
	}
}
