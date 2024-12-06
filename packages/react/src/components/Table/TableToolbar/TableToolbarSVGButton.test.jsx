import React from 'react';
import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { Edit } from '@carbon/react/icons';

import { settings } from '../../../constants/Settings';

import TableToolbarSVGButton from './TableToolbarSVGButton';

const { prefix } = settings;

describe('TableToolbarSVGButton', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be accessible by test id', () => {
    render(
      <TableToolbarSVGButton
        description="description"
        testId="test-button"
        onClick={jest.fn()}
        renderIcon={(props) => <Edit size={20} {...props} />}
      />
    );

    expect(screen.getByTestId('test-button')).toBeDefined();
  });

  it('should auto-position tooltip', () => {
    const formOriginalGetBoundingClientRect = HTMLFormElement.prototype.getBoundingClientRect;
    const divOriginalGetBoundingClientRect = HTMLDivElement.prototype.getBoundingClientRect;

    // form element used only as a wrapper to mock getBoundingClientRect
    HTMLFormElement.prototype.getBoundingClientRect = jest.fn(() => ({
      bottom: 96,
      height: 48,
      left: 48,
      right: 1035,
      top: 48,
      width: 987,
      x: 48,
      y: 48,
    }));

    HTMLDivElement.prototype.getBoundingClientRect = jest.fn(() => ({
      bottom: 34,
      height: 24,
      left: 963.3125,
      right: 1036,
      top: 10,
      width: 72.6875,
      x: 963.3125,
      y: 10,
    }));

    render(
      <form>
        <TableToolbarSVGButton
          description="tooltip description"
          testId="test-button"
          onClick={jest.fn()}
          renderIcon={(props) => <Edit size={20} {...props} />}
        />
      </form>
    );

    expect(screen.getByTestId('test-button')).toHaveClass(`${prefix}--tooltip--align-end`);

    HTMLFormElement.prototype.getBoundingClientRect = formOriginalGetBoundingClientRect;
    HTMLDivElement.prototype.getBoundingClientRect = divOriginalGetBoundingClientRect;
  });

  it('should auto-position tooltip in LTR mode', () => {
    const formOriginalGetBoundingClientRect = HTMLFormElement.prototype.getBoundingClientRect;
    const divOriginalGetBoundingClientRect = HTMLDivElement.prototype.getBoundingClientRect;

    // form element used only as a wrapper to mock getBoundingClientRect
    HTMLFormElement.prototype.getBoundingClientRect = jest.fn(() => ({
      bottom: 96,
      height: 48,
      left: 48,
      right: 1035,
      top: 48,
      width: 987,
      x: 48,
      y: 48,
    }));

    HTMLDivElement.prototype.getBoundingClientRect = jest.fn(() => ({
      bottom: 34,
      height: 24,
      left: 47,
      right: 119.6875,
      top: 10,
      width: 72.6875,
      x: 47,
      y: 10,
    }));

    render(
      <form>
        <TableToolbarSVGButton
          description="tooltip description"
          testId="test-button"
          onClick={jest.fn()}
          renderIcon={(props) => <Edit size={20} {...props} />}
          langDir="rtl"
        />
      </form>
    );

    expect(screen.getByTestId('test-button')).toHaveClass(`${prefix}--tooltip--align-start`);

    HTMLFormElement.prototype.getBoundingClientRect = formOriginalGetBoundingClientRect;
    HTMLDivElement.prototype.getBoundingClientRect = divOriginalGetBoundingClientRect;
  });
});
