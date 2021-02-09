# @cfware/shadow-element [![NPM Version][npm-image]][npm-url]

My uhtml based shadow element

## Usage

This module makes use of public class fields.

```js
import ShadowElement, {html, template, css, adoptedStyleSheets, define} from '@cfware/shadow-element';

class MyElement extends ShadowElement {
	static [adoptedStyleSheets] = [
		css`
			:host {
				background: blue;
			}
		`
	];

	get [template]() {
		return html`I'm blue`;
	}
}

MyElement[define]('my-element');
```


[npm-image]: https://img.shields.io/npm/v/@cfware/shadow-element.svg
[npm-url]: https://npmjs.org/package/@cfware/shadow-element
