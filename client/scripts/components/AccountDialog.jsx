import React      from "react";
import PropTypes  from "prop-types";
import { Link }   from "react-router-dom";
import IconButton from "material-ui/IconButton";
import UserRecord from "project/scripts/records/user";
import {
	login,
	logout
}                 from "project/scripts/redux/actions";
import Config     from "project/scripts/config";
import                 "project/styles/account-dialog.less";

const PROVIDER_ICON_MAP = {
	facebook: "fa-facebook-square",
	google: "fa-google-plus-square",
	twitter: "fa-twitter-square"
};


function handleLogoutButtonClicked({ dispatch }) {
	dispatch(logout());
}

function handleLoginClicked({ dispatch, provider }) {
	dispatch(login({ provider }));
}

function renderNotLoggedIn(dispatch) {
	return (
		<div>
			{
				Config.auth.facebook.isEnabled && (
					<IconButton
						className="login-link"
						iconClassName={`fa ${PROVIDER_ICON_MAP.facebook}`}
						title="Log in with Facebook"
						aria-label="Log in with Facebook"
						onClick={() => handleLoginClicked({ dispatch, provider: "facebook" })}
					/>
				)
			}
			{
				Config.auth.google.isEnabled && (
					<IconButton
						className="login-link"
						iconClassName={`fa ${PROVIDER_ICON_MAP.google}`}
						title="Log in with Google"
						aria-label="Log in with Google"
						onClick={() => handleLoginClicked({ dispatch, provider: "google" })}
					/>
				)
			}
			{
				Config.auth.twitter.isEnabled && (
					<IconButton
						className="login-link"
						iconClassName={`fa ${PROVIDER_ICON_MAP.twitter}`}
						title="Log in with Google"
						aria-label="Log in with Google"
						onClick={() => handleLoginClicked({ dispatch, provider: "twitter" })}
					/>
				)
			}
		</div>
	);
}

/**
 * Generates a React component representing the dialog shown to allow users to manage their site account
 * (log in/out, edit profile, etc.).
 *
 * @memberof client.react-components
 *
 * @param {object} props - props for the component
 *
 * @return {external:React.Component} the component to render
 */
function AccountDialog(props) {
	const providerIcon = props.loggedInUser && PROVIDER_ICON_MAP[props.loggedInUser.provider];

	return (
		<div
			className="c_account-dialog"
		>
			{
				<h4
				>
					{
						props.loggedInUser && (
							<Link
								to={`/profile/${props.loggedInUser.username}`}
							>
								{
									providerIcon && (
										<span
											className={`fa ${providerIcon} provider-icon`}
										></span>
									)
								}
								{ props.loggedInUser.name.get("display") }
							</Link>
						)
					}
					{
						props.loggedInUser && (
							<IconButton
								type="button"
								iconClassName="fa fa-sign-out"
								aria-label="Log out"
								title="Log out"
								onClick={handleLogoutButtonClicked}
							/>
						)
					}
					{
						!props.loggedInUser && "Log in"
					}
				</h4>
			}
			{
				!props.loggedInUser && renderNotLoggedIn(props.dispatch)
			}
		</div>
	);
}

/**
 * Component prop types
 *
 * @prop {function} dispatch - function to dispatch actions to the Redux store
 * @prop {client.records.UserRecord} [loggedInUser] - the currently logged in user, if any
 */
AccountDialog.propTypes = {
	dispatch: PropTypes.func.isRequired,
	loggedInUser: PropTypes.instanceOf(UserRecord),
};

export default AccountDialog;
