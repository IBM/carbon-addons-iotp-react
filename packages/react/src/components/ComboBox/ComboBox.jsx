import React, { useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ComboBox as CarbonComboBox, Tag } from '@carbon/react';
import { pick } from 'lodash-es';

import { settings } from '../../constants/Settings';
import { filterValidAttributes } from '../../utils/componentUtilityFunctions';
import { keyboardKeys } from '../../constants/KeyCodeConstants';

const { iotPrefix } = settings;

const propTypes = {
  // eslint-disable-next-line react/forbid-foreign-prop-types
  ...CarbonComboBox.propTypes,
  loading: PropTypes.bool,
  // Callback that is called with the value of the input on change
  onChange: PropTypes.func.isRequired,
  // Optional classname to be applied to wrapper
  wrapperClassName: PropTypes.string,
  // String to pass to input field option
  editOptionText: PropTypes.string,
  // String to pass for tags close button aria-label. Will be prepended to value name
  closeButtonText: PropTypes.string,
  // Allow custom onBlur function to be passed to the combobox textinput
  onBlur: PropTypes.func,
  // Bit that will allow mult value and tag feature
  hasMultiValue: PropTypes.bool,
  // On submit/enter, new items should be added to the listbox
  addToList: PropTypes.bool,
  // If true the menu will expand in width to fit the content
  menuFitContent: PropTypes.bool,
  // The horizontal offset direction of the menu. Relevant if menuFitContent is active.
  // Default is 'end' whit means that it expands to the right in normal LTR mode
  horizontalDirection: PropTypes.oneOf(['start', 'end']),
  testId: PropTypes.string,
};

const defaultProps = {
  ...CarbonComboBox.defaultProps,
  loading: false,
  wrapperClassName: null,
  closeButtonText: 'Close',
  editOptionText: 'Create',
  hasMultiValue: false,
  addToList: false,
  items: [],
  onInputChange: null,
  onBlur: null,
  testId: 'combo',
  menuFitContent: false,
  horizontalDirection: 'end',
};

const ComboBox = React.forwardRef(
  (
    {
      loading,
      wrapperClassName,
      closeButtonText,
      editOptionText,
      hasMultiValue,
      onChange,
      items,
      className,
      disabled,
      id,
      itemToString,
      size,
      onInputChange,
      addToList,
      helperText,
      shouldFilterItem,
      onBlur,
      testId,
      menuFitContent,
      horizontalDirection,
      ...rest
    },
    ref
  ) => {
    // Ref for the combobox input
    const comboRef = ref || React.createRef();
    // Input value that is added to list
    const [inputValue, setInputValue] = useState('');
    // Array that populates list
    const [listItems, setListItems] = useState(items);
    // Array that populates tags
    const [tagItems, setTagItems] = useState([]);
    // Array that populates tags
    const prevTagAndListCount = useRef(items.length + tagItems.length);

    // Handle focus after adding new tags or list items
    useEffect(() => {
      const currentTagAndListCount = tagItems.length + listItems.length;

      // only focus input if the tags or list have increased
      if (prevTagAndListCount.current < currentTagAndListCount) {
        comboRef.current.focus();
      }

      // Store the value for the next render
      prevTagAndListCount.current = currentTagAndListCount;
    }, [tagItems, listItems, comboRef]);

    /**
     * List to the blur event and trigger parent onBlur
     * @param {event} e
     */
    const handleOnBlur = (e) => {
      if (onBlur) {
        onBlur(inputValue, e);
      }
    };

    const handleOnClose = (e) => {
      // Get close target's text
      const closedValue = e.currentTarget.parentNode?.children[0]?.textContent;
      // If there is a tag with the same value then remove from tag array
      tagItems.forEach((item, idx) => {
        if (itemToString(item) === closedValue) {
          tagItems.splice(idx, 1);
          setTagItems([...tagItems]);
        }
      });
      // Send new value to users onChange callback
      onChange([...tagItems]);
      // eslint-disable-next-line no-unused-expressions
      e.currentTarget.parentNode?.parentNode?.parentNode?.firstChild?.children[0]?.children[1]?.focus();
    };

    const handleOnChange = ({ selectedItem: downShiftSelectedItem }) => {
      const newItem =
        downShiftSelectedItem &&
        Object.keys(downShiftSelectedItem).reduce((acc, currentId) => {
          const value = downShiftSelectedItem[currentId];
          return {
            ...acc,
            [currentId]: typeof value === 'string' ? value.trim() : value,
          };
        }, {});

      const currentValue = itemToString(newItem);
      // Check that there is no existing tag
      const hasNoExistingTag = tagItems.filter((x) => itemToString(x) === currentValue).length < 1;
      // Check if value is part of items array
      const isInList = listItems.filter((x) => itemToString(x).trim() === currentValue)[0];

      if (hasMultiValue) {
        // If tags array does not contain new value
        if (newItem && hasNoExistingTag) {
          // Add new value to tags array
          setTagItems((inputValues) => [...inputValues, newItem]);
          // pass the combobox value to user's onChange callback
          onChange([...tagItems, newItem]);
        }
      } else {
        onChange(newItem);
      }

      if (
        (addToList || hasMultiValue) &&
        typeof newItem?.id === 'string' &&
        newItem?.id.startsWith(`${iotPrefix}-input-`) &&
        !isInList
      ) {
        // Add new item to items array
        setListItems((currentList) => [newItem, ...currentList]);
      }

      setInputValue(null);
    };

    // If the input text doesn't match something in the list, the CarbonComboBox does not call the onChange handler
    // https://github.com/carbon-design-system/carbon/issues/6613
    const handleOnKeypress = (evt) => {
      // Current value of input
      const currentValue = comboRef.current.value.trim();
      if (evt.key === keyboardKeys.ENTER && currentValue) {
        const newItem = {
          id: `${iotPrefix}-input-${currentValue.split(' ').join('-')}-${currentValue.length}`,
          text: currentValue,
        };
        handleOnChange({ selectedItem: newItem });
      }
    };

    const handleInputChange = (e) => {
      const matchedItem = listItems.filter((x) => itemToString(x) === e)[0];
      if ((onBlur || addToList || hasMultiValue) && e && e !== '' && !matchedItem) {
        setInputValue({
          id: `${iotPrefix}-input-${e.split(' ').join('-')}-${e.length}`,
          text: e,
        });
      } else {
        setInputValue(null);
      }
      // Pass on to user callbacks
      if (typeof onInputChange === 'function') {
        onInputChange(e);
      }
    };

    const combinedItems = useMemo(
      () => (inputValue ? [inputValue, ...listItems] : listItems),
      [inputValue, listItems]
    );

    const shouldFilterItemForTags = ({
      item,
      itemToString: _itemToString,
      inputValue: _inputValue,
    }) => _itemToString(item)?.includes(_inputValue);

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={classnames(`${iotPrefix}--combobox`, {
          [wrapperClassName]: wrapperClassName,
          [`${iotPrefix}--combobox-add`]: inputValue,
          [`${iotPrefix}--combobox-size-${size}`]: size,
          [`${iotPrefix}--combobox-helper-text`]: helperText,
          [`${iotPrefix}--combobox__menu--fit-content`]: menuFitContent,
          [`${iotPrefix}--combobox__menu--flip-horizontal`]: horizontalDirection === 'start',
        })}
        onKeyDown={handleOnKeypress}
        onBlur={handleOnBlur}
        data-testid={`${testId}-wrapper`}
        data-edit-option-text={editOptionText}
      >
        <CarbonComboBox
          data-testid={`${testId}-box`}
          id={id}
          key={`tags:${tagItems.length} listItems:${listItems.length}`}
          size={size}
          ref={comboRef}
          items={combinedItems}
          itemToString={itemToString}
          onChange={handleOnChange}
          onInputChange={handleInputChange}
          className={classnames(className, `${iotPrefix}--combobox-input`)}
          disabled={disabled || (loading !== undefined && loading !== false)}
          helperText={helperText}
          shouldFilterItem={hasMultiValue || addToList ? shouldFilterItemForTags : shouldFilterItem}
          {...pick(
            rest,
            'ariaLabel',
            'direction',
            'downshiftProps',
            'initialSelectedItem',
            'invalid',
            'invalidText',
            'itemToElement',
            'light',
            'onToggleClick',
            'placeholder',
            'selectedItem',
            'titleText',
            'translateWithId',
            'type',
            'warn',
            'warnText'
          )}
          {...filterValidAttributes(rest)}
        />
        {hasMultiValue ? (
          <ul data-testid={`${testId}-tags`} className={`${iotPrefix}--combobox-tags`}>
            {tagItems.map((item, idx) => (
              <li key={`li-${item?.id}-${idx}`}>
                <Tag
                  key={`tag-${item?.id}-${idx}`}
                  filter
                  onClose={(e) => handleOnClose(e)}
                  title={closeButtonText}
                >
                  {itemToString(item)}
                </Tag>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }
);

ComboBox.propTypes = propTypes;
ComboBox.defaultProps = defaultProps;

export default ComboBox;
