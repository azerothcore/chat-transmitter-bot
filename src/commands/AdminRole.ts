import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { Guild } from "../entity/Guild";

export default class AdminRole implements Command {
	public commandName = "adminrole";
	public description = "Manage the admin role";

	public build(builder: SlashCommandBuilder): void {
		builder
			.addSubcommand(subcommand => subcommand
				.setName("add")
				.setDescription("Add a role to the list of admin roles")
				.addRoleOption(option => option
					.setName("role")
					.setDescription("The role to add")
					.setRequired(true)
				)
			)
			.addSubcommand(subcommand => subcommand
				.setName("remove")
				.setDescription("Remove a role from the list of admin roles")
				.addRoleOption(option => option
					.setName("role")
					.setDescription("The role to remove")
					.setRequired(true)
				)
			)
			.addSubcommand(subcommand => subcommand
				.setName("list")
				.setDescription("Print a list of the admin roles for this server")
			);
	}

	public async execute(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand()) {
			return;
		}

		const cmd = interaction.options.getSubcommand();
		if (cmd === "add") await this.add(interaction);
		else if (cmd === "remove") await this.remove(interaction);
		else if (cmd === "list") await this.list(interaction);
	}

	private async add(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand()) {
			return;
		}
		const role = interaction.options.getRole("role");
		if (!interaction.guild || !role) {
			return;
		}
		const guild = await Guild.findOrCreate(interaction.guild.id);
		guild.addAdminRole(role.id);
		await interaction.reply(`✅ Role ${role} added as Admin.`);
	}

	private async remove(interaction: CommandInteraction) {
		if (!interaction?.isChatInputCommand()) {
			return;
		}
		const role = interaction.options.getRole("role");
		if (!interaction.guild || !role) {
			return;
		}
		const guild = await Guild.findOrCreate(interaction.guild.id);
		const removed = await guild.removeAdminRole(role.id);
		if (removed) {
			await interaction.reply(`✅ ${role} is no longer an admin role.`);
		} else {
			await interaction.reply(`❌ ${role} is not an admin role.`);
		}
	}

	private async list(interaction: CommandInteraction) {
		if (!interaction || !interaction.guild) {
			return;
		}
		const guild = await Guild.findOrCreate(interaction.guild.id);
		const roles = guild.adminRoles.map(role => `<@&${role.discordId}>`);
		if (roles.length === 0) {
			await interaction.reply("❌ There are no admin roles.");
		} else {
			await interaction.reply(`The following roles are Admins: ${roles.join(", ")}.`);
		}
	}
}
