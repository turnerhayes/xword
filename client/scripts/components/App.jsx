import React          from "react";
import PropTypes      from "prop-types";
import classnames     from "classnames";
import { withRouter } from "react-router";
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
function App({ children, sidebar, classes }) {
	return (
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
						{children}
					</article>
					{
						sidebar && (
							<aside
								className="page-layout__left-panel"
							>{sidebar}</aside>
						)
					}
				</div>
			</section>
		</MuiThemeProvider>
	);
}

/**
 * @member {object} - Component prop types
 *
 * @prop {Types.RenderableElement} [children=[]] - child(ren) of the component
 * @prop {external:React.Component} [sidebar] - Component to render in the sidebar
 */
App.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	]),
	sidebar: PropTypes.element,
	classes: PropTypes.object,
};

App.defaultProps = {
	children: []
};


export default withRouter(withStyles(styles)(App));
