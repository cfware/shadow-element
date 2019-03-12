import {html, render} from 'lighterhtml';
import {Debouncer} from '@cfware/debouncer';

export {html};

export const htmlFor = html.for;

function decamelizePropName(name) {
	return name
		.replace(/([a-z\d])([A-Z])/gu, '$1-$2')
		.replace(/([a-z]+)([A-Z][a-z\d]+)/gu, '$1-$2')
		.toLowerCase();
}

function wireRenderProps(proto, props) {
	Object.entries(props).forEach(([name, value]) => {
		const privSymbol = Symbol(name);

		Object.defineProperties(proto, {
			[privSymbol]: {
				value,
				writable: true
			},
			[name]: {
				enumerable: true,
				get() {
					return this[privSymbol];
				},
				set(value) {
					this[privSymbol] = value;
					this.render();
				}
			}
		});
	});
}

function reflectBooleanProps(proto, names, observedAttributes) {
	names.forEach(name => {
		const attrName = decamelizePropName(name);

		observedAttributes.add(attrName);
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

function typedReflectionProp(proto, items, observedAttributes, attributeClass) {
	Object.entries(items).forEach(([name, defaultValue]) => {
		const attrName = decamelizePropName(name);

		observedAttributes.add(attrName);
		Object.defineProperty(proto, name, {
			enumerable: true,
			get() {
				return attributeClass(this.hasAttribute(attrName) ? this.getAttribute(attrName) : defaultValue);
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

const symDebounce = Symbol('ShadowElement.debounce');
const symLifetimeEvents = Symbol('ShadowElement.lifetimeEvents');

export class ShadowElement extends HTMLElement {
	constructor(mode = 'open') {
		super();

		const shadowRoot = this.attachShadow({mode});
		Object.defineProperties(this, {
			[symDebounce]: {
				value: new Debouncer(() => {
					render(shadowRoot, () => this.template);
				}, 10, 5)
			},
			[symLifetimeEvents]: {
				value: [],
				writable: true
			}
		});
	}

	render(now = false) {
		this[symDebounce].run();

		if (now) {
			this[symDebounce].flush();
		}
	}

	connectedCallback() {
		const saveEvent = (owner, type, fn) => {
			if (typeof fn === 'string') {
				const name = fn;
				fn = (...args) => this[name](...args);
			}

			owner.addEventListener(type, fn);
			this[symLifetimeEvents].push(() => owner.removeEventListener(type, fn));
		};

		const events = this.constructor[symLifetimeEvents];
		Object.entries(events.document).forEach(([type, fn]) => {
			saveEvent(document, type, fn);
		});

		Object.entries(events.window).forEach(([type, fn]) => {
			saveEvent(window, type, fn);
		});

		// Bypass debounce on initial render
		this.render(true);
	}

	disconnectedCallback() {
		this[symLifetimeEvents].forEach(cleanup => {
			cleanup();
		});
		this[symLifetimeEvents] = [];
	}

	attributeChangedCallback() {
		this.render();
	}

	static define(elementName, options = {}) {
		const proto = this.prototype;
		const observedAttributes = new Set(this.observedAttributes);

		wireRenderProps(proto, options.renderProps || {});
		typedReflectionProp(proto, options.stringProps || {}, observedAttributes, String);
		typedReflectionProp(proto, options.numericProps || {}, observedAttributes, Number);
		reflectBooleanProps(proto, options.booleanProps || [], observedAttributes);

		Object.defineProperty(this, symLifetimeEvents, {
			value: {
				document: options.documentEvents || {},
				window: options.windowEvents || {}
			}
		});

		if (observedAttributes.size > 0) {
			Object.defineProperty(this, 'observedAttributes', {
				get() {
					return observedAttributes;
				}
			});
		}

		customElements.define(elementName, this);
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
			this.removeAttribute('tabindex');
			this.setAttribute('disabled', '');
		} else {
			this.setAttribute('tabindex', 0);
			this.removeAttribute('disabled');
		}
	}

	constructor() {
		super();

		const clickKeys = new Set(['Enter', ' ']);
		this.addEventListener('keypress', event => {
			if (clickKeys.has(event.key)) {
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
