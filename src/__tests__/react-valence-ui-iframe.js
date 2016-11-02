'use strict';

var React = require('react'), //eslint-disable-line no-unused-vars
	ReactDOM = require( 'react-dom' ),
	TestUtils = require( 'react-addons-test-utils' ),
	ReactIframe = require('../react-valence-ui-iframe.js'),
	sinon = require('sinon');

describe('react-valence-ui-iframe', function() {
	var resizeCallbackMakerStub,
		cleanupStub,
		crossDomainStub,
		sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		cleanupStub = sinon.stub();
		resizeCallbackMakerStub = sinon.stub().returns({ cleanup: cleanupStub });
		crossDomainStub = sinon.stub().returns(true);
	});

	afterEach(function() {
		sandbox.restore();
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
		ReactIframe.__Rewire__('ResizeCallbackMaker', { startResizingCallbacks: resizeCallbackMakerStub, crossDomain: crossDomainStub });
		var callback = sinon.stub();
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);
		elem.handleOnLoad();

		expect(resizeCallbackMakerStub.called).toBe(true);
	});

	it('should not throw an error if the ResizeCallbackMaker startResizingCallbacks does not return a result', function() {
		ReactIframe.__Rewire__('ResizeCallbackMaker', { startResizingCallbacks: sinon.stub(), crossDomain: crossDomainStub });
		var callback = sinon.stub();
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);
		elem.handleOnLoad();

		expect(elem.state.iframeCleanup).toBe(null);
	});

	it('should set the "cleanup" state to the variable returned by the resizeCallbackMaker', function() {
		ReactIframe.__Rewire__('ResizeCallbackMaker', { startResizingCallbacks: resizeCallbackMakerStub, crossDomain: crossDomainStub });
		var callback = sinon.stub();
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);
		elem.handleOnLoad();

		expect(elem.state.iframeCleanup).toBe(cleanupStub);
	});

	it('should call the "cleanup" state function on load if one exists before setting the new one', function() {
		ReactIframe.__Rewire__('ResizeCallbackMaker', { startResizingCallbacks: resizeCallbackMakerStub, crossDomain: crossDomainStub });
		var callback = sinon.stub();
		var elem = TestUtils.renderIntoDocument(<ReactIframe resizeCallback={callback}/>);

		elem.handleOnLoad();
		expect(cleanupStub.called).toBe(false);

		elem.handleOnLoad();
		expect(cleanupStub.called).toBe(true);
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

		expect(ReactDOM.findDOMNode(wrapper).style['overflow-y']).toBe(iframeOverflowY);
	});

	it('should render a d2l-suppress-nav element offscreen', function() {
		var elem = TestUtils.renderIntoDocument(
			<ReactIframe />
		);
		var wrapper = TestUtils.scryRenderedDOMComponentsWithClass(
			elem,
			'vui-offscreen d2l-suppress-nav'
		);

		expect(wrapper.length).toBe(1);
	});
});
