import { connect }      from "react-redux";
import selectors from "@app/selectors";
import TopNavigation    from "@app/components/TopNavigation";

const withRedux = connect(
	function mapStateToProps(state) {
		return {
			loggedInUser: selectors.users.getLoggedInUser(state), 
		};
	}
);

const TopNavigationContainer = withRedux(TopNavigation);

TopNavigationContainer.displayName = "TopNavigationContainer";

export default TopNavigationContainer;
