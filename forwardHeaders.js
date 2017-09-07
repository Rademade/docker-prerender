// Set all blacklisted headers as lowercase
const BLACKLISTED = [
	'user-agent',       // Prerender sets her own user agent, which we dont want to override
	'host',             // This is set to the host of prerender, so its wrong to forward
	'accept',           // Let prerender accept everything and handle it
	'accept-encoding',  // We dont want to forward deflate or gzip since prerender will break on those
	'connection',       // No sudden keepalive stuff
	'accept-charset',   // Prerender handles this
	'content-length'    // Since we are rewriting lots of the request, we let prerender recalculate this
];

module.exports = {
	// Since prerender does not forward headers, this causes problems for some crawlers looking for
	// e.g. localized content. This plugin ensures the headers sent to prerender are also set in
	// the PhantomJS instance. Some headers may be blacklisted and will not be forwarded.
	onPhantomPageCreate(phantom, req, res, next) {
		// The following function is executed in the Phridge context, which means we do not have a
		// regular closure over it. Instead this function is stringified and sent to Phridge, where
		// it is executed.
		// We keep it in a function instead of a const, since that ensures phridge does not meddle with it.
		function executeInsidePhantom(headers, blacklisted, resolve) {
			// DO NOT ES6 this method since Phantom has problems with the ES6 stuff!
			var page = this;
			var customHeaders = page.customHeaders || {};
			for (var header in headers) {
				if (headers.hasOwnProperty(header) && blacklisted.indexOf(header) === -1) {
					customHeaders[header] = headers[header];
				}
			}
			page.customHeaders = customHeaders;
			//Custom headers should only be set by the initial request, so after initialization
			//we need to reset the custom headers.
			//see: http://phantomjs.org/api/webpage/property/custom-headers.html
			page.onInitialized = function () {
				page.customHeaders = {};
			};

			resolve();
		}

		// By setting the headers as an argument here, they will be bound in the function in Phridge.
		// Transformation is done using JSON.stringify and the resulting JSON object is unpacked in
		// Phridge. We use a promise based approach so we can detect when phridge has set the headers,
		// and we continue the middleware chain.
		req.prerender.page.run(req.headers, BLACKLISTED, executeInsidePhantom)
			.then(() => next())
			.catch(() => {
				res.sendStatus(req.prerender.statusCode);
				res.end('Could not forward sent headers');
			});
	}
};
