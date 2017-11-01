import React            from "react";
import PropTypes        from "prop-types";
import { withRouter }   from "react-router";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import TopNavigation    from "project/scripts/components/TopNavigation";
import                       "project/styles/page-layout.less";

/**
 * Root application component.
 *
 * @memberof client.react-components
 */
class App extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {Types.RenderableElement} [children=[]] - child(ren) of the component
	 * @prop {external:React.Component} [sidebar] - Component to render in the sidebar
	 */
	static propTypes = {
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		]),
		sidebar: PropTypes.element
	}

	static defaultProps = {
		children: []
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
			<MuiThemeProvider>
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
							{this.props.children}
						</article>
						{
							this.props.sidebar && (
								<aside
									className="page-layout__left-panel"
								>{this.props.sidebar}</aside>
							)
						}
					</div>
				</section>
			</MuiThemeProvider>
		);
	}
}

export default withRouter(App);
