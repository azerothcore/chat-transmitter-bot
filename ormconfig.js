const fs = require("fs");
const namingStrategies = require("typeorm-naming-strategies");

module.exports = {
	"type": "sqlite",
	"database": "data.sqlite",
	"entities": [
		"build/entity/**/*.js",
	],
	"migrations": [
		"build/migration/**/*.js"
	],
	"cli": {
		"migrationsDir": "src/migration",
	},
	"synchronize": true,
	"migrationsRun": true,
	"namingStrategy": new namingStrategies.SnakeNamingStrategy(),
};
