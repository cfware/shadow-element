# @cfware/shadow-element [![NPM Version][npm-image]][npm-url]

My lighterhtml based shadow element

## Usage

This module makes use of [public class fields].

```js
import {ShadowElement, html, template} from '@cfware/shadow-element';

class MyElement extends ShadowElement {
	get [template]() {
		return html`
			<style>
				:host {
					background: blue;
				}
			</style>
			I'm blue
		`;
	}
}

MyElement.define('my-element');
```


[npm-image]: https://img.shields.io/npm/v/@cfware/shadow-element.svg
[npm-url]: https://npmjs.org/package/@cfware/shadow-element
