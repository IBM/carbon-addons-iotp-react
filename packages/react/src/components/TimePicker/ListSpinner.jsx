import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown } from '@carbon/react/icons';
import classnames from 'classnames';

import { settings } from '../../constants/Settings';
import useMerged from '../../hooks/useMerged';
import Button from '../Button';
import { keyboardKeys } from '../../constants/KeyCodeConstants';

const { iotPrefix } = settings;

const propTypes = {
  className: PropTypes.string,
  testId: PropTypes.string,

  i18n: PropTypes.shape({
    previous: PropTypes.string,
    next: PropTypes.string,
  }),
  /** Optional default selected item */
  defaultSelectedId: PropTypes.string,
  /** Optional handler that is called whenever value is updated */
  onChange: PropTypes.func,
  /** Optional handler that is called whenever item is clicked */
  onClick: PropTypes.func,
  /** Optional handler that is called whenever right arrow is clicked */
  onRightArrowClick: PropTypes.func,
  /** Optional handler that is called whenever left arrow is clicked */
  onLeftArrowClick: PropTypes.func,
  /** Array of items to render in the spinning list */
  list: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, value: PropTypes.string })),
  /** Optional tag name to use instead of ul */
  containerElement: PropTypes.string,
};

// istanbul ignore next
const defaultProps = {
  className: undefined,
  testId: 'list-spinner',
  i18n: {
    previous: 'Previous item',
    next: 'Next item',
  },
  defaultSelectedId: undefined,
  onChange: () => {},
  onClick: () => {},
  onRightArrowClick: () => {},
  onLeftArrowClick: () => {},
  list: [],
  containerElement: 'ul',
};

export function backwardArraySwap(arr) {
  const newArr = [...arr];
  const first = newArr.shift();
  newArr.push(first);
  return newArr;
}

export function forwardArraySwap(arr) {
  const newArr = [...arr];
  const last = newArr.pop();
  newArr.unshift(last);
  return newArr;
}

/**
 *
 * @param {*} arr - the array to opperate on
 * @param {*} index - the index of the item to move
 * @returns array - new array with the chosen index as 3 item in array
 */
export function moveToSecondIndex(arr, index) {
  const newArr = [...arr];
  let removed;
  if (index > 2) {
    // 6 - 2
    removed = newArr.splice(0, index - 2);
    newArr.push(...removed);
  }
  if (index < 2) {
    const amnt = 2 - index;
    // 6 - 2
    removed = newArr.splice(-amnt, amnt);
    newArr.unshift(...removed);
  }
  return newArr;
}

const ListSpinner = React.forwardRef(
  (
    {
      className,
      testId,
      i18n,
      defaultSelectedId,
      onChange,
      onClick,
      onRightArrowClick,
      onLeftArrowClick,
      list,
      containerElement: ContainerElement,
    },
    ref
  ) => {
    const containerRef = useRef();
    const contentRef = useRef();
    const touch = useRef(false);
    const ticking = useRef(false);
    const scrollEvent = useRef(false);
    const scrollPosition = useRef();
    const timer = useRef();

    const [listItems, setListItems] = useState(list);
    const [selectedId, setSelectedId] = useState(defaultSelectedId);

    const { previous, next } = useMerged(defaultProps.i18n, i18n);

    useEffect(() => {
      setSelectedId(defaultSelectedId);
    }, [defaultSelectedId]);

    useEffect(() => {
      const index = list.findIndex((i) => i.id === selectedId);
      const newList = moveToSecondIndex(list, index);
      setListItems(newList);
      onChange(selectedId);
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [onChange, selectedId]);

    const observerRef = React.useRef();
    useEffect(() => {
      // Create a new observer
      if (window?.IntersectionObserver) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && scrollEvent.current) {
                clearTimeout(timer.current);
                timer.current = setTimeout(setSelectedId(entry.target.childNodes[0].id), 800);
              }
            });
          },
          {
            root: containerRef.current,
            rootMargin: '-50% 0% -50% 0%',
            threshold: 0,
          }
        );
      }

      return () => observerRef.current?.disconnect();
    }, []);

    const handleWheel = (e) => {
      e.persist();
      scrollEvent.current = true;
      if (!ticking.current) {
        /* eslint-disable func-names */
        setTimeout(
          () =>
            setTimeout(() => {
              if (e.deltaY < 0) {
                setSelectedId((prev) => {
                  const prevIndex = list.findIndex((i) => i.id === prev);
                  const val = prevIndex > 0 ? list[prevIndex - 1].id : list[list.length - 1].id;
                  setTimeout(() => onClick(val));
                  return val;
                });
              } else {
                setSelectedId((prev) => {
                  const prevIndex = list.findIndex((i) => i.id === prev);
                  const val =
                    prevIndex === list.indexOf(list[list.length - 1])
                      ? list[0].id
                      : list[prevIndex + 1].id;
                  setTimeout(() => onClick(val));
                  return val;
                });
              }
              ticking.current = false;
            }),
          100
        );

        ticking.current = true;
      }
    };

    const handleTouchMove = (e) => {
      e.persist();
      scrollEvent.current = true;
      /* istanbul ignore else */
      if (!ticking.current) {
        /* eslint-disable func-names */
        setTimeout(() => {
          setTimeout(() => {
            if (scrollPosition.current - e.touches[0].pageY < 0) {
              setSelectedId((prev) => {
                const prevIndex = list.findIndex((i) => i.id === prev);
                const val = prevIndex > 0 ? list[prevIndex - 1].id : list[list.length - 1].id;
                setTimeout(() => onClick(val));
                return val;
              });
            } else {
              setSelectedId((prev) => {
                const prevIndex = list.findIndex((i) => i.id === prev);
                const val =
                  prevIndex === list.indexOf(list[list.length - 1])
                    ? list[0].id
                    : list[prevIndex + 1].id;
                setTimeout(() => onClick(val));
                return val;
              });
            }
            scrollPosition.current = e.touches[0].pageY;
            ticking.current = false;
            touch.current = false;
          });
        }, 100);
        ticking.current = true;
      }
    };

    const handleTouchStart = (e) => {
      e.persist();
      scrollPosition.current = e.touches[0].pageY;
      touch.current = true;
    };

    // eslint-disable-next-line consistent-return
    const handleKeyPress = (e) => {
      e.persist();
      // istanbul ignore else
      if (e.target.id.length === 2) {
        // istanbul ignore else
        if (e.key === keyboardKeys.UP) {
          e.preventDefault();
          setSelectedId((prev) => {
            const prevIndex = list.findIndex((i) => i.id === prev);
            const val = prevIndex > 0 ? list[prevIndex - 1].id : list[list.length - 1].id;
            setTimeout(() => onClick(val));
            return val;
          });
          setTimeout(() => contentRef.current.childNodes[0].focus());
          return false;
        }
        // istanbul ignore else
        if (e.key === keyboardKeys.DOWN) {
          e.preventDefault();
          setSelectedId((prev) => {
            const prevIndex = list.findIndex((i) => i.id === prev);
            const val =
              prevIndex === list.indexOf(list[list.length - 1])
                ? list[0].id
                : list[prevIndex + 1].id;
            setTimeout(() => onClick(val));
            return val;
          });
          setTimeout(() => contentRef.current.childNodes[0].focus());
          return false;
        }
        // istanbul ignore else
        if (e.key === keyboardKeys.RIGHT) {
          onRightArrowClick(e);
        }
        // istanbul ignore else
        if (e.key === keyboardKeys.LEFT) {
          onLeftArrowClick(e);
        }
      }

      // istanbul ignore else
      if (/\s/.test(e.key) || e.key === 'Enter') {
        // istanbul ignore else
        if (e.currentTarget.id === `${iotPrefix}--list-spinner__btn--up`) {
          setSelectedId((prev) => {
            const prevIndex = list.findIndex((i) => i.id === prev);
            const val = prevIndex > 0 ? list[prevIndex - 1].id : list[list.length - 1].id;
            setTimeout(() => onClick(val));
            return val;
          });
        }
        // istanbul ignore else
        if (e.currentTarget.id === `${iotPrefix}--list-spinner__btn--down`) {
          setSelectedId((prev) => {
            const prevIndex = list.findIndex((i) => i.id === prev);
            const val =
              prevIndex === list.indexOf(list[list.length - 1])
                ? list[0].id
                : list[prevIndex + 1].id;
            setTimeout(() => onClick(val));
            return val;
          });
        }
      }
    };

    const handleClick = useCallback(
      (e) => {
        e.persist();
        e.preventDefault();
        scrollEvent.current = false;
        if (e.currentTarget.id === `${iotPrefix}--list-spinner__btn--up`) {
          setSelectedId((prev) => {
            const prevIndex = list.findIndex((i) => i.id === prev);
            const val = prevIndex > 0 ? list[prevIndex - 1].id : list[list.length - 1].id;
            setTimeout(() => onClick(val));
            return val;
          });
        } else if (e.currentTarget.id === `${iotPrefix}--list-spinner__btn--down`) {
          setSelectedId((prev) => {
            const prevIndex = list.findIndex((i) => i.id === prev);
            const val =
              prevIndex === list.indexOf(list[list.length - 1])
                ? list[0].id
                : list[prevIndex + 1].id;
            setTimeout(() => onClick(val));
            return val;
          });
        } else {
          setSelectedId(e.currentTarget.id);
          onClick(e.currentTarget.id);
        }
        e.currentTarget.focus();
      },
      [list, onClick]
    );
    const renderItems = listItems.map((el) => (
      <li
        data-testid={`${testId}-list-item`}
        ref={(node) => {
          // Once component mounts tell our observer to observe it
          if (node) {
            if (el.value === selectedId) {
              contentRef.current = node;
            }
            setTimeout(() => observerRef.current?.observe(node), 0);
          }
        }}
        className={classnames(`${iotPrefix}--list-spinner__list-item`, {
          [`${iotPrefix}--list-spinner__list-item--selected`]: el.id === selectedId,
        })}
        key={el.id}
        id={`${el.id}-list-item`}
        data-selected={el.value === selectedId}
      >
        <Button
          ref={el.id === selectedId ? ref : null}
          testId={el.id === selectedId ? `${testId}-selected-item` : el.id}
          id={el.id}
          tabIndex={-1}
          kind="ghost"
          iconDescription={el.value}
          onMouseDown={handleClick}
        >
          {el.value}
        </Button>
      </li>
    ));

    return (
      <div
        data-testid={testId}
        className={classnames(`${iotPrefix}--list-spinner__section`, {
          [className]: className,
        })}
      >
        <Button
          tabIndex={-1}
          testId={`${testId}-prev-btn`}
          id={`${iotPrefix}--list-spinner__btn--up`}
          onMouseDown={handleClick}
          iconDescription={previous}
          className={`${iotPrefix}--list-spinner__btn ${className}-spinner__btn`}
          renderIcon={ChevronUp}
          kind="ghost"
          onKeyDown={handleKeyPress}
        />
        <div
          className={`${iotPrefix}--list-spinner__list-container ${className}-spinner__list-container`}
        >
          <ContainerElement
            data-testid={`${testId}-list`}
            ref={containerRef}
            className={`${iotPrefix}--list-spinner__list ${className}-spinner__list`}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onKeyDown={handleKeyPress}
          >
            {renderItems}
          </ContainerElement>
        </div>
        <Button
          testId={`${testId}-next-btn`}
          tabIndex={-1}
          id={`${iotPrefix}--list-spinner__btn--down`}
          onMouseDown={handleClick}
          className={`${iotPrefix}--list-spinner__btn ${className}-spinner__btn`}
          iconDescription={next}
          renderIcon={ChevronDown}
          kind="ghost"
          onKeyDown={handleKeyPress}
        />
      </div>
    );
  }
);

ListSpinner.propTypes = propTypes;
ListSpinner.defaultProps = defaultProps;
export default ListSpinner;
