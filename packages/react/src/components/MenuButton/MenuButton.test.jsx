import React from 'react';
import {
  unstable_MenuItem as MenuItem,
  unstable_MenuDivider as MenuDivider,
  unstable_MenuRadioGroup as MenuRadioGroup,
  unstable_MenuSelectableItem as MenuSelectableItem,
} from '@carbon/react';
import { ChevronDown, ChevronUp, Copy, TrashCan } from '@carbon/react/icons';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { settings } from '../../constants/Settings';

import * as MenuButtonUtils from './utils';
import MenuButton from './MenuButton';

const { prefix } = settings;

const callbacks = {
  primary: jest.fn(),
  publish: jest.fn(),
  duplicate: jest.fn(),
  share: jest.fn(),
  csv: jest.fn(),
  json: jest.fn(),
  delete: jest.fn(),
};
const menuItems = [
  <MenuSelectableItem
    key="publish"
    label="Publish"
    initialChecked={false}
    onChange={callbacks.publish}
  />,
  <MenuDivider key="div-1" />,
  <MenuItem key="duplicate" renderIcon={Copy} label="Duplicate" onClick={callbacks.duplicate} />,
  <MenuDivider key="div-2" />,
  <MenuItem key="share" label="Share with">
    <MenuRadioGroup
      label="Shared with"
      items={['None', 'Product Team', 'Organization', 'Company']}
      initialSelectedItem="None"
      onChange={callbacks.share}
    />
  </MenuItem>,
  <MenuDivider key="div-3" />,
  <MenuItem key="export" label="Export">
    <MenuItem label="CSV" onClick={callbacks.csv} />
    <MenuItem label="JSON" onClick={callbacks.json} />
  </MenuItem>,
  <MenuItem
    key="disabled"
    label={<span title="You must have proper credentials to use this option.">Disabled</span>}
    disabled
  />,
  <MenuDivider key="div-4" />,
  <MenuItem
    key="delete"
    label="Delete"
    renderIcon={TrashCan}
    onClick={callbacks.delete}
    shortcut="⌘⌫"
    /** this is unavailable until we upgrade to Carbon 10.32/7.32 */
    kind="danger"
  />,
];

const generateMenuButton = (buttonRect) => {
  const button = document.createElement('button');
  button.getBoundingClientRect = jest.fn(() => {
    return buttonRect;
  });
  const menu = document.createElement('ul');
  menu.getBoundingClientRect = jest.fn(() => {
    return {
      bottom: 236,
      height: 236,
      left: 0,
      right: 208,
      top: 0,
      width: 208,
      x: 0,
      y: 0,
    };
  });
  Object.defineProperty(button, 'nextSibling', {
    get() {
      return menu;
    },
  });

  return button;
};
describe('MenuButton', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should be a single button if only a label is given', () => {
    render(<MenuButton label="Actions">{menuItems}</MenuButton>);

    expect(screen.getByTestId('menu-button-single')).toBeVisible();
    expect(screen.queryByTestId('menu-button-primary')).toBeNull();
    expect(screen.queryByTestId('menu-button-secondary')).toBeNull();
  });

  it('should be a split button if a label and primary action are given', () => {
    render(
      <MenuButton label="Actions" onPrimaryActionClick={jest.fn()}>
        {menuItems}
      </MenuButton>
    );

    expect(screen.getByTestId('menu-button-primary')).toBeVisible();
    expect(screen.getByTestId('menu-button-secondary')).toBeVisible();
  });

  it('should be an icon only button if a label is not given', () => {
    render(<MenuButton>{menuItems}</MenuButton>);

    expect(screen.getByTestId('menu-button-icon')).toBeVisible();
    expect(screen.queryByTestId('menu-button-single')).toBeNull();
    expect(screen.queryByTestId('menu-button-primary')).toBeNull();
    expect(screen.queryByTestId('menu-button-secondary')).toBeNull();
  });

  it('should be fire the onPrimaryActionClick callback when in split mode', () => {
    const create = jest.fn();
    render(
      <MenuButton label="Create" onPrimaryActionClick={create}>
        {menuItems}
      </MenuButton>
    );

    userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(create).toBeCalled();
  });

  it('should use default size for buttons and menu items', () => {
    render(<MenuButton label="Create">{menuItems}</MenuButton>);

    // The "default" size does not have a specific class, so we make sure that the
    // other size classed have not been added.
    expect(screen.getByRole('button', { name: 'Create' })).not.toHaveClass(`${prefix}--btn--sm`);
    expect(screen.getByRole('button', { name: 'Create' })).not.toHaveClass(`${prefix}--btn--md`);
    expect(screen.getByRole('button', { name: 'Create' })).not.toHaveClass(`${prefix}--btn--lg`);
    expect(screen.getByRole('button', { name: 'Create' })).not.toHaveClass(`${prefix}--btn--xl`);

    userEvent.click(screen.getByRole('button', { name: 'Create' }));

    // The menu will by default get the size lg which mathces the size "default" of
    // the triggering button
    expect(screen.getAllByRole('menu')[0]).toHaveClass(`${prefix}--menu--lg`);
  });

  it('should render the correct sizes for buttons and menu items for size "default"', () => {
    render(
      <MenuButton size="default" label="Create">
        {menuItems}
      </MenuButton>
    );

    // The "default" size does not have a specific class, so we make sure that the
    // other size classed have not been added.
    expect(screen.getByRole('button', { name: 'Create' })).not.toHaveClass(`${prefix}--btn--sm`);
    expect(screen.getByRole('button', { name: 'Create' })).not.toHaveClass(`${prefix}--btn--md`);
    expect(screen.getByRole('button', { name: 'Create' })).not.toHaveClass(`${prefix}--btn--lg`);
    expect(screen.getByRole('button', { name: 'Create' })).not.toHaveClass(`${prefix}--btn--xl`);

    userEvent.click(screen.getByRole('button', { name: 'Create' }));

    // The menu will by default get the size lg which matches the size "default" of
    // the triggering button
    expect(screen.getAllByRole('menu')[0]).toHaveClass(`${prefix}--menu--lg`);
  });

  it('should render the correct sizes for buttons and menu items for size "md"', () => {
    render(
      <MenuButton size="md" label="Create">
        {menuItems}
      </MenuButton>
    );

    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--md`);

    userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getAllByRole('menu')[0]).toHaveClass(`${prefix}--menu--md`);
  });

  it('should render the correct sizes for buttons and menu items for size "sm"', () => {
    render(
      <MenuButton size="sm" label="Create">
        {menuItems}
      </MenuButton>
    );

    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--sm`);

    userEvent.click(screen.getByRole('button', { name: 'Create' }));
    // The size "sm" will not get an explicit class, so we check that the other classes
    // are not present
    expect(screen.getAllByRole('menu')[0]).not.toHaveClass(`${prefix}--menu--md`);
    expect(screen.getAllByRole('menu')[0]).not.toHaveClass(`${prefix}--menu--lg`);
  });

  it('should render the correct default kind for buttons', () => {
    // Single button
    const { rerender } = render(<MenuButton label="Create">{menuItems}</MenuButton>);
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--primary`);

    // Split button
    rerender(
      <MenuButton onPrimaryActionClick={() => {}} label="Create">
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--primary`);
    expect(screen.getByRole('button', { name: 'open menu button' })).toHaveClass(
      `${prefix}--btn--primary`
    );

    // Icon only button
    rerender(<MenuButton renderOpenIcon={ChevronDown}>{menuItems}</MenuButton>);
    expect(screen.getByRole('button')).toHaveClass(`${prefix}--btn--ghost`);
  });

  it('should render primary kind for single button and split button', () => {
    // Single button
    const { rerender } = render(<MenuButton label="Create">{menuItems}</MenuButton>);
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--primary`);

    // Split button
    rerender(
      <MenuButton onPrimaryActionClick={() => {}} label="Create">
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--primary`);
    expect(screen.getByRole('button', { name: 'open menu button' })).toHaveClass(
      `${prefix}--btn--primary`
    );

    // Icon only button is always ghost
    rerender(<MenuButton renderOpenIcon={ChevronDown}>{menuItems}</MenuButton>);
    expect(screen.getByRole('button')).toHaveClass(`${prefix}--btn--ghost`);
  });

  it('should render seondary kind for single button and split button', () => {
    // Single button
    const { rerender } = render(
      <MenuButton kind="secondary" label="Create">
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--secondary`);

    // Split button
    rerender(
      <MenuButton kind="secondary" onPrimaryActionClick={() => {}} label="Create">
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--secondary`);
    expect(screen.getByRole('button', { name: 'open menu button' })).toHaveClass(
      `${prefix}--btn--secondary`
    );

    // Icon only button is always ghost
    rerender(
      <MenuButton kind="secondary" renderOpenIcon={ChevronDown}>
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button')).toHaveClass(`${prefix}--btn--ghost`);
  });

  it('should render tertiary kind for single button and split button', () => {
    // Single button
    const { rerender } = render(
      <MenuButton kind="tertiary" label="Create">
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--tertiary`);

    // Split button
    rerender(
      <MenuButton kind="tertiary" onPrimaryActionClick={() => {}} label="Create">
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--tertiary`);
    expect(screen.getByRole('button', { name: 'open menu button' })).toHaveClass(
      `${prefix}--btn--tertiary`
    );

    // Icon only button is always ghost
    rerender(
      <MenuButton kind="tertiary" renderOpenIcon={ChevronDown}>
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button')).toHaveClass(`${prefix}--btn--ghost`);
  });

  it('should render ghost kind for single button & icon button', () => {
    // Single button
    const { rerender } = render(
      <MenuButton kind="ghost" label="Create">
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass(`${prefix}--btn--ghost`);

    // Icon only button is always ghost
    rerender(
      <MenuButton kind="ghost" renderOpenIcon={ChevronDown}>
        {menuItems}
      </MenuButton>
    );
    expect(screen.getByRole('button')).toHaveClass(`${prefix}--btn--ghost`);
  });

  it('should be open the menu when clicking the button in single button mode', () => {
    render(<MenuButton label="Create">{menuItems}</MenuButton>);

    expect(document.body.querySelector(`.${prefix}--menu`)).toBeNull();
    userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText('Publish')).toBeVisible();
    expect(document.body.querySelector(`.${prefix}--menu`)).toHaveClass(`${prefix}--menu--open`);
  });

  it('should be open the menu when clicking the secondary button split button mode', () => {
    render(
      <MenuButton label="Create" onPrimaryActionClick={callbacks.primary}>
        {menuItems}
      </MenuButton>
    );

    expect(document.body.querySelector(`.${prefix}--menu`)).toBeNull();
    userEvent.click(screen.getByLabelText('open menu button'));
    expect(screen.getByText('Publish')).toBeVisible();
    expect(document.body.querySelector(`.${prefix}--menu`)).toHaveClass(`${prefix}--menu--open`);
  });

  it('should not open when clicking the primary action of a split button', () => {
    render(
      <MenuButton label="Create" onPrimaryActionClick={callbacks.primary}>
        {menuItems}
      </MenuButton>
    );

    expect(document.body.querySelector(`.${prefix}--menu`)).toBeNull();
    userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(callbacks.primary).toHaveBeenCalled();
    expect(document.body.querySelector(`.${prefix}--menu`)).toBeNull();
  });

  it('should close the menu when clicking a child item with an onClick handler', () => {
    render(
      <MenuButton label="Create" onPrimaryActionClick={callbacks.primary}>
        {menuItems}
      </MenuButton>
    );

    expect(document.body.querySelector(`.${prefix}--menu`)).toBeNull();
    userEvent.click(screen.getByLabelText('open menu button'));

    expect(document.body.querySelector(`.${prefix}--menu`)).toHaveClass(`${prefix}--menu--open`);
    userEvent.click(screen.getByTitle('Duplicate'));
    expect(callbacks.duplicate).toHaveBeenCalled();
    expect(document.body.querySelector(`.${prefix}--menu`)).toBeNull();
  });

  it('should show a warning when using an icon without an icon description', () => {
    console.error = jest.fn();
    render(
      <MenuButton
        label="Create"
        onPrimaryActionClick={callbacks.primary}
        renderOpenIcon={ChevronDown}
        renderCloseIcon={ChevronUp}
        openIconDescription={null}
        closeIconDescription={null}
      >
        {menuItems}
      </MenuButton>
    );

    expect(console.error).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(
        `Failed prop type: renderCloseIcon property specified without also providing an closeIconDescription property.`
      )
    );
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(
        `Failed prop type: renderOpenIcon property specified without also providing an openIconDescription property.`
      )
    );
    expect(console.error).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining(
        `Failed prop type: The prop \`iconDescription\` is marked as required in \`ForwardRef\`, but its value is \`null\`.`
      )
    );
  });

  describe('getShadowBlockerConfig', () => {
    const MENU_HEIGHT = 236;
    beforeEach(() => {
      Object.defineProperty(document.body, 'clientWidth', {
        writable: true,
        value: 1024,
      });
      Object.defineProperty(document.body, 'clientHeight', {
        writable: true,
        value: 768,
      });
    });

    afterEach(() => {
      Object.defineProperty(document.body, 'clientWidth', {
        writable: true,
        value: 0,
      });
      Object.defineProperty(document.body, 'clientHeight', {
        writable: true,
        value: 0,
      });
    });

    it('get the correct height of the menu', () => {
      const button = generateMenuButton({
        bottom: 747,
        height: 48,
        left: 930,
        right: 978,
        top: 699,
        width: 48,
        x: 930,
        y: 699,
      });

      const { menuHeight } = MenuButtonUtils.getShadowBlockerConfig({ current: button });
      expect(menuHeight).toEqual(MENU_HEIGHT);
    });

    it('should set openHorizontally when menu overflows to both top and bottom', () => {
      Object.defineProperty(document.body, 'clientWidth', {
        writable: true,
        value: 1024,
      });
      Object.defineProperty(document.body, 'clientHeight', {
        writable: true,
        value: 384,
      });

      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 200,
        width: 48,
        x: 912.984375,
        y: 768,
      });

      const { flippedX, flippedY, opensHorizontally } = MenuButtonUtils.getShadowBlockerConfig({
        current: button,
      });

      expect(flippedX).toEqual(false);
      expect(flippedY).toEqual(true);
      expect(opensHorizontally).toEqual(true);
    });

    it('should generate correct config when overflow is right', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 408,
        width: 48,
        x: 912.984375,
        y: 408,
      });

      const { flippedX, flippedY, opensHorizontally } = MenuButtonUtils.getShadowBlockerConfig({
        current: button,
      });
      expect(flippedX).toEqual(false);
      expect(flippedY).toEqual(true);
      expect(opensHorizontally).toEqual(false);
    });

    it('should generate correct config when overflow is top-right', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 48,
        width: 48,
        x: 912.984375,
        y: 48,
      });

      const { flippedX, flippedY, opensHorizontally } = MenuButtonUtils.getShadowBlockerConfig({
        current: button,
      });
      expect(flippedX).toEqual(false);
      expect(flippedY).toEqual(true);
      expect(opensHorizontally).toEqual(false);
    });

    it('should generate correct config when overflow is top', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 480.484375,
        right: 528.484375,
        top: 48,
        width: 48,
        x: 480.484375,
        y: 48,
      });

      const { flippedX, flippedY, opensHorizontally } = MenuButtonUtils.getShadowBlockerConfig({
        current: button,
      });
      expect(flippedX).toEqual(false);
      expect(flippedY).toEqual(false);
      expect(opensHorizontally).toEqual(false);
    });

    it('should generate correct config when there is no overflow in any direction', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 480.484375,
        right: 528.484375,
        top: 408,
        width: 48,
        x: 480.484375,
        y: 408,
      });

      const { flippedX, flippedY, opensHorizontally } = MenuButtonUtils.getShadowBlockerConfig({
        current: button,
      });
      expect(flippedX).toEqual(false);
      expect(flippedY).toEqual(false);
      expect(opensHorizontally).toEqual(false);
    });

    it('should generate correct config when overflow is left', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 48,
        right: 96,
        top: 408,
        width: 48,
        x: 48,
        y: 408,
      });

      const { flippedX, flippedY, opensHorizontally } = MenuButtonUtils.getShadowBlockerConfig({
        current: button,
      });
      expect(flippedX).toEqual(false);
      expect(flippedY).toEqual(false);
      expect(opensHorizontally).toEqual(false);
    });

    it('should generate correct config when overflow is top-left', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 48,
        right: 96,
        top: 48,
        width: 48,
        x: 48,
        y: 48,
      });

      const { flippedX, flippedY, opensHorizontally } = MenuButtonUtils.getShadowBlockerConfig({
        current: button,
      });
      expect(flippedX).toEqual(false);
      expect(flippedY).toEqual(false);
      expect(opensHorizontally).toEqual(false);
    });

    it('should generate correct config when overflow is bottom-left', () => {
      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 48,
        right: 96,
        top: 768,
        width: 48,
        x: 48,
        y: 768,
      });

      const { flippedX, flippedY, opensHorizontally } = MenuButtonUtils.getShadowBlockerConfig({
        current: button,
      });
      expect(flippedX).toEqual(true);
      expect(flippedY).toEqual(false);
      expect(opensHorizontally).toEqual(false);
    });
  });

  describe('getMenuPosition', () => {
    beforeEach(() => {
      jest.spyOn(MenuButtonUtils, 'getMenuPosition');
      Object.defineProperty(document.body, 'clientWidth', {
        writable: true,
        value: 1024,
      });
      Object.defineProperty(document.body, 'clientHeight', {
        writable: true,
        value: 768,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      Object.defineProperty(document.body, 'clientWidth', {
        writable: true,
        value: 0,
      });
      Object.defineProperty(document.body, 'clientHeight', {
        writable: true,
        value: 0,
      });
    });

    it('should position a single button in the bottom right corner', () => {
      const button = generateMenuButton({
        bottom: 747,
        height: 48,
        left: 930,
        right: 978,
        top: 699,
        width: 48,
        x: 930,
        y: 699,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: null,
        })
      ).toEqual({ x: 978, y: 463 });
    });

    it('should position a split button in the top-left correctly', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 170.4375,
        right: 218.4375,
        top: 48,
        width: 48,
        x: 170.4375,
        y: 48,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 170.4375, y: 96 });
    });

    it('should position a split button in the top correctly', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 541.703125,
        right: 589.703125,
        top: 48,
        width: 48,
        x: 541.703125,
        y: 48,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 541.703125, y: 96 });
    });

    it('should position a split button in the top in RTL correctly', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 541.703125,
        right: 589.703125,
        top: 48,
        width: 48,
        x: 541.703125,
        y: 48,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 541.703125, y: 96 });
    });

    it('should position a split button in the top-right correctly', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 48,
        width: 48,
        x: 912.984375,
        y: 48,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 864.984375, y: 96 });
    });

    it('should position a split button in the top-right in RTL correctly', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 48,
        width: 48,
        x: 912.984375,
        y: 48,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 960.984375, y: 96 });
    });

    it('should position a split button in the bottom-right in RTL correctly', () => {
      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 768,
        width: 48,
        x: 912.984375,
        y: 768,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 960.984375, y: 532 });
    });

    it('should position a split button in the left correctly', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 170.4375,
        right: 218.4375,
        top: 408,
        width: 48,
        x: 170.4375,
        y: 408,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 170.4375, y: 456 });
    });

    it('should position a split button in the left in RTL correctly', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 170.4375,
        right: 218.4375,
        top: 408,
        width: 48,
        x: 170.4375,
        y: 408,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 170.4375, y: 456 });
    });

    it('should position a split button in the right correctly', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 408,
        width: 48,
        x: 912.984375,
        y: 408,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 960.984375, y: 456 });
    });

    it('should position a split button in the right in RTL correctly', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 408,
        width: 48,
        x: 912.984375,
        y: 408,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 960.984375, y: 456 });
    });

    it('should position a split button in the bottom-left correctly', () => {
      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 170.4375,
        right: 218.4375,
        top: 768,
        width: 48,
        x: 170.4375,
        y: 768,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 170.4375, y: 532 });
    });

    it('should position a split button in the bottom-left in RTL correctly', () => {
      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 170.4375,
        right: 218.4375,
        top: 768,
        width: 48,
        x: 170.4375,
        y: 768,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 170.4375, y: 532 });
    });

    it('should position a split button on the bottom correctly', () => {
      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 541.703125,
        right: 589.703125,
        top: 768,
        width: 48,
        x: 541.703125,
        y: 768,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 541.703125, y: 532 });
    });

    it('should position a split button in the bottom-right correctly', () => {
      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 768,
        width: 48,
        x: 912.984375,
        y: 768,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 960.984375, y: 532 });
    });

    it('should position a split button that overflows top-bottom correctly', () => {
      Object.defineProperty(document.body, 'clientWidth', {
        writable: true,
        value: 1024,
      });
      Object.defineProperty(document.body, 'clientHeight', {
        writable: true,
        value: 384,
      });

      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 768,
        width: 48,
        x: 912.984375,
        y: 768,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 960.984375, y: 532 });
    });

    it('should position an icon only button on the right correctly', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 408,
        width: 48,
        x: 912.984375,
        y: 408,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: '',
          buttonRef: { current: button },
          onPrimaryActionClick: null,
        })
      ).toEqual({ x: 960.984375, y: 456 });
    });

    it('should position an icon only button on the top-right correctly', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 912.984375,
        right: 960.984375,
        top: 48,
        width: 48,
        x: 912.984375,
        y: 48,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: '',
          buttonRef: { current: button },
          onPrimaryActionClick: null,
        })
      ).toEqual({ x: 960.984375, y: 96 });
    });

    it('should position an icon only button on the top correctly', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 480.484375,
        right: 528.484375,
        top: 48,
        width: 48,
        x: 480.484375,
        y: 48,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: '',
          buttonRef: { current: button },
          onPrimaryActionClick: null,
        })
      ).toEqual({ x: 480.484375, y: 96 });
    });

    it('should position an icon only button in the center correctly', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 480.484375,
        right: 528.484375,
        top: 408,
        width: 48,
        x: 480.484375,
        y: 408,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: '',
          buttonRef: { current: button },
          onPrimaryActionClick: null,
        })
      ).toEqual({ x: 480.484375, y: 456 });
    });

    it('should position an icon only button in the left correctly', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 48,
        right: 96,
        top: 408,
        width: 48,
        x: 48,
        y: 408,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: '',
          buttonRef: { current: button },
          onPrimaryActionClick: null,
        })
      ).toEqual({ x: 48, y: 456 });
    });

    it('should position an icon only button in the top-left correctly', () => {
      const button = generateMenuButton({
        bottom: 96,
        height: 48,
        left: 48,
        right: 96,
        top: 48,
        width: 48,
        x: 48,
        y: 48,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: '',
          buttonRef: { current: button },
          onPrimaryActionClick: null,
        })
      ).toEqual({ x: 48, y: 96 });
    });

    it('should position an icon only button in the bottom-left correctly', () => {
      const button = generateMenuButton({
        bottom: 816,
        height: 48,
        left: 48,
        right: 96,
        top: 768,
        width: 48,
        x: 48,
        y: 768,
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: '',
          buttonRef: { current: button },
          onPrimaryActionClick: null,
        })
      ).toEqual({ x: 48, y: 532 });
    });

    it('should position a split button on the bottom correctly in RTL', () => {
      const button = generateMenuButton({
        bottom: 747,
        height: 48,
        left: 489,
        right: 537,
        top: 699,
        width: 48,
        x: 489,
        y: 699,
      });
      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 489, y: 463 });
    });

    it('should position a split button in the center correctly in RTL', () => {
      const button = generateMenuButton({
        bottom: 456,
        height: 48,
        left: 480.484375,
        right: 528.484375,
        top: 408,
        width: 48,
        x: 480.484375,
        y: 408,
      });
      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Actions',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 480.484375, y: 456 });
    });

    it('should position a split button in the top-right of a small window correctly', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 321,
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1052,
      });

      const button = generateMenuButton({
        bottom: 112,
        height: 48,
        left: 925,
        right: 973,
        top: 64,
        width: 48,
        x: 925,
        y: 64,
      });

      const primaryButton = document.createElement('button');
      primaryButton.getBoundingClientRect = () => ({
        bottom: 112,
        height: 48,
        left: 802.5625,
        right: 925,
        top: 64,
        width: 122.4375,
        x: 802.5625,
        y: 64,
      });
      Object.defineProperty(button, 'previousSibling', {
        get() {
          return primaryButton;
        },
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Create',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
        })
      ).toEqual({ x: 594.5625, y: 64 });
    });

    it('should position a split button in the top-right of a small window in rtl correctly', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 321,
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1052,
      });

      const button = generateMenuButton({
        bottom: 112,
        height: 48,
        left: 808.5625,
        right: 856.5625,
        top: 64,
        width: 48,
        x: 808.5625,
        y: 64,
      });

      const primaryButton = document.createElement('button');
      primaryButton.getBoundingClientRect = () => ({
        bottom: 112,
        height: 48,
        left: 802.5625,
        right: 925,
        top: 64,
        width: 122.4375,
        x: 802.5625,
        y: 64,
      });
      Object.defineProperty(button, 'previousSibling', {
        get() {
          return primaryButton;
        },
      });

      expect(
        MenuButtonUtils.getMenuPosition({
          label: 'Create',
          buttonRef: { current: button },
          onPrimaryActionClick: jest.fn(),
          langDir: 'rtl',
        })
      ).toEqual({ x: 600.5625, y: 64 });
    });
  });

  it('should position a split button in the top-left of a small window correctly', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 321,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1052,
    });

    const button = generateMenuButton({
      bottom: 112,
      height: 48,
      left: 186.4375,
      right: 234.4375,
      top: 64,
      width: 48,
      x: 186.4375,
      y: 64,
    });

    const primaryButton = document.createElement('button');
    primaryButton.getBoundingClientRect = () => ({
      bottom: 112,
      height: 48,
      left: 802.5625,
      right: 925,
      top: 64,
      width: 122.4375,
      x: 802.5625,
      y: 64,
    });
    Object.defineProperty(button, 'previousSibling', {
      get() {
        return primaryButton;
      },
    });

    expect(
      MenuButtonUtils.getMenuPosition({
        label: 'Create',
        buttonRef: { current: button },
        onPrimaryActionClick: jest.fn(),
      })
    ).toEqual({ x: 234.4375, y: 64 });
  });

  it('should position a split button in the top-left of a small window in rtl correctly', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 321,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1052,
    });

    const button = generateMenuButton({
      bottom: 112,
      height: 48,
      left: 186.4375,
      right: 234.4375,
      top: 64,
      width: 48,
      x: 186.4375,
      y: 64,
    });

    const primaryButton = document.createElement('button');
    primaryButton.getBoundingClientRect = () => ({
      bottom: 112,
      height: 48,
      left: 802.5625,
      right: 925,
      top: 64,
      width: 122.4375,
      x: 802.5625,
      y: 64,
    });
    Object.defineProperty(button, 'previousSibling', {
      get() {
        return primaryButton;
      },
    });

    expect(
      MenuButtonUtils.getMenuPosition({
        label: 'Create',
        buttonRef: { current: button },
        onPrimaryActionClick: jest.fn(),
      })
    ).toEqual({ x: 234.4375, y: 64 });
  });

  it("should fallback to hard-coded defaults if refs aren't passed", () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const button = generateMenuButton({
      bottom: 96,
      height: 48,
      left: 170.4375,
      right: 218.4375,
      top: 48,
      width: 48,
      x: 170.4375,
      y: 48,
    });
    button.nextSibling.getBoundingClientRect.mockImplementation(() => undefined);

    expect(
      MenuButtonUtils.getMenuPosition({
        label: 'Actions',
        buttonRef: { current: button },
        onPrimaryActionClick: jest.fn(),
      })
    ).toEqual({ x: 170.4375, y: 96 });
  });
});
