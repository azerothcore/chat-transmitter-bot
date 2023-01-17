import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

import { Bot } from "../Bot";
import { Command } from "../Command";
import { CommandController } from "../controller/CommandController";

export default class Mail implements Command {
	public commandName = "mail";
	public description = "Sends to one or multiple players";

	public async execute(interaction: CommandInteraction) {
		const modalId = `mail-modal-${interaction.id}`;
		const modal = new ModalBuilder()
			.setCustomId(modalId)
			.setTitle("Send Mail");

		const playersInput = new TextInputBuilder()
			.setCustomId("playersInput")
			.setLabel("Recipient names (comma-separated)")
			.setRequired(true)
			.setMaxLength(500)
			.setStyle(TextInputStyle.Short);
		const subjectInput = new TextInputBuilder()
			.setCustomId("subjectInput")
			.setLabel("Subject")
			.setRequired(true)
			.setMaxLength(64)
			.setStyle(TextInputStyle.Short);
		const moneyInput = new TextInputBuilder()
			.setCustomId("moneyInput")
			.setLabel("Money (in copper)")
			.setRequired(false)
			.setStyle(TextInputStyle.Short);
		const itemsInput = new TextInputBuilder()
			.setCustomId("itemsInput")
			.setLabel("Items (itemid1[:count1] itemid2[:count2] ...)")
			.setRequired(false)
			.setStyle(TextInputStyle.Short);
		const bodyInput = new TextInputBuilder()
			.setCustomId("bodyInput")
			.setLabel("Body")
			.setRequired(false)
			.setMaxLength(500)
			.setStyle(TextInputStyle.Paragraph);

		const rows = [playersInput, subjectInput, moneyInput, itemsInput, bodyInput].map(input => new ActionRowBuilder<TextInputBuilder>().addComponents(input));
		modal.addComponents(rows);
		await interaction.showModal(modal);

		const submission = await interaction.awaitModalSubmit({
			time: 3600000,
			filter: (i => i.customId === modalId && i.user.id === interaction.user.id),
		}).catch(() => {
			return null;
		});

		if (submission) {
			const playersStr = submission.fields.getTextInputValue("playersInput");
			const players = playersStr.split(",").map(player => player.trim()).map(player => player.charAt(0).toUpperCase() + player.slice(1).toLowerCase());
			const subject = submission.fields.getTextInputValue("subjectInput").trim();
			let money = parseInt(submission.fields.getTextInputValue("moneyInput").trim());
			if (isNaN(money)) {
				money = 0;
			}
			const itemsStr = submission.fields.getTextInputValue("itemsInput");
			const items = itemsStr.split(/\s/).map(part => {
				const split = part.split(":");
				const itemId = parseInt(split[0]);
				if (isNaN(itemId)) {
					return null;
				}
				let count = parseInt(split[1]);
				if (isNaN(count)) {
					count = 1;
				}
				return { itemId, count };
			}).filter(item => item !== null);
			const body = submission.fields.getTextInputValue("bodyInput").trim().replace(/"/g, "'");

			let confirmTxt = `Send the following mail${players.length > 1 ? "s" : ""}?\n`;
			confirmTxt += `\n**${players.length > 1 ? "Recipients" : "Recipient"}**: ${players.join(", ")}`;
			confirmTxt += `\n**Subject**: ${subject}`;
			if (money > 0) {
				confirmTxt += `\n**Money**: ${Bot.instance.formatMoney(money)}`;
			}
			if (items.length > 0) {
				confirmTxt += `\n**${items.length > 1 ? "Items" : "Item"}**: ` + items.map(item => `${item?.itemId}${(item?.count ?? 0) > 1 ? (" x" + item?.count) : ""}`).join(", ");
			}
			if (body === "") {
				confirmTxt += "\nNo body";
			} else {
				confirmTxt += "\n```\n" + body + "```";
			}
			const buttonId = `mail-confirm-${submission.id}`;
			const confirmButton = new ButtonBuilder()
				.setCustomId(buttonId)
				.setLabel("Send")
				.setEmoji("✉️")
				.setStyle(ButtonStyle.Primary);
			const row = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(confirmButton);
			await submission.deferReply();
			const response = await submission.editReply({
				content: confirmTxt,
				components: [row],
			});

			const clicked = await response.awaitMessageComponent({
				time: 3600000,
				filter: (click) => click.customId === buttonId && click.user.id === interaction.user.id,
				componentType: ComponentType.Button,
			}).catch((err) => {
				// Timed out
				return null;
			});
			if (clicked) {
				const commands = this.makeMailCommands(players, subject, money, items, body);
				let remainingCommands = commands.length;
				const errors: string[] = [];
				for (const cmd of commands) {
					const res = CommandController.instance.runCommand(cmd, async (result) => {
						if (!result.success) {
							errors.push(result.output);
						}

						remainingCommands -= 1;
						if (remainingCommands > 0) {
							return;
						}

						if (errors.length > 0) {
							await clicked.reply(errors.join("\n"));
						} else {
							await clicked.reply(`📨 Mail${commands.length > 1 ? "s" : ""} sent!`);
						}
					});

					if (res === false) {
						await clicked.reply("❌ Could not send mail");
					}
				}
			}
		}
	}

	private makeMailCommands(players: string[], subject: string, money: number, items: ({ count: number, itemId: number } | null)[], body: string): string[] {
		const commands: string[] = [];

		for (const player of players) {
			if (money > 0) {
				commands.push(`send money ${player} "${subject}" "${body}" ${money}`);
			}
			if (items.length > 0) {
				commands.push(`send items ${player} "${subject}" "${body}" ${items.map(item => `${item?.itemId}:${item?.count}`).join(" ")}`);
			}
			if (money === 0 && items.length === 0) {
				commands.push(`send mail ${player} "${subject}" "${body}"`);
			}
		}

		return commands;
	}
}
