import {wire, bind, define} from 'hyperhtml/esm';

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

export default function decamelizePropName(name) {
	return name
		.replace(/([a-z\d])([A-Z])/gu, '$1-$2')
		.replace(/([a-z]+)([A-Z][a-z\d]+)/gu, '$1-$2')
		.toLowerCase();
}

function appendObservedAttributes(list, name) {
	if (list && !list.includes(name)) {
		list.push(name);
	}
}

export function reflectBooleanProps(proto, names, observedAttributes) {
	names.forEach(name => {
		const attrName = decamelizePropName(name);

		appendObservedAttributes(observedAttributes, attrName);
		Object.defineProperty(proto, name, {
			enumerable: true,
			get() {
				return this.hasAttribute(attrName);
			},
			set(value) {
				if (value) {
					this.setAttribute(attrName, '');
				} else {
					this.removeAttribute(attrName);
				}
			}
		});
	});
}

export function reflectStringProps(proto, items, observedAttributes) {
	Object.entries(items).forEach(([name, defaultValue]) => {
		const attrName = decamelizePropName(name);

		appendObservedAttributes(observedAttributes, attrName);
		Object.defineProperty(proto, name, {
			enumerable: true,
			get() {
				return this.hasAttribute(attrName) ? this.getAttribute(attrName) : String(defaultValue);
			},
			set(value) {
				if (value == null) { // eslint-disable-line eqeqeq
					this.removeAttribute(attrName);
				} else {
					this.setAttribute(attrName, value);
				}
			}
		});
	});
}

export function reflectNumericProps(proto, items, observedAttributes) {
	Object.entries(items).forEach(([name, defaultValue]) => {
		const attrName = decamelizePropName(name);

		appendObservedAttributes(observedAttributes, attrName);
		Object.defineProperty(proto, name, {
			enumerable: true,
			get() {
				return this.hasAttribute(attrName) ? Number(this.getAttribute(name)) : (defaultValue || 0);
			},
			set(value) {
				if (value == null) { // eslint-disable-line eqeqeq
					this.removeAttribute(attrName);
				} else {
					this.setAttribute(attrName, value);
				}
			}
		});
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
		const observedAttributes = [...(this.observedAttributes || [])];

		if (options.renderProperties) {
			wireRenders(this, options.renderProperties);
		}

		reflectStringProps(proto, options.stringProps || {}, observedAttributes);
		reflectNumericProps(proto, options.numericProps || {}, observedAttributes);
		reflectBooleanProps(proto, options.booleanProps || [], observedAttributes);

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
