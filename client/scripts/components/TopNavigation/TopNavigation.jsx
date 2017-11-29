import React          from "react";
import PropTypes      from "prop-types";
import {
	Link
}                     from "react-router-dom";
import {
	connect
}                     from "react-redux";
import AppBar         from "material-ui/AppBar";
import Toolbar        from "material-ui/Toolbar";
import Button         from "material-ui/Button";
import IconButton     from "material-ui/IconButton";
import Icon           from "material-ui/Icon";
import Popover        from "material-ui/Popover";
import { withStyles } from "material-ui/styles";
import AccountDialog  from "project/scripts/components/AccountDialog";
import UserRecord     from "project/scripts/records/user";

const styles = {
	userAccount: {
		marginLeft: "auto",
	},
};

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
		classes: PropTypes.object,
		className: PropTypes.string,
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
			<AppBar
				className={this.props.className}
				color="default"
			>
				<Toolbar
				>
					<Button
						component={Link}
						to="/solve"
					>
						Solve
					</Button>
					<Button
						component={Link}
						to="/generate"
					>
						Generate
					</Button>
					<IconButton
						className={this.props.classes.userAccount}
						onClick={(event) => this.setState({
							isAccountDialogPopoverOpen: true,
							accountDialogAnchorEl: event.target,
						})}
					>
						<Icon
							className="fa fa-user"
						/>
					</IconButton>
					<Popover
						open={this.state.isAccountDialogPopoverOpen}
						onRequestClose={() => this.setState({ isAccountDialogPopoverOpen: false })}
						anchorEl={this.state.accountDialogAnchorEl}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
					>
						<AccountDialog
							loggedInUser={this.props.currentUser}
							dispatch={this.props.dispatch}
						/>
					</Popover>
				</Toolbar>
			</AppBar>
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
)(withStyles(styles)(TopNavigation));
