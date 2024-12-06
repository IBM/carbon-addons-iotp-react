import React, { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Subtract } from '@carbon/react/icons';
import { isEmpty } from 'lodash-es';

import ComposedModal from '../ComposedModal/ComposedModal';
import Button from '../Button';
import { settings } from '../../constants/Settings';
import ListBuilder from '../ListBuilder/ListBuilder';

const { iotPrefix } = settings;

export const UserShape = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  username: PropTypes.string,
});

export const GroupShape = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  groups: PropTypes.arrayOf(PropTypes.any),
  users: PropTypes.arrayOf(UserShape),
});

export const propTypes = {
  i18n: PropTypes.shape({
    modalHeaderTitle: PropTypes.string,
    modalHeaderLabel: PropTypes.string,
    addUser: PropTypes.string,
    removeUser: PropTypes.string,
    recent: PropTypes.string,
    allListSearchPlaceholderText: PropTypes.string,
    selectedListSearchPlaceholderText: PropTypes.string,
    expand: PropTypes.string,
    close: PropTypes.string,
    primaryButtonLabel: PropTypes.string,
    secondaryButtonLabel: PropTypes.string,
    /** (count) => `Items (${count} available)` */
    allListTitle: PropTypes.func,

    /** (count) => `${count} items selected` */
    selectedListTitle: PropTypes.func,
  }),
  users: PropTypes.arrayOf(GroupShape).isRequired,
  initialSelectedUsers: PropTypes.arrayOf(GroupShape).isRequired,

  /** Should the dialog be open or not */
  isOpen: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  /** Close the dialog */
  onClose: PropTypes.func.isRequired,
  /** Callback to submit the dialog/form */
  onSubmit: PropTypes.func,

  testId: PropTypes.string,
};

const defaultProps = {
  i18n: {
    modalHeaderTitle: 'Select users',
    modalHeaderLabel: 'Selected users will have edit access',
    addUser: 'Add',
    removeUser: 'Remove',
    recent: 'Recent',
    allListSearchPlaceholderText: 'Enter a value to search all users',
    selectedListSearchPlaceholderText: 'Enter a value to search selected users',
    expand: 'Expand',
    close: 'Close',
    allListTitle: (count) => `Users (${count} available)`,
    selectedListTitle: (count) => `${count} Selected`,
    primaryButtonLabel: 'OK',
    secondaryButtonLabel: 'Cancel',
  },
  isOpen: false,
  onSubmit: null,
  testId: 'select-users-modal',
};

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

const SelectUsersModal = ({
  isOpen,
  onClose,
  onSubmit,
  users,
  initialSelectedUsers,
  i18n,
  testId,
}) => {
  const mergedI18n = { ...defaultProps.i18n, ...i18n };

  const [selectedUsers, setSelectedUsers] = useState(initialSelectedUsers);

  const canSaveRef = useRef(false);

  const handleRemove = (row) => {
    canSaveRef.current = true;
    setSelectedUsers(selectedUsers.filter((s) => s !== row));
  };

  const handleAdd = (row) => {
    canSaveRef.current = true;
    setSelectedUsers([row].concat(...selectedUsers));
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
            aria-label={mergedI18n.addUser}
            renderIcon={ArrowRight}
            hasIconOnly
            kind="ghost"
            size="sm"
            onClick={() => handleAdd(user)}
            iconDescription={mergedI18n.addUser}
            // TODO: pass testId in v3
            // testId={`${testId}-add-user-button`}
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
              aria-label={mergedI18n.removeUser}
              renderIcon={Subtract}
              hasIconOnly
              kind="ghost"
              size="sm"
              onClick={() => handleRemove(user)}
              iconDescription={mergedI18n.removeUser}
              // TODO: pass testId in v3
              // testId={`${testId}-remove-user-button`}
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
  const { addUser, removeUser, expand, close, ...i18nListBuilder } = mergedI18n;

  return (
    <div data-testid={`${testId}-container`} className={`${iotPrefix}--select-users-modal`}>
      <ComposedModal
        isLarge
        footer={{
          isPrimaryButtonDisabled: !canSaveRef.current,
          primaryButtonLabel: mergedI18n.primaryButtonLabel,
          secondaryButtonLabel: mergedI18n.secondaryButtonLabel,
        }}
        header={{
          label: mergedI18n.modalHeaderLabel,
          title: mergedI18n.modalHeaderTitle,
        }}
        open={isOpen}
        onSubmit={() => {
          onSubmit(selectedUsers);
          canSaveRef.current = false;
        }}
        onClose={(e) => {
          setSelectedUsers(initialSelectedUsers);
          onClose(e);
          canSaveRef.current = false;
        }}
        // TODO: replace with passed testId in v3.
        // testId={testId}
      >
        <ListBuilder
          items={usersList}
          itemCount={userCount}
          // TODO: replace with passed test in v3.
          // testId={`${testId}-list-builder`}
          testId="select-users"
          selectedItems={selectedList}
          i18n={{
            ...i18nListBuilder,
            addLabel: addUser,
            removeLabel: removeUser,
            expandIconDescription: expand,
            collapseIconDescription: close,
          }}
        />
      </ComposedModal>
    </div>
  );
};

SelectUsersModal.propTypes = propTypes;
SelectUsersModal.defaultProps = defaultProps;

export default SelectUsersModal;
