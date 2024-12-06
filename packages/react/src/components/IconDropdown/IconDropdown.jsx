import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import { settings } from '../../constants/Settings';
import { Dropdown } from '../Dropdown';

const { iotPrefix, prefix } = settings;

const itemShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  footer: PropTypes.node,
});

const propTypes = {
  id: PropTypes.string.isRequired,
  dropdownId: PropTypes.string.isRequired,
  columnCount: PropTypes.number,
  selectedItem: itemShape,
  items: PropTypes.arrayOf(itemShape).isRequired,

  // Dropdown specific props
  /**
   * 'aria-label' of the ListBox component.
   */
  ariaLabel: PropTypes.string,

  /**
   * Specify the direction of the dropdown. Can be either top or bottom.
   */
  direction: PropTypes.oneOf(['top', 'bottom']),

  /**
   * Disable the control
   */
  disabled: PropTypes.bool,

  /**
   * Provide helper text that is used alongside the control label for
   * additional help
   */
  helperText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

  /**
   * Specify if the currently selected value is invalid.
   */
  invalid: PropTypes.bool,

  /**
   * Message which is displayed if the value is invalid.
   */
  invalidText: PropTypes.string,

  /**
   * Generic `label` that will be used as the textual representation of what
   * this field is for
   */
  label: PropTypes.node.isRequired,

  /**
   * `true` to use the light version.
   */
  light: PropTypes.bool,

  /**
   * `onChange` is a utility for this controlled component to communicate to a
   * consuming component what kind of internal state changes are occurring.
   */
  onChange: PropTypes.func,
  translateWithId: PropTypes.func,

  /**
   * Provide the title text that will be read by a screen reader when
   * visiting this control
   */
  titleText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

  /**
   * The dropdown type, `default` or `inline`
   */
  type: PropTypes.oneOf(['default', 'inline']),

  testId: PropTypes.string,
};

/* istanbul ignore next, ignore the default onChange */
const defaultPropTypes = {
  columnCount: 4,
  selectedItem: null,
  disabled: false,
  type: 'default',
  light: false,
  titleText: '',
  helperText: '',
  direction: 'bottom',
  ariaLabel: '',
  invalid: false,
  invalidText: '',
  onChange: () => {},
  translateWithId: undefined,
  testId: 'icon-dropdown',
};

const defaultItemSize = 48;
const defaultHelperPadding = 4;

const IconDropdown = ({
  id,
  columnCount,
  selectedItem: controlledSelectedItem,
  items,
  dropdownId,
  disabled,
  direction,
  onChange,
  translateWithId,
  testId,
  ...other
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalSelectedItem, setInternalSelectedItem] = useState(controlledSelectedItem);

  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(columnCount * defaultItemSize);

  const [topTranslate, setTopTranslate] = useState(0);
  const [bottomTranslate, setBottomTranslate] = useState(0);

  const selectedItem =
    controlledSelectedItem !== null ? controlledSelectedItem : internalSelectedItem;

  const dropdownRef = useRef(null);

  const highlightedItem =
    highlightedIndex >= 0 && highlightedIndex < items.length ? items[highlightedIndex] : null;

  // const hasFooter = highlightedItem || selectedItem;

  const handleClick = useCallback(() => {
    // Takes measurements of the dropdown and text that renders beneath this - used to position the footer
    // const dropdown = document.getElementById(id);
    const helperText = dropdownRef.current.getElementsByClassName(
      `${prefix}--form__helper-text`
    )[0];
    const validationText = dropdownRef.current.getElementsByClassName(
      `${prefix}--form-requirement`
    )[0];
    const menuOption = dropdownRef.current.getElementsByClassName(
      `${prefix}--list-box__menu-item`
    )[0];

    const dropdownLabel = dropdownRef.current.getElementsByClassName(
      `${prefix}--list-box__field`
    )[0];

    const helperTextHeight =
      helperText !== undefined ? helperText.clientHeight + defaultHelperPadding : 0;
    const validationTextHeight =
      validationText !== undefined ? validationText.clientHeight + defaultHelperPadding : 0;

    const labelHeight = dropdownLabel !== undefined ? dropdownLabel.clientHeight : 0;

    setWidth(columnCount * (menuOption?.offsetWidth ?? defaultItemSize));
    setHeight(Math.ceil(items.length / columnCount) * defaultItemSize);
    setTopTranslate(helperTextHeight + validationTextHeight + labelHeight + 1); // Add one for the border width
    setBottomTranslate(helperTextHeight + validationTextHeight);
  }, [columnCount, dropdownRef, items.length]);

  const Footer = () => {
    const selectedFooter = highlightedItem !== null ? highlightedItem : selectedItem;
    return (
      <div
        data-testid={`${testId}-footer`}
        className={`${iotPrefix}--icon-dropdown__footer`}
        style={{
          width: `${width}px`,
          transform: `translateY(-${direction === 'top' ? topTranslate : bottomTranslate}px)`,
          paddingTop: direction === 'bottom' ? `${height}px` : 0,
          paddingBottom: direction === 'top' ? `${height}px` : 0,
          bottom: direction === 'top' ? 0 : 'initial',
        }}
      >
        {selectedFooter && (
          <div className={`${iotPrefix}--icon-dropdown__footer-content`}>
            {selectedFooter.footer}
          </div>
        )}
      </div>
    );
  };

  const itemToElement = (item) => {
    const index = items.findIndex((element) => element.id === item.id);

    return (
      <>
        {/* {
          // only display this button when the dropdown is open, bc if it's shown when closed it's
          // rendered in a different place and causes a <button> within <button> warning.
          isOpen ? (
            <Button
              className={classnames(
                `${iotPrefix}--icon-dropdown__image-button`,
                {
                  [`${iotPrefix}--icon-dropdown__image-button--leading`]: index % columnCount === 0,
                },
                {
                  [`${iotPrefix}--icon-dropdown__image-button--trailing`]:
                    (index + 1) % columnCount === 0,
                },
                {
                  [`${iotPrefix}--icon-dropdown__image-button--bottom`]:
                    index + columnCount >= items.length && !hasFooter && direction === 'bottom',
                },
                {
                  [`${iotPrefix}--icon-dropdown__image-button--top`]:
                    index < columnCount && hasFooter && direction === 'top',
                }
              )}
              renderIcon={item?.icon}
              kind="ghost"
              hasIconOnly
              disabled={disabled}
              selected={item.id === selectedItem?.id}
              testId={`dropdown-button__${item?.id}`}
              iconDescription={item.text}
              title={item?.text}
            />
          ) : null
        } */}
        <div
          className={`${iotPrefix}--icon-dropdown__selected-icon-label`}
          onMouseEnter={() => {
            if (index !== highlightedIndex) {
              setHighlightedIndex(index);
            }
          }}
        >
          {React.createElement(item.icon)}
          <div className={`${iotPrefix}--icon-dropdown__selected-icon-label__content`}>
            {item.text}
          </div>
        </div>
      </>
    );
  };

  return (
    <div id={id} ref={dropdownRef}>
      {isOpen && direction === 'top' && <Footer />}

      <Dropdown
        id={dropdownId}
        direction={direction}
        style={{ width: `${width}px` }}
        items={items}
        className={`${iotPrefix}--icon-dropdown__selection-buttons`}
        selectedItem={selectedItem}
        onChange={({ selectedItem: newSelected }) => {
          setInternalSelectedItem(newSelected);
          onChange(newSelected);
        }}
        translateWithId={translateWithId}
        renderSelectedItem={itemToElement}
        downshiftProps={{
          isOpen,
          onStateChange: (change) => {
            handleClick();

            if (change.isOpen !== undefined) {
              setIsOpen(change.isOpen);
            }

            if (change.highlightedIndex !== undefined) {
              setHighlightedIndex(change.highlightedIndex);
            }
          },
        }}
        data-testid={testId}
        {...other}
        itemToElement={itemToElement}
        itemToString={(item) => item.text}
      />
      {isOpen && direction === 'bottom' && <Footer />}
    </div>
  );
};

IconDropdown.propTypes = propTypes;
IconDropdown.defaultProps = defaultPropTypes;

export default IconDropdown;
