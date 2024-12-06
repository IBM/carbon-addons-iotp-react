import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Share, Star, TrashCan } from '@carbon/react/icons';
import userEvent from '@testing-library/user-event';

import RuleBuilder from './RuleBuilder';

const RULE_ID_MATCH = expect.stringMatching(/[a-zA-Z0-9]/gi);

describe('The RuleBuilder', () => {
  it('should be selectable by testId', () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();
    const handleFavorite = jest.fn();
    const handleShare = jest.fn();
    const handleDelete = jest.fn();
    const handleApply = jest.fn();
    const handlePreview = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <RuleBuilder
        testId="rule_builder"
        filter={{
          filterMetaText: 'meta text',
          filterTags: ['tag-1', 'tag-2'],
          filterColumns: [
            {
              id: 'column1',
              name: 'Column 1',
            },
            {
              id: 'column2',
              name: 'Column 2',
            },
            {
              id: 'column3',
              name: 'Column 3',
            },
          ],
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        actionBar={[
          {
            actionId: 'favorite',
            actionLabel: 'Favorite',
            actionIcon: Star,
            actionCallback: handleFavorite,
          },
          {
            actionId: 'share',
            actionLabel: 'Share',
            actionIcon: Share,
            actionCallback: handleShare,
          },
          {
            actionId: 'delete',
            actionLabel: 'Delete',
            actionIcon: TrashCan,
            actionCallback: handleDelete,
          },
        ]}
        footerButtons={[
          {
            buttonId: 'preview',
            buttonLabel: 'Preview results',
            buttonCallback: handlePreview,
          },
          {
            buttonId: 'apply',
            buttonLabel: 'Apply',
            buttonCallback: handleApply,
          },
        ]}
      />
    );

    expect(screen.getByTestId('rule_builder')).toBeDefined();
    expect(screen.getByTestId('rule_builder-tabs')).toBeDefined();
    expect(screen.getByTestId('rule_builder-editor')).toBeDefined();
    expect(screen.getByTestId('rule_builder-title')).toBeDefined();
    expect(screen.getByTestId('rule_builder-metatext')).toBeDefined();
    expect(screen.getByTestId('rule_builder-title-input')).toBeDefined();
    expect(screen.getByTestId('rule_builder-editor-tab')).toBeDefined();
    expect(screen.getByTestId('rule_builder-sharing-tab')).toBeDefined();
    expect(screen.getByTestId('rule_builder-title-input')).toBeDefined();
    expect(screen.getByTestId('filter-tag-container')).toBeDefined();
    expect(screen.getByTestId('read-table')).toBeDefined();
    expect(screen.getByTestId('edit-table')).toBeDefined();
  });

  it('should render and include action bar and footer elements', () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();
    const handleFavorite = jest.fn();
    const handleShare = jest.fn();
    const handleDelete = jest.fn();
    const handleApply = jest.fn();
    const handlePreview = jest.fn();

    render(
      <RuleBuilder
        filter={{
          filterColumns: [
            {
              id: 'column1',
              name: 'Column 1',
            },
            {
              id: 'column2',
              name: 'Column 2',
            },
            {
              id: 'column3',
              name: 'Column 3',
            },
          ],
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        actionBar={[
          {
            actionId: 'favorite',
            actionLabel: 'Favorite',
            actionIcon: Star,
            actionCallback: handleFavorite,
          },
          {
            actionId: 'share',
            actionLabel: 'Share',
            actionIcon: Share,
            actionCallback: handleShare,
          },
          {
            actionId: 'delete',
            actionLabel: 'Delete',
            actionIcon: TrashCan,
            actionCallback: handleDelete,
          },
        ]}
        footerButtons={[
          {
            buttonId: 'preview',
            buttonLabel: 'Preview results',
            buttonCallback: handlePreview,
          },
          {
            buttonId: 'apply',
            buttonLabel: 'Apply',
            buttonCallback: handleApply,
          },
        ]}
      />
    );

    expect(screen.getByTestId('rule-builder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview results' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Favorite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByText('Editor access')).toBeInTheDocument();
  });

  it('should call callbacks on button clicks', () => {
    const observe = jest.fn();
    const unobserve = jest.fn();
    const takeRecords = jest.fn();
    const disconnect = jest.fn();
    const IntersectionObserverMock = jest.fn(() => ({
      observe,
      unobserve,
      takeRecords,
      disconnect,
    }));
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      enumerable: true,
      value: IntersectionObserverMock,
    });

    const handleSave = jest.fn();
    const handleCancel = jest.fn();
    const handleFavorite = jest.fn();
    const handleShare = jest.fn();
    const handleDelete = jest.fn();
    const handleApply = jest.fn();
    const handlePreview = jest.fn();
    act(() => {
      render(
        <RuleBuilder
          onSave={handleSave}
          onCancel={handleCancel}
          filter={{
            filterColumns: [
              { id: 'column1', name: 'Column 1' },
              { id: 'column2', name: 'Column 2' },
              { id: 'column3', name: 'Column 3' },
            ],
            filterUsers: [
              {
                id: 'teams',
                name: 'Teams',
                groups: [
                  {
                    id: 'team-a',
                    name: 'Team A',
                    users: [
                      {
                        username: '@tpeck',
                        email: 'tpeck@pal.com',
                        name: 'Templeton Peck',
                      },
                      {
                        username: '@jsmith',
                        email: 'jsmith@pal.com',
                        name: 'John Smith',
                      },
                    ],
                  },
                ],
              },
            ],
          }}
          actionBar={[
            {
              actionId: 'favorite',
              actionLabel: 'Favorite',
              actionIcon: Star,
              actionCallback: handleFavorite,
            },
            {
              actionId: 'share',
              actionLabel: 'Share',
              actionIcon: Share,
              actionCallback: handleShare,
            },
            {
              actionId: 'delete',
              actionLabel: 'Delete',
              actionIcon: TrashCan,
              actionCallback: handleDelete,
            },
          ]}
          footerButtons={[
            {
              buttonId: 'preview',
              buttonLabel: 'Preview results',
              buttonCallback: handlePreview,
            },
            {
              buttonId: 'apply',
              buttonLabel: 'Apply',
              buttonCallback: handleApply,
            },
          ]}
        />
      );
    });

    const addRuleButton = screen.getByRole('button', { name: 'Add rule' });
    expect(addRuleButton).toBeVisible();
    userEvent.click(screen.getByLabelText(/select a column/gi));
    userEvent.click(screen.getByText('Column 1'));
    userEvent.click(screen.getByLabelText(/not equal/gi));
    userEvent.click(screen.getByText('Equals'));
    userEvent.type(screen.getAllByPlaceholderText('Enter a value')[0], '145');
    userEvent.click(screen.getByRole('tab', { name: 'Sharing and preferences' }));
    userEvent.type(screen.getByLabelText(/filter name/gi), 'A Test Filter');
    userEvent.type(screen.getByLabelText(/tags \(optional\)/gi), 'first tag{enter}');
    userEvent.type(screen.getByLabelText(/tags \(optional\)/gi), 'a second tag,');
    userEvent.click(screen.getByTestId('rule-builder-add-edit-users'));
    userEvent.click(screen.getAllByTestId('expand-icon')[0]);
    userEvent.click(screen.getAllByRole('button', { name: 'Add' })[0]);
    userEvent.click(screen.getAllByRole('button', { name: 'OK' })[0]);

    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function)); // callback arg

    act(() => {
      const [callback] = IntersectionObserverMock.mock.calls[0];
      callback([{ isIntersecting: true }]); // test a callback
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeVisible();
    userEvent.click(saveButton);
    const ruleBuilderState = {
      filterTitleText: 'A Test Filter',
      filterColumns: [
        {
          id: 'column1',
          name: 'Column 1',
        },
        {
          id: 'column2',
          name: 'Column 2',
        },
        {
          id: 'column3',
          name: 'Column 3',
        },
      ],
      filterRules: {
        groupLogic: 'ALL',
        id: RULE_ID_MATCH,
        rules: [
          {
            columnId: 'column1',
            id: RULE_ID_MATCH,
            operand: 'EQ',
            value: '145',
          },
        ],
      },
      filterTags: ['first-tag', 'a-second-tag'],
      filterUsers: [
        {
          id: 'teams',
          name: 'Teams',
          groups: [
            {
              id: 'team-a',
              name: 'Team A',
              users: [
                {
                  username: '@tpeck',
                  email: 'tpeck@pal.com',
                  name: 'Templeton Peck',
                },
                {
                  username: '@jsmith',
                  email: 'jsmith@pal.com',
                  name: 'John Smith',
                },
              ],
            },
          ],
        },
      ],
      filterAccess: expect.arrayContaining([
        expect.objectContaining({
          access: 'edit',
          id: 'team-a',
          name: 'Team A',
          users: [
            {
              username: '@tpeck',
              email: 'tpeck@pal.com',
              name: 'Templeton Peck',
            },
            {
              username: '@jsmith',
              email: 'jsmith@pal.com',
              name: 'John Smith',
            },
          ],
        }),
      ]),
    };
    expect(handleSave).toHaveBeenCalledWith(ruleBuilderState);

    userEvent.click(screen.getByLabelText('Share'));
    expect(handleShare).toHaveBeenCalledWith(ruleBuilderState);

    userEvent.click(screen.getByLabelText('Favorite'));
    expect(handleShare).toHaveBeenCalledWith(ruleBuilderState);

    userEvent.click(screen.getByLabelText('Delete'));
    expect(handleShare).toHaveBeenCalledWith(ruleBuilderState);

    userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(handleShare).toHaveBeenCalledWith(ruleBuilderState);

    userEvent.click(screen.getByTestId('rule-builder-cancel'));
    expect(handleCancel).toHaveBeenCalled();

    userEvent.click(screen.getByTestId('rule-builder-add-edit-users'));
    expect(screen.getByText('Selected users will have edit access')).toBeVisible();
  });

  it(`should close the user modal without making changes when clicking the 'x'`, () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    render(
      <RuleBuilder
        onSave={handleSave}
        onCancel={handleCancel}
        filter={{
          filterColumns: [
            {
              id: 'column1',
              name: 'Column 1',
            },
            {
              id: 'column2',
              name: 'Column 2',
            },
            {
              id: 'column3',
              name: 'Column 3',
            },
          ],
          filterUsers: [
            {
              name: 'A user',
              email: 'auser@example.com',
              username: '@auser',
            },
            {
              id: 'teams',
              name: 'Teams',
              groups: [
                {
                  id: 'team-a',
                  name: 'Team A',
                  users: [
                    {
                      username: '@tpeck',
                      email: 'tpeck@pal.com',
                      name: 'Templeton Peck',
                    },
                    {
                      username: '@jsmith',
                      email: 'jsmith@pal.com',
                      name: 'John Smith',
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    );
    userEvent.click(screen.getByRole('tab', { name: 'Sharing and preferences' }));
    userEvent.click(screen.getByTestId('rule-builder-add-edit-users'));
    userEvent.click(screen.getAllByTestId('expand-icon')[0]);
    userEvent.click(screen.getAllByRole('button', { name: 'Add' })[0]);
    userEvent.click(screen.getAllByTitle('Close')[0]);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeVisible();
    userEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      filterColumns: [
        {
          id: 'column1',
          name: 'Column 1',
        },
        {
          id: 'column2',
          name: 'Column 2',
        },
        {
          id: 'column3',
          name: 'Column 3',
        },
      ],
      filterUsers: [
        {
          name: 'A user',
          email: 'auser@example.com',
          username: '@auser',
        },
        {
          id: 'teams',
          name: 'Teams',
          groups: [
            {
              id: 'team-a',
              name: 'Team A',
              users: [
                {
                  username: '@tpeck',
                  email: 'tpeck@pal.com',
                  name: 'Templeton Peck',
                },
                {
                  username: '@jsmith',
                  email: 'jsmith@pal.com',
                  name: 'John Smith',
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should add remove/tags', () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    render(
      <RuleBuilder
        filter={{
          filterColumns: [
            {
              id: 'column1',
              name: 'Column 1',
            },
            {
              id: 'column2',
              name: 'Column 2',
            },
            {
              id: 'column3',
              name: 'Column 3',
            },
          ],
        }}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
    userEvent.click(screen.getByRole('tab', { name: 'Sharing and preferences' }));

    userEvent.type(screen.getByLabelText(/filter name/gi), 'A Test Filter');
    userEvent.type(screen.getByLabelText(/tags \(optional\)/gi), 'first tag{enter}');
    userEvent.type(screen.getByLabelText(/tags \(optional\)/gi), 'a second tag,');
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeVisible();
    userEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      filterColumns: [
        {
          id: 'column1',
          name: 'Column 1',
        },
        {
          id: 'column2',
          name: 'Column 2',
        },
        {
          id: 'column3',
          name: 'Column 3',
        },
      ],
      filterTags: ['first-tag', 'a-second-tag'],
      filterTitleText: 'A Test Filter',
    });

    userEvent.click(screen.getByLabelText('first-tag'));

    userEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      filterColumns: [
        {
          id: 'column1',
          name: 'Column 1',
        },
        {
          id: 'column2',
          name: 'Column 2',
        },
        {
          id: 'column3',
          name: 'Column 3',
        },
      ],
      filterTags: ['a-second-tag'],
      filterTitleText: 'A Test Filter',
    });
  });
});
