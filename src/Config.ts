import * as fs from "fs";

const fsAsync = fs.promises;

export class Config {
	public listenPort: number;
	public secretKey: string;
	public discordToken: string;
	public useClassEmoji: boolean;
	public classEmojis: string[];
	public useRaceEmoji: boolean;
	public raceEmojis: string[];
	public filterAtHere: boolean;
	public filterAtEveryone: boolean;
	public apiBaseUrl: string;
	public ignoreGuilds: string[];

	private static checkedMissingField: boolean = false;

	public static async load(): Promise<Config> {
		const json: Buffer = await fsAsync.readFile("config.json");
		const config = JSON.parse(json.toString()) as Config;

		if (!Config.checkedMissingField) {
			const defaultConfigJson = await fsAsync.readFile("config.default.json");
			const defaultConfig = JSON.parse(defaultConfigJson.toString());
			Config.checkAllMissingFields(config, defaultConfig);
			Config.checkedMissingField = true;
		}

		return config;
	}

	private static checkAllMissingFields(obj: object, model: object, parentName: string = "") {
		const missing = Config.hasMissingFields(obj, model);
		if (parentName !== "") {
			parentName += ".";
		}
		for (const field of missing) {
			console.warn(`Field ${parentName}${field} is missing in config.json!`);
		}
		for (const key in model) {
			if (typeof model[key] === "object" && obj.hasOwnProperty(key)) {
				Config.checkAllMissingFields(obj[key], model[key], parentName + key);
			}
		}
	}

	private static hasMissingFields(obj: object, model: object): string[] {
		const missing = [];
		for (const key in model) {
			if (!obj.hasOwnProperty(key)) {
				missing.push(key);
			}
		}
		return missing;
	}
};
