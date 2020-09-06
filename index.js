/*
 * Botson
 * v1.4.0
 * By Isaac Chen
 * 9/5/2020
 */

// Requires
require("dotenv").config();
const Discord = require("discord.js");
const HTTP = require("http");

// Tokens
const BOT_TOKEN = process.env.BOT_TOKEN;
const TENOR_TOKEN = process.env.TENOR_TOKEN;

// Settings
const MAX_GIFS = 10;
const caasinehcID = "195213987871195137";

// Bot and token
const bot = new Discord.Client();

// Functions
// Send an http request to get random Emma Watson GIF links from Tenor
function getGIFURLs(count, PG_only = false) {
	// Sanitize the count argument
	if(!Number.isInteger(count)) {
		throw "Parameter \"count\" must be an integer!";
	}
	
	// Return a promise that will resolve to an array of GIF URLs
	return new Promise(resolve => {
		// Generate query parameters
		const QUERY_PARAMS = {
			key: TENOR_TOKEN,
			q: "Emma%20Watson",
			locale: "en_US",
			contentfilter: PG_only ? "high" : "off",
			media_filter: "minimal",
			ar_range: "all",
			limit: count
		};
		const QUERY_PARAM_STRING = (Object
			.keys(QUERY_PARAMS)
			.map(key => key + "=" + QUERY_PARAMS[key])
			.join("&")
		);
		
		// HTTP request options
		const OPTIONS = {
			host: "api.tenor.com",
			path: "/v1/random?" + QUERY_PARAM_STRING
		};
		
		// Callback for when we receive data from the HTTP request
		function callback(response) {
			// Start with an empty string as the response
			let responseStr = "";
			
			// When we receive a chunk of data, append it to the end of the response string
			response.on("data", chunk => {
				responseStr += chunk;
			});
			
			// When we have received the full response, resolve the promise and return it
			response.on("end", () => {
				const WATSON_URLS = (JSON
					.parse(responseStr)["results"]
					.map(gifObj => gifObj["url"])
				);
				resolve(WATSON_URLS);
			});
		}
		
		// Send out the HTTP request
		HTTP.request(OPTIONS, callback).end();
	});
}

// Login the bot
bot.login(BOT_TOKEN);

// When the bot is ready, log to the console
bot.on("ready", () => {
	console.info(`Logged in as ${bot.user.tag}!`);
});

// Handle messages
bot.on("message", msg => {
	// Ping
	if(msg.content.toLowerCase() === "!ping") {
		msg.reply("pong");
	}
	
	// becho
	else if(msg.content.toLowerCase().split(" ")[0] === "!becho") {
		// Verify that caasinehc was the one who asked
		if(msg.author.id === caasinehcID) {
			// Echo whatever comes after "!becho "
			const msgToEcho = msg.content.substring("!becho ".length - 1);
			if(msgToEcho.length > 0) {
				msg.channel.send(msgToEcho);
			}
			else {
				msg.channel.send("Sorry, I can't send an empty message!");
			}
			
			// Delete the command message
			if(msg.deletable) msg.delete();
		}
	}
	
	// Botson
	else if(msg.content.toLowerCase().split(" ")[0] === "!botson") {
		// Find out how many Emma Watson GIFs they want (default 1)
		const countInput = msg.content.split(" ")[1];
		let count = parseInt(countInput);
		// Ensure it is a number (default to 1 if it isn't)
		if(Number.isNaN(count)) {
			count = 1;
		}
		
		// 69 420 lol funny original meme jokes
		if(count === 69 || count === 420 || count === 69420) {
			msg.channel.send(":rolling_eyes:");
		}
		// Ensure that we aren't sending too many GIFs at once
		else if(count > MAX_GIFS) {
			msg.channel.send(`I don't really wanna send more than ${MAX_GIFS} GIFs at a time, sorry!`);
		}
		// Ensure that we aren't sending zero or a negative number of gifs
		else if(count <= 0) {
			msg.channel.send(`How am I supposed to send ${count} GIFs? I'm confused...`);
		}
		// If the number of GIFs requested is reasonable, send em!
		else {
			// Send the requested number of Emma Watson GIFs!
			getGIFURLs(count, !msg.channel.nsfw).then(result => {
				// Discord will only turn the first five links into embedded
				// images, so we have to split the GIFs into blocks of 5, and
				// send each block as a separate message
				const blocks = [];
				while(result.length > 0) {
					blocks.push(result.splice(0, 5));
				}
				
				// Send the message(s)
				for(let block of blocks) {
					msg.channel.send(block);
				}
			});
		}
	}
});
