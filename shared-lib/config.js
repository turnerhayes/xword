"use strict";

const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

const webSocketsInline = !process.env.WEB_SOCKETS_URL;

const websocketsPath = webSocketsInline ?
	"/sockets" :
	undefined;

const websocketsUrl = webSocketsInline ?
	global.document.origin :
	process.env.WEB_SOCKETS_URL;

let staticContentURL = process.env.STATIC_CONTENT_URL;
const staticContentInline = !staticContentURL;

if (staticContentInline) {
	staticContentURL = global.document.origin;
}
else {
	staticContentURL = staticContentURL.replace(/\/$/, "");
}


const colors = [
	{
		id: "blue",
		name: "Blue",
		hex: "#0000FF"
	},
	{
		id: "red",
		name: "Red",
		hex: "#FF0000"
	},
	{
		id: "yellow",
		name: "Yellow",
		hex: "#FFFF00"
	},
	{
		id: "green",
		name: "Green",
		hex: "#008000"
	},
	{
		id: "purple",
		name: "Purple",
		hex: "#9706CC"
	},
	{
		id: "black",
		name: "Black",
		hex: "#000000"
	}
];

// Cache a mapping of color ID to index within the colors array so that
// we can quickly look up the color definition in the `get` method below
const colorIndexMap = colors.reduce(
	(mapping, colorDefinition, index) => {
		mapping[colorDefinition.id] = index;

		return mapping;
	},
	{}
);

Object.defineProperty(
	colors,
	// Utility method to fetch a color definition from a color ID
	"get",
	{
		value: function getColorDefinition(colorID) {
			return colors[colorIndexMap[colorID]];
		}
	}
);


exports = module.exports = {
	app: {
		environment: ENVIRONMENT,
		isDevelopment: IS_DEVELOPMENT
	},

	game: {
		board: {
			width: {
				min: 15,
				max: 25
			},
			height: {
				min: 15,
				max: 25
			}
		},
		players: {
			min: 3,
			max: 6
		},
		colors
	},

	staticContent: {
		inline: staticContentInline,
		url: staticContentURL
	},

	websockets: {
		inline: webSocketsInline,
		url: websocketsUrl,
		path: websocketsPath
	}
};
