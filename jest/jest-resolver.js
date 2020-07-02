const {
	NodeJsInputFileSystem,
	CachedInputFileSystem,
	ResolverFactory
} = require("enhanced-resolve");
const alias = require("../webpack-aliases");

const CACHE_DURATION_IN_MILLISECONDS = 4000;

const myResolver = ResolverFactory.createResolver({
	fileSystem: new CachedInputFileSystem(
		new NodeJsInputFileSystem(),
		CACHE_DURATION_IN_MILLISECONDS
	),
	extensions: [".js", ".json"],
	useSyncFileSystemCalls: true,
	alias,
});


exports = module.exports = function jestResolver(moduleName, info) {
	const resolveContext = {};
	return myResolver.resolveSync({}, info.basedir, moduleName, resolveContext);
};
