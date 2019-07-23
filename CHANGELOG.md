# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.9.0](https://github.com/cfware/shadow-element/compare/v0.8.0...v0.9.0) (2019-07-23)


### ⚠ BREAKING CHANGES

* Update lighterhtml to version 0.16.1

### Features

* Enable partial attribute updates ([#21](https://github.com/cfware/shadow-element/issues/21)) ([668c7cc](https://github.com/cfware/shadow-element/commit/668c7cc))

## [0.8.0](https://github.com/cfware/shadow-element/compare/v0.7.0...v0.8.0) (2019-06-06)


### Features

* Update dependencies ([aaec500](https://github.com/cfware/shadow-element/commit/aaec500))


### BREAKING CHANGES

* Update lighterhtml to 0.14.1



## [0.7.0](https://github.com/cfware/shadow-element/compare/v0.6.0...v0.7.0) (2019-05-11)


### Bug Fixes

* **package:** update lighterhtml to version 0.12.0 ([#13](https://github.com/cfware/shadow-element/issues/13)) ([a3ab4b3](https://github.com/cfware/shadow-element/commit/a3ab4b3))


### BREAKING CHANGES

* **package:** update lighterhtml to version 0.12.0 (#13)



## [0.6.0](https://github.com/cfware/shadow-element/compare/v0.5.4...v0.6.0) (2019-05-10)


### Bug Fixes

* update lighterhtml to version 0.11.0 ([#12](https://github.com/cfware/shadow-element/issues/12)) ([5ccbccf](https://github.com/cfware/shadow-element/commit/5ccbccf))


### BREAKING CHANGES

* update lighterhtml to version 0.11.0 (#12)



## [0.5.4](https://github.com/cfware/shadow-element/compare/v0.5.3...v0.5.4) (2019-04-27)


### Bug Fixes

* **package:** update lighterhtml to version 0.10.0 ([#8](https://github.com/cfware/shadow-element/issues/8)) ([e0d20c5](https://github.com/cfware/shadow-element/commit/e0d20c5))



## [0.5.3](https://github.com/cfware/shadow-element/compare/v0.5.2...v0.5.3) (2019-04-25)


### Bug Fixes

* Update dependencies ([57919e9](https://github.com/cfware/shadow-element/commit/57919e9))



## [0.5.2](https://github.com/cfware/shadow-element/compare/v0.5.1...v0.5.2) (2019-03-24)


### Features

* Export lighterhtml render method ([7d9da6c](https://github.com/cfware/shadow-element/commit/7d9da6c))



## [0.5.1](https://github.com/cfware/shadow-element/compare/v0.5.0...v0.5.1) (2019-03-23)


### Bug Fixes

* Use @cfware/add-event-listener ([e464494](https://github.com/cfware/shadow-element/commit/e464494))



# [0.5.0](https://github.com/cfware/shadow-element/compare/v0.4.5...v0.5.0) (2019-03-22)


### Features

* Use @cfware/callback-array-once. ([fa591ec](https://github.com/cfware/shadow-element/commit/fa591ec))


### BREAKING CHANGES

* This module now uses stage-3 proposal class fields.



## [0.4.5](https://github.com/cfware/shadow-element/compare/v0.4.4...v0.4.5) (2019-03-14)


### Bug Fixes

* Revert some of the 'terser friendly' changes. ([6f6a011](https://github.com/cfware/shadow-element/commit/6f6a011))



## [0.4.4](https://github.com/cfware/shadow-element/compare/v0.4.3...v0.4.4) (2019-03-13)


### Features

* Create createBoundEventListeners instance function ([51913a4](https://github.com/cfware/shadow-element/commit/51913a4))



## [0.4.3](https://github.com/cfware/shadow-element/compare/v0.4.2...v0.4.3) (2019-03-12)


### Bug Fixes

* Improve ability to minify components. ([f6afe19](https://github.com/cfware/shadow-element/commit/f6afe19))



## [0.4.2](https://github.com/cfware/shadow-element/compare/v0.4.1...v0.4.2) (2019-03-12)


### Features

* Add documentEvents & windowEvents to ShadowElement.define options. ([44ca59b](https://github.com/cfware/shadow-element/commit/44ca59b))



## [0.4.1](https://github.com/cfware/shadow-element/compare/v0.4.0...v0.4.1) (2019-03-11)


### Features

* Expose html.for as htmlFor. ([3a015da](https://github.com/cfware/shadow-element/commit/3a015da))



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
