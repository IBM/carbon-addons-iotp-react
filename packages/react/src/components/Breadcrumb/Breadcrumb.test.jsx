import React from 'react';
import { BreadcrumbItem } from '@carbon/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Breadcrumb from './Breadcrumb';

const commonProps = {
  onClick: jest.fn(),
};

describe('Breadcrumb', () => {
  it('is selectable with testId', () => {
    render(
      <Breadcrumb {...commonProps} hasOverflow testId="breadcrumb-test">
        <BreadcrumbItem href="#">Breadcrumb 1</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 3</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByTestId('breadcrumb-test')).toBeTruthy();
  });

  it('overflows when container is smaller than breadcrumbs', () => {
    const { container } = render(
      <Breadcrumb {...commonProps} hasOverflow>
        <BreadcrumbItem href="#">Breadcrumb 1</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 3</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(container.querySelector('.breadcrumb--overflow')).toBeFalsy();
    expect(screen.getByTestId('overflow')).toBeTruthy();
    expect(screen.getByTestId('breadcrumb')).toBeTruthy();
  });
});

describe('Breadcrumb with overflow', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 400,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
  });

  afterAll(() => {
    delete HTMLElement.prototype.clientWidth;
    delete HTMLElement.prototype.scrollWidth;
  });

  it('overflows when container is smaller than breadcrumbs', () => {
    const { container } = render(
      <Breadcrumb {...commonProps} hasOverflow testId="breadcrumb-test">
        <BreadcrumbItem href="#">Breadcrumb 1</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 3</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(container.querySelector('.breadcrumb--overflow')).toBeTruthy();
    expect(screen.getByTestId('overflow')).toBeTruthy();
    expect(screen.getByTestId('breadcrumb-test')).toBeTruthy();
    expect(screen.getByTestId('breadcrumb-test-overflow-menu')).toBeTruthy();
    userEvent.click(screen.getByTestId('breadcrumb-test-overflow-menu'));
    expect(screen.getByTestId('breadcrumb-test-overflow-menu-item-0')).toBeTruthy();
  });

  it('shows overflowed items completely when there is enough space again', () => {
    const { container, rerender } = render(
      <Breadcrumb {...commonProps} hasOverflow>
        <BreadcrumbItem href="#">Breadcrumb 1</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 3</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(container.querySelector('.breadcrumb--overflow')).toBeTruthy();

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    rerender(
      <Breadcrumb {...commonProps} hasOverflow>
        <BreadcrumbItem href="#">Breadcrumb 1</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 3</BreadcrumbItem>
      </Breadcrumb>
    );

    expect(container.querySelector('.breadcrumb--overflow')).toBeFalsy();
  });

  describe('has dev console warning(s)', () => {
    const originalDev = window.__DEV__;
    const originalResizeObserver = window.ResizeObserver;

    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    beforeEach(() => {
      window.__DEV__ = true;
      window.ResizeObserver = undefined;
    });

    afterEach(() => {
      console.error.mockClear();
      window.__DEV__ = originalDev;
      window.ResizeObserver = originalResizeObserver;
    });

    afterAll(() => {
      console.error.mockRestore();
    });

    it('when ResizeObserver is not supported in the current environment', () => {
      render(
        <Breadcrumb {...commonProps} hasOverflow>
          <BreadcrumbItem href="#">Breadcrumb 1</BreadcrumbItem>
          <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
          <BreadcrumbItem href="#">Breadcrumb 3</BreadcrumbItem>
        </Breadcrumb>
      );
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });
});
