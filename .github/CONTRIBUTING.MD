# Contributing

## Prerequisites

Before contributing to `carbon-addons-iot-react`, you should make sure you have
the following tools installed:

- [Node.js](https://nodejs.org/en/download/) - the required version is specified
  in the [`.nvmrc`](/.nvmrc)
  - If you're on macOS or using WSL on Windows, we recommend using
    [`nvm`](https://github.com/nvm-sh/nvm) as your version manager for Node.
- Git
- [Yarn Classic](https://classic.yarnpkg.com/en/docs/install)

You'll also need a code editor to make changes. There are many to choose from
but some popular options are [VSCode](https://code.visualstudio.com/),
[Atom](https://atom.io), and [Sublime](https://www.sublimetext.com/).

With that all in place, you're ready to start contributing!

### Working with the monorepo

The PAL is structured as a set of packages versioned and deployed together - `carbon-addons-iot-react`, and `@ai-apps/components`. Each one of these packages live in the `packages` directory, for example, `carbon-addons-iot-react` lives in the `packages/react` directory.

To work on a package you must make sure to change into the correct directory - `cd packages/react` - otherwise package specific commands, or packages added via `yarn add`, will be run and added to the global scope and may conflict with other packages.

Each package should be capable of producing an independent build and storybook environment, however it may be necessary to build and link _all_ packages contained within the monorepo. In that case running `yarn build` from the root will build every package and it's local dependents in order. Other global scripts include:

- `build`: Builds and links every package
- `lint`: Lints every package
- `test`: Runs the test suite of every package
- `build:storybook`: Builds the storybook for every package (where applicable)
- `clean`: Cleans built files for the entire monorepo

### Developing on Windows 10

To get a Windows environment set up for contributing to this codebase, you'll
need to set up the Windows Subsystem for Linux (WSL).

To set up WSL, follow
[this guide published by the Carbon team](https://github.com/carbon-design-system/carbon/blob/master/docs/guides/setup/windows.md).
The steps should be the same, except that you'll be cloning this repository
instead of the Carbon repository.

```sh
git clone git@github.com:carbon-design-system/carbon-addons-iot-react.git
```

or with `https`:

```sh
git clone https://github.com/carbon-design-system/carbon-addons-iot-react.git
```

## Build and start the development server

From the root directory of the project, run:

```sh
# To install the project's dependencies
yarn install
```

To get your development server running and to start coding, run:

```sh
yarn start
```

This will start a development server where you can see any changes you are
making to components in our react components Storybook.

Once it's done building, you can edit source code or create new components. The
system is set up to automatically bundle your changes/additions. Visit
http://localhost:3000 to see the changes happen on the fly.

## Adding a new component or feature

You're ready to add a new component or feature to this library, THANK YOU!
However, this is only a
[_presentational_](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
component library. Please do not add components with any dependencies on
internationalization libraries, redux, react-router, etc.

For a component request or feature enhancement to be considered ‘ready to
implement’, a design spec and usage guidance should be provided in the issue.
Associated code pull requests will not be merged without these artifacts.

## Dependencies

Dependencies must be added via `yarn add <packageName>`. Please do not use
`npm install <packageName>`.

When adding new `dependencies` or `devDependencies` to the codebase, the
associated pull request should include justification for the package and the
alternatives considered.

Any change to `dependencies` (including version bumps) will impact consumers
that are required to go through open source approvals within their organization.
This approval process is not always a trivial task. `devDependencies` are less
of a concern as they are not included in the exported package.

## Submitting pull requests and commits

All new development work should take place in a feature branch off of `next`.

Commits must follow the
[conventional commit](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary)
format. You won't be able to create a commit unless you follow those rules. The
[recent commits in the repository](https://github.com/carbon-design-system/carbon-addons-iot-react/commits/master)
show examples of the format and how it's generally used.

For more information on what type of change commit should be labeled a
`BREAKING CHANGE`, `feat`, or `fix`, please read
[the versioning documentation](https://github.com/carbon-design-system/carbon-addons-iot-react/blob/master/docs/guides/versioning.md).

Commits are preferred but not required to contain a link to an issue. If you
choose to link commits to an issue, the 72 character limit can be avoided by
placing the link in the body of the commit. Example:

```sh
git commit -m "fix(table): columns need unique ids" -m "#123"
```

Pull requests must contain a link to a relevant issue. If applicable,
[automatically close issues from PRs via the keywords](https://help.github.com/en/articles/closing-issues-using-keywords).

## Styling new components

Components should have their own sass partial in which the corresponding styles
are contained. If a component does not have one, please add it.

Do not use `styled-components`. Any components using it should be refactored to
the sass partial approach. This helps promote consistency with the Carbon Design
System.

## Documenting new components

Components should have a file named `{Component}.mdx` in their root directory. This file should minimally contain a few sections detailing the props and how to use the component. It can also contain simple examples of various states of the component. These examples can also link to existing stories and be used interactively within the docs tab. See [addon-docs readme for more details](https://github.com/storybookjs/storybook/blob/next/addons/docs/README.md).

An minimal doc file should include:

```md
# `ExampleComponent` component

## Table of Contents

- [Getting started](#getting-started)
- [Props](#props)
- [Feedback](#feedback)
- External Links
  - [Source Code](https://github.com/carbon-design-system/carbon-addons-iot-react/tree/next/packages/react/src/components/ExampleComponent)

## Getting started

A quick introduction to the component and an example import for how to use it.

`import { ExampleComponent } from 'carbon-addons-iot-react';`

\```jsx
<ExampleComponent testId="an example test id" propOne={1}/>
\```

## Props

A Prop table detailing the various props that can be passed to this component, their types, defaults, and description.

| Name   | Type   | Default             | Description                  |
| :----- | :----- | :------------------ | :--------------------------- |
| testId | string | 'component-test-id' | The test id of the component |

## Feedback

Help us improve this component by providing feedback, asking questions on Slack, or updating this file on
[GitHub](https://github.com/carbon-design-system/carbon-addons-iot-react/tree/next/packages/react/src/components/ExampleComponent/ExampleComponent.mdx).
````

## Adding new SVG images

If SVG files need to be added that are not already distributed by Carbon, please
take the following steps.

1. first add the SVG files to `src/icons/svg`.
2. Next, run `yarn svg-convert`. This will produce a React JSX component, as
   well as update the `src/icons/components/index.jsx` exports with the newly
   created component.
3. You can then import the file as a regular react componet with
   `import MySvgIcon from 'src/icons/components/MySvgIcon.jsx`.

## Testing

An automated unit test bucket runs when you execute `yarn test:base`.

Before every push, the test suite is ran automatically and takes snapshots of
all of the current component stories. If you have made changes to a component,
our tests will likely fail because the snapshots will no longer match. You will
be prevented from pushing to git until you fix this error.

### Writing tests

The items below are high level points of guidance for writing tests:

- Use the `@testing-library` family of packages instead of `enzyme`. Helping to
  refactor away from `enzyme` where possible is appreciated.
- Prefer queries that reflect the experience of visual/mouse users as well as
  those that use assistive technology,
  [read more from the `@testing-library` docs](https://testing-library.com/docs/guide-which-query)
  - `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`,
    `getByDisplayValue`
- Write tests using queries directly from the `screen` object rather than
  destructuring them from `render` result,
  [read more from the `prefer-screen-queries` eslint rule](https://github.com/testing-library/eslint-plugin-testing-library/blob/master/docs/rules/prefer-screen-queries.md)

### Updating snapshots

After the unit test engine has detected a snapshot difference, all snapshots can
be updated by running `yarn test:update`.

_Do not blindly update snapshots to pass the testcase._ Make sure the detected
change is intentional and not unintentional before updating the snapshot.

### Visual regression tests

If you're adding a new component or making visual changes to an existing component, you'll want to run the visual regression tests and generate new comparison images. Visual regression tests run within a docker container using cypress to ensures a consistent environment for generating all regression test images. To run these tests, you'll need to install docker on your host machine. You can find [docker install instructions here](https://docs.docker.com/get-docker/).

Once that is installed and running, you can run `yarn test:e2e:images` to build the docker container, install all dependencies, and run the cypress visual regression tests. These tests will compare your changes against the existing baseline images in `packages/react/cypress-visual-screenshots/baseline`.

If this is a new component, you'll want to add it to the "kitchen-sink" cypress test that combines many components in a single image for testing. This addition, or making visual changes to existing components, will cause the tests to fail. If intentional changes to the component cause this failure, you'll need to run `yarn test:e2e:update` to replace the existing baseline images with these newly created images. Commit these changes into git and push. The new images will become the baseline for all future comparisons.

### Minimum code coverage

Code coverage thresholds are enforced in the repository. If you add code but do
not cover it with unit tests, the git push may fail because the coverage fell to
a level under the required code coverage thresholds. Please add storybook
stories or unit tests to cover your new code before checking in. _Do not reduce
the code coverage threshold to get around this constraint._

To understand what lines of code are NOT covered by the current testcases, open
the coverage/index.html file in a browser and investigate.

## Setting up VSCode to share settings and extensions

Some contributors to this repository are using some pretty cool VSCode
extensions to make local development easier. If you'd like to reuse the same
ones, follow
[the instructions to set up the VSCode Settings Sync](http://shanalikhan.github.io/2015/12/15/Visual-Studio-Code-Sync-Settings.html).

Here's the Gist ID to download/share settings from:
`5e3fb697c29f2aaa058145a3349a8229`

After installing the VSCode Sync, restart VSCode, go to the Command Palette and
search for Sync. Select Sync : Advanced Options-> Sync : Download Settings from
Public GIST

Then Sync : Download Settings. It will ask you for a Public GIST URL, here it
is.

Here's the Public GIST URL:
https://gist.github.com/scottdickerson/5e3fb697c29f2aaa058145a3349a8229
