import React from 'react';
import { withKnobs, select, boolean, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Edit, Information, SendAlt } from '@carbon/react/icons';

import Button from '../Button';

import SidePanel from './SidePanel';
// import SidePanelReadMe from './SidePanel.mdx'; carbon  11

const actionItemButtons = [
  {
    buttonLabel: 'Edit',
    buttonIcon: Edit,
    buttonCallback: action('Edit clicked'),
  },
  {
    buttonLabel: 'Info',
    buttonIcon: Information,
    buttonCallback: action('Info clicked'),
  },
  {
    buttonLabel: 'Send',
    buttonIcon: SendAlt,
    buttonCallback: action('Send clicked'),
  },
];

const Content = ({ style }) => (
  <div
    style={{
      ...style,
    }}
  >
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a dapibus nulla. Fusce et enim
      et elit rutrum interdum quis eu nulla. Nulla neque neque, condimentum eget pellentesque sit
      amet, volutpat ac enim. Etiam id magna vel dolor condimentum imperdiet. Vivamus eu
      pellentesque turpis, eget ultricies lectus. Vestibulum sodales massa non lobortis interdum.
      Sed cursus sem in dolor tempus tempus. Pellentesque et nisi vel erat egestas ultricies. Etiam
      id risus nec mi laoreet suscipit. Phasellus porttitor accumsan placerat. Donec auctor nunc id
      erat congue, tincidunt viverra diam feugiat. Donec sit amet quam vel augue auctor posuere.
      Nunc maximus volutpat nulla vel vehicula. Praesent bibendum nulla at erat facilisis sodales.
      Aenean aliquet dui vel iaculis tincidunt. Praesent suscipit ultrices mi eget finibus. Mauris
      vehicula ultricies auctor. Nam vestibulum iaculis lectus, nec sodales metus lobortis non.
      Suspendisse nulla est, consectetur non convallis et, tristique eu risus. Sed ut tortor et
      nulla tempor vulputate et vel ligula. Curabitur egestas lorem ut mi vestibulum porttitor.
      Fusce eleifend vehicula semper. Donec luctus neque quam, et blandit eros accumsan at.
    </p>
    <Button kind="ghost"> Inline Button </Button>
  </div>
);

const handlePrimaryButtonClick = action('Primary button clicked');
const handleSecondaryButtonClick = action('Secondary button clicked');

const InPage = ({
  isOpen,
  isCondensed,
  direction,
  type,
  title,
  subtitle,
  actionItems,
  onToggle,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  isBusy,
  isPrimaryButtonDisabled,
}) => {
  // Padding would normally be done in app scss file off of classes
  let padding;
  if (type === 'over') {
    padding = '1rem 1rem 1rem 1rem';
  } else if (isOpen === true) {
    if (direction === 'right') {
      padding = '1rem 336px 1rem 1rem';
    } else {
      // direction is left
      padding = '1rem 1rem 1rem 336px';
    }
  } else if (type === 'inline' && direction === 'right') {
    padding = '1rem 4rem 1rem 1rem';
  } else if (type === 'inline') {
    padding = '1rem 1rem 1rem 4rem';
  } else {
    padding = '1rem 1rem 1rem 1rem';
  }

  let options = {};
  if (onPrimaryButtonClick === 'yes') {
    options = {
      ...options,
      onPrimaryButtonClick: handlePrimaryButtonClick,
    };
  }

  if (onSecondaryButtonClick === 'yes') {
    options = {
      ...options,
      onSecondaryButtonClick: handleSecondaryButtonClick,
    };
  }

  return (
    <div
      style={{
        position: 'relative',
        padding,
        border: '1px solid',
        transition: isOpen === true ? 'all 240ms ease-in-out' : 'all 240ms ease-in-out 240ms',
        minHeight: '600px',
        maxWidth: '1046px',
      }}
    >
      <Content />
      <SidePanel
        style={{
          position: 'absolute',
          left: direction === 'right' ? 'unset' : 0,
          right: direction === 'right' ? 0 : 'unset',
          top: 0,
          bottom: 0,
        }}
        isOpen={isOpen}
        isFullWidth={boolean('Content is full width', false)}
        direction={direction}
        type={type}
        title={title}
        subtitle={subtitle}
        actionItems={actionItems}
        onToggle={onToggle}
        isCondensed={isCondensed}
        onPrimaryButtonClick={options.onPrimaryButtonClick}
        onSecondaryButtonClick={options.onSecondaryButtonClick}
        isBusy={isBusy}
        isPrimaryButtonDisabled={isPrimaryButtonDisabled}
      >
        <Content />
      </SidePanel>
    </div>
  );
};

export default {
  title: '1 - Watson IoT/SidePanel',
  decorators: [withKnobs],

  parameters: {
    component: SidePanel,
    // docs: {
    //   page: SidePanelReadMe,
    // }, //carbon 11
  },
};

export const Default = () => (
  <SidePanel
    isOpen={boolean('Is open', true)}
    isFullWidth={boolean('Content is full width', false)}
    direction={select('Direction', ['left', 'right'], 'left')}
    type={select(
      'Slide in behavior (Default is slide in)',
      [undefined, 'inline', 'over'],
      undefined
    )}
    title={text(
      'SidePanel Title text',
      'My title, volutpat ac enim. Etiam id magna vel dolor condimentum imperdiet'
    )}
    subtitle={select(
      'SidePanel Subtitle text',
      ['My title, volutpat ac enim. Etiam id magna vel dolor condimentum imperdiet', undefined],
      undefined
    )}
    actionItems={boolean('Show icons', true) ? actionItemButtons : undefined}
    onToggle={action('Toggle clicked')}
    isCondensed={boolean('condensed', false)}
    onPrimaryButtonClick={select(
      'Primary footer button',
      [handlePrimaryButtonClick, undefined],
      handlePrimaryButtonClick
    )}
    onSecondaryButtonClick={select(
      'Secondary footer button',
      [handleSecondaryButtonClick, undefined],
      handleSecondaryButtonClick
    )}
    isBusy={boolean('isBusy', false)}
    isPrimaryButtonDisabled={boolean('Footer primary button disabled', false)}
  >
    <Content />
  </SidePanel>
);

export const InPageExample = () => (
  <InPage
    isOpen={boolean('Is open', true)}
    direction={select('Direction', ['left', 'right'], 'left')}
    type={select(
      'Slide in behavior (Default is slide in)',
      [undefined, 'inline', 'over'],
      undefined
    )}
    title={text(
      'SidePanel Title text',
      'My title, volutpat ac enim. Etiam id magna vel dolor condimentum imperdiet'
    )}
    subtitle={select(
      'SidePanel Subtitle text',
      ['My title, volutpat ac enim. Etiam id magna vel dolor condimentum imperdiet', undefined],
      undefined
    )}
    actionItems={boolean('Show icons', true) ? actionItemButtons : undefined}
    onToggle={action('Toggle clicked')}
    isCondensed={boolean('condensed', false)}
    onPrimaryButtonClick={select('Primary footer button', ['yes', 'no'], 'yes')}
    onSecondaryButtonClick={select('Secondary footer button', ['yes', 'no'], 'yes')}
    isBusy={boolean('isBusy', false)}
    isPrimaryButtonDisabled={boolean('Footer primary button disabled', false)}
  />
);

Default.storyName = 'Default';
