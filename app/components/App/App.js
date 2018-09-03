import React                        from "react";
import { Switch, Route }            from "react-router-dom";
import { Loadable as NotFoundPage } from "@app/components/NotFoundPage";
import { Loadable as HomePage }     from "@app/components/HomePage";
import SolvePuzzle                  from "@app/containers/SolvePuzzle";
import GeneratePuzzle               from "@app/containers/GeneratePuzzle";
import TopNavigation                from "@app/containers/TopNavigation";
import                                   "./App.less";

/**
 * Root application component.
 *
 * @memberof client.react-components
 * @extends external:React.Component
 */
class App extends React.Component { // Do not use PureComponent; messes with react-router
	/**
	 * Generates a Route component for the sidebar that renders the specified
	 * component and is bound to the specified path.
	 *
	 * @function
	 * @private
	 *
	 * @param {React.Component} Component - the component to render in the sidebar
	 * @param {string} path - the path at which to render the Route
	 *
	 * @returns {React.Component} the react-router-dom Route component
	 */
	sidebarRoute = (Component, path) => {
		return (
			<Route exact path={path}
				render={(props) => (
					<aside
						className="page-layout__left-panel"
					>
						<Component {...props} />
					</aside>
				)}
			/>
		);
	}

	/**
	 * Generates a React component representing the application.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		return (
			<section
				className="page-layout__main-container"
			>
				<header
					className="page-layout__main-header"
				>
					<TopNavigation
					/>
				</header>
				<div
					className="page-layout__main-content-container"
				>
					<article
						className="page-layout__main-content"
					>
						<Switch>
							<Route exact path="/" component={HomePage} />
							<Route exact path="/puzzle/solve" component={SolvePuzzle} />
							<Route exact path="/puzzle/generate" component={GeneratePuzzle} />
							<Route component={NotFoundPage} />
						</Switch>
					</article>
				</div>
			</section>
		);
	}
}

export default App;
