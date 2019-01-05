import {wire, bind, define} from 'hyperhtml/esm';
import camelCase from 'camelcase';

export {wire, bind, define};

define('get-reference', (node, value) => {
	value(node);
});

export function wirePrivates(Class, props) {
	Object.entries(props).forEach(([name, value]) => {
		const privName = `_${name}`;

		Object.defineProperty(Class.prototype, privName, {value, writable: true});
		Object.defineProperty(Class.prototype, name, {
			enumerable: true,
			get() {
				return this[privName];
			}
		});
	});
}

export function wireRenders(Class, props) {
	Object.entries(props).forEach(([name, value]) => {
		const privName = `_${name}`;

		Object.defineProperty(Class.prototype, privName, {value, writable: true});
		Object.defineProperty(Class.prototype, name, {
			enumerable: true,
			get() {
				return this[privName];
			},
			set(value) {
				this[privName] = value;
				this.render();
			}
		});
	});
}

export function wireBooleanPropAttr(Class, name) {
	const propName = camelCase(name);

	Object.defineProperty(Class, propName, {
		get() {
			return this.hasAttribute(name);
		},
		set(value) {
			if (value) {
				this.setAttribute(name, '');
			} else {
				this.removeAttribute(name);
			}
		}
	});
}

export function wireBasicPropAttr(Class, name, defaultValue) {
	const propName = camelCase(name);

	Object.defineProperty(Class, propName, {
		enumerable: true,
		get() {
			return this.hasAttribute(name) ? this.getAttribute(name) : defaultValue;
		},
		set(value) {
			if (typeof value === 'undefined') {
				this.removeAttribute(name);
			} else {
				this.setAttribute(name, value);
			}
		}
	});
}

export function wireNumericPropAttr(Class, name, defaultValue = 0) {
	const propName = camelCase(name);

	Object.defineProperty(Class, propName, {
		enumerable: true,
		get() {
			return this.hasAttribute(name) ? Number(this.getAttribute(name)) : defaultValue;
		},
		set(value) {
			if (typeof value === 'undefined') {
				this.removeAttribute(name);
			} else {
				this.setAttribute(name, value);
			}
		}
	});
}

export const metaLink = (url, metaURL) => new URL(url, metaURL).toString();

export class ShadowElement extends HTMLElement {
	constructor(mode = 'open', htmlFn = 'html') {
		super();

		Object.defineProperty(this, htmlFn, {
			value: bind(this.attachShadow({mode}))
		});
	}

	connectedCallback() {
		this.render();
	}

	attributeChangedCallback() {
		this.render();
	}

	static define(elementName, options = {}) {
		const proto = this.prototype;
		const Super = Object.getPrototypeOf(this);
		const observedAttributes = this.observedAttributes || [];

		if (options.renderProperties) {
			wireRenders(this, options.renderProperties);
		}

		Object.entries(options.attributes || {}).forEach(([name, defaultValue]) => {
			if (!observedAttributes.includes(name)) {
				observedAttributes.push(name);
			}

			wireBasicPropAttr(proto, name, defaultValue);
		});

		if (observedAttributes.length > 0) {
			Object.defineProperty(proto, 'observedAttributes', {
				get() {
					return observedAttributes;
				}
			});
		}

		if (options.extends) {
			const Native = document.createElement(options.extends).constructor;
			const Intermediate = class extends Native {};
			const ownKeys = o => Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o));
			const keys = ['length', 'name', 'arguments', 'caller', 'prototype'];

			ownKeys(Super).filter(key => keys.indexOf(key) < 0).forEach(key => {
				Object.defineProperty(Intermediate, key, Object.getOwnPropertyDescriptor(Super, key));
			});

			ownKeys(Super.prototype).forEach(key => {
				Object.defineProperty(Intermediate.prototype, key, Object.getOwnPropertyDescriptor(Super.prototype, key));
			});
			Object.setPrototypeOf(this, Intermediate);
			Object.setPrototypeOf(proto, Intermediate.prototype);
			customElements.define(elementName, this, {extends: options.extends});
		} else {
			customElements.define(elementName, this);
		}
	}
}

export class ButtonElement extends ShadowElement {
	get disabled() {
		return this.hasAttribute('disabled');
	}

	set disabled(value) {
		if (this.disabled === Boolean(value)) {
			return;
		}

		if (value) {
			this.setAttribute('disabled', '');
			this.removeAttribute('tabindex');
		} else {
			this.removeAttribute('disabled');
			this.setAttribute('tabindex', 0);
		}
	}

	constructor() {
		super();

		this.addEventListener('keypress', event => {
			const code = event.charCode || event.keyCode;
			if (code === 32 || code === 13) {
				this.click();
			}
		});
		this.addEventListener('click', event => {
			if (this.disabled) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
			}
		});
		this.setAttribute('role', 'button');
		if (!this.disabled) {
			this.setAttribute('tabindex', 0);
		}
	}
}
