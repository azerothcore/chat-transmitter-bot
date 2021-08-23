import { GuardFunction } from "@typeit/discord";
import { Guild } from "../entity/Guild";

export const AdminRole: GuardFunction<"message"> = async ([message], client, next) => {
	const guild = await Guild.findOrCreate(message.guild.id);

	for (const role of guild.adminRoles) {
		if (message.member.roles.cache.some(r => r.id === role.discordId)) {
			await next();
			break;
		}
	}
}
