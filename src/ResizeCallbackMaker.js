'use strict';
// TODO: someone should probably go and rewrite an implementation of /d2l/common/iframe/iframe-client.js without jquery
// Based on: .../lp/framework/web/D2L.LP.Web.UI/Common/Controls/IFrame/ClassInitializer.js

var id = 10;

function ResizeCallbackMaker() {}

ResizeCallbackMaker.prototype.doCallback = function(toggle, callback, iframe, lastHtml, lastWidth) {
	var height, body = null;
	var pollingInterval = 500;
	var self = this;

	if (!toggle.resize) {
		return;
	}

	try {
		if (this.checkForLegacyFrameSets(iframe)) {
			callback(null, null);
			return;
		}

		body = iframe.contentWindow.document.body;
		body.style.overflowY = 'hidden';

		// Note that neither events or mutationobserver were correctly detecting changes in all scenarios but outerHTML was hence what we have here
		var currentHtml = body.outerHTML,
			clientRect = iframe.getBoundingClientRect(),
			currentWidth = clientRect.right - clientRect.left;

		if (currentHtml == lastHtml && currentWidth === lastWidth) { // eslint-disable-line eqeqeq
			setTimeout(function() { self.doCallback(toggle, callback, iframe, currentHtml, currentWidth); }, pollingInterval);
			return;
		}
		// Set the style to 'auto' before doing anything so that the iframe will pick up shrinking
		// May cause a blip in the iframe's rendering area, which is why we only resize when the html or width change
		iframe.style.height = 'auto';
		height = this.getHeightFromSameOriginIframe(iframe);
		callback(height, null);
	} catch (e) {
		callback(null, null);

		if (body) {
			body.style.overflowY = 'auto';
		}
	}

	setTimeout(function() { self.doCallback(toggle, callback, iframe, currentHtml, currentWidth); }, pollingInterval);
};

ResizeCallbackMaker.prototype.getHeightFromSameOriginIframe = function(iframe) {
	// The correct height property to use will vary depending on doc type as well as browser hence all the shenanigans
	var body = iframe.contentWindow.document.body,
		bodyHeight = this.getElementHeight(body),
		docElement = iframe.contentWindow.document.documentElement,
		docElementHeight = (docElement) ? this.getElementHeight(docElement) : 0,
		innerHeight = iframe.contentWindow.innerHeight ? iframe.contentWindow.innerHeight : 0,
		height = Math.max(bodyHeight, docElementHeight, innerHeight);

	return height;
};

ResizeCallbackMaker.prototype.getElementHeight = function(elem) {
	return Math.max(elem.scrollHeight, elem.offsetHeight, elem.clientHeight);
};

ResizeCallbackMaker.prototype.checkForLegacyFrameSets = function(iframe) {
	return (iframe.contentWindow.document.getElementsByTagName('frameset').length > 0);
};

ResizeCallbackMaker.prototype.crossDomain = function(iframe) {
	try {
		var body = iframe.contentWindow.document.body; // eslint-disable-line no-unused-vars
		return false;
	} catch (e) {
		return true;
	}
};

ResizeCallbackMaker.prototype.requestIframeSize = function(iframe) {
	iframe.contentWindow.postMessage(JSON.stringify({ handler: 'd2l.iframe.client', id: id }), '*');
};

ResizeCallbackMaker.prototype.listenForCrossDomainSizeChanges = function(event, callback) {
	try {
		var data = JSON.parse(event.data);

		//At times data.id is undefined, so we only currently check on the data.handler.
		//This needs to be addressed in the future if we need to communicate with multiple iframes
		if (data.handler === 'd2l.iframe.host') {
			callback(data.height, 'hidden');
		}
	} catch (e) { /* do nothing */ }
};

ResizeCallbackMaker.prototype.isIos = function(n) {
	var platform = n.platform;
	return /iPad|iPhone|iPod/i.test(platform);
};

ResizeCallbackMaker.prototype.startResizingCallbacks = function(iframe, callback) {
	if (!iframe) { throw 'no iframe provided'; }
	if (!callback) { throw 'no callback provided'; }

	// ios has problems with scrolling when tapping inside an iframe, so we won't try to size them bigger than the screen
	if (this.isIos(navigator)) {
		callback(null, null);
	} else if (this.crossDomain(iframe)) {
		// The content is on another domain. If it includes /d2l/common/iframe/iframe-client.js, it can tell us its height
		var self = this;
		var listenWrapper = function(e) { self.listenForCrossDomainSizeChanges(e, callback); };
		var stopListening = function() { window.removeEventListener('message', listenWrapper, false); };
		callback(null, null);

		window.addEventListener('message', listenWrapper, false);
		this.requestIframeSize(iframe);

		return {
			security: 'crossDomain',
			cleanup: stopListening
		};
	} else {
		var toggle = { resize: true };
		this.doCallback(toggle, callback, iframe);

		return {
			security: 'sameDomain',
			cleanup: function() {
				toggle.resize = false;
			}
		};
	}
};

module.exports = new ResizeCallbackMaker();
