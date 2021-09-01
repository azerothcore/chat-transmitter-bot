import { ChatMsg } from "../enums";
import { IPlayerInfo } from "./IPlayerInfo";

export interface IChat {
	guildId: string;
	player: IPlayerInfo;
	text: string;
	type: ChatMsg;
	zone: string;
};
