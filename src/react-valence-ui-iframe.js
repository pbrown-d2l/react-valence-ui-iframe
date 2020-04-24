var React = require('react');
require('./d2l-iframe-wrapper-for-react.js');

var ResizingIframe = React.createClass({
	propTypes: {
		src: React.PropTypes.string.isRequired,
		resizeCallback: React.PropTypes.func,
		progressCallback: React.PropTypes.func
	},
	getInitialState: function() {
		return {};
	},
	componentDidMount: function() {
		this.frame.addEventListener('d2l-iframe-wrapper-for-react-load', this.handleOnLoad);
		this.frame.addEventListener('d2l-iframe-wrapper-for-react-resize', this.callbackWrapper);
		this.updateProgress(0);
	},
	componentWillUnmount() {
		this.frame.removeEventListener('d2l-iframe-wrapper-for-react-load', this.testLoad);
	},
	updateProgress: function(progress) {
		if (this.props.progressCallback) {
			this.props.progressCallback(progress, 'none');
		}
	},
	callbackWrapper: function(e) {
		var height = e.detail.height;
		var sizeKnown = !!height;
		this.props.resizeCallback(height, sizeKnown);
	},
	handleOnLoad: function() {
		this.updateProgress(100);
	},
	render: function() {
		// HACK! HACK! HACK! d2l content looks for d2l_navbar (or d2l-navigation if on daylight)
		return (
			<div
				className="resizing-iframe-container"
			>
				<div id="d2l_navbar" className="vui-offscreen d2l-suppress-nav"></div>
				<d2l-iframe-wrapper-for-react
					ref={e => this.frame = e}
					class="resizing-iframe"
					src={this.props.src}
					resize
				></d2l-iframe-wrapper-for-react>
			</div>
		);
	}
});

module.exports = ResizingIframe;
