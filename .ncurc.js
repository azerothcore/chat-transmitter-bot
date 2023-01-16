module.exports = {
	target: (dependencyName) => {
		if (["node-fetch", "nanoid", "query-string"].includes(dependencyName)) {
			// Don't update these packages to the latest major version, keep current major and update minor and patch versions
			const res = "minor";
			return res;
		}
		return "latest";
	},
}
