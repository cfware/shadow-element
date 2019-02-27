# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [0.4.0](https://github.com/cfware/shadow-element/compare/v0.3.4...v0.4.0) (2019-02-27)


### Code Refactoring

* Reduce export surface area. ([583f6a2](https://github.com/cfware/shadow-element/commit/583f6a2))


### Features

* Switch from hyperhtml to lighterhtml. ([f7a8db1](https://github.com/cfware/shadow-element/commit/f7a8db1))


### BREAKING CHANGES

* Remove `wire` and `bind` export.
* ShadowElement.html no longer exists, `html` is directly
exported.
* Implementations must not define a `render` method,
instead must define a `template` property.
* ShadowElement `_render` method no longer exists,
instead call `element.render(true)` for immediate rendering.
* Stop defining `get-reference` attribute.
* Remove exports `define`, `wirePrivates`,
`wireRenders`, `reflectBooleanProps`, `reflectStringProps` and
`reflectNumericProps`.
* Remove default export `decamelizePropName`.
* Use symbol for private storage associated with render
properties.
* Rename `ShadowElement.define` option `renderProperties`
to `renderProps`.
* Remove `ShadowElement.define` option `extends`.
