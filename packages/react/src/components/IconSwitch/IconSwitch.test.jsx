/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { List } from '@carbon/react/icons';
import userEvent from '@testing-library/user-event';

import { settings } from '../../constants/Settings';

import IconSwitch from './IconSwitch';

const { prefix, iotPrefix } = settings;

describe('IconSwitch', () => {
  describe('component rendering', () => {
    it('should be selectable by testId', () => {
      render(
        <IconSwitch
          name="blah"
          size="sm"
          renderIcon={List}
          text="test"
          index={0}
          testId="ICON_SWITCH"
        />
      );
      expect(screen.getByTestId('ICON_SWITCH')).toBeDefined();
    });

    it('should have the expected text', () => {
      render(<IconSwitch name="blah" size="sm" renderIcon={List} text="test" index={0} />);
      expect(screen.getByRole('button')).toBeVisible();
    });

    it('label should have the expected class', () => {
      render(<IconSwitch name="blah" size="sm" renderIcon={List} text="test" index={0} />);
      const className = `${prefix}--assistive-text`;
      expect(screen.getByText('test')).toHaveClass(className);
    });

    it('should have the expected class', () => {
      render(<IconSwitch name="blah" size="sm" renderIcon={List} text="test" index={0} />);
      const cls = `${iotPrefix}--icon-switch--default`;
      expect(screen.getByRole('button')).toHaveClass(cls);
    });

    it('should have unselected class', () => {
      render(<IconSwitch name="blah" size="sm" renderIcon={List} text="test" index={0} />);
      const unselectedClass = `${iotPrefix}--icon-switch--unselected`;
      expect(screen.getByRole('button')).toHaveClass(unselectedClass);
    });

    it('should NOT have unselected class when selected is set to true', () => {
      render(<IconSwitch name="blah" size="sm" renderIcon={List} text="test" index={0} selected />);
      const unselectedClass = `${iotPrefix}--icon-switch--unselected`;
      expect(screen.getByRole('button')).not.toHaveClass(unselectedClass);
    });
  });

  describe('events', () => {
    const index = 1;
    const name = 'first';
    const text = 'test';
    let buttonOnClick;
    let buttonOnKey;

    beforeEach(() => {
      buttonOnClick = jest.fn();
      buttonOnKey = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should invoke button onClick handler', () => {
      render(
        <IconSwitch
          name={name}
          size="sm"
          renderIcon={List}
          onClick={buttonOnClick}
          onKeyDown={buttonOnKey}
          text={text}
          index={index}
        />
      );
      userEvent.click(screen.getByRole('button'));
      expect(buttonOnClick).toHaveBeenCalledWith({ index, name, text });
    });

    it('should invoke button onKeyDown handler when SPACE', () => {
      render(
        <IconSwitch
          name={name}
          size="sm"
          renderIcon={List}
          onClick={buttonOnClick}
          onKeyDown={buttonOnKey}
          text={text}
          index={index}
        />
      );
      userEvent.type(screen.getByRole('button'), '{space}');
      expect(buttonOnKey).toHaveBeenCalledWith({ index, name, text });
    });
    it('should invoke button onKeyDown handler when ENTER', () => {
      render(
        <IconSwitch
          name={name}
          size="sm"
          renderIcon={List}
          onClick={buttonOnClick}
          onKeyDown={buttonOnKey}
          text={text}
          index={index}
        />
      );
      userEvent.type(screen.getByRole('button'), '{enter}');
      expect(buttonOnKey).toHaveBeenCalledWith({ index, name, text });
    });
    it('should NOT invoke button onKeyDown handler when NEITHER SPACE NOR ENTER', () => {
      render(
        <IconSwitch
          name={name}
          size="sm"
          renderIcon={List}
          onClick={buttonOnClick}
          onKeyDown={buttonOnKey}
          text={text}
          index={index}
        />
      );
      userEvent.type(screen.getByRole('button'), 'L');
      expect(buttonOnKey).toHaveBeenCalledTimes(0);
    });
  });
});
