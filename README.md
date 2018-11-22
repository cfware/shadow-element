# @cfware/shadow-element

[![Travis CI][travis-image]][travis-url]
[![Greenkeeper badge][gk-image]](https://greenkeeper.io/)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

My HyperHTML based shadow element

### Install @cfware/shadow-element

This is not a node module, though using it likely requires node.js 8 build
system.  See [cfware/rollup-webapp] for a gulp@4 based build system template.

This component is open source but semi-closed development.  It is not stable
and is subject to change on the whim of my internal needs.  This may change in
the future - or it might not.  If this fits your need you should be prepared to
fork it.  You are probably better off using [hyperhtml-element].

This module will follow semver but will remain on 0.x.  Every 0.x.0 release is
subject to breaking changes.

```sh
npm i -D @cfware/shadow-element
```

## Usage

```js
'use strict';

import {ShadowElement} from '@cfware/shadow-element';

class MyElement extends ShadowElement {
	render() {
		this.html`
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

## Running tests

Currently only `xo`.  Eventually testing here will expand to the browser but
for now testing is indirect by consumers of this module.

```sh
npm install
npm test
```

[npm-image]: https://img.shields.io/npm/v/@cfware/shadow-element.svg
[npm-url]: https://npmjs.org/package/@cfware/shadow-element
[travis-image]: https://travis-ci.org/cfware/shadow-element.svg?branch=master
[travis-url]: https://travis-ci.org/cfware/shadow-element
[gk-image]: https://badges.greenkeeper.io/cfware/shadow-element.svg
[downloads-image]: https://img.shields.io/npm/dm/@cfware/shadow-element.svg
[downloads-url]: https://npmjs.org/package/@cfware/shadow-element
[license-image]: https://img.shields.io/npm/l/@cfware/shadow-element.svg

[cfware/rollup-webapp]: https://github.com/cfware/rollup-webapp
[hyperhtml-element]: https://github.com/WebReflection/hyperHTML-Element#readme
