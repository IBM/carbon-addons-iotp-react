import React, { useRef, useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { debounce } from 'lodash-es';
import { Close, ChevronLeft as OpenLeft, ChevronRight as OpenRight } from '@carbon/react/icons';

import { ToggleTip } from '../ToggleTip';
import { settings } from '../../constants/Settings';
import useHasTextOverflow from '../../hooks/useHasTextOverflow';
import Button from '../Button';
import { getKeyboardFoucusableElements } from '../../utils/a11yUtils';

const { iotPrefix } = settings;

const propTypes = {
  /** Whether panel is open or not */
  isOpen: PropTypes.bool,
  /** Whether content area has any padding or not */
  isFullWidth: PropTypes.bool,
  /** Whether panel header is condensed or not */
  isCondensed: PropTypes.bool,
  /** Optional override of behavior of side panel which is to slide in */
  type: PropTypes.oneOf(['inline', 'over']),
  /** Which side the side panel will appear next to content */
  direction: PropTypes.oneOf(['left', 'right']),
  /** Callback for when close button is clicked */
  onToggle: PropTypes.func,
  /** Main Title */
  title: PropTypes.string,
  /** Sub title or description - will go away when content is scrolled */
  subtitle: PropTypes.string,
  /** Action items which will appear as part of header above the content */
  actionItems: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        buttonLabel: PropTypes.string,
        buttonIcon: PropTypes.elementType,
        buttonCallback: PropTypes.func,
      })
    ),
    PropTypes.node,
  ]),
  /** Optional test id */
  testId: PropTypes.string,
  /** Callback for when Primary footer button is clicked */
  onPrimaryButtonClick: PropTypes.func,
  /** Callback for when Secondary footer button is clicked */
  onSecondaryButtonClick: PropTypes.func,
  i18n: PropTypes.shape({
    closeIconLabel: PropTypes.string,
    openIconLabel: PropTypes.string,
    primaryButtonLabel: PropTypes.string,
    secondaryButtonLabel: PropTypes.string,
  }),
  /** Toggle side panel busy state */
  isBusy: PropTypes.bool,
  /** should the footer primary button be disabled */
  isPrimaryButtonDisabled: PropTypes.bool,
};

const defaultProps = {
  isOpen: false,
  isFullWidth: false,
  isCondensed: false,
  type: undefined,
  direction: 'right',
  title: null,
  subtitle: null,
  actionItems: null,
  testId: 'side-panel',
  i18n: {
    closeIconLabel: 'Close',
    openIconLabel: 'Open',
    primaryButtonLabel: 'Save',
    secondaryButtonLabel: 'Cancel',
  },
  onToggle: undefined,
  onPrimaryButtonClick: undefined,
  onSecondaryButtonClick: undefined,
  isBusy: false,
  isPrimaryButtonDisabled: false,
};

const baseClass = `${iotPrefix}--sidepanel`;

const SidePanel = ({
  isOpen,
  isFullWidth,
  isCondensed,
  type,
  direction,
  title,
  subtitle,
  actionItems,
  testId,
  i18n,
  onToggle,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  // eslint-disable-next-line react/prop-types
  children,
  // eslint-disable-next-line react/prop-types
  style,
  isBusy,
  isPrimaryButtonDisabled,
}) => {
  const titleRef = useRef();
  const subtitleRef = useRef();
  const contentRef = useRef();
  const truncatesTitle = useHasTextOverflow(titleRef, title);
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  const toggleIcon = useMemo(() => {
    return isOpen
      ? {
          icon: Close,
          label: mergedI18n.closeIconLabel,
          tooltipPostion: 'left',
          disabled: isBusy,
        }
      : {
          icon: direction === 'right' ? OpenLeft : OpenRight,
          label: mergedI18n.openIconLabel,
          tooltipPostion: direction === 'right' ? 'left' : 'right',
        };
  }, [isOpen, mergedI18n.closeIconLabel, mergedI18n.openIconLabel, direction, isBusy]);
  const actionIconBtns = useMemo(
    () =>
      actionItems &&
      ((Array.isArray(actionItems) &&
        actionItems.map((e, i) => (
          <Button
            testId={`${testId}-action-button-${e.buttonLabel}`}
            className={`${baseClass}__action-bar__item-${i + 1}`}
            key={`${e.buttonLabel}-${i}`}
            hasIconOnly
            iconDescription={e.buttonLabel}
            kind="ghost"
            renderIcon={e.buttonIcon}
            onClick={e.buttonCallback}
            size="sm"
            tabIndex={isOpen ? 0 : -1}
          />
        ))) ||
        actionItems),
    [actionItems, testId, isOpen]
  );

  useEffect(() => {
    const currentElement = document.querySelector(`.${baseClass}__content`);
    const keyboardfocusableElements = getKeyboardFoucusableElements(currentElement ?? document);

    if (isOpen) {
      [...keyboardfocusableElements].forEach((e) => {
        e.setAttribute('tabindex', 0);
      });
    } else {
      [...keyboardfocusableElements].forEach((e) => {
        e.setAttribute('tabindex', -1);
      });
    }
  }, [isOpen]);

  // Since subtitle is dynamic we set a css variable with the height value to animate in condensed mode
  const [subtitleHeight, setSubtitleHeight] = useState('100%');
  // Triggerd when the content is scrolled in either direction
  const [isScrolling, setIsScrolling] = useState(false);
  // If content scrollTop is not 0 we set it to isScrolled
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setTimeout(() => setSubtitleHeight(subtitleRef?.current?.getBoundingClientRect().height), 500);
  }, [subtitle]);

  const delayedScrollCheck = debounce(() => {
    if (contentRef.current?.scrollTop !== 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  }, 250);

  useEffect(() => {
    delayedScrollCheck();
  }, [delayedScrollCheck, isScrolling]);

  const truncateString = (str, length) => {
    if (str.length <= length) {
      return str;
    }
    return `${str.substring(0, length)}...`;
  };

  return (
    <div
      key={`sidePanel--${subtitle}`}
      data-testid={testId}
      className={classnames(`${baseClass}`, {
        [`${baseClass}--closed`]: !isOpen,
        [`${baseClass}--full-width`]: isFullWidth,
        [`${baseClass}--start`]: direction === 'left',
        [`${baseClass}--inline`]: type === 'inline',
        [`${baseClass}--slide-over`]: type === 'over',
        [`${baseClass}--condensed`]: isCondensed || isScrolled,
      })}
      style={style}
    >
      {onToggle && (isOpen || type === 'inline') ? (
        <Button
          testId={`${testId}-toggle-button`}
          hasIconOnly
          wrapperClasses={`${baseClass}__toggle-button`}
          kind="ghost"
          iconDescription={toggleIcon.label}
          renderIcon={toggleIcon.icon}
          onClick={onToggle}
          tooltipPosition={toggleIcon.tooltipPostion}
          disabled={toggleIcon.disabled}
        />
      ) : null}
      <header className={`${baseClass}__header`} aria-hidden={!isOpen}>
        {title && truncatesTitle ? (
          <ToggleTip
            data-testid={`${testId}-title`}
            ref={titleRef}
            showIcon={false}
            className={`${baseClass}__title`}
            tabIndex={isOpen ? 0 : -1}
            content={<>{title}</>}
            triggerText={
              isCondensed || isScrolled ? (
                <>{truncateString(title, 25)}</>
              ) : (
                <>{truncateString(title, 50)}</>
              )
            }
          />
        ) : title ? (
          <h2 data-testid={`${testId}-title`} ref={titleRef} className={`${baseClass}__title`}>
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p
            ref={subtitleRef}
            data-testid={`${testId}-subtitle`}
            style={{ '--sub-title-height': subtitleHeight }}
            className={`${baseClass}__subtitle`}
          >
            {subtitle}
          </p>
        ) : null}
        {actionIconBtns ? (
          <div
            data-testid={`${testId}-action-bar`}
            className={`${baseClass}__action-bar`}
            aria-hidden={!isOpen}
          >
            {actionIconBtns}
          </div>
        ) : null}
      </header>
      <section
        data-testid={`${testId}-content`}
        ref={contentRef}
        className={`${baseClass}__content`}
        onScroll={() => setIsScrolling((prev) => !prev)}
        aria-hidden={!isOpen}
      >
        {children}
      </section>
      {onSecondaryButtonClick || onPrimaryButtonClick ? (
        <div
          className={`${baseClass}__footer`}
          data-testid={`${testId}-footer`}
          aria-hidden={!isOpen}
        >
          {onSecondaryButtonClick ? (
            <Button
              testId={`${testId}-secondary-button`}
              className={`${baseClass}__footer__secondary-button`}
              onClick={onSecondaryButtonClick}
              tooltipPosition={toggleIcon.tooltipPostion}
              kind="secondary"
              disabled={isBusy}
              tabIndex={isOpen ? 0 : -1}
            >
              {mergedI18n.secondaryButtonLabel}
            </Button>
          ) : null}
          {onPrimaryButtonClick ? (
            <Button
              testId={`${testId}-primary-button`}
              className={`${baseClass}__footer__primary-button`}
              kind="primary"
              onClick={onPrimaryButtonClick}
              loading={isBusy}
              disabled={isPrimaryButtonDisabled}
              tabIndex={isOpen ? 0 : -1}
            >
              {mergedI18n.primaryButtonLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

SidePanel.propTypes = propTypes;
SidePanel.defaultProps = defaultProps;
export default SidePanel;
