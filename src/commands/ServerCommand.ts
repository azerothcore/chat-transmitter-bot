import { SlashCommandBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";

import { Bot } from "../Bot";
import { Command } from "../Command";
import { Guild } from "../entity/Guild";
import { CommandController, ICommandResult } from "../controller/CommandController";

class ServerCommandArg {
	private name: string;
	private _requiresAdmin: boolean;
	private args: ServerCommandArg[];
	private index: number;

	public constructor(name: string, requiresAdmin = false) {
		this.name = name;
		this._requiresAdmin = requiresAdmin;
		this.args = [];
		this.index = 0;
	}

	public addArg(name: string, requiresAdmin?: boolean, cb?: (self: ServerCommandArg) => void): ServerCommandArg {
		const arg = new ServerCommandArg(name, requiresAdmin ?? this.requiresAdmin());
		arg.index = this.index + 1 + this.args.filter(a => ["$", "#"].includes(a.getName()[0])).length;
		this.args.push(arg);
		cb?.(arg);
		return this;
	}

	public getName(): string {
		return this.name;
	}

	public getIndex(): number {
		return this.index;
	}

	public getArgs(): ServerCommandArg[] {
		return [...this.args];
	}

	public requiresAdmin() {
		return this._requiresAdmin;
	}

	public toDiscordChoiceData() {
		return {
			name: this.name,
			value: this.name,
		};
	}
}

export default class ServerCommand implements Command {
	public commandName = "command";
	public description = "Run a server command";

	private dummyArgNames: string[];
	private commandArguments: ServerCommandArg[];

	public constructor() {
		const nArgs = 10;
		this.dummyArgNames = [];
		for (let i = 0; i < nArgs; ++i) {
			this.dummyArgNames.push(`arg${i + 1}`);
		}

		this.commandArguments = [
			new ServerCommandArg("account")
				.addArg("create", true, create => create
					.addArg("$account")
					.addArg("$password"))
				.addArg("delete", true, _delete => _delete
					.addArg("$account"))
				.addArg("lock", false, lock => lock
					.addArg("country", false, country => country
						.addArg("on")
						.addArg("off"))
					.addArg("on")
					.addArg("off"))
				.addArg("onlinelist", true)
				.addArg("set", false, set => set
					.addArg("addon", false, addon => addon
						.addArg("[$account]")
						.addArg("#addon"))
					.addArg("gmlevel", true, gmlevel => gmlevel
						.addArg("[$account]")
						.addArg("#level")
						.addArg("[#realmid]"))
					.addArg("password", true, password => password
						.addArg("$account")
						.addArg("$password")
						.addArg("$password"))),
			new ServerCommandArg("announce")
				.addArg("$message"),
			new ServerCommandArg("arena")
				.addArg("create", true, create => create
					.addArg("$name")
					.addArg("$arenaName")
					.addArg("2")
					.addArg("3")
					.addArg("5"))
				.addArg("disband", true, disband => disband
					.addArg("#teamId"))
				.addArg("info", false, info => info
					.addArg("#teamId"))
				.addArg("rename", true, rename => rename
					.addArg("$oldName")
					.addArg("$newName")),
			new ServerCommandArg("ban")
				.addArg("account", false, account => account
					.addArg("$name")
					.addArg("$banTime")
					.addArg("$reason"))
				.addArg("character", false, character => character
					.addArg("$name")
					.addArg("$banTime")
					.addArg("$reason"))
				.addArg("ip", false, ip => ip
					.addArg("$ip")
					.addArg("$banTime")
					.addArg("$reason"))
				.addArg("playeraccount", false, playeraccount => playeraccount
					.addArg("$characterName")
					.addArg("$banTime")
					.addArg("$reason")),
			new ServerCommandArg("baninfo")
				.addArg("account", false, account => account
					.addArg("$accountName"))
				.addArg("character", false, character => character
					.addArg("$characterName"))
				.addArg("ip", false, ip => ip
					.addArg("$ip")),
			new ServerCommandArg("banlist")
				.addArg("account", false, account => account
					.addArg("[$accountName]"))
				.addArg("character", false, character => character
					.addArg("$characterName"))
				.addArg("ip", false, ip => ip
					.addArg("[$ip]")),
			new ServerCommandArg("cache")
				.addArg("delete", false, _delete => _delete
					.addArg("$characterName"))
				.addArg("info", false, info => info
					.addArg("$characterName"))
				.addArg("refresh", false, refresh => refresh
					.addArg("$characterName")),
			new ServerCommandArg("character")
				.addArg("changefaction", false, changefaction => changefaction
					.addArg("$characterName"))
				.addArg("changerace", false, changerace => changerace
					.addArg("$characterName"))
				.addArg("customize", false, customize => customize
					.addArg("$characterName"))
				.addArg("deleted", false, deleted => deleted
					.addArg("delete", true, _delete => _delete
						.addArg("#guid|$name"))
					.addArg("list", false)
					.addArg("purge", true)
					.addArg("restore", true, restore => restore
						.addArg("$guid|$name")
						.addArg("[$newName]")
						.addArg("[#newAccount]")))
				.addArg("erase", true, erase => erase
					.addArg("$characterName"))
				.addArg("level", true, level => level
					.addArg("$characterName")
					.addArg("#level"))
				.addArg("rename", false, rename => rename
					.addArg("[$name]")
					.addArg("1")
					.addArg("[$newName]"))
				.addArg("reputation", false, reputation => reputation
					.addArg("$characterName"))
				.addArg("titles", false, titles => titles
					.addArg("$characterName")),
			new ServerCommandArg("combatstop")
				.addArg("$playerName"),
			new ServerCommandArg("commands"),
			new ServerCommandArg("debug")
				.addArg("objectcount"),
			new ServerCommandArg("deserter")
				.addArg("bg", false, bg => bg
					.addArg("add", false, add => add
						.addArg("$playerName")
						.addArg("$timeString"))
					.addArg("remove", false, remove => remove
						.addArg("all", false, all => all
							.addArg("[$maxDuration]"))
						.addArg("$playerName")))
				.addArg("instance", false, instance => instance
					.addArg("add", false, add => add
						.addArg("$playerName")
						.addArg("$timeString"))
					.addArg("remove", false, remove => remove
						.addArg("all", false, all => all
							.addArg("[$maxDuration]"))
						.addArg("$playerName"))),
			new ServerCommandArg("disable")
				.addArg("add", true, add => add
					.addArg("battleground", true, bg => bg
						.addArg("$entry")
						.addArg("$flag")
						.addArg("$comment"))
					.addArg("map", true, map => map
						.addArg("$entry")
						.addArg("$flag")
						.addArg("$comment"))
					.addArg("outdoorpvp", true, outdoorpvp => outdoorpvp
						.addArg("$entry")
						.addArg("$flag")
						.addArg("$comment"))
					.addArg("quest", true, quest => quest
						.addArg("$entry")
						.addArg("$flag")
						.addArg("$comment"))
					.addArg("spell", true, spell => spell
						.addArg("$entry")
						.addArg("$flag")
						.addArg("$comment"))
					.addArg("vmap", true, vmap => vmap
						.addArg("$entry")
						.addArg("$flag")
						.addArg("$comment")))
				.addArg("remove", true, remove => remove
					.addArg("battleground", true, bg => bg
						.addArg("$entry"))
					.addArg("map", true, map => map
						.addArg("$entry"))
					.addArg("outdoorpvp", true, outdoorpvp => outdoorpvp
						.addArg("$entry"))
					.addArg("quest", true, quest => quest
						.addArg("$entry"))
					.addArg("spell", true, spell => spell
						.addArg("$entry"))
					.addArg("vmap", true, vmap => vmap
						.addArg("$entry"))),
			new ServerCommandArg("event")
				.addArg("activelist")
				.addArg("info", false, info => info
					.addArg("#eventId"))
				.addArg("start", false, start => start
					.addArg("#eventId"))
				.addArg("stop", false, stop => stop
					.addArg("#eventId")),
			new ServerCommandArg("gm")
				.addArg("ingame")
				.addArg("list"),
			new ServerCommandArg("gmannounce")
				.addArg("$message"),
			new ServerCommandArg("gmnameannounce")
				.addArg("$message"),
			new ServerCommandArg("gmnotify")
				.addArg("$message"),
			new ServerCommandArg("guild")
				.addArg("create", false, create => create
					.addArg("$leaderName")
					.addArg("$guildName"))
				.addArg("delete", false, _delete => _delete
					.addArg("$guildName"))
				.addArg("info", false, info => info
					.addArg("$guildName|#guildId"))
				.addArg("invite", false, invite => invite
					.addArg("$characterName")
					.addArg("$guildName"))
				.addArg("rank", false, rank => rank
					.addArg("$characterName")
					.addArg("#rank"))
				.addArg("rename", false, rename => rename
					.addArg("$guildName")
					.addArg("$newGuildName"))
				.addArg("uninvite", false, uninvite => uninvite
					.addArg("$characterName")),
			new ServerCommandArg("help")
				.addArg("[$command]"),
			new ServerCommandArg("instance")
				.addArg("getbossstate", false, getbossstate => getbossstate
					.addArg("$bossId")
					.addArg("$characterName"))
				.addArg("setbossstate", false, setbossstate => setbossstate
					.addArg("$bossId")
					.addArg("$encounterState")
					.addArg("$characterName"))
				.addArg("stats"),
			new ServerCommandArg("kick")
				.addArg("$characterName")
				.addArg("[$reason]"),
			new ServerCommandArg("lfg")
				.addArg("clean", true)
				.addArg("options", false, options => options
					.addArg("[#newValue]"))
				.addArg("queue"),
			new ServerCommandArg("list")
				.addArg("creature", false, creature => creature
					.addArg("#creatureEntry")
					.addArg("[#maxCount]"))
				.addArg("item", false, item => item
					.addArg("#itemEntry")
					.addArg("[#maxCount]"))
				.addArg("object", false, object => object
					.addArg("#objectGuid")),
			new ServerCommandArg("lookup")
				.addArg("area", false, area => area
					.addArg("$namePart"))
				.addArg("creature", false, creature => creature
					.addArg("$namePart"))
				.addArg("event", false, event => event
					.addArg("$namePart"))
				.addArg("faction", false, faction => faction
					.addArg("$namePart"))
				.addArg("gobject", false, gobject => gobject
					.addArg("$namePart"))
				.addArg("item", false, item => item
					.addArg("set", false, itemset => itemset
						.addArg("$namePart"))
					.addArg("$namePart"))
				.addArg("map", false, map => map
					.addArg("$namePart"))
				.addArg("object", false, object => object
					.addArg("$namePart"))
				.addArg("player", false, player => player
					.addArg("account", false, account => account
						.addArg("$accountName")
						.addArg("[#maxResults]"))
					.addArg("email", false, email => email
						.addArg("$email")
						.addArg("[#maxResults]"))
					.addArg("ip", false, ip => ip
						.addArg("$ip")
						.addArg("[#maxResults]")))
				.addArg("quest", false, quest => quest
					.addArg("$namePart"))
				.addArg("skill", false, skill => skill
					.addArg("$namePart"))
				.addArg("spell", false, spell => spell
					.addArg("id", false, id => id
						.addArg("#id"))
					.addArg("$namePart"))
				.addArg("taxinode", false, taxinode => taxinode
					.addArg("$namePart"))
				.addArg("teleport", false, teleport => teleport
					.addArg("$namePart"))
				.addArg("title", false, title => title
					.addArg("$namePart")),
			new ServerCommandArg("mute")
				.addArg("$playerName")
				.addArg("$muteTimeString")
				.addArg("[$reason]"),
			new ServerCommandArg("mutehistory")
				.addArg("$accountName"),
			new ServerCommandArg("nameannounce")
				.addArg("$announcement"),
			new ServerCommandArg("notify")
				.addArg("$message"),
			new ServerCommandArg("pdump", true)
				.addArg("load", true, load => load
					.addArg("$fileName")
					.addArg("$accountName")
					.addArg("[$newName]")
					.addArg("[$newGuid]"))
				.addArg("write", true, write => write
					.addArg("$fileName")
					.addArg("$playerName|#guid")),
			new ServerCommandArg("pinfo")
				.addArg("$playerName|#guid"),
			new ServerCommandArg("player")
				.addArg("learn", false, learn => learn
					.addArg("$playerName")
					.addArg("#spell")
					.addArg("all"))
				.addArg("unlearn", false, unlearn => unlearn
					.addArg("$playerName")
					.addArg("#spell")
					.addArg("all")),
			new ServerCommandArg("quest")
				.addArg("add", false, add => add
					.addArg("#questId")
					.addArg("$characterName"))
				.addArg("complete", false, complete => complete
					.addArg("#questId")
					.addArg("$characterName"))
				.addArg("remove", false, remove => remove
					.addArg("#questId")
					.addArg("$characterName"))
				.addArg("reward", false, reward => reward
					.addArg("#questId")
					.addArg("$characterName")),
			new ServerCommandArg("reload", true)
				.addArg("$table")
				.addArg("all", true, all => all
					.addArg("$tables")),
			new ServerCommandArg("reset", true)
				.addArg("achievements", true, achievements => achievements
					.addArg("$characterName"))
				.addArg("all", true, all => all
					.addArg("spells")
					.addArg("talents"))
				.addArg("honor", true, honor => honor
					.addArg("$characterName"))
				.addArg("level", true, level => level
					.addArg("$characterName"))
				.addArg("spells", true, spells => spells
					.addArg("$characterName"))
				.addArg("stats", true, stats => stats
					.addArg("$characterName"))
				.addArg("talents", true, talents => talents
					.addArg("$characterName")),
			new ServerCommandArg("revive")
				.addArg("$characterName"),
			new ServerCommandArg("saveall"),
			new ServerCommandArg("send")
				.addArg("items", false, items => items
					.addArg("$subject")
					.addArg("$text")
					.addArg("#itemId1:count")
					.addArg("[#itemId2:count]")
					.addArg("[#itemId3:count]")
					.addArg("[#itemId4:count]")
					.addArg("[#itemId5:count]")
					.addArg("[#itemId6:count]"))
				.addArg("mail", false, mail => mail
					.addArg("$characterName")
					.addArg("$subject")
					.addArg("$text"))
				.addArg("message", true, message => message
					.addArg("$characterName")
					.addArg("$message"))
				.addArg("money", false, money => money
					.addArg("$characterName")
					.addArg("$subject")
					.addArg("$text")
					.addArg("#money")),
			new ServerCommandArg("server")
				.addArg("corpses")
				.addArg("debug", true)
				.addArg("exit", true)
				.addArg("idlerestart", true, idlerestart => idlerestart
					.addArg("cancel")
					.addArg("#delay")
					.addArg("[#exitCode]"))
				.addArg("idleshutdown", true, idleshutdown => idleshutdown
					.addArg("cancel")
					.addArg("#delay")
					.addArg("[#exitCode]"))
				.addArg("info")
				.addArg("motd")
				.addArg("restart", true, restart => restart
					.addArg("cancel")
					.addArg("#delay")
					.addArg("[#exitCode]"))
				.addArg("set", true, set => set
					.addArg("closed", true, closed => closed
						.addArg("on")
						.addArg("off"))
					.addArg("motd", true, motd => motd
						.addArg("$motd")))
				.addArg("shutdown", true, shutdown => shutdown
					.addArg("cancel")
					.addArg("#delay")
					.addArg("[#exitCode]")),
			new ServerCommandArg("teleport")
				.addArg("name", false, name => name
					.addArg("$playerName")
					.addArg("$location")),
			new ServerCommandArg("ticket")
				.addArg("assign", false, assign => assign
					.addArg("#ticketId")
					.addArg("$gmName"))
				.addArg("close", false, close => close
					.addArg("#ticketId"))
				.addArg("closedlist")
				.addArg("comment", false, comment => comment
					.addArg("#ticketId")
					.addArg("$comment"))
				.addArg("complete", false, complete => complete
					.addArg("#ticketId")
					.addArg("$comment"))
				.addArg("delete", false, _delete => _delete
					.addArg("#ticketId"))
				.addArg("list")
				.addArg("onlinelist")
				.addArg("reset")
				.addArg("response", false, response => response
					.addArg("append", false, append => append
						.addArg("#ticketId")
						.addArg("$comment"))
					.addArg("appendln", false, appendln => appendln
						.addArg("#ticketId")
						.addArg("$comment")))
				.addArg("togglesystem")
				.addArg("unassign", false, unassign => unassign
					.addArg("#ticketId"))
				.addArg("viewid", false, viewid => viewid
					.addArg("#ticketId"))
				.addArg("viewname", false, viewname => viewname
					.addArg("$creatorName")),
			new ServerCommandArg("unban")
				.addArg("account", false, account => account
					.addArg("$accountName"))
				.addArg("character", false, character => character
					.addArg("$characterName"))
				.addArg("ip", false, ip => ip
					.addArg("$ip"))
				.addArg("playeraccount", false, playeraccount => playeraccount
					.addArg("$characterName")),
			new ServerCommandArg("unmute")
				.addArg("$characterName"),
			new ServerCommandArg("unstuck")
				.addArg("$characterName")
				.addArg("inn")
				.addArg("graveyard")
				.addArg("startzone"),
		];
	}

	public async build(builder: SlashCommandBuilder) {
		for (const arg of this.dummyArgNames) {
			builder
				.addStringOption(option => option
					.setName(arg)
					.setRequired(false)
					.setDescription(arg)
					.setAutocomplete(true)
				);
		}
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand()) {
			return;
		}

		const args = this.dummyArgNames
			.map(arg => interaction.options.getString(arg))
			.filter(arg => arg !== null && arg !== undefined && arg?.trim() !== "")
			.map(arg => arg?.trim());
		const command = args
			.join(" ")
			.trim();
		if (command === "") {
			await interaction.reply("❌ Empty command.");
			return;
		}

		const guild = await Guild.findOrCreate(interaction.guildId ?? "");
		const isAdmin = await guild.isMemberAdmin(interaction.user.id);
		if (!isAdmin) {
			const currentCommand: ServerCommandArg[] = [];
			for (const arg of args) {
				const choices = this.getChoices(currentCommand, true);
				const argFound = choices.find(a => a.getName() === arg);
				if (!argFound) {
					break;
				}
				if (argFound.requiresAdmin()) {
					await interaction.reply("❌ You need an administrator role to run this.");
					return;
				}
				currentCommand.push(argFound);
			}
		}

		await interaction.deferReply();

		const res = CommandController.instance.runCommand(command, async (result) => {
			await ServerCommand.onCommandResult(interaction, result);
		});
		if (res === false) {
			await interaction.editReply("❌ Could not execute command.");
		}
	}

	public async autocomplete(interaction: AutocompleteInteraction) {
		if (!interaction) {
			return;
		}

		const guild = await Guild.findOrCreate(interaction.guildId ?? "");
		const isAdmin = await guild.isMemberAdmin(interaction.user.id);

		const inputs = this.dummyArgNames
			.map(arg => interaction.options.getString(arg))
			.filter(arg => arg !== null && arg !== undefined && arg?.trim() !== "")
			.map(arg => arg?.trim());
		const focused = interaction.options.getFocused(true);
		const focusedValue = focused.value.toLowerCase().trim();
		const focusIdx = this.dummyArgNames.indexOf(focused.name);

		const currentCommand: ServerCommandArg[] = [];
		let idx = 0;
		for (const arg of inputs) {
			if (idx === focusIdx || !arg) {
				break;
			}

			const choices = this.getChoices(currentCommand, isAdmin);
			const argFound = choices.find(a => a.getName() === arg);
			if (argFound) {
				currentCommand.push(argFound);
			} else {
				currentCommand.push(new ServerCommandArg(arg));
			}

			++idx;
		}
		let choices = this.getChoices(currentCommand, isAdmin);
		// Filter choices by removing args that are not at the current arg index
		choices = choices.filter(arg => arg.getIndex() === currentCommand.length);

		await interaction.respond(choices
			.filter(arg => focusedValue === "" || arg.getName().toLowerCase().includes(focusedValue))
			.slice(0, 25)
			.map(arg => arg.toDiscordChoiceData()));
	}

	public static async onCommandResult(interaction: CommandInteraction, result: ICommandResult) {
		let text = result.success ? "✅ Command executed successfully." : "❌ Command failed.";

		result.output = result.output.trim();
		if (result.output.length > 0) {
			text += "\nOutput: ```\n" + result.output + "```";
		}

		const split = Bot.splitMessage(text, {
			maxLength: 1940,
			prepend: "```\n",
			append: "\n```",
			char: "\n",
		});
		await interaction.editReply(split.shift() ?? "");
		for (const msg of split) {
			await interaction.followUp(msg);
		}
	}

	private getChoices(currentCommand: ServerCommandArg[], isAdmin: boolean) {
		if (currentCommand.length === 0) {
			return this.commandArguments.filter(arg => isAdmin || !arg.requiresAdmin());
		}
		let choices = [
			...currentCommand[currentCommand.length - 1].getArgs(),
			...(currentCommand.map(a => a.getArgs()).filter(ar => ar.length > 0).slice(-1)[0] ?? []),
		];
		choices = choices.filter(arg => isAdmin || !arg.requiresAdmin());
		return Array.from(new Set(choices));
	}
}
