import {
	Set,
	Map,
	fromJS,
}                      from "immutable";
import UserUtils       from "project/scripts/utils/user";
import DictionaryUtils from "project/scripts/utils/dictionary";

function getCurrentPagePath() {
	return `${document.location.pathname}${document.location.search}${document.location.hash}`;
}

export const LOGOUT = "@XWORD/SESSION/LOGOUT";

export function logout() {
	return (dispatch) => {
		const currentPage = getCurrentPagePath();

		// Dispatch an action, mainly for logging purposes (in case we're logging
		// actions)
		dispatch(
			{
				type: LOGOUT
			}
		);

		document.location.href = `/logout?redirectTo=${encodeURIComponent(currentPage)}`;
	};
}

export const LOGIN = "@XWORD/SESSION/LOGIN";

export function login({ provider }) {
	return (dispatch) => {
		const currentPage = getCurrentPagePath();

		// Dispatch an action, mainly for logging purposes (in case we're logging
		// actions)
		dispatch(
			{
				type: LOGIN,
				payload: {
					provider
				}
			}
		);

		if (provider === "facebook") {
			document.location.href = `/auth/facebook?redirectTo=${encodeURIComponent(currentPage)}`;
		}
		else if (provider === "google") {
			document.location.href = `/auth/google?redirectTo=${encodeURIComponent(currentPage)}`;
		}
		else if (provider === "twitter") {
			document.location.href = `/auth/twitter?redirectTo=${encodeURIComponent(currentPage)}`;
		}
	};
}

export const GET_USERS = "@XWORD/USERS/GET";

export function getUsers({ userIDs }) {
	return (dispatch, getState) => {
		userIDs = Set.of(...userIDs);
		if (userIDs.size === 0) {
			// Nothing requested, nothing to do
			return;
		}

		const missingUsers = userIDs.subtract(Set.fromKeys(getState().get("users").items));

		if (missingUsers.size === 0) {
			// Have the users; no need to fetch any
			return;
		}

		return dispatch({
			type: GET_USERS,
			payload: UserUtils.getUsers({
				userIDs: userIDs.toArray()
			}),
		});
	};
}

export const UPDATE_USER_PROFILE = "@XWORD/USERS/UPDATE";

export function updateUserProfile({ user }) {
	return {
		type: UPDATE_USER_PROFILE,
		payload: {
			user
		},
	};
}

export const CHANGE_USER_PROFILE = "@XWORD/USERS/CHANGE";

export function changeUserProfile({ userID, updates }) {
	return {
		type: CHANGE_USER_PROFILE,
		payload: {
			userID,
			updates
		},
	};
}


export const SET_UI_STATE = "@XWORD/UI/SET_STATE";

export function setUIState({ section, settings }) {
	return {
		type: SET_UI_STATE,
		payload: {
			section,
			settings
		},
	};
}

export const ADD_PUZZLE = "@XWORD/PUZZLES/ADD";

export function addPuzzle({ puzzle, setAsCurrent }) {
	return {
		type: ADD_PUZZLE,
		payload: {
			puzzle,
			setAsCurrent,
		},
	};
}

export const SET_GENERATED_PUZZLE = "@XWORD/PUZZLES/GENERATED/SET";

export function setGeneratedPuzzle({ puzzle }) {
	return {
		type: SET_GENERATED_PUZZLE,
		payload: {
			puzzle
		},
	};
}

export const UPDATE_GENERATED_PUZZLE_CELL = "@XWORD/PUZZLES/GENERATED/UPDATE_CELL";

export function updateGeneratedPuzzleCell({ columnIndex, rowIndex, cell }) {
	return {
		type: UPDATE_GENERATED_PUZZLE_CELL,
		payload: {
			columnIndex,
			rowIndex,
			cell
		},
	};
}

export const UPDATE_GENERATED_PUZZLE_GRID = "@XWORD/PUZZLES/GENERATED/UPDATE_GRID";

export function updateGeneratedPuzzleGrid({ grid }) {
	return {
		type: UPDATE_GENERATED_PUZZLE_GRID,
		payload: {
			grid
		},
	};
}

export const UPDATE_GENERATED_PUZZLE_CLUE = "@XWORD/PUZZLES/GENERATED/UPDATE_CLUE";

export function updateGeneratedPuzzleClue({ clueNumber, clueText, direction }) {
	return {
		type: UPDATE_GENERATED_PUZZLE_CLUE,
		payload: {
			clueNumber,
			clueText,
			direction
		},
	};
}

export const CLEAR_GENERATED_PUZZLE_CLUES = "@XWORD/PUZZLES/GENERATED/CLEAR_CLUES";

export function clearGeneratedPuzzleClues() {
	return {
		type: CLEAR_GENERATED_PUZZLE_CLUES,
	};
}

export const SET_CURRENT_PUZZLE_INDEX = "@XWORD/PUZZLES/SET_CURRENT_INDEX";

export function setCurrentPuzzleIndex({ index }) {
	return {
		type: SET_CURRENT_PUZZLE_INDEX,
		payload: index,
	};
}

export const SET_PUZZLE_CELL_CONTENT = "@XWORD/PUZZLES/SET_CELL_CONTENT";

export function setPuzzleCellContent({ puzzleIndex, position, value }) {
	return {
		type: SET_PUZZLE_CELL_CONTENT,
		payload: {
			puzzleIndex,
			position,
			value,
		},
	};
}

export const FIND_TERMS = "@XWORD/TERMS/FIND";

export function findTerms(searchArgs) {
	return (dispatch, getState) => {
		const state = getState();

		if (!state.getIn(["dictionary", "termSearches", searchArgs.pattern])) {
			dispatch({
				type: FIND_TERMS,
				payload: DictionaryUtils.findTerms(searchArgs).then(
					(results) => Map({
						results,
						searchArgs: fromJS(searchArgs),
					})
				),
			});
		}
	};
}
