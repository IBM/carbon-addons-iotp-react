import { CloseOutline, View, ViewOff } from '@carbon/react/icons';
import React, { useCallback, useMemo } from 'react';

import Button from '../../Button/Button';

/**
 * The useVisibilityToggle hook will append a "visibility toggle" button to each selected column
 * if the hasVisibilityToggle is true. This is done be defining custom row actions for the listitems
 * and since the custom row actions will replace all existing actions we must also add back the "remove" button.
 */
export const useVisibilityToggle = ({
  handleRemove,
  hasVisibilityToggle,
  hiddenIds,
  hideIconDescription,
  onChange,
  removeIconDescription,
  selectedColumnItems,
  setHiddenIds,
  showIconDescription,
  testId,
}) => {
  const toggleVisibility = useCallback(
    (id, show) => {
      setHiddenIds((prev) => {
        const groupItem = selectedColumnItems.find((item) => item.id === id && item.children);
        const childIds = groupItem?.children.map((child) => child.id);

        return groupItem
          ? show
            ? prev.filter((prevId) => !childIds.includes(prevId))
            : [...prev, ...childIds]
          : show
          ? prev.filter((prevId) => prevId !== id)
          : [...prev, id];
      });
      onChange(show ? 'show' : 'hide', id);
    },
    [selectedColumnItems, setHiddenIds, onChange]
  );

  const generateRowActions = useCallback(
    // We need to create custom row actions with icon buttons
    // that are state dependent.
    (id, isHidden) => () =>
      [
        <Button
          key={`${id}-list-item-visibility-button`}
          testId={`${testId}-toggle-visibility-button-${id}`}
          renderIcon={isHidden ? ViewOff : View}
          hasIconOnly
          kind="ghost"
          size="sm"
          onClick={() => toggleVisibility(id, isHidden)}
          iconDescription={isHidden ? showIconDescription : hideIconDescription}
          title={isHidden ? showIconDescription : hideIconDescription}
        />,
        <Button
          key={`${id}-list-item-delete-button`}
          // We use the "list-builder" test since we are "overwriting" the buttons
          // of the ListBuilder and want to have the same test-id for the same button
          // regardless of where it is rendered.
          testId={`${testId}-list-builder-remove-button-${id}`}
          renderIcon={CloseOutline}
          hasIconOnly
          kind="ghost"
          size="sm"
          onClick={() => handleRemove(null, id)}
          iconDescription={removeIconDescription}
          title={removeIconDescription}
        />,
      ],
    [
      toggleVisibility,
      handleRemove,
      hideIconDescription,
      removeIconDescription,
      showIconDescription,
      testId,
    ]
  );

  const appendNewRowActions = useCallback(
    (item) => {
      const itemIsHidden = item.children?.length
        ? item.children.every((child) => hiddenIds.includes(child.id))
        : hiddenIds.includes(item.id);

      return {
        ...item,
        content: { ...item.content, rowActions: generateRowActions(item.id, itemIsHidden) },
        children: item.children
          ? item.children.map((child) => ({
              ...child,
              content: {
                ...child.content,
                rowActions: generateRowActions(child.id, hiddenIds.includes(child.id)),
              },
            }))
          : undefined,
      };
    },
    [generateRowActions, hiddenIds]
  );

  return useMemo(() => {
    if (!hasVisibilityToggle) {
      return selectedColumnItems;
    }

    return selectedColumnItems.map(appendNewRowActions);
  }, [selectedColumnItems, hasVisibilityToggle, appendNewRowActions]);
};
