import fs from "fs-extra";

import { EAnticheatReportType } from "./model/IAnticheatReport";

export class Config {
	public wsPort: number;
	public httpHost: string;
	public httpPort: number;
	public secretKey: string;
	public discordClientId: string;
	public discordToken: string;
	public useClassEmoji: boolean;
	public classEmojis: string[];
	public useRaceEmoji: boolean;
	public raceEmojis: string[][];
	public useRaidMarkerEmoji: boolean;
	public raidMarkerEmojis: string[];
	public confirmEmojis: string[];
	public filterAtHere: boolean;
	public filterAtEveryone: boolean;
	public apiBaseUrl: string;
	public ignoreGuilds: string[];
	public queryResultsKeepDuration: number;
	public anticheatReportCooldown: number;
	public anticheatFilteredReportTypes: EAnticheatReportType[];
	public moneyEmojis: { gold: string, silver: string, copper: string };

	private static checkedMissingField: boolean;

	public static async load(): Promise<Config> {
		const json: Buffer = await fs.readFile("config.json");
		const config = JSON.parse(json.toString()) as Config;

		if (!Config.checkedMissingField) {
			const defaultConfigJson = await fs.readFile("config.default.json");
			const defaultConfig = JSON.parse(defaultConfigJson.toString());
			Config.checkAllMissingFields(config, defaultConfig);
			Config.checkedMissingField = true;
		}

		return config;
	}

	private static checkAllMissingFields(obj: object, model: object, parentName = "") {
		const missing = Config.hasMissingFields(obj, model);
		if (parentName !== "") {
			parentName += ".";
		}
		for (const field of missing) {
			console.warn(`Field ${parentName}${field} is missing in config.json!`);
		}
		for (const key in model) {
			if (typeof model[key] === "object" && Object.prototype.hasOwnProperty.call(obj, key)) {
				Config.checkAllMissingFields(obj[key], model[key], parentName + key);
			}
		}
	}

	private static hasMissingFields(obj: object, model: object): string[] {
		const missing: string[] = [];
		for (const key in model) {
			if (!Object.prototype.hasOwnProperty.call(obj, key)) {
				missing.push(key);
			}
		}
		return missing;
	}
}
