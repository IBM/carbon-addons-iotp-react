# Versioning

This document aims to provide clarity on our versioning strategy and is based
off
[the versioning documentation from Carbon](https://github.com/carbon-design-system/carbon/blob/master/docs/guides/versioning.md).

The Carbon Add-ons for Watson IoT team aims to follow
[Semantic Versioning](https://semver.org/) (semver) for the package we ship.

From semver.org, this means that:

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
> 1. **MAJOR** version when you make incompatible API changes,
> 2. **MINOR** version when you add functionality in a backwards compatible
>    manner, and
> 3. **PATCH** version when you make backwards compatible bug fixes.
>
> _Additional labels for pre-release and build metadata are available as
> extensions to the MAJOR.MINOR.PATCH format._

As a result, whenever you see a `minor` or `patch` update for a package from
`carbon-addons-iot-react` you should feel confident that you can update without
anything breaking in your project.

All new development takes place on the `next` branch. For every PR that is
merged, a new release is published to the `@next` channel. Periodically, the
`next` branch is merged into `master` triggering a release on `@latest`.

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

**Note:** If you ever bring in an update and it does break something in your
project, please
[create an issue](https://github.com/carbon-design-system/carbon-addons-iot-react/issues/new?assignees=&labels=%3Abug%3A++Bug&template=bug-report.md&title=%5BComponentName%5D+bug_title)
and we will resolve the issue as quickly as possible.

In the following sections, you'll find specific details for our packages and the
types of changes you can expect to occur as a consumer of that package. We'll
try to highlight common changes in code and the corresponding `semver` bump that
you can expect for the package when it is updated.

## `carbon-addons-iot-react`

### Changes

| Type of change                                                                                                                             | semver bump |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| [A new prop is added to a component](#a-new-prop-is-added-to-a-component)                                                                  | `minor`     |
| [An existing prop is deprecated](#an-existing-prop-is-deprecated)                                                                          | `minor`     |
| [An existing prop is removed](#an-existing-prop-is-removed)                                                                                | `major`     |
| [An existing prop type is changed to be more specific](#an-existing-prop-type-is-changed-to-be-more-specific)                              | `major`     |
| [An existing prop type is changed to be more generic](#an-existing-prop-type-is-changed-to-be-more-generic)                                | `minor`     |
| [A `PropTypes.func` prop type is changed to have different arguments](#a-proptypesfunc-prop-type-is-changed-to-have-different-arguments)   | `major`     |
| [A `PropTypes.func` prop type is changed to have additional arguments](#a-proptypesfunc-prop-type-is-changed-to-have-additional-arguments) | `minor`     |
| [A `PropTypes.func` prop type is changed to have fewer arguments](#a-proptypesfunc-prop-type-is-changed-to-have-fewer-arguments)           | `major`     |
| [A class name, id, or other selector is added, changed, or removed](#a-class-name-id-or-other-selector-is-added-changed-or-removed)        | `minor`     |
| [A `data-testid` attribute is added](#a-data-testid-attribute-is-added)                                                                    | `minor`     |
| [A `data-testid` attribute default prop value is changed or removed](#a-data-testid-attribute-default-prop-value-is-changed-or-removed)    | `major`     |
| [The DOM node that an `data-testid` corresponds to is changed](#the-dom-node-that-an-data-testid-corresponds-to-is-changed)                | `major`     |

### Examples

#### A new prop is added to a component

semver bump: **minor**

```diff
function ExampleComponent({
  propA,
+  propB,
}) {
  return (
    <>
      <span>{propA}</span>
+      <span>{propB}</span>
    </>
  );
}

ExampleComponent.propTypes = {
  propA: PropTypes.string,
+  propB: PropTypes.string,
};
```

#### An existing prop is deprecated

semver bump: **minor**

```diff
function ExampleComponent({ propA, propB }) {
  return (
    <>
      <span>{propA}</span>
      <span>{propB}</span>
    </>
  );
}

ExampleComponent.propTypes = {
  propA: PropTypes.string,
-  propB: PropTypes.string,
+  propB: deprecate(PropTypes.string),
};
```

#### An existing prop is removed

semver bump: **major**

```diff
function ExampleComponent({
  propA,
-  propB,
}) {
  return (
    <>
      <span>{propA}</span>
-      <span>{propB}</span>
    </>
  );
}

ExampleComponent.propTypes = {
  propA: PropTypes.string,
-  propB: deprecate(PropTypes.string),
};
```

#### An existing prop type is changed to be more specific

semver bump: **major**

```diff
function ExampleComponent({ propA, propB }) {
  return (
    <>
      <span>{propA}</span>
      <span>{propB}</span>
    </>
  );
}

ExampleComponent.propTypes = {
  propA: PropTypes.string,
-  propB: PropTypes.node,
+  propB: PropTypes.string,
};
```

#### An existing prop type is changed to be more generic

semver bump: **minor**

```diff
function ExampleComponent({ propA, propB }) {
  return (
    <>
      <span>{propA}</span>
      <span>{propB}</span>
    </>
  );
}

ExampleComponent.propTypes = {
  propA: PropTypes.string,
-  propB: PropTypes.string,
+  propB: PropTypes.node,
};
```

#### A `PropTypes.func` prop type is changed to have different arguments

semver bump: **major**

```diff
import { SomeComponent } from '@carbon/react';

function ExampleComponent() {
  function onChange(arg) {
    // If a or b change types (from number to string) or if they are removed
    // (a or b no longer exists)
    const { a, b } = arg;
  }

  return <SomeComponent onChange={onChange} />;
}
```

#### A `PropTypes.func` prop type is changed to have additional arguments

semver bump: **minor**

```diff
import { SomeComponent } from '@carbon/react';

function ExampleComponent() {
-  function onChange(a, b) {
+  function onChange(a, b, c) {
    // ...
  }

  return <SomeComponent onChange={onChange} />;
}
```

#### A `PropTypes.func` prop type is changed to have fewer arguments

semver bump: **major**

```diff
import { SomeComponent } from '@carbon/react';

function ExampleComponent() {
-  function onChange(a, b, c) {
+  function onChange(a, b) {
    // ...
  }

  return <SomeComponent onChange={onChange} />;
}
```

#### A class name, id, or other selector is added, changed, or removed

semver bump: **minor**

```diff
.#{$iot-prefix}--bar-chart-card {
- .card--title {
+ .#{$iot-prefix}--card--title {
    padding-bottom: $spacing-02;
    padding-top: $spacing-02;
    width: 100%;
  }
}
```

```diff
function CardTitle({ children, title }) {
  return (
-   <span className="card--title" title={title}>
+   <span className={`${iotPrefix}--card--title`} title={title}>
      {children}
    </span>
  );
}
```

In general, we consider selectors to be internals/implementation details for the
following reasons:

1. There is no way we could test to see if a change we make could break how
   someone is overriding a specific selector
1. Following semantic versioning with selectors would introduce broad
   implications resulting in the inflexibility or freezing of all aspects of our
   styles which would make it challenging to update without considering it a
   breaking change.

We realize this can be painful for consuming projects. In attempt to ease this
pain, here are a few supporting thoughts you may find helpful:

1. Overriding styles from this library in your application is a valid use case
   that we would like to assist in supporting. While there is no way for this
   library to test your codebase for overriden styles,
   [version release changelogs](https://github.com/carbon-design-system/carbon-addons-iot-react/releases)
   are provided for each release, which contain a list of included commits and
   recently closed issues. This can be used to identify high level potential
   changes when upgrading versions of this library in your application.
   Additionally you may consider writing automated tests against styles you
   override to ensure their validity when updating.
1. Changes to the public component API is tracked via
   [a jest snapshot file](https://github.com/carbon-design-system/carbon-addons-iot-react/blob/master/src/utils/__tests__/__snapshots__/publicAPI.test.js.snap).
   This includes `className` and other prop changes. The file can be used during
   your upgrade process to compare changes between different versions of the
   library.
   [Here is an example comparing v2.55.0 -> v2.56.0](https://github.com/carbon-design-system/carbon-addons-iot-react/compare/v2.55.0...v2.56.0#diff-789e184fd0335570057a913379ee5f43),
   tags can be changed and selected via the dropdowns at the top of that page.
1. For testing automation, we are working to provide a dedicated `data-testid`
   data attribute placed on the containing element of each component. This
   should be used in place of class or id selectors in your testing automation.
   More info is available in the [testing guide documentation](/testing).

#### A `data-testid` attribute is added

semver bump: **minor**

```diff
- function ExportedComponent({ message }) {
+ function ExportedComponent({ testId, message }) {
  return (
    <>
-     <span>{message}</span>
+     <span data-testid={testId}>{message}</span>
    </>
  );
}

ExportedComponent.propTypes = {
  message: PropTypes.string,
+ testId: PropTypes.string,
};
ExportedComponent.defaultProps = {
  message: '',
+ testId: 'ExportedComponent',
};
```

#### A `data-testid` attribute default prop value is changed or removed

semver bump: **major**

```diff
function ExportedComponent({ testId, message }) {
  return (
    <>
      <span>{message}</span>
      <span data-testid={testId}>{message}</span>
    </>
  );
}

ExportedComponent.propTypes = {
  message: PropTypes.string,
  testId: PropTypes.string,
};
ExportedComponent.defaultProps = {
  message: '',
- testId: 'ExportedComponent',
+ testId: 'ExportedComponentNewName',
};
```

#### The DOM node that an `data-testid` corresponds to is changed

semver bump: **major**

```diff
function ExportedComponent({ testId, message }) {
  return (
-  <>
+  <div data-testid={testId}>
      <span>{message}</span>
-      <span data-testid={testId}>{message}</span>
+      <span>{message}</span>
-  </>
+  <div/>
  );
}

ExportedComponent.propTypes = {
  message: PropTypes.string,
  testId: PropTypes.string,
};
ExportedComponent.defaultProps = {
  message: '',
  testId: 'ExportedComponent',
};
```

#### The DOM node that an `id` corresponds to is changed

semver bump: **minor**

We have components that require specifying an `id` that typically corresponds to
an underlying `<input>` node. However, changes to the exact node that the `id`
references may change over time. As a result, you should not rely on an `id`
pointing to a specific element but instead treat it as a unique identifier that
the component uses for something that it renders.

#### The DOM node that an `aria-label` corresponds to is changed

semver bump: **minor**

Certain components require the product developer to pass in an `aria-label` or
`aria-labelledby` prop for supporting screen reader users. Ultimately, these
values are passed along to a given element in the DOM. While the label should
stay consistent over time, you should not rely on either prop pointing to the
same element over time. In other words, the node that `aria-label` or
`aria-labelledby` is supplied to may change over time.
