import path from "path";
import { DataSource } from "typeorm";
import { Client, EmbedBuilder, IntentsBitField, Interaction, InteractionType, TextChannel, verifyString } from "discord.js";

import { Config } from "./Config";
import { ChatMsg } from "./enums";
import { IChat } from "./model/IChat";
import { Guild } from "./entity/Guild";
import { Player } from "./entity/Player";
import { dataSource } from "./dataSource.js";
import { Command, getAllCommands } from "./Command";
import { IChannelChat } from "./model/IChannelChat";
import { EAnticheatReportType, IAnticheatReport } from "./model/IAnticheatReport";

export class Bot {
	public static instance: Bot;

	public client: Client;
	public config: Config;
	public db: DataSource;
	public tmpQueryResultsDir = path.join(__dirname, "..", "tmp", "queries");

	private commands: { [key: string]: Command; };

	public constructor(config: Config) {
		Bot.instance = this;
		this.config = config;
	}

	public async run() {
		this.db = await dataSource.initialize();
		this.commands = await this.loadCommands();
		this.client = new Client({ intents: [IntentsBitField.Flags.Guilds] });

		this.client.once("ready", this.onReady.bind(this));
		this.client.on("interactionCreate", this.onInteraction.bind(this));

		this.client.login(this.config.discordToken);
	}

	public getRaceString(raceId: number, gender?: number): string | null {
		if (!this.config.useRaceEmoji) {
			const races = ["Human", "Orc", "Dwarf", "Night Elf", "Undead", "Tauren", "Gnome", "Troll", null, "Draenei", "Blood Elf"];
			return races[raceId - 1];
		} else {
			return this.config.raceEmojis[raceId - 1][gender ?? 0];
		}
	}

	public getClassString(classId: number): string | null {
		if (!this.config.useClassEmoji) {
			const classNames = ["Warrior", "Paladin", "Hunter", "Rogue", "Priest", "Death Knight", "Shaman", "Mage", "Warlock", null, "Druid"];
			return classNames[classId - 1];
		} else {
			return this.config.classEmojis[classId - 1];
		}
	}

	private async loadCommands(): Promise<{ [key: string]: Command }> {
		const commands = {};
		for (const command of await getAllCommands()) {
			commands[command.commandName] = command;
		}
		return commands;
	}

	private onReady() {
		console.log(`Discord bot ready! Logged in as ${this.client?.user?.username}#${this.client?.user?.discriminator}.\r\nInvite link: https://discord.com/oauth2/authorize?client_id=${this.client?.user?.id}&scope=bot&permissions=289856`);
	}

	private async onInteraction(interaction: Interaction) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			const cmd = this.commands[interaction.commandName];
			await cmd?.execute(interaction);
		} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			const cmd = this.commands[interaction.commandName];
			await cmd?.autocomplete?.(interaction);
		}
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

		// Escape backquotes
		text = text.replace(/`/g, "\\`");

		// Replace in-game links
		text = text.replace(/\|c[0-9A-F]{8}\|H(\w+):(\d+)(?::-?\d+)*\|h\[(.+?)\]\|h\|r/gi, (substring: string, ...args): string => {
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

	private static getChatColor(type: ChatMsg): number {
		if (type === ChatMsg.Yell) {
			return Number("0xFF4040");
		} else if (type === ChatMsg.Emote) {
			return Number("0xFF8040");
		}
		return Number("0xD3D2D1");
	}

	public async onLocalChat(data: IChat) {
		const guild = await Guild.find(data.guildId);
		if (!guild) {
			return;
		}

		Player.save(data.player);

		const zoneChannel = guild.getZoneChannel(data.zone);
		if (!zoneChannel) {
			return;
		}

		const channel = await this.client.channels.fetch(zoneChannel.discordId) as TextChannel;
		if (!channel) {
			console.error(`Could not find channel ${zoneChannel.discordId} in guild ${guild.discordId}`);
			return;
		}

		const txt = this.formatChatText(data);
		if (data.type === ChatMsg.Say) {
			await channel.send(txt);
		} else {
			await channel.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(txt)
						.setColor(Bot.getChatColor(data.type))
				]
			});
		}
	}

	public async onChannelChat(data: IChannelChat) {
		const guild = await Guild.find(data.guildId);
		if (!guild) {
			return;
		}

		Player.save(data.player);

		const channelId = guild.getChannel(data.channel)?.discordId ||
			guild.getZoneChannel(data.channel.replace("General - ", ""))?.discordId ||
			guild.getZoneChannel(data.channel.replace("LocalDefense - ", ""))?.discordId ||
			guild.miscChannel;
		if (!channelId) {
			return;
		}

		const channel = await this.client.channels.fetch(channelId) as TextChannel;
		if (!channel) {
			console.error(`Could not find channel ${channelId} in guild ${guild.discordId}`);
			return;
		}

		await channel.send(`[${data.channel}] ${data.player.name}: ${this.processText(data.text)}`);
	}

	public async onAnticheatReport(data: IAnticheatReport) {
		const guild = await Guild.find(data.guildId);
		if (!guild) {
			return;
		}

		await Player.save(data.player);

		const channelId = guild.anticheatReportsChannel;
		if (!channelId) {
			return;
		}

		const channel = await this.client.channels.fetch(channelId) as TextChannel;
		if (!channel) {
			console.error(`Could not find channel ${channelId} in guild ${guild.discordId}`);
			return;
		}

		const player = data.player;
		await channel.send(`${EAnticheatReportType[data.reportType]} Report:\n${player.name}: level ${player.level} ${Bot.instance.getRaceString(player.raceId, player.gender)} ${Bot.instance.getClassString(player.classId)}. Character GUID: \`${player.guid}\`\r\nAccount: \`${player.accountName}\` (ID: \`${player.accountGuid}\`).\r\nLast IP address used: \`${player.lastIpAddr}\``);
	}

	/**
	 * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
	 * @param {string} text Content to split
	 * @param {SplitOptions} [options] Options controlling the behavior of the split
	 * @returns {string[]}
	 */
	public static splitMessage(text: string, { maxLength = 2_000, char = "\n", prepend = "", append = "" } = {}): string[] {
		text = verifyString(text);
		if (text.length <= maxLength) {
			return [text];
		}
		let splitText = [text];
		if (Array.isArray(char)) {
			while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
				const currentChar = char.shift();
				if (currentChar instanceof RegExp) {
					splitText = splitText.flatMap(chunk => chunk.match(currentChar) ?? "");
				} else {
					splitText = splitText.flatMap(chunk => chunk.split(currentChar));
				}
			}
		} else {
			splitText = text.split(char);
		}
		if (splitText.some(elem => elem.length > maxLength)) throw new RangeError("SPLIT_MAX_LEN");
		const messages: string[] = [];
		let msg = "";
		for (const chunk of splitText) {
			if (msg && (msg + char + chunk + append).length > maxLength) {
				messages.push(msg + append);
				msg = prepend;
			}
			msg += (msg && msg !== prepend ? char : "") + chunk;
		}
		return messages.concat(msg).filter(m => m);
	}

	public randomConfirmEmoji(): string | null {
		if (this.config.confirmEmojis.length === 0) {
			return null;
		}

		return this.config.confirmEmojis[Math.floor(Math.random() * this.config.confirmEmojis.length)];
	}
}
