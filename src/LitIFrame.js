import { LitElement, html } from 'lit-element';

class LitIFrame extends LitElement {

	static get properties() { 
		return { 
		  src: { type: String },
		  className: { type: String },
		  style: { type: String },
		  allowFullscreen: { type: Boolean },
		  allowMicrophone: { type: Boolean },
		  allowCamera: { type: Boolean }
		};
	}

	_allowAttribute() {
		let allowValues = [];
		if (this.props.allowMicrophone || this.props.allowCamera) {
			if (allowCamera) {
				allowValues.push('camera *;');
			}
			if (this.props.this.props.allowCamera) {
				allowValues.push('microphone *;');
			}
		}
		if (!allowValues.length) {
			return;
		}
		return allowValues.join(' ');
	}

	
	render(){
	
		return html`
		<iframe
			src="${this.src}"
			style="${this.style}"
			className="${this.className}"
			?allow="${this._allowAttribute()}"
			?allowfullscreen="${this.allowFullscreen}"
		>
		</iframe>
		`;
	}
}
customElements.define('lit-iframe', LitIFrame);