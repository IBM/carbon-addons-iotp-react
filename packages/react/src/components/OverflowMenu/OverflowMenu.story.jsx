/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, select, text } from '@storybook/addon-knobs';

import { OverflowMenuItem } from '../OverflowMenuItem';

// import OverflowMenuREADME from './OverflowMenu.mdx'; //carbon 11

import { OverflowMenu } from '.';

const directions = {
  'Bottom of the trigger button (bottom)': 'bottom',
  'Top of the trigger button (top)': 'top',
};

const defaultProps = {
  menu: () => ({
    direction: select('Menu direction (direction)', directions, 'bottom'),
    ariaLabel: text('ARIA label (ariaLabel)', 'Menu'),
    iconDescription: text('Icon description (iconDescription)', 'Options'),
    flipped: boolean('Flipped (flipped)', false),
    light: boolean('Light (light)', false),
    selectorPrimaryFocus: text('Primary focus element selector (selectorPrimaryFocus)', ''),
    size: select('Size (size)', ['sm', 'md', 'lg'], 'md'),
    onClick: action('onClick'),
    onFocus: action('onFocus'),
    onKeyDown: action('onKeyDown'),
    onClose: action('onClose'),
    onOpen: action('onOpen'),
    withCarbonTooltip: boolean('Enable Carbon tooltip (withCarbonTooltip)', false),
  }),
  menuItem: () => ({
    className: 'some-class',
    disabled: boolean('Disabled (disabled)', false),
    requireTitle: boolean('Use hover over text for menu item (requireTitle)', false),
    onClick: action('onClick'),
  }),
};

OverflowMenu.displayName = 'OverflowMenu';

export default {
  title: '1 - Watson IoT/Menus/OverflowMenu',
  decorators: [withKnobs],

  parameters: {
    component: OverflowMenu,

    subcomponents: {
      OverflowMenuItem,
    },

    // docs: {
    //   page: OverflowMenuREADME,
    // }, carbon 11
  },
};

const OverflowMenuExample = ({ overflowMenuProps, overflowMenuItemProps }) => (
  <>
    <OverflowMenu {...overflowMenuProps}>
      <OverflowMenuItem {...overflowMenuItemProps} itemText="Option 1" />
      <OverflowMenuItem
        {...overflowMenuItemProps}
        itemText="Option 2 is an example of a really long string and how we recommend handling this"
        requireTitle
      />
      <OverflowMenuItem {...overflowMenuItemProps} itemText="Option 3" />
      <OverflowMenuItem {...overflowMenuItemProps} itemText="Option 4" />
      <OverflowMenuItem {...overflowMenuItemProps} itemText="Danger option" hasDivider isDelete />
    </OverflowMenu>
  </>
);

export const Basic = () => (
  <OverflowMenu {...defaultProps.menu()}>
    <OverflowMenuItem {...defaultProps.menuItem()} itemText="Option 1" />
    <OverflowMenuItem
      {...defaultProps.menuItem()}
      itemText="Option 2 is an example of a really long string and how we recommend handling this"
      requireTitle
    />
    <OverflowMenuItem {...defaultProps.menuItem()} itemText="Option 3" />
    <OverflowMenuItem {...defaultProps.menuItem()} itemText="Option 4" />
    <OverflowMenuItem {...defaultProps.menuItem()} itemText="Danger option" hasDivider isDelete />
  </OverflowMenu>
);

Basic.storyName = 'basic';

Basic.parameters = {
  info: {
    text: `
        Overflow Menu is used when additional options are available to the user and there is a space constraint.
        Create Overflow Menu Item components for each option on the menu.
      `,
  },
};

export const WithLinks = () => (
  <OverflowMenu {...defaultProps.menu()}>
    <OverflowMenuItem
      {...{
        ...defaultProps.menuItem(),
        href: 'https://www.ibm.com',
      }}
      itemText="Option 1"
    />
    <OverflowMenuItem
      {...{
        ...defaultProps.menuItem(),
        href: 'https://www.ibm.com',
      }}
      itemText="Option 2 is an example of a really long string and how we recommend handling this"
      requireTitle
    />
    <OverflowMenuItem
      {...{
        ...defaultProps.menuItem(),
        href: 'https://www.ibm.com',
      }}
      itemText="Option 3"
    />
    <OverflowMenuItem
      {...{
        ...defaultProps.menuItem(),
        href: 'https://www.ibm.com',
      }}
      itemText="Option 4"
    />
    <OverflowMenuItem
      {...{
        ...defaultProps.menuItem(),
        href: 'https://www.ibm.com',
      }}
      itemText="Danger option"
      hasDivider
      isDelete
    />
  </OverflowMenu>
);

WithLinks.storyName = 'with links';

WithLinks.parameters = {
  info: {
    text: `
        Overflow Menu is used when additional options are available to the user and there is a space constraint.
        Create Overflow Menu Item components for each option on the menu.
        When given \`href\` props, menu items render as <a> tags to facilitate usability.
      `,
  },
};

export const CustomTrigger = () => (
  <OverflowMenu
    {...{
      ...defaultProps.menu(),
      ariaLabel: null,
      style: { width: 'auto' },
      // eslint-disable-next-line react/display-name
      renderIcon: () => <div style={{ padding: '0 1rem', color: '#161616' }}>Menu</div>,
    }}
  >
    <OverflowMenuItem {...defaultProps.menuItem()} itemText="Option 1" />
    <OverflowMenuItem
      {...defaultProps.menuItem()}
      itemText="Option 2 is an example of a really long string and how we recommend handling this"
      requireTitle
    />
    <OverflowMenuItem {...defaultProps.menuItem()} itemText="Option 3" />
    <OverflowMenuItem {...defaultProps.menuItem()} itemText="Option 4" />
    <OverflowMenuItem {...defaultProps.menuItem()} itemText="Danger option" hasDivider isDelete />
  </OverflowMenu>
);

CustomTrigger.storyName = 'custom trigger';

CustomTrigger.parameters = {
  info: {
    text: `
        Sometimes you just want to render something other than an icon
      `,
  },
};

export const AutoPositioningExample = () => (
  <div
    style={{
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
      height: 'calc(100vh - 4rem)',
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
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            flipped: true,
            direction: 'top',
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            direction: 'top',
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
        }}
      >
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            flipped: false,
            direction: 'top',
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
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
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
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
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <OverflowMenuExample
          overflowMenuProps={{
            ...defaultProps.menu(),
            useAutoPositioning: true,
          }}
          overflowMenuItemProps={defaultProps.menuItem()}
        />
      </div>
    </div>
  </div>
);

AutoPositioningExample.storyName = 'auto positioning';

AutoPositioningExample.parameters = {
  info: {
    text: `
        Overflow Menu is used when additional options are available to the user and there is a space constraint.
        Create Overflow Menu Item components for each option on the menu.
      `,
  },
};
