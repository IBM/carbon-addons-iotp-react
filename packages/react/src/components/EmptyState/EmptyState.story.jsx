import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, boolean } from '@storybook/addon-knobs';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';

import { DashboardIcon } from '../../icons/components';

import EmptyState from './EmptyState';

export default {
  title: '1 - Watson IoT/Empty states',

  parameters: {
    component: EmptyState,
    info: `
    Empty states occur in an app when no data is available to be displayed to the user. An empty state most commonly occurs the first time that a user interacts with a product or page, but is also used when data was deleted or is not available.

    **Actions**

    \`EmptyState\` can have two optional actions: \`action\` and \`secondaryAction\`.

    \`action\` can be either a button or a custom component and should be used to let the user have an option to "overcome" the empty state.

    \`secondaryAction\` usually is a link that could for example reference documentation for further reading as to why the empty state occured. However, it is also possible to pass a custom compent as well.

    The prop format for both actions is as follows:
    \`\`\`
    {
      label: 'actionLabel',
      onClick: () => {},
    }
    \`\`\`

    For more information, please visit the [empty states usage guidance](https://pages.github.ibm.com/ai-applications/design/components/empty-states/usage)
    `,
  },
};

export const FirstTimeUse = () => (
  <EmptyState
    icon="empty"
    title="You don’t have any [variable] yet"
    body="Optional extra sentence or sentences to describe the resource and how to create it or the action a first-time user needs to take."
    action={{
      label: 'Action',
      onClick: action('action onClick'),
    }}
  />
);

FirstTimeUse.storyName = 'First-time use';

export const NoSearchResultsFound = () => (
  <EmptyState
    icon="no-result"
    title="No results found"
    body="Subtext is optional because this user experience is common and the user knows how to return to the search mechanism. Use an optional extra sentence or sentences to explain how to adjust search parameters or prompt user action."
  />
);

export const Success = () => (
  <EmptyState
    icon="success"
    title="Success"
    body="Optional extra sentence or sentences to describe the process or procedure that completed successfully. If needed, describe the next step that the user needs to take."
  />
);

export const Page404 = () => (
  <EmptyState
    icon="error404"
    title="Uh oh. Something’s not right."
    body="Optional extra sentence or sentences to describe further details about the error and, if applicable, how the user can fix it."
    action={{
      label: 'Try again',
      onClick: action('action onClick'),
    }}
  />
);

Page404.storyName = '404 error';

export const DataMissing = () => (
  <EmptyState
    icon="empty"
    title="No [variable] to show"
    body="Optional extra sentence or sentences to describe the data and how to create it, the action a user needs to take, or to describe why the data is missing. For example, in a scenario in which no errors occurred, the optional text might describe why no errors are displayed."
    action={{
      label: 'Action',
      onClick: action('action onClick'),
    }}
  />
);

export const Error = () => (
  <EmptyState
    icon="error"
    title="Oops! We’re having trouble [problem]"
    body="Optional extra sentence or sentences to describe further details about the error and, if applicable, how the user can fix it. Can provide information about who to contact if the error persists."
    action={{
      label: 'Try again',
      onClick: action('action onClick'),
    }}
  />
);

export const NotAuthorized = () => (
  <EmptyState
    icon="not-authorized"
    title="You don’t have permission to [variable]"
    body="Optional extra sentence or sentences to describe any action that the user can take or who to contact regarding permissions."
    action={{
      label: 'Action',
      onClick: action('action onClick'),
    }}
  />
);

export const NotConfigured = () => (
  <EmptyState
    icon="empty"
    title="Configure your [variable]"
    body="Optional extra sentence or sentences to describe the [variable] and how to configure it or set it up."
    action={{
      label: 'Action',
      onClick: action('action onClick'),
    }}
  />
);

export const WithoutIcon = () => (
  <EmptyState
    title={text('title', 'This is an empty state without an image')}
    body={text(
      'body',
      'You can create empty states without images, although it is recommended to always use images.'
    )}
    action={{
      label: 'Action',
      onClick: action('action onClick'),
    }}
  />
);

export const WithCustomIcon = () => (
  <EmptyState
    icon={DashboardIcon}
    title="Empty state with a custom icon"
    body="Custom icons can be used in addition to the preconfigured options."
    action={{
      label: 'Action',
      onClick: action('action onClick'),
    }}
  />
);

export const WithCustomBody = () => (
  <EmptyState
    icon={DashboardIcon}
    title="Empty state with a custom body"
    body={
      <div>
        This is a <strong>custom body node</strong>.
      </div>
    }
    action={{
      label: 'Action',
      onClick: action('action onClick'),
    }}
  />
);

export const TabsWithEmptyState = () => {
  return (
    <Tabs selected={1} light={boolean('light', false)}>
      <TabList aria-label="List of tabs">
        <Tab>provide a label</Tab>
        <Tab>provide a label</Tab>
        <Tab>provide a label</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <EmptyState
            icon="no-result"
            title="No results found"
            body="We couldn't find anything. Sorry."
          />
        </TabPanel>
        <TabPanel>
          <EmptyState
            icon="no-result"
            title="No results found"
            body="We couldn't find anything. Sorry."
          />
        </TabPanel>
        <TabPanel>
          <EmptyState
            icon="no-result"
            title="No results found"
            body="We couldn't find anything. Sorry."
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export const Playground = () => (
  <EmptyState
    icon={select(
      'icon',
      ['error', 'error404', 'empty', 'not-authorized', 'no-result', 'success', null],
      'empty'
    )}
    title={text('title', 'This is an empty state you can configure via knobs')}
    body={text(
      'body',
      'You can create empty states without images, although it is recommended to always use images. The secondary action should be a text link.'
    )}
    action={{
      label: text('action.label', 'Primary action'),
      onClick: action('action onClick'),
    }}
    secondaryAction={{
      label: text('secondaryAction.label', 'Secondary action'),
      onClick: action('secondaryAction onClick'),
    }}
    size={select('size', ['default', 'small'], 'default')}
    arrangement={select('arrangement', ['stacked', 'inline'], 'stacked')}
  />
);
