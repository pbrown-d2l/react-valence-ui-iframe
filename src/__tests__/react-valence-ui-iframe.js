'use strict';

var React = require('react/addons'),
	TestUtils = React.addons.TestUtils,
	ReactIframe = require('../react-valence-ui-iframe.js'),
	sinon = require('sinon');

describe('react-valence-ui-iframe', function() {
	var resizeCallbackMakerStub,
		cleanupStub;

	beforeEach(function() {
		cleanupStub = sinon.stub;
		resizeCallbackMakerStub = sinon.stub().returns({ cleanup: cleanupStub });
	});

	it('should render an iframe to the screen', function() {
		var elem = TestUtils.renderIntoDocument(
			<ReactIframe />
		);
		var wrapper = TestUtils.scryRenderedDOMComponentsWithClass(
			elem,
			'resizing-iframe'
		);
		expect(wrapper.length).toBe(1);
	});

	it('should call progressCallback with (0,"none") on mount', function() {
		var callback = sinon.stub();
		TestUtils.renderIntoDocument(<ReactIframe progressCallback={callback}/>);

		expect(callback.calledWith(0, 'none')).toBe(true);
	});

	it('should call progressCallback with (100,"none") on load', function() {
		var callback = sinon.stub();
		var elem = TestUtils.renderIntoDocument(<ReactIframe progressCallback={callback}/>);
		elem.handleOnLoad();

		expect(callback.calledWith(100, 'none')).toBe(true);
	});

	it('should call resizeCallbackMaker if resizeCallback is provided', function() {
		ReactIframe.__Rewire__('ResizeCallbackMaker', { startResizingCallbacks: resizeCallbackMakerStub });
		var callback = sinon.stub();
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);
		elem.handleOnLoad();

		expect(resizeCallbackMakerStub.called).toBe(true);
	});

	it('should set the "cleanup" state to the variable returned by the resizeCallbackMaker', function() {
		ReactIframe.__Rewire__('ResizeCallbackMaker', { startResizingCallbacks: resizeCallbackMakerStub });
		var callback = sinon.stub();
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);
		elem.handleOnLoad();

		expect(elem.state.iframeCleanup).toBe(cleanupStub);
	});

	it('callbackWrapper should set the iframeOverflowY value', function() {
		var callback = sinon.stub();
		var height = 10;
		var iframeOverflowY = 'hidden';
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);
		elem.callbackWrapper(height, iframeOverflowY);

		expect(elem.state.iframeOverflowY).toBe(iframeOverflowY);
	});

	it('callbackWrapper should call the resizeCallback with the height and sizeKnown = true if there is a height', function() {
		var callback = sinon.stub();
		var height = 10;
		var sizeKnown = true;
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);
		elem.callbackWrapper(height);

		expect(callback.calledWith(height, sizeKnown)).toBe(true);
	});

	it('callbackWrapper should call the resizeCallback with null and sizeKnown = false if the height is null', function() {
		var callback = sinon.stub();
		var height = null;
		var sizeKnown = false;
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);
		elem.callbackWrapper(height);

		expect(callback.calledWith(height, sizeKnown)).toBe(true);
	});

	it('should call this.state.iframeCleanup on unmount if it exists', function() {
		var iframeCleanup = sinon.stub();
		var elem = TestUtils.renderIntoDocument(<ReactIframe />);
		elem.setState({iframeCleanup: iframeCleanup});
		elem.componentWillUnmount();

		expect(iframeCleanup.called).toBe(true);
	});

	it('should set overflowY on the iframe if iframeOverflowY is set', function() {
		var iframeOverflowY = 'hidden';
		var elem = TestUtils.renderIntoDocument(<ReactIframe />);
		elem.setState({iframeOverflowY: iframeOverflowY});

		var wrapper = TestUtils.findRenderedDOMComponentWithClass(
			elem,
			'resizing-iframe'
		);

		expect(React.findDOMNode(wrapper).style['overflow-y']).toBe(iframeOverflowY);
	});
});
