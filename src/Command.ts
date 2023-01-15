import { SlashCommandBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import glob from "glob-promise";

export interface Command {
	commandName: string;
	description: string;

	build?(builder: SlashCommandBuilder): void | Promise<void>;
	execute(interaction: CommandInteraction): Promise<void>;
	autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

export const getAllCommands = async (): Promise<Command[]> => {
	const files = await glob.promise(__dirname + "/commands/**/*.js");
	const imports = await Promise.all(files.map((file: string) => {
		return import(file.replace(__dirname, ".").replace(".js", ""));
	}));
	return imports
		.map(imp => imp.default)
		.filter(val => typeof val === "function")
		.map(clss => new clss());
};
