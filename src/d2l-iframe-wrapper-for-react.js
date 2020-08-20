import { LitElement, html, css } from 'lit-element';
import * as ResizeCallbackMaker from './ResizeCallbackMaker.js';
import { styleMap } from 'lit-html/directives/style-map';

class IFrame extends LitElement {

	static get styles() {
		return css`
			.resizing-iframe {
				display: flex;
				flex: 1;
				min-height: 98%;
				border: none;
			}
		`;
	}
	static get properties() {
		return {
			src: { type: String },
			resize: { type: Boolean },
			_iframeCleanup: { type: Object },
			_frameOverflowY: { type: String }
		};
	}

	constructor() {
		super();
		this._onResize = this._onResize.bind(this);
		this._onFrameLoad = this._onFrameLoad.bind(this);
	}

	_onFrameLoad() {
		this.dispatchEvent(new CustomEvent(
			'd2l-iframe-wrapper-for-react-load', { bubbles: true, composed: true }
		));

		if (this.resize) {
			if (this._iframeCleanup) {
				this._iframeCleanup();
			}
			const iframe = this.shadowRoot.querySelector('.resizing-iframe');
			var result = ResizeCallbackMaker.startResizingCallbacks(iframe, this._onResize);

			if (result && result.cleanup) {
				this._iframeCleanup = result.cleanup;
			} else {
				this._iframeCleanup = null;
			}
		}
	}

	_onResize(height, iframeOverflowY) {
		this._frameOverflowY = iframeOverflowY;
		this.dispatchEvent(new CustomEvent(
			'd2l-iframe-wrapper-for-react-resize', { bubbles: true, composed: true, detail: { height: height } }
		));
	}

	render() {
		const style = { overflowY: this._frameOverflowY || '' };
		return html`
			<iframe
				class="resizing-iframe"
				src=${this.src}
				allow="camera *; microphone *; display-capture *; encrypted-media *; fullscreen *;"
				@load=${this._onFrameLoad}}
				style=${styleMap(style)}
			></iframe>
		`;
	}
}
customElements.define('d2l-iframe-wrapper-for-react', IFrame);
