import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Add, Edit } from '@carbon/react/icons';

import { settings } from '../../../../constants/Settings';

import RowActionsCell from './RowActionsCell';
import RowActionsError from './RowActionsError';

const { iotPrefix } = settings;
const mockApplyRowAction = jest.fn();
const commonRowActionsProps = {
  id: 'rowId',
  tableId: 'tableId',
  onApplyRowAction: mockApplyRowAction,
};

describe('RowActionsCell', () => {
  beforeEach(() => {
    mockApplyRowAction.mockClear();
  });

  it('click handler', () => {
    const tableRow = document.createElement('tr');
    const actions = [{ id: 'addAction', renderIcon: Add, iconDescription: 'See more' }];
    render(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
      container: document.body.appendChild(tableRow),
    });

    const btn = screen.queryByRole('button');
    // one button should render
    expect(btn).toBeTruthy();
    userEvent.click(btn);
    expect(mockApplyRowAction).toHaveBeenCalledTimes(1);
  });

  it('custom SVG in button', () => {
    const tableRow = document.createElement('tr');
    const actions = [
      {
        id: 'addAction',
        renderIcon: () => <svg title="my svg" />,
        iconDescription: 'See more',
      },
    ];
    render(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
      container: document.body.appendChild(tableRow),
    });
    const btn = screen.queryByRole('button');
    // one button should render
    expect(btn).toBeTruthy();
    userEvent.click(btn);
    expect(mockApplyRowAction).toHaveBeenCalledTimes(1);
  });

  it('overflow menu trigger has ID', () => {
    const tableRow = document.createElement('tr');
    const actions = [
      { id: 'add', renderIcon: Add, iconDescription: 'See more' },
      { id: 'edit', renderIcon: Edit, isOverflow: true, labelText: 'Edit' },
    ];
    render(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
      container: document.body.appendChild(tableRow),
    });
    const btns = screen.queryAllByRole('button');
    // Only one id should be present
    expect(btns[0].id).not.toEqual('tableId-rowId-row-actions-cell-overflow');
    expect(btns[1].id).toEqual('tableId-rowId-row-actions-cell-overflow');
  });

  it('handles no actions', () => {
    const tableRow = document.createElement('tr');
    render(<RowActionsCell {...commonRowActionsProps} />, {
      container: document.body.appendChild(tableRow),
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('actions are wrapped in special gradient background container', () => {
    const tableRow = document.createElement('tr');
    const action = {
      id: 'addAction',
      renderIcon: Add,
      iconDescription: 'See more',
      labelText: 'Drill in to find out more',
    };
    render(<RowActionsCell {...commonRowActionsProps} actions={[action]} />, {
      container: document.body.appendChild(tableRow),
    });

    //  Container background div is present
    expect(screen.queryByTestId('row-action-container-background')).toBeTruthy();
    // Action text matches the action.labelText prop value
    expect(screen.queryByText(action.labelText)).toBeTruthy();
  });

  it('still renders action cell and container when all actions are hidden', () => {
    const tableRow = document.createElement('tr');
    const actions = [
      {
        id: 'hidden',
        labelText: 'hidden',
        hidden: true,
      },
      {
        id: 'hidden2',
        labelText: 'Hidden 2',
        isOverflow: true,
        hidden: true,
      },
    ];
    render(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
      container: document.body.appendChild(tableRow),
    });

    expect(screen.getByTestId('row-action-container-background')).toBeVisible();
  });

  it('does not render hidden actions', () => {
    const tableRow = document.createElement('tr');
    const actions = [
      {
        id: 'hiddenEdit',
        renderIcon: 'edit',
        iconDescription: 'Edit stuff',
        labelText: 'Hidden Edit icon label',
        hidden: true,
      },
      {
        id: 'visible',
        labelText: 'Visible action button',
      },
      {
        id: 'hidden2',
        labelText: 'Hidden 2',
        hidden: true,
      },
    ];
    render(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
      container: document.body.appendChild(tableRow),
    });

    expect(screen.queryByText('Hidden Edit icon label')).toBeNull();

    expect(screen.getByText('Visible action button')).toBeVisible();

    expect(screen.queryByText('Hidden 2')).toBeNull();
  });

  describe('RowActionsError', () => {
    it('should show errors and be dismissable when onClearError is given', () => {
      const tableRow = document.createElement('tr');
      const actions = [{ id: 'addAction', renderIcon: Add, iconDescription: 'See more' }];
      const onClearError = jest.fn();
      render(
        <RowActionsCell
          id="test"
          tableId="test-table"
          actionFailedText="action-failed"
          learnMoreText="learn-more"
          dismissText="dismiss"
          rowActionsError={{
            title: 'an-error',
            message: 'it-did-occur',
            learnMoreURL: 'https://example.com',
          }}
          onApplyRowAction={jest.fn()}
          onClearError={onClearError}
          actions={actions}
        />,
        {
          container: document.body.appendChild(tableRow),
        }
      );

      expect(screen.getByText('action-failed')).toBeVisible();
      userEvent.click(
        within(screen.getByTestId('row-action-container-background')).getByRole('button')
      );
      expect(screen.getByRole('link', { name: 'learn-more' })).toBeVisible();
      const clearButton = screen.getByRole('button', { name: 'dismiss' });
      expect(clearButton).toBeVisible();

      userEvent.click(clearButton);
      expect(onClearError).toHaveBeenCalledTimes(1);
    });

    it('should only show "dismiss" button if there is an onClearError prop', () => {
      const tableRow = document.createElement('tr');
      const actions = [{ id: 'addAction', renderIcon: Add, iconDescription: 'See more' }];
      render(
        <RowActionsCell
          id="test"
          tableId="test-table"
          actionFailedText="action-failed"
          learnMoreText="learn-more"
          dismissText="dismiss"
          rowActionsError={{
            title: 'an-error',
            message: 'it-did-occur',
            learnMoreURL: 'https://example.com',
          }}
          onApplyRowAction={jest.fn()}
          onClearError={undefined}
          actions={actions}
        />,
        {
          container: document.body.appendChild(tableRow),
        }
      );

      expect(screen.getByText('action-failed')).toBeVisible();
      userEvent.click(
        within(screen.getByTestId('row-action-container-background')).getByRole('button')
      );
      expect(screen.queryByRole('button', { name: 'dismiss' })).not.toBeInTheDocument();
    });

    it('should only show "learn more" link if there is a learnMoreURL prop', () => {
      const tableRow = document.createElement('tr');
      const actions = [{ id: 'addAction', renderIcon: Add, iconDescription: 'See more' }];
      const onClearError = jest.fn();
      render(
        <RowActionsCell
          id="test"
          tableId="test-table"
          actionFailedText="action-failed"
          learnMoreText="learn-more"
          dismissText="dismiss"
          rowActionsError={{
            title: 'an-error',
            message: 'it-did-occur',
          }}
          onApplyRowAction={jest.fn()}
          onClearError={onClearError}
          actions={actions}
        />,
        {
          container: document.body.appendChild(tableRow),
        }
      );

      expect(screen.getByText('action-failed')).toBeVisible();
      userEvent.click(
        within(screen.getByTestId('row-action-container-background')).getByRole('button')
      );
      expect(screen.queryByRole('link', { name: 'learn-more' })).not.toBeInTheDocument();
    });

    it('should return null if no errors given', () => {
      const tableRow = document.createElement('tr');
      render(
        <RowActionsError
          actionFailedText="action-failed"
          learnMoreText="learn-more"
          dismissText="dismiss"
          rowActionsError={null}
        />,
        {
          container: document.body.appendChild(tableRow),
        }
      );

      expect(screen.queryByText('action-failed')).toBeNull();
      expect(screen.queryByTestId('row-action-container-background')).toBeNull();
    });
  });

  describe('overflowMenu', () => {
    let originalBounding;

    beforeAll(() => {
      originalBounding = Element.prototype.getBoundingClientRect;
      // If this is not mocked the OverflowMenu won't trigger the onOpen callback
      // and the menu items won't be visible.
      Element.prototype.getBoundingClientRect = () => ({
        height: 100,
        width: 100,
      });
    });
    afterAll(() => {
      HTMLElement.prototype.getBoundingClientRect = originalBounding;
    });

    it('action container background knows when overflow menu is open (in order to stay visible)', () => {
      const tableRow = document.createElement('tr');
      const actions = [{ id: 'edit', renderIcon: Edit, isOverflow: true, labelText: 'Edit' }];
      const { container } = render(
        <RowActionsCell {...commonRowActionsProps} actions={actions} />,
        {
          container: document.body.appendChild(tableRow),
        }
      );

      let actionContainer = container.querySelectorAll(
        `.${iotPrefix}--row-actions-container .${iotPrefix}--row-actions-container__background--overflow-menu-open`
      );
      expect(actionContainer).toHaveLength(0);

      const overflowMenu = screen.getByRole('button', {
        name: RowActionsCell.defaultProps.overflowMenuAria,
      });

      userEvent.click(overflowMenu);

      actionContainer = container.querySelectorAll(
        `.${iotPrefix}--row-actions-container .${iotPrefix}--row-actions-container__background--overflow-menu-open`
      );
      expect(actionContainer).toHaveLength(1);

      // Close by clicking the menu
      userEvent.click(overflowMenu);
      actionContainer = container.querySelectorAll(
        `.${iotPrefix}--row-actions-container .${iotPrefix}--row-actions-container__background--overflow-menu-open`
      );
      expect(actionContainer).toHaveLength(0);
    });

    it('autoselects the first enabled alternative when the overflow menu is opened', () => {
      const tableRow = document.createElement('tr');
      const actions = [
        { disabled: true, id: 'add', isOverflow: true, labelText: 'Add' },
        {
          disabled: false,
          id: 'edit',
          renderIcon: Edit,
          isOverflow: true,
          labelText: 'Edit',
        },
      ];

      const { container } = render(
        <RowActionsCell {...commonRowActionsProps} actions={actions} />,
        {
          container: document.body.appendChild(tableRow),
        }
      );
      const actionContainer = container.querySelectorAll(
        `.${iotPrefix}--row-actions-container .${iotPrefix}--row-actions-container__background--overflow-menu-open`
      );
      expect(actionContainer).toHaveLength(0);

      const overflowMenu = screen.getByRole('button', {
        name: RowActionsCell.defaultProps.overflowMenuAria,
      });

      userEvent.click(overflowMenu);

      expect(screen.getByTitle('Add').closest('button')).toBeDisabled();
      expect(screen.getByTitle('Add').closest('button')).toBeVisible();
      expect(screen.getByTitle('Edit').closest('button')).not.toBeDisabled();
      expect(screen.getByTitle('Edit').closest('button')).toBeVisible();
      expect(screen.getByTitle('Edit').closest('button')).toHaveClass(
        `${iotPrefix}--action-overflow-item--initialFocus`
      );
    });

    it('renders overflow action icons from strings using bundled icons', () => {
      const tableRow = document.createElement('tr');
      const actions = [
        {
          id: 'edit',
          renderIcon: 'edit',
          iconDescription: 'Edit stuff',
          labelText: 'Edit icon label',
          isOverflow: true,
        },
      ];
      render(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
        container: document.body.appendChild(tableRow),
      });

      userEvent.click(
        screen.getByRole('button', {
          name: RowActionsCell.defaultProps.overflowMenuAria,
        })
      );

      expect(screen.getByLabelText('Edit icon label', { selector: 'svg' })).toBeVisible();
      expect(
        screen.getByTestId('tableId-rowId-row-actions-cell-overflow-menu-item-edit')
      ).toBeVisible();
    });

    it('does not render hidden overflow actions', () => {
      const tableRow = document.createElement('tr');
      const actions = [
        {
          id: 'hiddenEdit',
          renderIcon: 'edit',
          iconDescription: 'Edit stuff',
          labelText: 'Hidden Edit icon label',
          isOverflow: true,
          hidden: true,
        },
        {
          id: 'visible',
          labelText: 'Visible',
          isOverflow: true,
        },
        {
          id: 'hidden2',
          labelText: 'Hidden 2',
          isOverflow: true,
          hidden: true,
        },
      ];
      render(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
        container: document.body.appendChild(tableRow),
      });

      userEvent.click(
        screen.getByRole('button', {
          name: RowActionsCell.defaultProps.overflowMenuAria,
        })
      );

      expect(screen.queryByLabelText('Hidden Edit icon label', { selector: 'svg' })).toBeNull();
      expect(
        screen.queryByTestId('tableId-rowId-row-actions-cell-overflow-menu-item-hiddenEdit')
      ).toBeNull();

      expect(
        screen.getByTestId('tableId-rowId-row-actions-cell-overflow-menu-item-visible')
      ).toBeVisible();

      expect(
        screen.queryByTestId('tableId-rowId-row-actions-cell-overflow-menu-item-hidden2')
      ).toBeNull();
    });

    it('does not render overflow button if all actions are hidden', () => {
      const tableRow = document.createElement('tr');
      const actions = [
        {
          id: 'initiallyVisible',
          labelText: 'Initially visible',
          isOverflow: true,
          hidden: false,
        },
        {
          id: 'hidden2',
          labelText: 'Hidden 2',
          isOverflow: true,
          hidden: true,
        },
      ];
      const { rerender } = render(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
        container: document.body.appendChild(tableRow),
      });

      expect(
        screen.queryByRole('button', {
          name: RowActionsCell.defaultProps.overflowMenuAria,
        })
      ).toBeVisible();

      actions[0].hidden = true;
      rerender(<RowActionsCell {...commonRowActionsProps} actions={actions} />, {
        container: document.body.appendChild(tableRow),
      });

      expect(
        screen.queryByRole('button', {
          name: RowActionsCell.defaultProps.overflowMenuAria,
        })
      ).toBeNull();
    });
  });
});
