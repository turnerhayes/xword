module.exports = function(env) {
	env = env || "dev";
	
	return require(`./webpack.${env}.config.js`);
};
