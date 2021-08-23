import { GuardFunction } from "@typeit/discord";

export const Admin: GuardFunction<"message"> = async ([message], client, next) => {
	if (message.member.hasPermission("ADMINISTRATOR")) {
		await next();
	}
}
