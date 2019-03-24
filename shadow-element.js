import {html, render} from 'lighterhtml';
import Debouncer from '@cfware/debouncer';
import runCallbacks from '@cfware/callback-array-once';
import addEventListener from '@cfware/add-event-listener';

export {html, render};

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
	});
}

function reflectBooleanProps(proto, names, observedAttributes) {
	names.forEach(name => {
		const attrName = decamelizePropName(name);

		observedAttributes.add(attrName);
		Object.defineProperties(proto, {
			[name]: {
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
			}
		});
	});
}

function typedReflectionProp(proto, items, observedAttributes, attributeClass) {
	Object.entries(items).forEach(([name, defaultValue]) => {
		const attrName = decamelizePropName(name);

		observedAttributes.add(attrName);
		Object.defineProperties(proto, {
			[name]: {
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
			}
		});
	});
}

export const metaLink = (url, metaURL) => new URL(url, metaURL).toString();

export class ShadowElement extends HTMLElement {
	_lifetimeCleanups = [];
	_debounce = new Debouncer(() => render(this._shadowRoot, () => this.template), 10, 5);

	constructor(mode = 'open') {
		super();

		this._shadowRoot = this.attachShadow({mode});
	}

	render(immediately) {
		this._debounce.run(immediately);
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

		wireRenderProps(proto, options.renderProps || {});
		typedReflectionProp(proto, options.stringProps || {}, observedAttributes, String);
		typedReflectionProp(proto, options.numericProps || {}, observedAttributes, Number);
		reflectBooleanProps(proto, options.booleanProps || [], observedAttributes);

		const props = {
			_lifetimeCleanups: {
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

		Object.defineProperties(this, props);

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
