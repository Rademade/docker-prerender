const prerender = require('prerender');
const redisCache = require('prerender-redis-cache');
const forwardHeaders = require('./forwardHeaders');
const stripHtml = require('./stripHtml');
const healthcheck = require('./healthcheck');

const removeScriptTags = process.env.REMOVE_SCRIPT_TAGS;

const options = {
	workers : process.env.PRERENDER_NUM_WORKERS || 2,
	iterations : process.env.PRERENDER_NUM_ITERATIONS || 25,
	softIterations : process.env.PRERENDER_NUM_SOFT_ITERATIONS || 10,
	jsTimeout : process.env.JS_TIMEOUT || 30000,
	jsCheckTimeout : 1000
};
console.log('Starting with options:', options);

const server = prerender(options);

server.use(redisCache);
server.use(healthcheck('_health'));
server.use(forwardHeaders);
server.use(prerender.sendPrerenderHeader());

if (removeScriptTags === 'true') {
	server.use(prerender.removeScriptTags());
} 

server.use(prerender.httpHeaders());
if (process.env.DEBUG_PAGES) {
	server.use(prerender.logger());
}
server.use(stripHtml);

server.start();

const shutdown = () => {
	console.log('Shutdown initiated');
	server.exit();
	// At this point prerender has started killing its phantom workers already.
	// We give it 5 seconds to quickly do so, and then halt the process. This
	// will ensure relatively rapid redeploys (prerender no longer accepts new
	// requests at this point
	setTimeout(() => {
		console.log('Prerender has shut down');
		process.exit();
	}, 5000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
