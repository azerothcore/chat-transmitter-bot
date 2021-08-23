import { GuardFunction } from "@typeit/discord";
import { Bot } from "../Bot";

export const IgnoreGuild: GuardFunction<"message"> = async ([message], client, next) => {
	if (!Bot.instance.config.ignoreGuilds.includes(message.guild.id)) {
		await next();
	}
}
