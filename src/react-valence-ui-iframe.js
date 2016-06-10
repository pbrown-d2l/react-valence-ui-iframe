'use strict';

var React = require('react'),
	ResizeCallbackMaker = require('./ResizeCallbackMaker');

var ResizingIframe = React.createClass({
	propTypes: {
		src: React.PropTypes.string.isRequired,
		resizeCallback: React.PropTypes.func,
		progressCallback: React.PropTypes.func
	},
	getInitialState: function() {
		return {
			iframeCleanup: null,
			iframeOverflowY: null,
			iframeLocation: null
		};
	},
	componentDidMount: function() {
		this.updateProgress(0);
	},
	componentDidUpdate: function() {
		this.updateNavbarStyle();
	},
	updateProgress: function(progress) {
		if (this.props.progressCallback) {
			this.props.progressCallback(progress, 'none');
		}
	},
	callbackWrapper: function(height, iframeOverflowY) {
		this.setState({
			iframeOverflowY: iframeOverflowY
		});

		var sizeKnown = !!height;
		this.props.resizeCallback(height, sizeKnown);
	},
	handleOnLoad: function() {
		this.updateProgress(100);

		if (this.props.resizeCallback) {
			var result = ResizeCallbackMaker.startResizingCallbacks(React.findDOMNode(this.refs.iframe), this.callbackWrapper);

			if (result.cleanup) {
				this.setState({
					iframeCleanup: result.cleanup
				});
			}
		}
	},
	updateNavbarStyle: function() {
		// Hide the navbar and minibar from within the iframe if it is rendered
		var iframe = React.findDOMNode(this.refs.iframe);
		// Should only manipulate the iframe if it is not cross domain and the iframe location has changed
		if (!ResizeCallbackMaker.crossDomain(iframe) &&
		(this.state.iframeLocation !== iframe.contentWindow.location.href)) {

			var iframeDocument = iframe.contentWindow.document;
			if (iframeDocument) {
				// Overwrite css style for navbar and minibar when page is rendered
				var iframeStyle = document.createElement('style');
				iframeStyle.innerHTML = 'd2l-navigation, .d2l-navbar, .d2l-minibar-placeholder {display:none;}';
				iframeStyle.type = 'text/css';
				var head = iframeDocument.head;
				if (head) {
					head.appendChild(iframeStyle);
				}
			}
			this.setState({
				iframeLocation: iframe.contentWindow.location.href
			});
		}
	},
	componentWillUnmount: function() {
		if (this.state.iframeCleanup) {
			this.state.iframeCleanup();
		}
	},
	render: function() {
		var style = {
			overflowY: this.state.iframeOverflowY || ''
		};

		return (
			<div
				className="resizing-iframe-container"
			>
				<iframe
					ref="iframe"
					onLoad={this.handleOnLoad}
					src={this.props.src}
					style={style}
					className="resizing-iframe"
				>
				</iframe>
			</div>
		);
	}
});

module.exports = ResizingIframe;
