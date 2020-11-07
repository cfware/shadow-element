import {html, render} from 'uhtml';
import Debouncer from '@cfware/debouncer';
import runCallbacks from '@cfware/callback-array-once';
import addEventListener from '@cfware/add-event-listener';
import Symbols from '@cfware/symbols';
import decamelize from '@cfware/decamelize';

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
	lifecycleEvents
] = Symbols;

export const wireRenderProperties = (Klass, properties) => {
	for (const [name, value] of Object.entries(properties)) {
		const privSymbol = Symbol(name);

		Object.defineProperties(Klass.prototype, {
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
};

const getObservedAttributes = Klass => new Set(Klass.observedAttributes);

const setObservedAttributes = (Klass, observedAttributes) => {
	Object.defineProperties(Klass, {
		observedAttributes: {
			enumerable: true,
			configurable: true,
			get() {
				return [...observedAttributes];
			}
		}
	});
};

export const reflectBooleanProperties = (Klass, names) => {
	const observedAttributes = getObservedAttributes(Klass);
	for (const name of names) {
		const attributeName = decamelize(name);

		observedAttributes.add(attributeName);
		Object.defineProperties(Klass.prototype, {
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

	setObservedAttributes(Klass, observedAttributes);
};

const reflectTypedProperties = (Klass, items, attributeClass) => {
	const observedAttributes = getObservedAttributes(Klass);
	for (const [name, defaultValue] of Object.entries(items)) {
		const attributeName = decamelize(name);

		observedAttributes.add(attributeName);
		Object.defineProperties(Klass.prototype, {
			[name]: {
				enumerable: true,
				get() {
					return this.hasAttribute(attributeName) ? attributeClass(this.getAttribute(attributeName)) : defaultValue;
				},
				set(value) {
					// eslint-disable-next-line eqeqeq
					if (value == null) {
						this.removeAttribute(attributeName);
					} else {
						this.setAttribute(attributeName, value);
					}
				}
			}
		});
	}

	setObservedAttributes(Klass, observedAttributes);
};

export const reflectStringProperties = (Klass, items) => reflectTypedProperties(Klass, items, String);

export const reflectNumericProperties = (Klass, items) => reflectTypedProperties(Klass, items, Number);

export const metaLink = (url, metaURL) => new URL(url, metaURL).toString();

export const booleanAttribute = value => value ? '' : undefined;

export default class ShadowElement extends HTMLElement {
	_lifecycleCleanup = [];
	_debounce = new Debouncer(() => this[debounceRenderCallback](), 10, 5);

	static get observedAttributes() {
		return [];
	}

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
				fn = this[fn].bind(this);
			}

			return addEventListener(owner, type, fn);
		});
	}

	[addCleanups](...callbacks) {
		this._lifecycleCleanup.push(...callbacks);
	}

	connectedCallback() {
		for (const [owner, events] of (this.constructor[lifecycleEvents] ?? [])) {
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

	static [define](elementName) {
		customElements.define(elementName, this);
	}
}
