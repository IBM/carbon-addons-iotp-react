import React from 'react';
import { withKnobs, select, boolean } from '@storybook/addon-knobs';
import { ContentSwitcher, Switch } from '@carbon/react';
import { List, Code, Screen, Laptop, Mobile, ScreenOff } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';

import IconSwitch, { ICON_SWITCH_SIZES } from './IconSwitch';

const { iotPrefix } = settings;

const codeIcons = {
  [ICON_SWITCH_SIZES.small]: Code,
  [ICON_SWITCH_SIZES.default]: Code,
  [ICON_SWITCH_SIZES.large]: Code,
};

const listIcons = {
  [ICON_SWITCH_SIZES.small]: List,
  [ICON_SWITCH_SIZES.default]: List,
  [ICON_SWITCH_SIZES.large]: List,
};

const mobileIcons = {
  [ICON_SWITCH_SIZES.small]: Mobile,
  [ICON_SWITCH_SIZES.default]: Mobile,
  [ICON_SWITCH_SIZES.large]: Mobile,
};

const laptopIcons = {
  [ICON_SWITCH_SIZES.small]: Laptop,
  [ICON_SWITCH_SIZES.default]: Laptop,
  [ICON_SWITCH_SIZES.large]: Laptop,
};

const desktopIcons = {
  [ICON_SWITCH_SIZES.small]: Screen,
  [ICON_SWITCH_SIZES.default]: Screen,
  [ICON_SWITCH_SIZES.large]: Screen,
};

const screenOffIcons = {
  [ICON_SWITCH_SIZES.small]: ScreenOff,
  [ICON_SWITCH_SIZES.default]: ScreenOff,
  [ICON_SWITCH_SIZES.large]: ScreenOff,
};

export default {
  title: '1 - Watson IoT/Icon content switcher',
  decorators: [withKnobs],

  parameters: {
    component: IconSwitch,
  },
};

export const ExampleUsedInContentSwitcherTwoIcons = () => {
  const size = select('Size', Object.values(ICON_SWITCH_SIZES), ICON_SWITCH_SIZES.default);
  const isDisabled = boolean('disabled', false);
  const isLight = boolean('light', false);
  return (
    <ContentSwitcher
      className={`${iotPrefix}--content-switcher--icon`}
      onChange={function noRefCheck() {}}
      selectedIndex={0}
      size={size}
    >
      <IconSwitch
        name="one"
        onClick={function noRefCheck() {}}
        onKeyDown={function noRefCheck() {}}
        text="Graphical View"
        renderIcon={listIcons[size]}
        index={0}
        disabled={isDisabled}
        light={isLight}
      />
      <IconSwitch
        name="two"
        onClick={function noRefCheck() {}}
        onKeyDown={function noRefCheck() {}}
        text="Source View"
        renderIcon={codeIcons[size]}
        index={0}
        disabled={isDisabled}
        light={isLight}
      />
    </ContentSwitcher>
  );
};

ExampleUsedInContentSwitcherTwoIcons.storyName = 'with 2 icons in ContentSwitcher';

export const ExampleUsedInContentSwitcher = () => {
  const size = select('Size', Object.values(ICON_SWITCH_SIZES), ICON_SWITCH_SIZES.default);
  const isDisabled = boolean('disabled', false);
  return (
    <ContentSwitcher
      className={`${iotPrefix}--content-switcher--icon`}
      onChange={function noRefCheck() {}}
      selectedIndex={0}
      size={size}
    >
      <IconSwitch
        name="one"
        onClick={function noRefCheck() {}}
        onKeyDown={function noRefCheck() {}}
        selected
        text="Desktop view"
        renderIcon={desktopIcons[size]}
        index={0}
        disabled={isDisabled}
      />
      <IconSwitch
        name="two"
        onClick={function noRefCheck() {}}
        onKeyDown={function noRefCheck() {}}
        selected={false}
        text="Laptop view"
        renderIcon={laptopIcons[size]}
        index={1}
        disabled={isDisabled}
      />
      <IconSwitch
        name="three"
        onClick={function noRefCheck() {}}
        onKeyDown={function noRefCheck() {}}
        selected={false}
        text="Mobile view"
        renderIcon={mobileIcons[size]}
        index={2}
        disabled={isDisabled}
      />
      <IconSwitch
        name="four"
        onClick={function noRefCheck() {}}
        onKeyDown={function noRefCheck() {}}
        selected={false}
        text="Screen off"
        renderIcon={screenOffIcons[size]}
        index={3}
        disabled={isDisabled}
      />
    </ContentSwitcher>
  );
};

ExampleUsedInContentSwitcher.storyName = 'With 4 icons in ContentSwitcher';

export const ContentSwitcherWithLabels = () => {
  const isDisabled = boolean('disabled', false);
  return (
    <ContentSwitcher
      className={`${iotPrefix}--content-switcher--icon`}
      onChange={function noRefCheck() {}}
      selectedIndex={0}
    >
      <Switch key="label1" name="label1" text="Label 1" disabled={isDisabled} />
      <Switch key="label2" name="label2" text="Label 2" disabled={isDisabled} />
    </ContentSwitcher>
  );
};

ContentSwitcherWithLabels.storyName = 'With labels';
