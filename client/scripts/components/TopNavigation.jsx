import React         from "react";
import PropTypes     from "prop-types";
import {
	Link
}                    from "react-router-dom";
import {
	connect
}                    from "react-redux";
import {
	Toolbar,
	ToolbarGroup
}                    from "material-ui/Toolbar";
import IconButton    from "material-ui/IconButton";
import Popover       from "material-ui/Popover";
import AccountDialog from "project/scripts/components/AccountDialog";
import UserRecord    from "project/scripts/records/user";

/**
 * Component representing the navigation bar on the top of the page.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class TopNavigation extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		currentUser: PropTypes.instanceOf(UserRecord),
	}

	state = {
		isAccountDialogPopoverOpen: false,
		accountDialogAnchorEl: null,
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		return (
			<Toolbar
			>
				<ToolbarGroup
					firstChild={true}
				>
					<Link
						to="/solve"
					>
						Solve a Puzzle
					</Link>
					<Link
						to="/generate"
					>
						Generate a Puzzle
					</Link>
				</ToolbarGroup>
			<ToolbarGroup
			>
				<IconButton
					iconClassName="fa fa-user"
					onClick={(event) => this.setState({
						isAccountDialogPopoverOpen: true,
						accountDialogAnchorEl: event.target,
					})}
				/>
				<Popover
					open={this.state.isAccountDialogPopoverOpen}
					onRequestClose={() => this.setState({ isAccountDialogPopoverOpen: false })}
					anchorEl={this.state.accountDialogAnchorEl}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					targetOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<AccountDialog
						loggedInUser={this.props.currentUser}
						dispatch={this.props.dispatch}
					/>
				</Popover>
			</ToolbarGroup>
			</Toolbar>
		);
	}
}

export default connect(
	function mapStateToProps(state) {
		const props = {};

		const usersState = state.get("users");

		props.currentUser = usersState.currentUser;

		return props;
	}
)(TopNavigation);
