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
			iframeOverflowY: null
		};
	},
	componentDidMount: function() {
		this.updateProgress(0);
		this.removeIFrameNavbar();
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
		this.removeIFrameNavbar();

		if (this.props.resizeCallback) {
			var result = ResizeCallbackMaker.startResizingCallbacks(React.findDOMNode(this.refs.iframe), this.callbackWrapper);

			if (result.cleanup) {
				this.setState({
					iframeCleanup: result.cleanup
				});
			}
		}
	},
	removeIFrameNavbar: function() {
		// Remove the navbar and minibar from within the iframe if it is rendered
		var iframe = React.findDOMNode(this.refs.iframe);
		if (iframe) {
			// Can only manipulate the iframe if it is not cross domain
			if (!ResizeCallbackMaker.crossDomain(iframe)) {
				var iframeDocument = iframe.contentWindow.document;
				if (iframeDocument) {
					var navbar = iframeDocument.getElementById('d2l_navbar');
					if (navbar) {
						navbar.parentNode.remove();
					}
				}
			}
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
