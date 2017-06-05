import {
	Record,
	Map
}                 from "immutable";
import GameRecord from "project/scripts/records/game";

const schema = {
	items: Map(),
	getGameError: null
};

class GamesStateRecord extends Record(schema, "GamesState") {
}

GamesStateRecord.prototype.setGetGameError = function setGetGameError(error) {
	return this.set("getGameError", error);
};

GamesStateRecord.prototype.addGame = function addGame(game) {
	return this.setIn(["items", game.name], new GameRecord(game));
};

GamesStateRecord.prototype.createGame = function createGame({ width, height, name, playerLimit }) {
	return this.setIn(["items", name], new GameRecord({
		name: name,
		playerLimit: playerLimit,
		board: {
			width,
			height
		}
	}));
};

GamesStateRecord.prototype.setMarble = function setMarble({ gameName, color, position}) {
	return this.updateIn(["items", gameName], game => game.setMarble({ color, position }));
};

GamesStateRecord.prototype.advancePlayer = function advancePlayer({ gameName }) {
	if (!this.items.has(gameName)) {
		return this;
	}

	return this.setIn(["items", gameName], this.items.get(gameName).advancePlayer());
};

export default GamesStateRecord;
