import { IPlayerInfo } from "./IPlayerInfo";

// https://github.com/azerothcore/mod-anticheat/blob/master/src/AnticheatMgr.h
export enum EAnticheatReportType {
	SpeedHack = 0,
	FlyHack = 1,
	WaterWalkHack = 2,
	JumpHack = 3,
	TeleportPlaneHack = 4,
	ClimbHack = 5,
	TeleportHack = 6,
	IgnoreControl = 7,
	ZAxisHack = 8,
	AntiswimHack = 9,
	GravityHack = 10,
	AntiKnockbackHack = 11,
	NoFallDamageHack = 12,
	OpAckHack = 13,
	CounterMeasures = 14,
}

export interface IAnticheatReport {
	guildId: string;
	player: IPlayerInfo;
	reportType: EAnticheatReportType;
}
