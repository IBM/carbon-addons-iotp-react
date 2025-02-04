import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { SkeletonText } from '@carbon/react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import warning from 'warning';
import { isEmpty } from 'lodash-es';

import useVisibilityObserver from '../../hooks/useVisibilityObserver';
import { settings } from '../../constants/Settings';
import {
  CARD_TITLE_HEIGHT,
  CARD_CONTENT_PADDING,
  CARD_SIZES,
  CARD_LAYOUTS,
  ROW_HEIGHT,
  CARD_DIMENSIONS,
  DASHBOARD_BREAKPOINTS,
  DASHBOARD_COLUMNS,
  DASHBOARD_SIZES,
  CARD_TYPES,
} from '../../constants/LayoutConstants';
import { CardPropTypes } from '../../constants/CardPropTypes';
import { getCardMinSize, filterValidAttributes } from '../../utils/componentUtilityFunctions';
import { getUpdatedCardSize, useCardResizing } from '../../utils/cardUtilityFunctions';
import { parseValue } from '../DateTimePicker/dateTimePickerUtils';
import useSizeObserver from '../../hooks/useSizeObserver';
import EmptyState from '../EmptyState/EmptyState';
import { DAYJS_INPUT_FORMATS } from '../../utils/dayjs';

import CardTypeContent from './CardTypeContent';
import CardToolbar from './CardToolbar';
import { CardTitle } from './CardTitle';

const { prefix, iotPrefix } = settings;

const OptimizedSkeletonText = React.memo(SkeletonText);

/** Full card */
const CardWrapper = React.forwardRef(
  (
    {
      isSelected,
      children,
      dimensions,
      id,
      style,
      className,
      onScroll,
      // The event handlers are needed for when the card appears as grid items
      // in the Dashboard Grid - isEditable
      onMouseDown,
      onMouseUp,
      onTouchEnd,
      onTouchStart,
      onFocus,
      onBlur,
      tabIndex,
      // TODO: remove deprecated testID prop in v3
      // eslint-disable-next-line react/prop-types
      testID,
      testId,
      ...others
    },
    ref
  ) => {
    const validOthers = filterValidAttributes(others);

    return (
      <div
        ref={ref}
        role="presentation"
        data-testid={testID || testId}
        id={id}
        style={{ ...style, '--card-default-height': `${dimensions.y}px` }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onTouchStart={onTouchStart}
        onScroll={onScroll}
        onFocus={onFocus}
        onBlur={onBlur}
        tabIndex={tabIndex}
        className={classnames(className, `${iotPrefix}--card--wrapper`, {
          [`${iotPrefix}--card--wrapper__selected`]: isSelected,
        })}
        {...validOthers}
      >
        {children}
      </div>
    );
  }
);

/** Header components */
export const CardHeader = (
  { children, testId, hasSubtitle } // eslint-disable-line react/prop-types
) => (
  <div
    data-testid={testId}
    className={classnames(`${iotPrefix}--card--header`, {
      [`${iotPrefix}--card--header--with-subtitle`]: hasSubtitle,
    })}
  >
    {children}
  </div>
);

const CardContent = (props) => {
  const { children, dimensions, isExpanded, className, testId, noPadding, hasFooter } = props;
  const height = `${dimensions.y - CARD_TITLE_HEIGHT - (hasFooter ? '40' : '0')}px`;
  return (
    <div
      data-testid={testId}
      style={{ [`--card-content-height`]: height }}
      className={classnames(className, `${iotPrefix}--card--content`, {
        [`${iotPrefix}--card--content--expanded`]: isExpanded,
        [`${iotPrefix}--card__content--no-padding`]: noPadding,
      })}
    >
      {children}
    </div>
  );
};

const EmptyMessageWrapper = (props) => {
  const { children } = props;
  return (
    <div
      style={{ '--card-content-padding': `${CARD_CONTENT_PADDING}px` }}
      className={`${iotPrefix}--card--empty-message-wrapper`}
    >
      {children}
    </div>
  );
};

CardWrapper.propTypes = {
  /**
   * Is given the event as argument. Should return true or false if event should trigger selection
   */
  isSelected: PropTypes.bool,
  children: PropTypes.node.isRequired,
  dimensions: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
  id: CardPropTypes.id,
  style: PropTypes.objectOf(PropTypes.string),
  testId: CardPropTypes.testId,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onTouchStart: PropTypes.func,
  onScroll: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  /** Optionally sets a keyboard tab index for the container */
  tabIndex: PropTypes.number,
};
CardWrapper.defaultProps = {
  isSelected: false,
  id: undefined,
  style: undefined,
  testId: 'Card',
  onMouseDown: undefined,
  onMouseUp: undefined,
  onTouchEnd: undefined,
  onTouchStart: undefined,
  onScroll: undefined,
  onFocus: undefined,
  onBlur: undefined,
  tabIndex: undefined,
};
CardContent.propTypes = {
  testId: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  dimensions: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
  isExpanded: CardPropTypes.isExpanded.isRequired,
  noPadding: PropTypes.bool,
  // define the actual card content depending if it has a footer or not
  hasFooter: PropTypes.bool,
};
CardContent.defaultProps = {
  children: undefined,
  className: '',
  testId: 'card-content',
  noPadding: false,
  hasFooter: false,
};
EmptyMessageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export const defaultProps = {
  size: CARD_SIZES.MEDIUM,
  layout: CARD_LAYOUTS.HORIZONTAL,
  title: undefined,
  subtitle: undefined,
  hasTitleWrap: false,
  toolbar: undefined,
  hideHeader: false,
  timeRange: undefined,
  isLoading: false,
  isEmpty: false,
  /** In editable mode we'll show preview data */
  isEditable: false,
  isExpanded: false,
  /** performance option: only render the content of the card to the ReactDOM if the card is visible on screen */
  isLazyLoading: false,
  /** For now we will hide the per card actions when we're editing */
  availableActions: {
    edit: false,
    clone: false,
    delete: false,
    range: false,
    expand: false,
    settings: false,
    extra: false,
  },
  renderExpandIcon: undefined,
  renderDateDropdownInPortal: true,
  rowHeight: ROW_HEIGHT,
  breakpoint: DASHBOARD_SIZES.LARGE,
  cardDimensions: CARD_DIMENSIONS,
  dashboardBreakpoints: DASHBOARD_BREAKPOINTS,
  dashboardColumns: DASHBOARD_COLUMNS,
  i18n: {
    noDataLabel: 'No data is available for this time range.',
    noDataShortLabel: 'No data',
    errorLoadingDataLabel: 'Error loading data for this card: ',
    errorLoadingDataShortLabel: 'Data error.',
    timeRangeLabel: 'Time range',
    rollingPeriodLabel: 'Rolling period',
    defaultLabel: 'Default',
    last24HoursLabel: 'Last 24 hrs',
    last7DaysLabel: 'Last 7 days',
    lastMonthLabel: 'Last month',
    lastQuarterLabel: 'Last quarter',
    lastYearLabel: 'Last year',
    periodToDateLabel: 'Period to date',
    thisWeekLabel: 'This week',
    thisMonthLabel: 'This month',
    thisQuarterLabel: 'This quarter',
    thisYearLabel: 'This year',
    selectTimeRangeLabel: 'Select time range',
    hourlyLabel: 'Hourly',
    dailyLabel: 'Daily',
    weeklyLabel: 'Weekly',
    monthlyLabel: 'Monthly',
    editCardLabel: 'Edit card',
    cloneCardLabel: 'Clone card',
    deleteCardLabel: 'Delete card',
    closeLabel: 'Close',
    expandLabel: 'Expand to fullscreen',
    overflowMenuDescription: 'Open and close list of options',
    toLabel: 'to',
    extraActionLabel: 'Action Label',
    titleTooltipIconDescription: 'Tooltip info icon',
  },
  onMouseDown: undefined,
  onMouseUp: undefined,
  onTouchEnd: undefined,
  onTouchStart: undefined,
  onScroll: undefined,
  onFocus: undefined,
  onBlur: undefined,
  tabIndex: undefined,
  testId: CardWrapper.defaultProps.testId,
  tooltip: undefined,
  titleTextTooltip: undefined,
  footerContent: undefined,
  dateTimeMask: DAYJS_INPUT_FORMATS.RANGE,
  padding: 'default',
  overrides: undefined,
  type: null,
  data: null,
  content: null,
};

/** Dumb component that renders the card basics */
const Card = (props) => {
  const {
    size,
    children,
    title,
    subtitle: subtitleProp,
    hasTitleWrap,
    layout,
    isLoading,
    isEmpty: isEmptyProp,
    isEditable,
    isExpanded,
    isLazyLoading,
    isResizable,
    resizeHandles: wrappingCardResizeHandles,
    error,
    hideHeader,
    id,
    tooltip,
    titleTextTooltip,
    timeRange,
    timeRangeOptions,
    onCardAction,
    availableActions,
    renderExpandIcon,
    renderDateDropdownInPortal,
    breakpoint,
    i18n,
    style,
    className,
    values,
    // TODO: remove deprecated testID prop in v3
    testID,
    testId,
    contentClassName,
    footerContent: CardFooter,
    dateTimeMask,
    extraActions,
    padding,
    overrides,
    // support for instantiate charts based on type
    type,
    data,
    content,
    ...others
  } = props;

  // TODO: remove once final version of range prop is supported
  useEffect(() => {
    if (__DEV__ && typeof availableActions?.range === 'string') {
      warning(
        false,
        'The Card components availableActions.range is an experimental property and may be subject to change.'
      );
    }
  }, [availableActions]);

  const ErrorMessage = overrides?.errorMessage?.component || EmptyState;

  // Checks size property against new size naming convention and reassigns to closest supported size if necessary.
  const newSize = getUpdatedCardSize(size);
  const [cardSize, cardRef] = useSizeObserver();

  const isSmall =
    newSize === CARD_SIZES.SMALL ||
    newSize === CARD_SIZES.SMALLWIDE ||
    newSize === CARD_SIZES.SMALLFULL;
  const isLargeThin = newSize === CARD_SIZES.LARGETHIN;
  const isMediumThin = newSize === CARD_SIZES.MEDIUMTHIN;
  const isSmallOrThin = isSmall || isMediumThin || isLargeThin;

  const dimensions = getCardMinSize(
    breakpoint,
    newSize,
    others.dashboardBreakpoints,
    others.cardDimensions,
    others.rowHeight,
    others.dashboardColumns
  );

  // Need to cache the default available actions so it doesn't rerender
  const mergedAvailableActions = useMemo(
    () => ({
      ...defaultProps.availableActions,
      ...availableActions,
    }),
    [availableActions]
  );

  const hasToolbarActions = Boolean(
    Object.values(mergedAvailableActions).find((action) => action !== false)
  );

  const strings = {
    ...defaultProps.i18n,
    ...i18n,
  };

  const getTheSubtitle = useMemo(() => {
    if (subtitleProp) {
      return subtitleProp;
    }

    if (mergedAvailableActions.range === 'full' || mergedAvailableActions.range === 'iconOnly') {
      const { readableValue } = parseValue(timeRange, dateTimeMask, strings.toLabel);

      return readableValue;
    }

    return undefined;
  }, [dateTimeMask, mergedAvailableActions.range, strings.toLabel, subtitleProp, timeRange]);

  const [subtitle, setSubtitle] = useState(getTheSubtitle);

  useEffect(() => {
    setSubtitle(getTheSubtitle);
  }, [getTheSubtitle, subtitleProp]);

  /** adds the id to the card action */
  const cachedOnCardAction = useCallback(
    (...args) => {
      const [action, value] = args;
      if (action === 'CHANGE_TIME_RANGE' && !subtitleProp) {
        if (value.timeRangeKind === 'PRESET') {
          setSubtitle(value.timeRangeValue.tooltipValue);
        } else if (!value.range) {
          setSubtitle(value.timeRangeValue.humanValue);
        }
      }
      onCardAction(id, ...args);
    },
    [subtitleProp, onCardAction, id]
  );

  const getChildSize = (theSize, cardTitle) => {
    const childSize = {
      ...theSize,
      height:
        cardTitle === null || cardTitle === undefined
          ? theSize.height
          : theSize.height - CARD_TITLE_HEIGHT,
    };
    return childSize;
  };

  if (__DEV__ && titleTextTooltip && tooltip) {
    warning(
      false,
      'The props titleTextTooltip and tooltip cannot be combined. Now using titleTextTooltip'
    );
  }
  if (__DEV__ && titleTextTooltip && hasTitleWrap) {
    warning(
      false,
      'The props titleTextTooltip and hasTitleWrap cannot be combined. Now using titleTextTooltip'
    );
  }

  const visibilityRef = useRef(null);
  const [isVisible] = useVisibilityObserver(visibilityRef, {
    unobserveAfterVisible: true,
  });
  const { resizeHandles, isResizing } = useCardResizing(
    wrappingCardResizeHandles,
    children,
    isResizable
  );

  // support passing the card toolbar through to the custom card
  const cardToolbar = hasToolbarActions ? (
    <CardToolbar
      width={cardSize.width}
      availableActions={mergedAvailableActions}
      renderExpandIcon={renderExpandIcon}
      renderDateDropdownInPortal={renderDateDropdownInPortal}
      i18n={strings}
      isEditable={isEditable}
      isExpanded={isExpanded}
      timeRange={timeRange}
      locale={others.locale}
      timeRangeOptions={timeRangeOptions}
      onCardAction={cachedOnCardAction}
      // TODO: remove deprecated testID prop in v3
      testId={`${testID || testId}-toolbar`}
      dateTimeMask={dateTimeMask}
      extraActions={extraActions}
      id={id}
    />
  ) : null;

  const isSupportedType =
    type === CARD_TYPES.METER_CHART ||
    type === CARD_TYPES.SPARKLINE_CHART ||
    type === CARD_TYPES.STACKED_AREA_CHART;

  // validate if the data is empty or prop says it's empty
  const isCardEmpty = (isSupportedType && isEmpty(data)) || isEmptyProp;

  const card = (
    <CardWrapper
      {...others} // you need all of these to support dynamic positioning during edit
      ref={(node) => {
        if (node) {
          visibilityRef.current = node;
          cardRef(node);
        }
      }}
      // TODO: remove deprecated testID prop in v3
      testId={testID || testId}
      id={id}
      dimensions={dimensions}
      isExpanded={isExpanded}
      style={
        !isExpanded
          ? style
          : {
              height: 'calc(100% - 50px)',
              width: 'calc(100% - 50px)',
            }
      }
      className={classnames(`${iotPrefix}--card`, className, {
        [`${iotPrefix}--card--resizing`]: isResizing,
      })}
    >
      {!hideHeader && (
        <CardHeader
          // TODO: remove deprecated testID prop in v3
          testId={`${testID || testId}-header`}
          hasSubtitle={!!subtitle}
        >
          <CardTitle
            // TODO: remove deprecated testID prop in v3
            id={id}
            hasTitleWrap={hasTitleWrap}
            subtitle={subtitle}
            title={title}
            titleTextTooltip={titleTextTooltip}
            infoIconTooltip={tooltip}
            titleTooltipIconDescription={strings.titleTooltipIconDescription} // To fix accessibility violation.
            testId={`${testID || testId}`}
          />
          {cardToolbar}
        </CardHeader>
      )}
      <CardContent
        // TODO: remove deprecated testID prop in v3
        testId={`${testID || testId}-content`}
        dimensions={dimensions}
        isExpanded={isExpanded}
        className={contentClassName}
        noPadding={padding === 'none'}
        hasFooter={!!CardFooter}
      >
        {!isVisible && isLazyLoading ? ( // if not visible don't show anything
          ''
        ) : isLoading ? (
          <div
            style={{
              '--card-content-padding': `${CARD_CONTENT_PADDING}px`,
            }}
            className={`${iotPrefix}--card--skeleton-wrapper`}
          >
            <OptimizedSkeletonText paragraph lineCount={isSmallOrThin ? 2 : 3} width="100%" />
          </div>
        ) : error ? (
          <ErrorMessage
            icon={isSmall ? '' : 'error'}
            title={strings.errorLoadingDataShortLabel}
            body={error}
            {...overrides?.errorMessage?.props}
          />
        ) : isCardEmpty && !isEditable ? (
          <ErrorMessage
            title={isSmallOrThin ? strings.noDataShortLabel : strings.noDataLabel}
            icon={isSmall ? '' : 'empty'}
            body=""
            {...overrides?.errorMessage?.props}
          />
        ) : isSupportedType ? ( // render card content based on supported type
          // TODO: remove deprecated testID prop in v3
          <CardTypeContent
            testId={testID || testId}
            isExpanded={isExpanded}
            type={type}
            data={data}
            content={content}
          />
        ) : Array.isArray(children) && typeof children?.[0] === 'function' ? ( // pass the measured size down to the children if it's an render function
          [
            // first option is a function
            children?.[0](getChildSize(cardSize, title), {
              cardToolbar,
              ...props,
            }), // second and third options are the resizable handles
            children?.slice(1),
          ]
        ) : typeof children === 'function' ? (
          children?.(getChildSize(cardSize, title), {
            cardToolbar,
            ...props,
          })
        ) : (
          children
        )}
      </CardContent>
      {CardFooter ? (
        <div
          className={`${iotPrefix}--card--footer--wrapper`}
          data-testid={`${testID || testId}-footer`}
        >
          <CardFooter />
        </div>
      ) : null}
      {resizeHandles}
    </CardWrapper>
  );

  return isExpanded ? (
    <div
      data-floating-menu-container // needed to place overflow floating menus within the modal so we can control them through css
      className={`${prefix}--modal is-visible`}
    >
      {card}
    </div>
  ) : (
    card
  );
};

Card.propTypes = CardPropTypes;
Card.defaultProps = defaultProps;

export default Card;
