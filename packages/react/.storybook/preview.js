import React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import { configureActions } from '@storybook/addon-actions';
import { DocsPage, DocsContainer } from '@storybook/blocks';

import Container from './Container';

configureActions({
  depth: 3,
});

export const parameters = {
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
  options: {
    storySort: (a, b) => {
      return a.title === b.title ? 0 : a.id.localeCompare(b.id, undefined, { numeric: true });
    },
  },
  a11y: {
    element: '#root',
    config: {},
    options: {},
    manual: true,
  },
};

export const decorators = [(story) => <Container story={story} />, withKnobs];
