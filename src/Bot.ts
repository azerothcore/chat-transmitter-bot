import * as fetch from "node-fetch";
import { nanoid } from "nanoid";
import { getManager } from "typeorm";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Client, Discord, On, Command, CommandMessage, Infos, Guard } from "@typeit/discord";

import { ChatMsg } from "./enums";
import { Utils } from "./Utils";
import { Config } from "./Config";
import { WebSocketManager } from "./WebSocketManager";
import { ICommandResult } from "./controller/CommandController";

import { NotBot } from "./guards/NotBot";
import { Admin } from "./guards/Admin";
import { AdminRole } from "./guards/AdminRole";
import { IgnoreGuild } from "./guards/IgnoreGuild";

import { Area } from "./entity/Area";
import { Guild } from "./entity/Guild";
import { Player } from "./entity/Player";

import { IChat } from "./model/IChat";
import { IChannelChat } from "./model/IChannelChat";
import { IPlayer } from "./model/chromiecraft-api/IPlayer";

export interface ICommandState {
	id: string;
	message: CommandMessage;
};

const commandPrefix: string = "!transmitter ";

@Discord(commandPrefix)
export abstract class Bot {
	public static instance: Bot;

	public config: Config;

	private client: Client;
	private commands: { [key: string]: ICommandState } = { };

	@On("ready")
	private async onReady(_: any, client: Client): Promise<void> {
		this.client = client;
		this.config = await Config.load();
		console.log(`Discord bot ready! Logged in as ${client.user.username}#${client.user.discriminator}.\r\nInvite link: https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=289856`);
		Bot.instance = this;
	}

	private async deleteCommandAndConfirmMessage(message: CommandMessage, confirmMessage: Message): Promise<void> {
		await Utils.sleep(10000);
		if (confirmMessage.deletable && !confirmMessage.deleted) {
			await confirmMessage.delete();
		}
		if (message.deletable && !message.deleted) {
			await message.delete();
		}
	}

	@Command("adminrole :action :role")
	@Infos({ "forAdmins": true })
	@Guard(IgnoreGuild, NotBot, Admin)
	private async adminRole(message: CommandMessage, client: Client): Promise<void> {
		const guild = await Guild.findOrCreate(message.guild.id);

		const action = (message.args.action as string).trim().toLowerCase();
		const role = message.mentions.roles.first() ?? (message.args.role as string).trim();

		const roleId = typeof role === "string" ? role : role.id;
		const roleName = typeof role === "string" ? role : role.name;

		if (action === "add" || action === "a") {
			await guild.addAdminRole(roleId);
			const confirmMessage = await message.reply(`role "${roleName}" added to the admin roles.`);
			await this.deleteCommandAndConfirmMessage(message, confirmMessage);
		} else if (action === "delete" || action === "del" || action === "d" || action === "remove" || action === "rem" || action === "r") {
			await guild.removeAdminRole(roleId);
			const confirmMessage = await message.reply(`role "${roleName}" removed from the admin roles.`);
			await this.deleteCommandAndConfirmMessage(message, confirmMessage);
		} else {
			await message.reply(`unknown action. Syntax: \`${commandPrefix}adminrole add <roleId>\` or \`${commandPrefix}adminrole delete <roleId>\`.`);
		}
	}

	@Command("zone")
	@Guard(IgnoreGuild, NotBot, AdminRole)
	private async zone(message: CommandMessage, client: Client): Promise<void> {
		const guild = await Guild.findOrCreate(message.guild.id);
		const name = message.content
			.trim()
			.slice(commandPrefix.length)
			.slice("zone".length)
			.trim();
		await guild.addZoneChannel(message.channel.id, name);

		const confirmMessage = await message.reply(`${message.channel.toString()} is now set as the channel for the zone \`${name}\`.`);
		await this.deleteCommandAndConfirmMessage(message, confirmMessage);
	}

	@Command("channel")
	@Guard(IgnoreGuild, NotBot, AdminRole)
	private async channel(message: CommandMessage, client: Client): Promise<void> {
		const guild = await Guild.findOrCreate(message.guild.id);
		const name = message.content
			.trim()
			.slice(commandPrefix.length)
			.slice("channel".length)
			.trim();
		await guild.addChannel(message.channel.id, name);

		const confirmMessage = await message.reply(`${message.channel.toString()} is now set as the \`${name}\` channel.`);
		await this.deleteCommandAndConfirmMessage(message, confirmMessage);
	}

	@Command("misc")
	@Guard(IgnoreGuild, NotBot, AdminRole)
	private async miscChannel(message: CommandMessage, client: Client): Promise<void> {
		const guild = await Guild.findOrCreate(message.guild.id);
		guild.miscChannel = message.channel.id;
		await getManager().save(guild);

		const confirmMessage = await message.reply(`${message.channel.toString()} is now set as the misc channel.`);
		await this.deleteCommandAndConfirmMessage(message, confirmMessage);
	}

	@Command("pinfo :playerName")
	@Guard(IgnoreGuild, NotBot, AdminRole)
	private async pinfo(message: CommandMessage, client: Client): Promise<void> {
		const player = await Player.find(message.args.playerName);
		if (player === undefined) {
			await message.reply(`could not find information in cache for player "${message.args.playerName}".`);
			return;
		}

		await message.reply(`${player.name}: level ${player.level} ${this.getRaceString(player.raceId)} ${this.getClassString(player.classId)}. Character GUID: \`${player.guid}\`\r\nAccount \`${player.accountName}\` (GUID \`${player.accountGuid}\`). Last IP address used: \`${player.lastIpAddr}\``);
	}

	@Command("command")
	@Guard(IgnoreGuild, NotBot, AdminRole)
	private async command(message: CommandMessage, client: Client): Promise<void> {
		const command = message.content
			.trim()
			.slice(commandPrefix.length)
			.slice("command".length)
			.trim();
		const id = nanoid();
		const success = WebSocketManager.instance.sendCommand(id, command);
		if (!success) {
			await message.reply("could not execute command.");
		} else {
			this.commands[id] = {
				id,
				message,
			};
		}
	}

	@Command("who")
	@Guard(IgnoreGuild, NotBot)
	private async who(message: CommandMessage, client: Client): Promise<void> {
		const res = await fetch(`${this.config.apiBaseUrl}/characters/online`);
		let players: IPlayer[] = await res.json();
		let query = message.content
			.trim()
			.slice(commandPrefix.length)
			.slice("who".length)
			.trim();
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
			const races = ["human", "orc", "dwarf", "nightelf", "undead", "tauren", "gnome", "troll", null, "draenei", "bloodelf"];
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
			return `${player.name}    ${zone.name}    level ${player.level} ${this.getRaceString(player.race)} ${this.getClassString(player.class)}${guild}`;
		}));
		await message.reply(`${numResultsBeforeFiltered} result${players.length === 1 ? "" : "s"}${filteredString}.\n${list.join("\n")}`);
	}

	public async transmitMessage(data: IChat): Promise<void> {
		const guild = await Guild.find(data.guildId);
		if (guild === undefined) {
			return;
		}

		Player.save(data.player);

		const zoneChannel = guild.getZoneChannel(data.zone);
		if (zoneChannel === undefined) {
			return;
		}

		const channel = await this.client.channels.fetch(zoneChannel.discordId) as TextChannel;
		if (channel === undefined) {
			console.error("Could not find channel " + zoneChannel.discordId + " in guild " + guild.discordId);
			return;
		}

		const txt = this.formatChatText(data);
		if (data.type === ChatMsg.Say) {
			await channel.send(txt);
		} else {
			await channel.send(new MessageEmbed({
				description: txt,
				color: Bot.getChatColor(data.type),
			}));
		}
	}

	public async transmitChannelMessage(data: IChannelChat): Promise<void> {
		const guild = await Guild.find(data.guildId);
		if (guild === undefined) {
			return;
		}

		Player.save(data.player);

		const channelId = guild.getChannel(data.channel)?.discordId ||
			guild.getZoneChannel(data.channel.replace("General - ", ""))?.discordId ||
			guild.getZoneChannel(data.channel.replace("LocalDefense - ", ""))?.discordId ||
			guild.miscChannel;
		if (channelId === undefined) {
			return;
		}

		const channel = await this.client.channels.fetch(channelId) as TextChannel;
		if (channel === undefined) {
			console.error("Could not find channel " + channelId + " in guild " + guild.discordId);
			return;
		}

		await channel.send(`[${data.channel}] ${data.player.name}: ${this.processText(data.text)}`);
	}

	public async onCommandResultReceived(result: ICommandResult): Promise<void> {
		const command = this.commands[result.commandId];
		if (!command) {
			return;
		}

		let text = result.success ? "command executed successfully." : "command failed.";

		result.output = result.output.trim();
		if (result.output.length > 0) {
			text += "\nOutput: ```\n" + result.output + "```";
		}

		await command.message.reply(text);
	}

	private processText(text: string): string {
		// Filter @everyone
		if (this.config.filterAtEveryone) {
			text = text.replace(/@everyone/g, "@ everyone");
		}

		// Filter @here
		if (this.config.filterAtHere) {
			text = text.replace(/@here/g, "@ here");
		}

		// Filter @User
		text = text.replace(/<@\d+>/g, "<@mention>");

		// Replace item links
		text = text.replace(/\|c[0-9A-F]{8}\|H(\w+):(\d+)(?::-?\d+)*\|h\[(.+?)\]\|h\|r/gi, (substring: string, ...args: any[]): string => {
			const [linkType, id, name] = args;
			return `[${name}](<https://wotlkdb.com/?${linkType}=${id}>)`;
		});

		// Raid marker emojis
		if (this.config.useRaidMarkerEmoji) {
			["{skull}", "{x}", "{square}", "{moon}", "{triangle}", "{diamond}", "{circle}", "{star}"].forEach((marker, idx) => {
				text = text.replace(new RegExp(marker, "gi"), this.config.raidMarkerEmojis[idx]);
			});
		}

		return text;
	}

	private formatChatText(data: IChat): string {
		if (data.type === ChatMsg.Yell) {
			return `[${data.zone}] ${data.player.name} yells: ${this.processText(data.text)}`;
		} else if (data.type === ChatMsg.Emote) {
			return `[${data.zone}] ${data.player.name} ${this.processText(data.text)}`;
		}
		return `[${data.zone}] ${data.player.name}: ${this.processText(data.text)}`;
	}

	private static getChatColor(type: ChatMsg): string {
		if (type === ChatMsg.Yell) {
			return "#FF4040";
		} else if (type === ChatMsg.Emote) {
			return "#FF8040";
		}
		return "#D3D2D1";
	}

	private getRaceString(raceId: number): string {
		if (!this.config.useRaceEmoji) {
			const races = ["Human", "Orc", "Dwarf", "Night Elf", "Undead", "Tauren", "Gnome", "Troll", null, "Draenei", "Blood Elf"];
			return races[raceId - 1];
		} else {
			return this.config.raceEmojis[raceId - 1];
		}
	}

	private getClassString(classId: number): string {
		if (!this.config.useClassEmoji) {
			const classNames = ["Warrior", "Paladin", "Hunter", "Rogue", "Priest", "Death Knight", "Shaman", "Mage", "Warlock", null, "Druid"];
			return classNames[classId - 1];
		} else {
			return this.config.classEmojis[classId - 1];
		}
	}
};
