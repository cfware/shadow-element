# @cfware/shadow-element

![Tests][tests-status]
[![Greenkeeper badge][gk-image]](https://greenkeeper.io/)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

My lighterhtml based shadow element

### Install @cfware/shadow-element

This module makes use of [public class fields].

```sh
npm i -D @cfware/shadow-element
```

## Usage

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
[tests-status]: https://github.com/cfware/shadow-element/workflows/Tests/badge.svg
[gk-image]: https://badges.greenkeeper.io/cfware/shadow-element.svg
[downloads-image]: https://img.shields.io/npm/dm/@cfware/shadow-element.svg
[downloads-url]: https://npmjs.org/package/@cfware/shadow-element
[license-image]: https://img.shields.io/npm/l/@cfware/shadow-element.svg

[public class fields]: https://github.com/tc39/proposal-class-fields#readme
