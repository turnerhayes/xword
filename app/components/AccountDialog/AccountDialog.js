import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }           from "react-router-dom";
import {
	injectIntl,
	intlShape,
}                         from "react-intl";
import classnames         from "classnames";
import Button             from "@material-ui/core/Button";
import Icon               from "@material-ui/core/Icon";
import IconButton         from "@material-ui/core/IconButton";
import Card               from "@material-ui/core/Card";
import CardContent        from "@material-ui/core/CardContent";
import CardHeader         from "@material-ui/core/CardHeader";
import CardActions        from "@material-ui/core/CardActions";
import { withStyles }     from "@material-ui/core/styles";
import Config             from "@app/config";
import messages           from "./messages";
import                         "@app/fonts/icomoon/style.css";

const PROVIDER_INFO = {
	facebook: {
		id: "facebook",
		name: "Facebook",
		ligature: "facebook",
	},
	google: {
		id: "google",
		name: "Google+",
		ligature: "google plus"
	},
	twitter: {
		id: "twitter",
		name: "Twitter",
		ligature: "twitter",
	},
};

const styles = {
	loginLink: {
		fontSize: "2em",
	},

	providerIcon: {
		marginRight: "0.5em",
	},

	buttonIcon: {
		marginRight: "1em",
		fontSize: "2em",
	},
};

/**
 * Represents the dialog shown to allow users to manage their site account (log in/out, edit profile, etc.).
 *
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class AccountDialog extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} onLogin - function to log in
	 * @prop {function} onLogout - function to log out
	 * @prop {external:Immutable.Map} [loggedInUser] - the currently logged in user, if any
	 * @prop {string} [className] - the class(es) to add to the dialog
	 */
	static propTypes = {
		onLogin: PropTypes.func.isRequired,
		onLogout: PropTypes.func.isRequired,
		loggedInUser: ImmutablePropTypes.map,
		enabledProviders: PropTypes.arrayOf(
			PropTypes.oneOf(Object.keys(PROVIDER_INFO))
		).isRequired,
		className: PropTypes.string,
		classes: PropTypes.object.isRequired,
		intl: intlShape.isRequired,
	}

	static defaultProps = {
		enabledProviders: Object.keys(PROVIDER_INFO).filter(
			(provider) => Config.auth[provider] && Config.auth[provider].isEnabled
		),
	}

	loginMethods = {}

	formatMessage = (...args) => {
		return this.props.intl.formatMessage(...args);
	}

	/**
	 * Handles the click of the Logout button.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleLogoutButtonClicked = () => {
		this.props.onLogout();
	}

	/**
	 * Handles the click of a Login button.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {string} args.provider - the name of the credential provider to use (e.g. "facebook", "twitter")
	 *
	 * @return {void}
	 */
	handleLoginClicked = ({ provider }) => {
		this.props.onLogin({ provider });
	}

	/**
	 * Generates a React component representing the view of the dialog when the user is not logged in.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderNotLoggedIn = () => {
		const { classes } = this.props;

		return (
			<div>
				{
					Object.keys(PROVIDER_INFO).map(
						(provider) => {
							if (!this.props.enabledProviders.includes(provider)) {
								return null;
							}

							/* istanbul ignore else */
							if (!this.loginMethods[provider]) {
								this.loginMethods[provider] = this.handleLoginClicked.bind(this, { provider });
							}

							const logInWithMessage = this.formatMessage(messages.actions.logInWith, {
								provider: PROVIDER_INFO[provider].name
							});

							return (
								<IconButton
									key={provider}
									className={classes.loginLink}
									title={logInWithMessage}
									aria-label={logInWithMessage}
									onClick={this.loginMethods[provider]}
								>
									<Icon
										className="icon"
									>
										{PROVIDER_INFO[provider].ligature}
									</Icon>
								</IconButton>
							);
						}
					)
				}
			</div>
		);
	}

	/**
	 * Generates a React component representing the dialog.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		const {
			classes
		} = this.props;

		const title = this.props.loggedInUser ? (
			<div>
				<Icon
					className={classnames(
						"icon",
						classes.providerIcon,
					)}
				>
					{PROVIDER_INFO[this.props.loggedInUser.get("provider")].ligature}
				</Icon>
				<Link
					to={`/profile/${this.props.loggedInUser.get("username")}`}
				>
					{this.props.loggedInUser.getIn(["name", "display"])}
				</Link>
			</div>
		) :
			this.formatMessage(messages.actions.logIn);

		return (
			<Card>
				<CardHeader
					title={title}
				>
				</CardHeader>
				<CardContent>
					{
						this.props.loggedInUser ?
							null :
							this.renderNotLoggedIn()
					}
				</CardContent>
				{
					this.props.loggedInUser && (
						<CardActions>
							<Button
								onClick={this.handleLogoutButtonClicked}
							>
								<Icon
									className={classnames(
										"icon",
										classes.buttonIcon
									)}
								>
									log out
								</Icon>
								{this.formatMessage(messages.actions.logOut)}
							</Button>
						</CardActions>
					)
				}
			</Card>
		);
	}
}

export { AccountDialog as Unwrapped };

export default injectIntl(
	withStyles(styles)(AccountDialog)
);
