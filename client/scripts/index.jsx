import ReactDOM         from "react-dom";
import React            from "react";
import { Switch }       from "react-router";
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
import Login            from "project/scripts/components/Login";
import CreateGame       from "project/scripts/components/CreateGame";
import PlayGame         from "project/scripts/components/PlayGame";
import HowToPlay        from "project/scripts/components/HowToPlay";


ReactDOM.render(
	<Provider store={getStore()}>
		<ConnectedRouter history={history}>
			<App>
				<Route
					exact
					name="Login"
					path="/login"
					component={Login}
				/>
				<Route
					exact
					name="Home"
					path="/"
					component={Home}
				>
				</Route>
				<Route
					exact
					name="How to Play"
					path="/how-to-play"
					component={HowToPlay}
				>
				</Route>
				<Switch>
					<Route
						name="Create Game"
						path="/game/create"
						component={CreateGame}
					/>
					<Route
						name="Play Game"
						path="/game/:name"
						render={
							({ match }) => {
								return (
									<PlayGame
										gameName={match.params.name}
										width={15}
										height={15}
									/>
								);
							}
						}
					/>
				</Switch>
			</App>
		</ConnectedRouter>
	</Provider>,
	document.getElementById("app")
);