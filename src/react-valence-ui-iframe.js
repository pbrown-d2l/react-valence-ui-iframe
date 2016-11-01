'use strict';

var React = require('react'),
	ReactDOM = require( 'react-dom' ),
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
			if (this.state.iframeCleanup) {
				this.state.iframeCleanup();
			}
			var result = ResizeCallbackMaker.startResizingCallbacks(ReactDOM.findDOMNode(this.refs.iframe), this.callbackWrapper);

			if (result && result.cleanup) {
				this.setState({
					iframeCleanup: result.cleanup
				});
			} else {
				this.setState({
					iframeCleanup: null
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

		// HACK! HACK! HACK! d2l content looks for d2l_navbar (or d2l-navigation if on daylight)
		return (
			<div
				className="resizing-iframe-container"
			>
				<div id="d2l_navbar" className="vui-offscreen d2l-suppress-nav"></div>
				<iframe
					ref="iframe"
					data-suppressNav='true'
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
