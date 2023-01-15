import { Bot } from "../Bot";
import { Event } from "./Event";
import { IAnticheatReport, EAnticheatReportType } from "../model/IAnticheatReport";

export class AnticheatController {
	private recentReports: { [key: number]: EAnticheatReportType[] };

	public constructor() {
		this.recentReports = {};
	}

	@Event("anticheatReport")
	public anticheatReport(data: IAnticheatReport): void {
		if (!(data.player.guid in this.recentReports)) {
			this.recentReports[data.player.guid] = [];
		}
		if (this.recentReports[data.player.guid].includes(data.reportType)) {
			return;
		}
		this.recentReports[data.player.guid].push(data.reportType);
		setTimeout(() => this.removeRecentReport(data), Bot.instance.config.anticheatReportThrottleDuration * 1000);

		Bot.instance.onAnticheatReport(data);
	}

	private removeRecentReport(data: IAnticheatReport) {
		if (!(data.player.guid in this.recentReports)) {
			return;
		}

		this.recentReports[data.player.guid] = this.recentReports[data.player.guid].filter(type => type !== data.reportType);
		if (this.recentReports[data.player.guid].length === 0) {
			delete this.recentReports[data.player.guid];
		}
	}
}
