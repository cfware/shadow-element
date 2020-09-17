import {html, render} from 'uhtml';
import Debouncer from '@cfware/debouncer';
import runCallbacks from '@cfware/callback-array-once';
import addEventListener from '@cfware/add-event-listener';
import Symbols from '@cfware/symbols';
import {decamelize} from './decamelize.js';

export {html, render};

export const htmlFor = html.for;
export const htmlNode = html.node;

export const [
	renderCallback,
	debounceRenderCallback,
	createBoundEventListeners,
	addCleanups,
	template,
	define,
	renderProperties,
	stringProperties,
	numericProperties,
	booleanProperties,
	lifecycleEvents
] = Symbols;

function wireRenderProperties(proto, properties) {
	for (const [name, value] of Object.entries(properties)) {
		const privSymbol = Symbol(name);

		Object.defineProperties(proto, {
			[privSymbol]: {
				writable: true,
				value
			},
			[name]: {
				enumerable: true,
				get() {
					return this[privSymbol];
				},
				set(value) {
					this[privSymbol] = value;
					this[renderCallback]();
				}
			}
		});
	}
}

function reflectBooleanProperties(proto, names, observedAttributes) {
	for (const name of names) {
		const attributeName = decamelize(name);

		observedAttributes.add(attributeName);
		Object.defineProperties(proto, {
			[name]: {
				enumerable: true,
				get() {
					return this.hasAttribute(attributeName);
				},
				set(value) {
					this.toggleAttribute(attributeName, Boolean(value));
				}
			}
		});
	}
}

function typedReflectionProperties(proto, items, observedAttributes, attributeClass) {
	for (const [name, defaultValue] of Object.entries(items)) {
		const attributeName = decamelize(name);

		observedAttributes.add(attributeName);
		Object.defineProperties(proto, {
			[name]: {
				enumerable: true,
				get() {
					return attributeClass(this.hasAttribute(attributeName) ? this.getAttribute(attributeName) : defaultValue);
				},
				set(value) {
					if (value == null) { // eslint-disable-line eqeqeq
						this.removeAttribute(attributeName);
					} else {
						this.setAttribute(attributeName, value);
					}
				}
			}
		});
	}
}

export const metaLink = (url, metaURL) => new URL(url, metaURL).toString();

export default class ShadowElement extends HTMLElement {
	_lifecycleCleanup = [];
	_debounce = new Debouncer(() => this[debounceRenderCallback](), 10, 5);

	constructor(mode = 'open') {
		super();

		this._shadowRoot = this.attachShadow({mode});
	}

	[debounceRenderCallback]() {
		render(this._shadowRoot, () => this[template]);
	}

	[renderCallback](immediately) {
		// Prevent `event` first argument from being treated as truthy
		this._debounce.run(immediately === true);
	}

	[createBoundEventListeners](owner, events) {
		return Object.entries(events).map(([type, fn]) => {
			if (['string', 'symbol'].includes(typeof fn)) {
				const id = fn;
				fn = (...args) => this[id](...args);
			}

			return addEventListener(owner, type, fn);
		});
	}

	[addCleanups](...callbacks) {
		this._lifecycleCleanup.push(...callbacks);
	}

	connectedCallback() {
		for (const [owner, events] of this.constructor._lifecycleEvents) {
			this[addCleanups](...this[createBoundEventListeners](owner, events));
		}

		// Bypass debounce on initial render
		this[renderCallback](true);
	}

	disconnectedCallback() {
		runCallbacks(this._lifecycleCleanup);
	}

	attributeChangedCallback() {
		this[renderCallback]();
	}

	static [define](elementName, options = {}) {
		const proto = this.prototype;
		const observedAttributes = new Set(this.observedAttributes);

		wireRenderProperties(proto, options[renderProperties] || {});
		typedReflectionProperties(proto, options[stringProperties] || {}, observedAttributes, String);
		typedReflectionProperties(proto, options[numericProperties] || {}, observedAttributes, Number);
		reflectBooleanProperties(proto, options[booleanProperties] || [], observedAttributes);

		const properties = {
			_lifecycleEvents: {
				value: options[lifecycleEvents] || new Map()
			}
		};

		if (observedAttributes.size > 0) {
			properties.observedAttributes = {
				get() {
					return observedAttributes;
				}
			};
		}

		Object.defineProperties(this, properties);

		customElements.define(elementName, this);
	}
}
