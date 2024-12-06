/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, text, select } from '@storybook/addon-knobs';
import { BreadcrumbSkeleton, BreadcrumbItem } from '@carbon/react';
import { layout05, spacing05 } from '@carbon/layout';

import Breadcrumb from './Breadcrumb';

const props = () => ({
  className: 'some-class',
  noTrailingSlash: boolean('No trailing slash (noTrailingSlash)', false),
  onClick: action('onClick'),
});

const PolyfillWarning = () => (
  <p style={{ marginTop: layout05 }}>
    Note: `hasOverflow` utilizes a{' '}
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver">ResizeObserver</a> to
    detect changes to the container width. This library does not provide a{' '}
    <a href="https://www.npmjs.com/package/resize-observer-polyfill">polyfill</a>, it will likely
    need to be added to your application due to{' '}
    <a href="https://caniuse.com/#feat=resizeobserver">current browser support</a>. This story will
    not demonstrate the `hasOverflow` functionality in browsers without support for ResizeObserver.
  </p>
);

export default {
  title: '1 - Watson IoT/Breadcrumb',
  decorators: [withKnobs],

  parameters: {
    component: Breadcrumb,
  },
};

export const Default = () => {
  return (
    <Breadcrumb {...props()}>
      <BreadcrumbItem href="#">Breadcrumb 1</BreadcrumbItem>
      <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
      <BreadcrumbItem href="#">{text('Breadcrumb 3 text', 'Breadcrumb 3')}</BreadcrumbItem>
    </Breadcrumb>
  );
};

Default.storyName = 'default';

Default.parameters = {
  info: {
    text: `
      Breadcrumb enables users to quickly see their location within a path of navigation and move up to a parent level if desired.
    `,
  },
};

export const Skeleton = () => <BreadcrumbSkeleton />;

Skeleton.storyName = 'skeleton';

Skeleton.parameters = {
  info: {
    text: `
          Placeholder skeleton state to use when content is loading.
          `,
  },
};

export const CurrentPageWithAriaCurrent = () => (
  <Breadcrumb {...props()}>
    <BreadcrumbItem>
      <a href="/#">Breadcrumb 1</a>
    </BreadcrumbItem>
    <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
    <BreadcrumbItem href="#" aria-current="page">
      Breadcrumb 3
    </BreadcrumbItem>
  </Breadcrumb>
);

CurrentPageWithAriaCurrent.storyName = 'current page with aria-current';

CurrentPageWithAriaCurrent.parameters = {
  info: {
    text: 'You can specify a BreadcrumbItem component as the current page with the `aria-current` prop by specifying `aria-current="page"`',
  },
};

export const HasOverflow = () => {
  return (
    <>
      <div style={{ width: '50vw', border: '1px solid', padding: spacing05 }}>
        <Breadcrumb hasOverflow {...props()}>
          <BreadcrumbItem href="#" title="1 Homexxxxxxxxxxxxxxxxxxxxxx">
            1 Homexxxxxxxxxxxxxxxxxxxxxx
          </BreadcrumbItem>
          <BreadcrumbItem
            href="#"
            onClick={(e) => {
              e.preventDefault();
              console.log('clicked');
            }}
            title="2 Devices"
          >
            2 Devices
          </BreadcrumbItem>
          <BreadcrumbItem href="#" title="3 A really long page name">
            3 A really long page name
          </BreadcrumbItem>
          <BreadcrumbItem href="#" title={text('Breadcrumb 4 text', '4 Another page')}>
            {text('Breadcrumb 4 text', '4 Another page')}
          </BreadcrumbItem>
          <BreadcrumbItem
            href="#"
            isCurrentPage
            title={text('Breadcrumb 5 text', '5th level page')}
          >
            {text('Breadcrumb 5 text', '5th level page')}
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      <PolyfillWarning />
    </>
  );
};

HasOverflow.storyName = 'hasOverflow';

HasOverflow.parameters = {
  info: {
    text: `
      Breadcrumbs can be automatically collapsed into an overflow menu by toggling 'hasOverflow'. Note, this requires the containing application to provide a polyfill for ResizeObserver!
    `,
  },
};

export const WithTruncation = () => {
  return (
    <Breadcrumb
      noTrailingSlash
      disableTruncation={select('Disable truncation', ['first', 'last', 'none'], 'first')}
    >
      <BreadcrumbItem href="#">{text('Breadcrumb 1 text', 'Breadcrumb 1')}</BreadcrumbItem>
      <BreadcrumbItem href="#">
        {text(
          'Breadcrumb 2 text',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi finibus tortor vel nisl suscipit, ac commodo lorem lobortis. Aenean at sem porta, rutrum nisi ut, lobortis enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi finibus tortor vel nisl suscipit, ac commodo lorem lobortis. Aenean at sem porta, rutrum nisi ut, lobortis enim.'
        )}
      </BreadcrumbItem>
    </Breadcrumb>
  );
};

WithTruncation.storyName = 'with truncation';
