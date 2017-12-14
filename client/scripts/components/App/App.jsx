import React          from "react";
import PropTypes      from "prop-types";
import {
	Route
}                       from "react-router-dom";
import { Provider }     from "react-redux";
import {
	ConnectedRouter
}                       from "react-router-redux";
import classnames     from "classnames";
import { history }      from "project/scripts/redux/configure-store";
import getStore         from "project/scripts/redux/store";
import {
	MuiThemeProvider,
	createMuiTheme,
	withStyles,
}                     from "material-ui/styles";
import {
	purple,
	green,
	orange
}                     from "material-ui/colors/purple";
import TopNavigation  from "project/scripts/components/TopNavigation";
import Home             from "project/scripts/components/Home";
import SolvePuzzle      from "project/scripts/containers/SolvePuzzle";
import GeneratePuzzle   from "project/scripts/containers/GeneratePuzzle";
import                     "project/styles/page-layout.less";

const TOP_NAVIGATION_BAR_HEIGHT = 60;

const theme = createMuiTheme({
	palette: {
		primary: purple,
		secondary: green,
	},
	status: {
		danger: orange,
	},
});

const styles = {
	topNav: {
		height: TOP_NAVIGATION_BAR_HEIGHT,
	},
	mainContent: {
		marginTop: TOP_NAVIGATION_BAR_HEIGHT,
	},
};

/**
 * Generates a React component representing the application.
 *
 * @memberof client.react-components
 * @function
 *
 * @return {external:React.Component} the component to render
 */
function App({ classes }) {
	return (
		<Provider store={getStore()}>
			<ConnectedRouter history={history}>
				<MuiThemeProvider
					theme={theme}
				>
					<section
						className="page-layout__main-container"
					>
						<header
							className="page-layout__main-header"
						>
							<TopNavigation
								className={classes.topNav}
							/>
						</header>
						<div
							className={classnames(
								"page-layout__main-content-container",
								classes.mainContent
							)}
						>
							<article
								className="page-layout__main-content"
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
							</article>
						</div>
					</section>
				</MuiThemeProvider>
			</ConnectedRouter>
		</Provider>
	);
}

/**
 * @member {object} - Component prop types
 */
App.propTypes = {
	classes: PropTypes.object,
};

export default withStyles(styles)(App);
