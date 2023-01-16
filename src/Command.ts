import path from "path";

import glob from "glob-promise";
import { SlashCommandBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";

export interface Command {
	commandName: string;
	description: string;

	build?(builder: SlashCommandBuilder): void | Promise<void>;
	execute(interaction: CommandInteraction): Promise<void>;
	autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

export const getAllCommands = async (): Promise<Command[]> => {
	const files = await glob.promise("commands/**/*.js", { cwd: __dirname });
	const imports = await Promise.all(files.map((file: string) => {
		return import(path.join(__dirname, file));
	}));
	return imports
		.map(imp => imp.default)
		.filter(val => typeof val === "function")
		.map(clss => new clss());
};
