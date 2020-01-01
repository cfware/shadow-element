/* eslint-env browser */
/* eslint prefer-named-capture-group: 0 */
import {html, render} from 'lighterhtml';
import Debouncer from '@cfware/debouncer';
import runCallbacks from '@cfware/callback-array-once';
import addEventListener from '@cfware/add-event-listener';

export {html, render};

export const htmlFor = html.for;

function decamelizePropertyName(name) {
	return name
		.replace(/([a-z\d])([A-Z])/gu, '$1-$2')
		.replace(/([a-z]+)([A-Z][a-z\d]+)/gu, '$1-$2')
		.toLowerCase();
}

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
					this.render();
				}
			}
		});
	}
}

function reflectBooleanProperties(proto, names, observedAttributes) {
	for (const name of names) {
		const attributeName = decamelizePropertyName(name);

		observedAttributes.add(attributeName);
		Object.defineProperties(proto, {
			[name]: {
				enumerable: true,
				get() {
					return this.hasAttribute(attributeName);
				},
				set(value) {
					if (value) {
						this.setAttribute(attributeName, '');
					} else {
						this.removeAttribute(attributeName);
					}
				}
			}
		});
	}
}

function typedReflectionProperties(proto, items, observedAttributes, attributeClass) {
	for (const [name, defaultValue] of Object.entries(items)) {
		const attributeName = decamelizePropertyName(name);

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

export class ShadowElement extends HTMLElement {
	_lifetimeCleanups = [];
	_debounce = new Debouncer(() => this.renderCallback(), 10, 5);

	constructor(mode = 'open') {
		super();

		this._shadowRoot = this.attachShadow({mode});
	}

	renderCallback() {
		render(this._shadowRoot, () => this.template);
	}

	render(immediately) {
		// Prevent `event` first argument from being treated as truthy
		this._debounce.run(immediately === true);
	}

	createBoundEventListeners(owner, events) {
		return Object.entries(events).map(([type, fn]) => {
			if (['string', 'symbol'].includes(typeof fn)) {
				const id = fn;
				fn = (...args) => this[id](...args);
			}

			return addEventListener(owner, type, fn);
		});
	}

	initEvents(owner, events) {
		this._lifetimeCleanups.push(...this.createBoundEventListeners(owner, events));
	}

	connectedCallback() {
		const {_document, _window} = this.constructor._lifetimeCleanups;

		this.initEvents(document, _document);
		this.initEvents(window, _window);

		// Bypass debounce on initial render
		this.render(true);
	}

	disconnectedCallback() {
		runCallbacks(this._lifetimeCleanups);
	}

	attributeChangedCallback() {
		this.render();
	}

	static define(elementName, options = {}) {
		const proto = this.prototype;
		const observedAttributes = new Set(this.observedAttributes);

		wireRenderProperties(proto, options.renderProps || {});
		typedReflectionProperties(proto, options.stringProps || {}, observedAttributes, String);
		typedReflectionProperties(proto, options.numericProps || {}, observedAttributes, Number);
		reflectBooleanProperties(proto, options.booleanProps || [], observedAttributes);

		const properties = {
			_lifetimeCleanups: {
				value: {
					_document: options.documentEvents || {},
					_window: options.windowEvents || {}
				}
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
