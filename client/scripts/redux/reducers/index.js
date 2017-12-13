import { combineReducers } from "redux-immutable";
import routerReducer       from "project/scripts/redux/reducers/router";
import usersReducer        from "project/scripts/redux/reducers/users";
import puzzlesReducer      from "project/scripts/redux/reducers/puzzles";
import dictionaryReducer   from "project/scripts/redux/reducers/dictionary";
import uiReducer           from "project/scripts/redux/reducers/ui";

export default combineReducers({
	users: usersReducer,
	puzzles: puzzlesReducer,
	ui: uiReducer,
	dictionary: dictionaryReducer,
	routing: routerReducer,
});
