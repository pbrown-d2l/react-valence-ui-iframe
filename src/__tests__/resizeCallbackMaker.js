'use strict';

var ResizeCallbackMaker = require('../ResizeCallbackMaker.js'),
	sinon = require('sinon');

describe('react-valence-ui-iframe', function() {
	var sandbox,
		iframe,
		callback;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		iframe = sinon.stub(),
		callback = sinon.stub();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('startResizingCallbacks', function() {
		it('should throw "no iframe provided" if no iframe is provided', function() {
			iframe = null;

			expect(
				function() { ResizeCallbackMaker.startResizingCallbacks(iframe, callback); }
			).toThrow('no iframe provided');
		});

		it('should throw "no callback provided" if no callback is provided', function() {
			callback = null;

			expect(
				function() { ResizeCallbackMaker.startResizingCallbacks(iframe, callback); }
			).toThrow('no callback provided');
		});

		it('should call the callback with null,null if the platform is ios', function() {
			sandbox.stub(ResizeCallbackMaker, 'isIos').returns(true);

			ResizeCallbackMaker.startResizingCallbacks(iframe, callback);
			expect(callback.calledWith(null, null)).toBe(true);
		});

		describe('crossDomain', function() {
			beforeEach(function() {
				sandbox.stub(ResizeCallbackMaker, 'isIos').returns(false);
				sandbox.stub(ResizeCallbackMaker, 'crossDomain').returns(true);
			});

			it('should call the callback with null, null', function() {
				sandbox.stub(ResizeCallbackMaker, 'requestIframeSize');

				ResizeCallbackMaker.startResizingCallbacks(iframe, callback);
				expect(callback.calledWith(null, null)).toBe(true);
			});

			it('should add a message event listener to the window', function() {
				sandbox.stub(ResizeCallbackMaker, 'requestIframeSize');
				sandbox.stub(window, 'addEventListener');

				ResizeCallbackMaker.startResizingCallbacks(iframe, callback);
				expect(window.addEventListener.calledWith('message'));
			});

			it('should return the proper values', function() {
				sandbox.stub(ResizeCallbackMaker, 'requestIframeSize');

				var returnVal = ResizeCallbackMaker.startResizingCallbacks(iframe, callback);
				expect(returnVal.security).toBe('crossDomain');
				expect(returnVal.cleanup !== null).toBe(true);
			});
		});

		describe('sameDomain', function() {
			beforeEach(function() {
				sandbox.stub(ResizeCallbackMaker, 'isIos').returns(false);
				sandbox.stub(ResizeCallbackMaker, 'crossDomain').returns(false);
			});

			it('calls doCallback', function() {
				sandbox.stub(ResizeCallbackMaker, 'doCallback');
				ResizeCallbackMaker.startResizingCallbacks(iframe, callback);
				expect(ResizeCallbackMaker.doCallback.called).toBe(true);
			});

			it('returns the proper values', function() {
				sandbox.stub(ResizeCallbackMaker, 'requestIframeSize');
				sandbox.stub(ResizeCallbackMaker, 'doCallback');

				var returnVal = ResizeCallbackMaker.startResizingCallbacks(iframe, callback);
				expect(returnVal.security).toBe('sameDomain');
				expect(returnVal.cleanup !== null).toBe(true);
			});
		});
	});

	describe('isIos', function() {
		['iPad', 'iPhone', 'iPod'].forEach(function(type) {
			it('returns true if ' + type, function() {
				var n = { platform: type };
				expect(ResizeCallbackMaker.isIos(n)).toBe(true);
			});
		});

		it('returns false if not ios', function() {
			var n = { platform: 'android' };
			expect(ResizeCallbackMaker.isIos(n)).toBe(false);
		});
	});

	describe('listenForCrossDomainSizeChanges', function() {
		it('calls the callback if the event has the d2l.iframe.host handler', function() {
			var height = '10px';
			sandbox.stub(JSON, 'parse').returns({
				handler: 'd2l.iframe.host',
				height: height
			});
			ResizeCallbackMaker.listenForCrossDomainSizeChanges(sinon.stub(), callback);
			expect(callback.calledWith(height, 'hidden')).toBe(true);
		});

		it('does not call the callback if the event does not have the d2l.iframe.host handler', function() {
			sandbox.stub(JSON, 'parse').returns({
				handler: 'got.milk?',
				haveMilk: true
			});
			ResizeCallbackMaker.listenForCrossDomainSizeChanges(sinon.stub(), callback);
			expect(callback.called).toBe(false);
		});

		it('does not throw an error if given bad data', function() {
			sandbox.stub(JSON, 'parse').throws();
			var func = function() {
				ResizeCallbackMaker.listenForCrossDomainSizeChanges(sinon.stub(), callback);
			};
			expect(func).not.toThrow();
		});
	});

	describe('requestIframeSize', function() {
		it('posts a message to the content window of the iframe', function() {
			var testIframe = { contentWindow: { postMessage: sinon.stub() }};
			ResizeCallbackMaker.requestIframeSize(testIframe);
			expect(testIframe.contentWindow.postMessage.called).toBe(true);
		});
	});

	describe('crossDomain', function() {
		it('returns true if accessing the body of the iframe throws an error', function() {
			var testIframe = { contentWindow: { document: { body: {} } } };
			expect(ResizeCallbackMaker.crossDomain(testIframe)).toBe(false);
		});

		it('returns false if you can access the body of the iframe', function() {
			var testIframe = { contentWindow: {} };
			expect(ResizeCallbackMaker.crossDomain(testIframe)).toBe(true);
		});
	});

	describe('checkForLegacyFrameSets', function() {
		it('returns true if the iframe contains a frameset', function() {
			var testIframe = { contentWindow: { document: {
				getElementsByTagName: sinon.stub().returns(['frameset'])
			}}};

			expect(ResizeCallbackMaker.checkForLegacyFrameSets(testIframe)).toBe(true);
		});

		it('returns false if the iframe contains no framesets', function() {
			var testIframe = { contentWindow: { document: {
				getElementsByTagName: sinon.stub().returns([])
			}}};

			expect(ResizeCallbackMaker.checkForLegacyFrameSets(testIframe)).toBe(false);
		});
	});

	describe('getHeightFromSameOriginIframe', function() {
		it('returns the height of the iframes body if it is greater than the iframes innerHeight and documentElement height', function() {
			var bodySize = 150;
			var docElementSize = 125;
			var innerHeight = 100;
			var testIframe = {
				contentWindow: {
					document: {
						body: { clientHeight: bodySize, scrollHeight: bodySize, offsetHeight: bodySize},
						documentElement: { clientHeight: docElementSize, scrollHeight: docElementSize, offsetHeight: docElementSize},
						innerHeight: innerHeight
					}
				}
			};

			expect(ResizeCallbackMaker.getHeightFromSameOriginIframe(testIframe)).toBe(bodySize);
		});

		it('returns the height of the iframes documentElement if it is greater than the iframes innerHeight and body height', function() {
			var bodySize = 125;
			var docElementSize = 150;
			var innerHeight = 100;
			var testIframe = {
				contentWindow: {
					document: {
						body: { clientHeight: bodySize, scrollHeight: bodySize, offsetHeight: bodySize},
						documentElement: { clientHeight: docElementSize, scrollHeight: docElementSize, offsetHeight: docElementSize},
						innerHeight: innerHeight
					}
				}
			};

			expect(ResizeCallbackMaker.getHeightFromSameOriginIframe(testIframe)).toBe(docElementSize);
		});

		it('returns the iframes innerHeight if it is greater than the iframes body height or documentElement height', function() {
			var bodySize = 125;
			var docElementSize = 100;
			var innerHeight = 150;
			var testIframe = {
				contentWindow: {
					document: {
						body: { clientHeight: bodySize, scrollHeight: bodySize, offsetHeight: bodySize},
						documentElement: { clientHeight: docElementSize, scrollHeight: docElementSize, offsetHeight: docElementSize}
					},
					innerHeight: innerHeight
				}
			};

			expect(ResizeCallbackMaker.getHeightFromSameOriginIframe(testIframe)).toBe(innerHeight);
		});
	});

	describe('getElementHeight', function() {
		it('returns the elements clientHeight if it is greater than its scrollHeight and offsetHeight', function() {
			var topHeight = 100;
			var elem = {
				clientHeight: topHeight,
				scrollHeight: 5,
				offsetHeight: 50
			};

			expect(ResizeCallbackMaker.getElementHeight(elem)).toBe(topHeight);
		});

		it('returns the elements scrollHeight if it is greater than its clientHeight and offsetHeight', function() {
			var topHeight = 100;
			var elem = {
				clientHeight: 50,
				scrollHeight: topHeight,
				offsetHeight: 50
			};

			expect(ResizeCallbackMaker.getElementHeight(elem)).toBe(topHeight);
		});

		it('returns the elements offsetHeight if it is greater than its scrollHeight and cilentHeight', function() {
			var topHeight = 100;
			var elem = {
				clientHeight: 50,
				scrollHeight: 5,
				offsetHeight: topHeight
			};

			expect(ResizeCallbackMaker.getElementHeight(elem)).toBe(topHeight);
		});
	});

	describe('doCallback', function() {
		it('does not call the callback if toggle.resize is false', function() {
			var toggle = { resize: false };
			ResizeCallbackMaker.doCallback(toggle, callback, iframe);
			expect(callback.called).toBe(false);
		});

		it('calls the callback with null,null if there are legacy framesets in the document', function() {
			var toggle = { resize: true };
			sandbox.stub(ResizeCallbackMaker, 'checkForLegacyFrameSets').returns(true);

			ResizeCallbackMaker.doCallback(toggle, callback, iframe);
			expect(callback.calledWith(null, null)).toBe(true);
		});

		it('does not call the callback if the iframe has not changed html or size', function() {
			sandbox.stub(ResizeCallbackMaker, 'checkForLegacyFrameSets').returns(false);
			var toggle = { resize: true };

			var bodyHtml = '<a></a>';
			var width = 500;
			var testIframe = {
				getBoundingClientRect: function() { return { right: 1000, left: 500}; },
				contentWindow: { document: { body: {
					outerHTML: bodyHtml,
					style: {}
				}}}
			};
			ResizeCallbackMaker.doCallback(toggle, callback, testIframe, bodyHtml, width);
			toggle.resize = false;
			expect(callback.called).toBe(false);
		});

		it('calls the callback with the height returned from getHeightFromSameOriginIframe', function() {
			sandbox.stub(ResizeCallbackMaker, 'checkForLegacyFrameSets').returns(false);
			var toggle = { resize: true };
			var height = 500;
			sandbox.stub(ResizeCallbackMaker, 'getHeightFromSameOriginIframe').returns(height);

			var testIframe = {
				style: { height: '123' },
				getBoundingClientRect: function() { return { right: 1000, left: 500}; },
				contentWindow: { document: { body: {
					outerHTML: '<a></a>',
					style: {}
				}}}
			};
			ResizeCallbackMaker.doCallback(toggle, callback, testIframe);
			toggle.resize = false;
			expect(callback.calledWith(height, null)).toBe(true);
		});

		it('calls the callback with null,null if an error is thrown', function() {
			sandbox.stub(ResizeCallbackMaker, 'checkForLegacyFrameSets').throws();
			ResizeCallbackMaker.doCallback({resize: true}, callback, iframe);
			expect(callback.calledWith(null, null)).toBe(true);
		});
	});
});
