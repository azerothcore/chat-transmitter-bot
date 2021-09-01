import { IPlayerInfo } from "./IPlayerInfo";

export interface IChannelChat {
	guildId: string;
	player: IPlayerInfo;
	text: string;
	type: number;
	channel: string;
};
