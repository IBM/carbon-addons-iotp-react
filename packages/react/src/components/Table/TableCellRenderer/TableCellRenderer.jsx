import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { DefinitionTooltip } from '@carbon/react';
import warning from 'warning';

import { Tooltip } from '../../Tooltip';
import { settings } from '../../../constants/Settings';
import { WrapCellTextPropTypes } from '../../../constants/SharedPropTypes';

const { iotPrefix } = settings;

const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.bool,
    PropTypes.object,
    PropTypes.array,
  ]),
  wrapText: WrapCellTextPropTypes.isRequired,
  truncateCellText: PropTypes.bool.isRequired,
  allowTooltip: PropTypes.bool,
  /** What locale should the number be rendered in */
  locale: PropTypes.string,
  renderDataFunction: PropTypes.func,
  columnId: PropTypes.string,
  rowId: PropTypes.string,
  row: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.node, PropTypes.bool, PropTypes.object, PropTypes.array])
  ),
  /** use white-space: pre; css when true */
  preserveCellWhiteSpace: PropTypes.bool,
  tooltipDirection: PropTypes.string,
};

const defaultProps = {
  row: null,
  children: null,
  allowTooltip: true,
  locale: null,
  renderDataFunction: null,
  columnId: null,
  rowId: null,
  preserveCellWhiteSpace: false,
};

const isElementTruncated = (element) => element.offsetWidth < element.scrollWidth;

const renderCustomCell = (renderDataFunction, args, className) => {
  const result = renderDataFunction(args);
  const title = typeof result === 'string' ? result : undefined;
  return (
    <span className={className} title={title}>
      {result}
    </span>
  );
};

/** Supports our default render decisions for primitive values */
const TableCellRenderer = ({
  tooltipDirection,
  children,
  wrapText,
  allowTooltip,
  truncateCellText,
  locale,
  tooltip,
  renderDataFunction,
  columnId,
  rowId,
  row,
  isSortable,
  sortFunction,
  isFilterable,
  filterFunction,
  preserveCellWhiteSpace,
}) => {
  const mySpanRef = React.createRef();
  const myClasses = classnames({
    [`${iotPrefix}--table__cell-text--truncate`]: wrapText !== 'always' && truncateCellText,
    [`${iotPrefix}--table__cell-text--no-wrap`]: wrapText === 'never' || wrapText === 'expand',
    [`${iotPrefix}--table__cell-text--preserve`]: preserveCellWhiteSpace,
  });

  const [useTooltip, setUseTooltip] = useState(false);

  const withTooltip = (element, tooltipForExtraInformation) => {
    return tooltip ? (
      <DefinitionTooltip
        triggerClassName={`${iotPrefix}--table__cell-tooltip`}
        tooltipText={tooltipForExtraInformation}
        id="table-header-tooltip"
        align={tooltipDirection}
        openOnHover
      >
        {element}
      </DefinitionTooltip>
    ) : (
      <Tooltip
        showIcon={false}
        triggerText={element}
        triggerId="table-cell-tooltip-trigger"
        tooltipId="table-cell-tooltip"
      >
        {element}
      </Tooltip>
    );
  };

  useEffect(() => {
    const canBeTruncated =
      typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean';
    if (canBeTruncated && truncateCellText && allowTooltip && mySpanRef && mySpanRef.current) {
      setUseTooltip(isElementTruncated(mySpanRef.current));
    }
  }, [mySpanRef, children, wrapText, truncateCellText, allowTooltip]);

  if (__DEV__) {
    const isObject =
      !React.isValidElement(children) && typeof children === 'object' && children !== null;
    const missingRender = isObject && typeof renderDataFunction !== 'function';
    const missingSort = isObject && isSortable && typeof sortFunction !== 'function';
    const missingFilter = isObject && isFilterable && typeof filterFunction !== 'function';
    warning(
      !missingRender,
      `You must supply a 'renderDataFunction' when passing objects as column values.`
    );

    warning(
      !missingSort,
      `You must supply a 'sortFunction' when isSortable is true and you're passing objects as column values.`
    );

    warning(
      !missingFilter,
      `You must supply a 'filterFunction' when passing objects as column values and want them filterable.`
    );
  }
  const cellContent = renderDataFunction ? (
    renderCustomCell(renderDataFunction, { value: children, columnId, rowId, row }, myClasses)
  ) : typeof children === 'string' || typeof children === 'number' ? (
    <span
      className={myClasses}
      title={
        useTooltip || tooltip
          ? undefined
          : typeof children === 'number' && locale
          ? children.toLocaleString(locale, { maximumFractionDigits: 20 })
          : children
      }
      ref={mySpanRef}
    >
      {typeof children === 'number' && locale
        ? children.toLocaleString(locale, { maximumFractionDigits: 20 })
        : children}
    </span>
  ) : typeof children === 'boolean' ? ( // handle booleans
    <span className={myClasses} title={useTooltip || tooltip ? undefined : children.toString()}>
      {children.toString()}
    </span>
  ) : typeof children === 'object' && !React.isValidElement(children) ? null : (
    children
  );

  return useTooltip || tooltip ? withTooltip(cellContent, tooltip) : cellContent;
};

TableCellRenderer.propTypes = propTypes;
TableCellRenderer.defaultProps = defaultProps;

export default TableCellRenderer;
