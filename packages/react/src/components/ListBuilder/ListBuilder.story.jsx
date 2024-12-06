import React, { createElement, useMemo, useState } from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { isEmpty } from 'lodash-es';
import { ArrowRight, CloseOutline, Subtract } from '@carbon/react/icons';

import StoryNotice, { experimentalStoryTitle } from '../../internal/StoryNotice';
import Button from '../Button/Button';
import { generateUserList } from '../SelectUsersModal/SelectUsersModal.story';
import { DragAndDrop } from '../../utils/DragAndDropUtils';

import ListBuilder from './ListBuilder';
import ListBuilderREADME from './ListBuilder.mdx';

export const Experimental = () => <StoryNotice componentName="ListBuilder" experimental />;
Experimental.storyName = experimentalStoryTitle;

export const NoItemsSelected = () => (
  <ListBuilder
    onAdd={action('onAdd')}
    onRemove={action('onRemove')}
    items={[
      {
        id: '1',
        content: {
          value: 'item one',
        },
      },
      { id: '2', content: { value: 'item two' } },
    ]}
  />
);

NoItemsSelected.storyName = 'with no items selected';

export const ItemsSelected = () => (
  <ListBuilder
    onAdd={action('onAdd')}
    onRemove={action('onRemove')}
    items={[
      {
        id: '1',
        content: {
          value: 'item one',
        },
      },
    ]}
    selectedItems={[{ id: '2', content: { value: 'item two' } }]}
  />
);

ItemsSelected.storyName = 'with items selected';

export const StatefulExample = () => {
  const [selected, setSelected] = useState([]);
  const [items, setItems] = useState([
    {
      id: '1',
      content: {
        value: 'item one',
      },
    },
    {
      id: '2',
      content: {
        value: 'item two',
      },
    },
    {
      id: '3',
      content: {
        value: 'item three',
      },
    },
  ]);

  const handleAdd = (event, id) => {
    setSelected((prev) => {
      const newItem = items.find((item) => item.id === id);
      return [...prev, newItem];
    });
    setItems((prev) => {
      return prev.filter((pItem) => pItem.id !== id);
    });

    // just to show the actions in storybook
    action('onAdd')(event, id);
  };

  const handleRemove = (event, id) => {
    setItems((prev) => {
      const removedItem = selected.find((item) => item.id === id);
      return [...prev, removedItem];
    });
    setSelected((prev) => prev.filter((pItem) => pItem.id !== id));

    // just to show the actions in storybook
    action('onRemove')(event, id);
  };

  return (
    <ListBuilder onAdd={handleAdd} onRemove={handleRemove} items={items} selectedItems={selected} />
  );
};

StatefulExample.storyName = 'stateful example';
StatefulExample.decorators = [createElement];

export const StatefulExampleWithCheckboxes = () => {
  const [selected, setSelected] = useState([]);
  const [searchValue, setSearchValue] = useState(null);

  const items = [
    {
      id: '1',
      content: {
        value: 'item one',
      },
    },
    {
      id: '2',
      content: {
        value: 'item two',
      },
    },
    {
      id: '3',
      content: {
        value: 'item three',
      },
    },
  ];

  const handleAdd = (event, id) => {
    setSelected((prev) => [...prev, items.find((item) => item.id === id)]);
    action('onAdd')(event, id);
  };

  const handleRemove = (event, id) => {
    setSelected((previous) => previous.filter((item) => item.id !== id));
    action('onRemove')(event, id);
  };

  return (
    <ListBuilder
      hasSelectedItemsSearch={boolean('hasSelectedItemsSearch', false)}
      hasReset={boolean('hasReset', true)}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onReset={action('onReset')}
      onItemsSearchChange={(value, evt) => {
        setSearchValue(value);
        action('onItemsSearchChange')(value, evt);
      }}
      items={items}
      itemsSearchValue={searchValue}
      selectedItems={selected}
      removeIcon={CloseOutline}
      useCheckboxes={boolean('useCheckboxes', true)}
    />
  );
};

StatefulExampleWithCheckboxes.storyName = 'stateful example with checkboxes';
StatefulExampleWithCheckboxes.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];

const itemsAreEqual = (item1, item2) => {
  if (!item1 || !item2) {
    return false;
  }

  // they're exactly the object, like some of the storybook examples
  if (item1 === item2) {
    return true;
  }

  // they have the same ids
  if (item1.id && item2.id && item1.id === item2.id) {
    return true;
  }

  // they have the same email
  if (item1.email && item2.email && item1.email === item2.email) {
    return true;
  }

  return false;
};

const mapUsers = (
  unmodifiedUsers,
  { parents = [], selectedUsers = [], depth = 0, renderRowActions, renderDisabledState }
) =>
  unmodifiedUsers.map((user) => {
    const { id, name, username, email, users = [], groups = [] } = user;

    const mappedGroups = isEmpty(groups)
      ? []
      : mapUsers(groups, {
          depth: depth + 1,
          selectedUsers,
          parents: [...parents, user],
          renderRowActions,
          renderDisabledState,
        });
    const mappedUsers = isEmpty(users)
      ? []
      : mapUsers(users, {
          depth: depth + 1,
          selectedUsers,
          parents: [...parents, user],
          renderRowActions,
          renderDisabledState,
        });
    const children = mappedGroups.concat(mappedUsers);

    return {
      id: id || email,
      content: {
        value: isEmpty(children) ? name : `${name} (${children.length})`,
        secondaryValue: username,
        tertiaryValue: email,
        rowActions: renderRowActions({ user, parents, selected: selectedUsers, depth }),
      },
      isCategory: depth === 0 && !isEmpty(children),
      disabled: renderDisabledState({ user, parents, selected: selectedUsers, depth }),
      children,
    };
  });

const flattenUsers = (results, user) => {
  return user.children && user.children.length > 0
    ? user.children.reduce(flattenUsers, results)
    : results.concat(user);
};

export const ComplexNestedExample = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const users = generateUserList();

  const handleRemove = (row) => {
    setSelectedUsers(selectedUsers.filter((s) => s !== row));
  };

  const handleAdd = (row) => {
    const userIdsInRow = row.users ? row.users.map(({ id }) => id) : [row.id];
    const filteredSelectedUsers = selectedUsers.filter(({ id }) => !userIdsInRow.includes(id));
    setSelectedUsers([row].concat(...filteredSelectedUsers));
  };

  const displayAllUsersList = (unmodifiedUsers, selection = []) => {
    return mapUsers(unmodifiedUsers, {
      selectedUsers: selection,
      renderDisabledState: ({ user, selected, parents }) => {
        const isInSelected = selected.filter((s) => itemsAreEqual(s, user)).length > 0;
        const isChildOfSelected =
          selected.filter((u) => parents.filter((p) => itemsAreEqual(p, u)).length > 0).length > 0;

        return isInSelected || isChildOfSelected;
      },
      renderRowActions: ({ user, selected, parents, depth }) => {
        const { username } = user;
        const isInSelected = selected.filter((s) => itemsAreEqual(s, user)).length > 0;
        const isChildOfSelected =
          selected.filter((u) => parents.filter((p) => itemsAreEqual(p, u)).length > 0).length > 0;

        // Don't render actions on the top level unless it's a user. TODO: is this supposed to support a flat list, too?
        const isCategory = depth === 0 && user && !user.username;

        if (isInSelected || isChildOfSelected || isCategory) {
          return null;
        }

        return () => [
          <Button
            key={`${username}-list-item-button-${depth}`}
            style={{ color: 'black' }}
            role="button"
            aria-label="Add user"
            renderIcon={ArrowRight}
            hasIconOnly
            kind="ghost"
            size="sm"
            onClick={() => handleAdd(user)}
            iconDescription="Add user"
          />,
        ];
      },
    });
  };

  const displaySelectedUsersList = (unmodifiedUsers) => {
    return mapUsers(unmodifiedUsers, {
      renderDisabledState: () => false,
      renderRowActions: ({ user, depth }) => {
        const { username } = user;

        if (depth === 0) {
          return () => [
            <Button
              key={`${username}-list-item-button-${depth}`}
              style={{ color: 'black' }}
              aria-label="Remove user"
              renderIcon={Subtract}
              hasIconOnly
              kind="ghost"
              size="sm"
              onClick={() => handleRemove(user)}
              iconDescription="Remove user"
            />,
          ];
        }

        return null;
      },
    });
  };

  const usersList = displayAllUsersList(users, selectedUsers);
  const userCount = useMemo(() => usersList.reduce(flattenUsers, []).length, [usersList]);
  const selectedList = displaySelectedUsersList(selectedUsers);

  return (
    <ListBuilder
      items={usersList}
      itemCount={userCount}
      testID="select-users"
      selectedItems={selectedList}
      i18n={{
        allListTitle: (count) => {
          return `Users (${count} available)`;
        },
      }}
    />
  );
};

ComplexNestedExample.storyName = 'complex nested example';
ComplexNestedExample.decorators = [createElement];

export default {
  title: '2 - Watson IoT Experimental/☢️ ListBuilder',
  decorators: [withKnobs],
  parameters: {
    component: ListBuilder,
    docs: {
      page: ListBuilderREADME,
    },
  },
};
