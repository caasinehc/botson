/*
 * Botson
 * v1.2.0
 * By Isaac Chen
 * 8/10/2020
 */

// Requires
require("dotenv").config();
const Discord = require("discord.js");
const HTTP = require("http");

// Bot and token
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

// Settings
const MAX_GIFS = 10;
const caasinehcID = "195213987871195137";

// Functions
// Send an http request to get a random Emma Watson GIF from Tenor
function getGIFURL() {
	// Return a promise that will resolve to the GIF URL
	return new Promise((resolve, reject) => {
		// HTTP request options
		const OPTIONS = {
			host: "api.tenor.com",
			path: "/v1/random?q=Emma%20Watson&limit=1"
		};
		
		// Callback for when we recieve data from the HTTP request
		function callback(response) {
			// Start with an empty string as the response
			let responseStr = "";
			
			// When we recieve a chunk of data, append it to the end of the reponse string
			response.on("data", chunk => {
				responseStr += chunk;
			});
			
			// When we have recieved the full response, resolve the promise and return it
			response.on("end", () => {
				const WATSON_URL = JSON.parse(responseStr)["results"][0]["url"];
				resolve(WATSON_URL);
			});
		}
		
		// Send out the HTTP request
		HTTP.request(OPTIONS, callback).end();
	});
}

// Login the bot
bot.login(TOKEN);

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
			// Echo whatever comes after "!becho"
			const splitMsg = msg.content.split(" ");
			splitMsg.shift();
			const msgToEcho = splitMsg.join(" ");
			if(msgToEcho.length > 0) {
				msg.channel.send(msgToEcho);
			}
			else {
				msg.channel.send("Sorry, I can't send an empty message!");
			}
		}
	}
	
	// Botson
	else if(msg.content.toLowerCase().split(" ")[0] === "!botson") {
		// Find out how many Emma Watson GIFs they want (default 1)
		const countInput = msg.content.split(" ")[1];
		let count = parseInt(countInput);
		// Ensure it is a number (default to 1 if it isn't)
		if(Number.isNaN(count) || count < 1) {
			count = 1;
		}
		// Ensure that we aren't sending too many GIFs at once
		if(count > MAX_GIFS) {
			msg.channel.send(`Sorry, I can only send up to ${MAX_GIFS} GIFs at a time!`);
		}
		// If the number of GIFs requested is reasonable, send em!
		else {
			// However many times the user requested, send an Emma Watson GIF
			for(let i = 0; i < count; i++) {
				// Get GIF URL and send it
				getGIFURL().then(result => {
					msg.channel.send(result);
				});
			}
		}
	}
});
