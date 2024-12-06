import { Copy, OverflowMenuVertical, TrashCan } from '@carbon/react/icons';
import { MenuItem, MenuItemDivider, MenuItemRadioGroup, MenuItemSelectable } from '@carbon/react';
import React from 'react';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';

import StoryNotice, { experimentalStoryTitle } from '../../internal/StoryNotice';

import MenuButtonREADME from './MenuButton.mdx';
import MenuButton from './MenuButton';

export const menuItems = [
  <MenuItemSelectable
    key="publish"
    label="Publish"
    initialChecked={false}
    onChange={action('Publish')}
  />,
  <MenuItem key="duplicate" renderIcon={Copy} label="Duplicate" onClick={action('Duplicate')} />,
  <MenuItem key="share" label="Share with">
    <MenuItemRadioGroup
      label="Shared with"
      items={['None', 'Product Team', 'Organization', 'Company']}
      selectedItem="None"
      onChange={action('Share')}
    />
  </MenuItem>,
  <MenuItem key="export" label="Export">
    <MenuItem label="CSV" onClick={action('Export CSV')} />
    <MenuItem label="JSON" onClick={action('Export JSON')} />
  </MenuItem>,
  <MenuItem
    key="disabled"
    label={<span title="You must have proper credentials to use this option.">Disabled</span>}
    disabled
  />,
  <MenuItemDivider key="div-1" />,
  <MenuItem
    key="delete"
    label="Delete"
    renderIcon={TrashCan}
    onClick={action('Delete')}
    shortcut="⌘⌫"
    /** this is unavailable until we upgrade to Carbon 10.32/7.32 */
    kind="danger"
  />,
];

const sizes = ['sm', 'md', 'default'];
const kinds = ['primary', 'secondary', 'tertiary', 'ghost'];

export const Experimental = () => <StoryNotice componentName="MenuButton" experimental />;
Experimental.storyName = experimentalStoryTitle;

const SingleButton = () => (
  <MenuButton
    size={select('Button size (size)', sizes, 'default')}
    kind={select('Button kind (kind)', kinds, 'primary')}
    label="Actions"
  >
    {menuItems}
  </MenuButton>
);

/**
 * If no primary action is given, but has a label we assume it's a single menu button.
 */
export const SingleMenuButton = () => <SingleButton />;

SingleMenuButton.storyName = 'menu button';

/**
 * if a primary action and label are given, then we assume it's a split button.
 */

const SplitButton = () => (
  <MenuButton
    size={select('Button size (size)', sizes, 'default')}
    kind={select(
      'Button kind (kind)',
      kinds.filter((kind) => kind !== 'ghost'),
      'primary'
    )}
    onPrimaryActionClick={action('onPrimaryActionClick')}
    label="Create"
  >
    {menuItems}
  </MenuButton>
);

export const SplitMenuButton = () => <SplitButton />;

SplitMenuButton.storyName = 'split menu button';

/**
 * if no label is given then it assumes it's an icon only menu.
 */
const IconOnlyButton = () => (
  <MenuButton
    size={select('Button size (size)', sizes, 'default')}
    renderOpenIcon={OverflowMenuVertical}
    renderCloseIcon={OverflowMenuVertical}
  >
    {menuItems}
  </MenuButton>
);

export const IconOnlyMenuButton = () => <IconOnlyButton />;

IconOnlyMenuButton.storyName = 'icon only menu button';

export const AutoPositioningExample = () => {
  const COMPONENTS = {
    IconOnlyButton,
    SplitButton,
    SingleButton,
  };

  const key = select(
    'component',
    ['IconOnlyButton', 'SplitButton', 'SingleButton'],
    'IconOnlyButton'
  );
  const Component = COMPONENTS?.[key];
  return (
    <div
      style={{
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
        height: 'calc(100vh)',
      }}
    >
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <Component />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <Component />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
          }}
        >
          <Component />
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <Component />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Component />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Component />
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <Component />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <Component />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <Component />
        </div>
      </div>
    </div>
  );
};

AutoPositioningExample.storyName = 'icon only with auto positioning';

export default {
  title: '2 - Watson IoT Experimental/☢️ MenuButton',

  decorators: [],
  parameters: {
    component: MenuButton,
    docs: {
      page: MenuButtonREADME,
    },
  },
  excludeStories: ['menuItems'],
};
