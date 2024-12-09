import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { omit, keyBy } from 'lodash-es';
import { Close16, Popup16, Settings16 } from '@carbon/icons-react';
import { OverflowMenu, OverflowMenuItem } from 'carbon-components-react';
import classnames from 'classnames';
import { useLangDirection } from 'use-lang-direction';

import { settings } from '../../constants/Settings';
import { TimeRangeOptionsPropTypes } from '../../constants/CardPropTypes';
import { CARD_ACTIONS } from '../../constants/LayoutConstants';
import DateTimePicker, {
  DateTimePickerDefaultValuePropTypes,
} from '../DateTimePicker/DateTimePickerV2WithoutTimeSpinner';
import Button from '../Button';
import { PRESET_VALUES } from '../../constants/DateConstants';
import { DAYJS_INPUT_FORMATS } from '../../utils/dayjs';

import CardRangePicker, { CardRangePickerPropTypes } from './CardRangePicker';

const { iotPrefix, prefix } = settings;

export const ToolbarSVGWrapper = (props) => {
  return (
    <Button
      kind="ghost"
      className={classnames(
        `${iotPrefix}--card--toolbar-action`,
        `${iotPrefix}--card--toolbar-svg-wrapper`,
        `${prefix}--btn--icon-only` // can't actually use the hasIconOnly prop because we don't want the tooltip
      )}
      {...props}
      size="sm"
    />
  );
};

const propTypes = {
  /** set of available actions for the card */
  availableActions: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.bool, PropTypes.string]))
    .isRequired,
  /** is the card editable */
  isEditable: PropTypes.bool,
  /** is the card expanded */
  isExpanded: PropTypes.bool,
  /**
   * Define the icon render to be rendered.
   * Can be a React component class
   */
  renderExpandIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  className: PropTypes.string,
  ...omit(CardRangePickerPropTypes, 'onClose'),
  /** Generates the available time range selection options. Each option should include 'this' or 'last'.
   * i.e. { thisWeek: 'This week', lastWeek: 'Last week'}
   */
  timeRange: PropTypes.oneOfType([
    CardRangePickerPropTypes.timeRange,
    DateTimePickerDefaultValuePropTypes,
  ]),
  timeRangeOptions: TimeRangeOptionsPropTypes, // eslint-disable-line react/require-default-props
  i18n: PropTypes.shape({
    last24Hours: PropTypes.string,
    last7Days: PropTypes.string,
    lastMonth: PropTypes.string,
    lastQuarter: PropTypes.string,
    lastYear: PropTypes.string,
    thisWeek: PropTypes.string,
    thisMonth: PropTypes.string,
    thisQuarter: PropTypes.string,
    thisYear: PropTypes.string,
    overflowMenuDescription: PropTypes.string,
    cloneCardLabel: PropTypes.string,
    deleteCardLabel: PropTypes.string,
    closeLabel: PropTypes.string,
    expandLabel: PropTypes.string,
    settingsLabel: PropTypes.string,
    extraActionLabel: PropTypes.string,
  }),
  testId: PropTypes.string,
  locale: PropTypes.string,
  dateTimeMask: PropTypes.string,
  /** If set to true it will render outside of the current DOM in a portal, otherwise render as a child */
  renderDateDropdownInPortal: PropTypes.bool,
};

const defaultProps = {
  isEditable: false,
  isExpanded: false,
  renderExpandIcon: Popup16,
  className: null,
  locale: 'en',
  timeRangeOptions: null,
  timeRange: null,
  i18n: {
    last24Hours: 'Last 24 hours',
    last7Days: 'Last 7 days',
    lastMonth: 'Last month',
    lastQuarter: 'Last quarter',
    lastYear: 'Last year',
    thisWeek: 'This week',
    thisMonth: 'This month',
    thisQuarter: 'This quarter',
    thisYear: 'This year',
    overflowMenuDescription: 'Card actions menu',
    cloneCardLabel: 'Clone card',
    deleteCardLabel: 'Delete card',
    closeLabel: 'Close',
    expandLabel: 'Expand',
    settingsLabel: 'Settings',
    extraActionLabel: 'Action Label',
  },
  testId: 'card-toolbar',
  dateTimeMask: DAYJS_INPUT_FORMATS.RANGE,
  renderDateDropdownInPortal: true,
};

const CardToolbar = ({
  i18n,
  width,
  isEditable,
  isExpanded,
  renderExpandIcon,
  availableActions,
  timeRange,
  timeRangeOptions: timeRangeOptionsProp,
  onCardAction,
  className,
  testId,
  locale,
  dateTimeMask,
  extraActions,
  renderDateDropdownInPortal,
}) => {
  const mergedI18n = { ...defaultProps.i18n, ...i18n };
  const langDir = useLangDirection();
  const overflowMenuPosition = React.useMemo(() => langDir === 'ltr', [langDir]);
  // maps the timebox internal label to a translated string
  // Need the default here in case that the CardToolbar is used by multiple different components
  // Also needs to reassign itself if i18n changes
  const timeRangeOptions = useMemo(
    () =>
      timeRangeOptionsProp ||
      (typeof availableActions?.range === 'string' // if we're using date time picker default to those options
        ? keyBy(PRESET_VALUES, 'id')
        : {
            last24Hours: mergedI18n.last24HoursLabel,
            last7Days: mergedI18n.last7DaysLabel,
            lastMonth: mergedI18n.lastMonthLabel,
            lastQuarter: mergedI18n.lastQuarterLabel,
            lastYear: mergedI18n.lastYearLabel,
            thisWeek: mergedI18n.thisWeekLabel,
            thisMonth: mergedI18n.thisMonthLabel,
            thisQuarter: mergedI18n.thisQuarterLabel,
            thisYear: mergedI18n.thisYearLabel,
          }),
    [
      availableActions,
      mergedI18n.last24HoursLabel,
      mergedI18n.last7DaysLabel,
      mergedI18n.lastMonthLabel,
      mergedI18n.lastQuarterLabel,
      mergedI18n.lastYearLabel,
      mergedI18n.thisMonthLabel,
      mergedI18n.thisQuarterLabel,
      mergedI18n.thisWeekLabel,
      mergedI18n.thisYearLabel,
      timeRangeOptionsProp,
    ]
  );

  const handleDateTimePickerChange = useCallback(
    (selectedValue) => {
      onCardAction('CHANGE_TIME_RANGE', selectedValue);
    },
    [onCardAction]
  );

  const extraActionSlot =
    extraActions && Object.keys(extraActions).length !== 0 ? (
      extraActions.children && extraActions.children.length ? (
        <OverflowMenu
          menuOptionsClass={`${iotPrefix}--card--toolbar__overflow-menu`}
          flipped={overflowMenuPosition}
          title={extraActions.iconDescription || mergedI18n.overflowMenuDescription}
          iconDescription={extraActions.iconDescription || mergedI18n.overflowMenuDescription}
          {...(extraActions.icon ? { renderIcon: extraActions.icon } : {})}
        >
          {extraActions.children.map((child, i) =>
            !child.hidden ? (
              <OverflowMenuItem
                data-testid={`${testId}-extra-overflow-menu-item-${i}`}
                key={`${child.id}-${i}`}
                itemText={child.itemText}
                disabled={child.disabled}
                onClick={() => (child.callback ? child.callback(child) : null)}
                requireTitle
              />
            ) : null
          )}
        </OverflowMenu>
      ) : extraActions.icon ? (
        <ToolbarSVGWrapper
          title={extraActions.iconDescription || mergedI18n.extraActionLabel}
          onClick={() => (extraActions.callback ? extraActions.callback(extraActions) : null)}
          renderIcon={extraActions.icon}
          testId={`${testId}-extra-single-action`}
          disabled={extraActions.disabled}
        />
      ) : extraActions.content ? (
        <div
          className={`${iotPrefix}--card--toolbar-action--custom-actions`}
          data-testid={`${testId}-extra-actions`}
        >
          {extraActions.content}
        </div>
      ) : null
    ) : null;

  return isEditable ? (
    <div data-testid={testId} className={classnames(className, `${iotPrefix}--card--toolbar`)}>
      {(availableActions.clone || availableActions.delete) && (
        <OverflowMenu
          flipped={overflowMenuPosition}
          title={mergedI18n.overflowMenuDescription}
          iconDescription={mergedI18n.overflowMenuDescription}
        >
          {availableActions.clone && (
            <OverflowMenuItem
              onClick={() => {
                onCardAction(CARD_ACTIONS.CLONE_CARD);
              }}
              itemText={mergedI18n.cloneCardLabel}
              title={mergedI18n.cloneCardLabel}
              requireTitle
              data-testid={`${testId}-clone-button`}
            />
          )}
          {availableActions.delete && (
            <OverflowMenuItem
              isDelete
              onClick={() => {
                onCardAction(CARD_ACTIONS.DELETE_CARD);
              }}
              itemText={mergedI18n.deleteCardLabel}
              title={mergedI18n.deleteCardLabel}
              requireTitle
              data-testid={`${testId}-delete-button`}
            />
          )}
        </OverflowMenu>
      )}
    </div>
  ) : (
    <div data-testid={testId} className={classnames(className, `${iotPrefix}--card--toolbar`)}>
      {availableActions.range ? (
        typeof availableActions.range === 'boolean' ? ( // boolean is the old range picker
          <CardRangePicker
            width={width}
            i18n={mergedI18n}
            timeRange={timeRange}
            timeRangeOptions={timeRangeOptions}
            onCardAction={onCardAction}
            cardWidth={width}
            testId={`${testId}-range-picker`}
          />
        ) : (
          // string values mean use the new picker
          <DateTimePicker
            id={testId}
            i18n={mergedI18n}
            dateTimeMask={dateTimeMask}
            locale={locale}
            hasIconOnly
            presets={Object.entries(timeRangeOptions).reduce(
              (acc, [timeRangeOptionKey, timeRangeOption]) => {
                acc.push({
                  id: timeRangeOptionKey,
                  label: timeRangeOption.label || mergedI18n.timeRange,
                  offset: timeRangeOption.offset,
                });
                return acc;
              },
              []
            )}
            defaultValue={timeRange}
            onApply={handleDateTimePickerChange}
            renderInPortal={renderDateDropdownInPortal}
          />
        )
      ) : null}
      {availableActions.settings ? (
        <ToolbarSVGWrapper
          title={mergedI18n.settingsLabel}
          onClick={() => onCardAction(CARD_ACTIONS.ON_SETTINGS_CLICK)}
          iconDescription={mergedI18n.settingsLabel}
          renderIcon={Settings16}
          testId={`${testId}-settings-button`}
        />
      ) : null}
      {availableActions.expand ? (
        <>
          {isExpanded ? (
            <>
              {availableActions.extra ? extraActionSlot : null}
              <ToolbarSVGWrapper
                title={mergedI18n.closeLabel}
                onClick={() => onCardAction(CARD_ACTIONS.CLOSE_EXPANDED_CARD)}
                iconDescription={mergedI18n.closeLabel}
                renderIcon={Close16}
                testId={`${testId}-close-button`}
              />
            </>
          ) : (
            <ToolbarSVGWrapper
              title={mergedI18n.expandLabel}
              onClick={() => {
                onCardAction(CARD_ACTIONS.OPEN_EXPANDED_CARD);
              }}
              iconDescription={mergedI18n.expandLabel}
              renderIcon={renderExpandIcon}
              testId={`${testId}-expand-button`}
            />
          )}
        </>
      ) : null}
      {!isExpanded && availableActions.extra ? extraActionSlot : null}
    </div>
  );
};

CardToolbar.propTypes = propTypes;
CardToolbar.defaultProps = defaultProps;
export default CardToolbar;
