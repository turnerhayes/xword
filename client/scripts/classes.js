import BEMHelper from "react-bem-helper";

const defaultHelper = BEMHelper.withDefaults({
	prefix: "xwc_",
});

export default function BEMClasses(component) {
	return new defaultHelper(component);
}
