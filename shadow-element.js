import {html, render} from 'lighterhtml';
import Debouncer from '@cfware/debouncer';

export {html};

export const htmlFor = html.for;

function decamelizePropName(name) {
	return name
		.replace(/([a-z\d])([A-Z])/gu, '$1-$2')
		.replace(/([a-z]+)([A-Z][a-z\d]+)/gu, '$1-$2')
		.toLowerCase();
}

const {defineProperties, entries} = Object;
const enumerable = true;
const writableProp = value => ({
	writable: true,
	value
});

function wireRenderProps(proto, props) {
	entries(props).forEach(([name, value]) => {
		const privSymbol = Symbol(name);

		defineProperties(proto, {
			[privSymbol]: writableProp(value),
			[name]: {
				enumerable,
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
		defineProperties(proto, {
			[name]: {
				enumerable,
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
			}
		});
	});
}

function typedReflectionProp(proto, items, observedAttributes, attributeClass) {
	entries(items).forEach(([name, defaultValue]) => {
		const attrName = decamelizePropName(name);

		observedAttributes.add(attrName);
		defineProperties(proto, {
			[name]: {
				enumerable,
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
			}
		});
	});
}

export const metaLink = (url, metaURL) => new URL(url, metaURL).toString();

const symDebounce = Symbol();
const symLifetimeEvents = Symbol();

export class ShadowElement extends HTMLElement {
	constructor(mode = 'open') {
		super();

		const shadowRoot = this.attachShadow({mode});
		defineProperties(this, {
			[symDebounce]: {
				value: new Debouncer(() => {
					render(shadowRoot, () => this.template);
				}, 10, 5)
			},
			[symLifetimeEvents]: writableProp([])
		});
	}

	render(immediately) {
		this[symDebounce].run(immediately);
	}

	createBoundEventListeners(owner, events) {
		return entries(events).map(([type, fn]) => {
			if (['string', 'symbol'].includes(typeof fn)) {
				const id = fn;
				fn = (...args) => this[id](...args);
			}

			owner.addEventListener(type, fn);
			return () => owner.removeEventListener(type, fn);
		});
	}

	initEvents(owner, events) {
		this[symLifetimeEvents].push(...this.createBoundEventListeners(owner, events));
	}

	connectedCallback() {
		const {_document, _window} = this.constructor[symLifetimeEvents];

		this.initEvents(document, _document);
		this.initEvents(window, _window);

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

		const props = {
			[symLifetimeEvents]: {
				value: {
					_document: options.documentEvents || {},
					_window: options.windowEvents || {}
				}
			}
		};

		if (observedAttributes.size > 0) {
			props.observedAttributes = {
				get() {
					return observedAttributes;
				}
			};
		}

		defineProperties(this, props);

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
