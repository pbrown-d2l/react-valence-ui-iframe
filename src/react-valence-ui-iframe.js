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
			minHeight: null
		};
	},
	componentDidMount: function() {
		this.updateProgress(0);
	},
	updateProgress: function(progress) {
		if (this.props.progressCallback) {
			this.props.progressCallback(progress, 'none');
		}
	},
	callbackWrapper: function(height, iframeOverflowY) {
		if (height) { height--; }

		this.setState({
			iframeOverflowY: iframeOverflowY,
			minHeight: height
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
	componentWillUnmount: function() {
		if (this.state.iframeCleanup) {
			this.state.iframeCleanup();
		}
	},
	render: function() {
		var style = {
			overflowY: this.state.iframeOverflowY || ''
		};

		var containerStyle = {
			minHeight: this.state.minHeight || ''
		};

		return (
			<div
				className="resizing-iframe-container"
				style={containerStyle}
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
