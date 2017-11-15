import ReactDOM         from "react-dom";
import React            from "react";
import {
	Route
}                       from "react-router-dom";
import { Provider }     from "react-redux";
import {
	ConnectedRouter
}                       from "react-router-redux";
import { history }      from "project/scripts/redux/configure-store";
import getStore         from "project/scripts/redux/store";
import App              from "project/scripts/components/App";
import Home             from "project/scripts/components/Home";
import SolvePuzzle      from "project/scripts/containers/SolvePuzzle";
import GeneratePuzzle   from "project/scripts/containers/GeneratePuzzle";

ReactDOM.render(
	<Provider store={getStore()}>
		<ConnectedRouter history={history}>
			<App
			>
				<Route
					exact
					name="Home"
					path="/"
					component={Home}
				>
				</Route>
				<Route
					exact
					name="Solve a Puzzle"
					path="/solve"
					component={SolvePuzzle}
				>
				</Route>
				<Route
					exact
					name="Generate a Puzzle"
					path="/generate"
					component={GeneratePuzzle}
				>
				</Route>
			</App>
		</ConnectedRouter>
	</Provider>,
	document.getElementById("app")
);
