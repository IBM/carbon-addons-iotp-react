<p align="center">
  <a href="https://pages.github.ibm.com/ai-applications/design/">
    <img alt="Carbon add-ons for Watson IoT" src="https://user-images.githubusercontent.com/3360588/59875762-3add3180-9367-11e9-8a65-a6cf7efa5061.png" width="100%" />
  </a>
</p>
<h1 align="center">
  Carbon add-ons for Watson IoT
</h1>

> Carbon add-ons for Watson IoT is an open-source react component library built
> by IBM Watson Internet Of Things. With the Carbon Design System and IBM Design
> Language as its foundation, the library consists of working code, resources,
> and a vibrant community of contributors.

<p align="center">
  <a href="https://www.npmjs.com/package/carbon-addons-iot-react">
    <img src="https://img.shields.io/npm/v/carbon-addons-iot-react/latest" alt="@latest npm version release" />
  </a>
  <a href="https://www.npmjs.com/package/carbon-addons-iot-react">
    <img src="https://img.shields.io/npm/v/carbon-addons-iot-react/next" alt="@next npm version release" />
  </a>
  <br/>
  <a href="https://carbon-design-system.github.io/carbon-addons-iot-react">
    <img src="https://img.shields.io/badge/view%20%40next-storybook-ff4785" alt="view @next storybook" />
  </a>
  <br/>
  <a href="https://github.com/carbon-design-system/carbon-addons-iot-react/actions?query=workflow%3ABuild+branch%3Amaster">
    <img src="https://img.shields.io/github/workflow/status/carbon-design-system/carbon-addons-iot-react/Build/master" alt="Build Status" />
  </a>
  <a href="https://coveralls.io/github/carbon-design-system/carbon-addons-iot-react?branch=master">
    <img src="https://coveralls.io/repos/github/carbon-design-system/carbon-addons-iot-react/badge.svg?branch=master" alt="Coverage Report" />
  </a>
  <br/>
  <a href="https://github.com/carbon-design-system/carbon-addons-iot-react/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="Carbon add-ons for Watson IoT is released under the Apache-2.0 license" />
  </a>
  <a href="https://github.com/carbon-design-system/carbon-addons-iot-react/blob/master/.github/CONTRIBUTING.MD">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" />
  </a>

</p>

## Installation

**@latest from
[`master`](https://github.com/carbon-design-system/carbon-addons-iot-react/tree/master)**
&nbsp; - &nbsp; <a href="https://carbon-design-system.github.io/carbon-addons-iot-react">
<img valign=middle src="https://img.shields.io/badge/view%20%40latest-storybook-ff4785" alt="view @latest storybook" />
</a>

```bash
# with npm
npm install carbon-addons-iot-react d3@">=5.0.0 <=5.14.2"

# with yarn
yarn add carbon-addons-iot-react d3@">=5.0.0 <=5.14.2"
```

**@next pre-releases from
[`next`](https://github.com/carbon-design-system/carbon-addons-iot-react/tree/next)**

```bash
# with npm
npm install carbon-addons-iot-react@next d3@"^7.0.0"

# with yarn
yarn add carbon-addons-iot-react@next d3@"^7.0.0"
```

> _`d3` is a peer dependency due to the usage of `@carbon/charts` in various
> components. The required version range is specified in
> [package.json](https://github.com/carbon-design-system/carbon-addons-iot-react/search?l=JSON&q=peerDependencies+d3)_

### Subscribe to all pre-releases on `next`

[Pre-release versions](https://semver.org/#spec-item-9) are available on
`carbon-addons-iot-react@next`. The default version range that is automatically
added to your `package.json` on install/add will only follow pre-releases on the
same `major.minor.patch` version. The version range can be modifed to follow all
pre-releases:

```diff
"dependencies": {
-    "carbon-addons-iot-react": "^2.139.0-next.4"
+    "carbon-addons-iot-react": "next"
  }
```

## 🚀 Quick Start

To test drive everything here, use
[`create-iot-react-app`](https://github.com/davidicus/create-iot-react-app). It
will create a new project that is preconfigured with everything you need to
begin to build an application.

```bash
npx create-iot-react-app <app-name>
```

## Styling

What's included

```bash
carbon-addons-iot-react/
├── css
│   ├── carbon-addons-iot-react.css
│   └── carbon-addons-iot-react.css.map
├── scss
│   └── components
│       └── modal
│           └── _modal.scss
│       └── ...
│   └── globals
│       └── scss
│           └── _vars.scss
│           └── ...
│   └── styles.scss (sass entrypoint)
```

Compiled CSS files are provided for ease of use getting started.

A sass entrypoint is available at `scss/styles.scss` for use in your project.

Using sass files (instead of the compiled .css) infers usage of a SCSS
pre-processor. All Sass files use the `*.scss` file extension. For transpiling
Sass code, use node-sass based Sass compilers, for example, WebPack sass-loader
or gulp-sass. Make sure your build process uses autoprefixer to ensure vendor
prefixes are automatically added to your output CSS.

Feedback and improvement requests regarding this configuration would be
appreciated,
[please open an issue](https://github.com/carbon-design-system/carbon-addons-iot-react/issues/new?assignees=&labels=%3Ahammer%3A++Enhancement&template=feature-request-or-enhancement.md&title=%5BComponentName%5D+request_title).

## Dependencies

Usage of this package does not require you to install additional Carbon
packages; `carbon-components`, `carbon-components-react`, or `@carbon` packages
(`@carbon/grid`, `@carbon-layout`, etc) as peer dependencies. You may still need
these packages if you use them directly in your project.

## 🤲 Contributing

Please check out our [Contribution Guidelines](https://github.com/carbon-design-system/carbon-addons-iot-react/blob/HEAD/.github/CONTRIBUTING.MD) for
more info on how you can help out!

## Testing

You can find our component test statement
[here](./src/components/COMPONENT_TEST)

If you are using our project with Jest tests, due to it's dependency on d3, you
may have to add some mock to your Jest setup script. See this issue for more
details: <https://github.com/facebook/jest/issues/5379>

Here's an example setup script, update your jest config to point to a setup
script: setupFiles: ['setupJest.js'],

```js
setupJest.js contents:

class SVGPathElement extends HTMLElement {}

window.SVGPathElement = SVGPathElement;
```

<a href="https://www.netlify.com">
    <img src="https://www.netlify.com/img/global/badges/netlify-light.svg" alt="Deploys by Netlify" />
</a>
