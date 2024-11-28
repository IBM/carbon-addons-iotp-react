/* eslint-disable react/button-has-type */
/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { ArrowUp, ArrowDown, ArrowsVertical as Arrows } from '@carbon/react/icons';

import { settings } from '../../../constants/Settings';
import { handleSpecificKeyDown } from '../../../utils/componentUtilityFunctions';

export const sortStates = {
  NONE: 'NONE',
  DESC: 'DESC',
  ASC: 'ASC',
};

const { prefix, iotPrefix } = settings;

export const translationKeys = {
  iconDescription: 'carbon.table.header.icon.description',
};

export const translateWithId = (key, { sortDirection, isSortHeader }) => {
  if (key === translationKeys.iconDescription) {
    if (isSortHeader) {
      // When transitioning, we know that the sequence of states is as follows:
      // NONE -> ASC -> DESC -> NONE
      if (sortDirection === sortStates.NONE) {
        return 'Sort rows by this header in ascending order';
      }
      if (sortDirection === sortStates.ASC) {
        return 'Sort rows by this header in descending order';
      }

      return 'Un sort rows by this header';
    }
    return 'Sort rows by this header in ascending order';
  }

  return '';
};

const sortDirections = {
  [sortStates.NONE]: 'none',
  [sortStates.ASC]: 'ascending',
  [sortStates.DESC]: 'descending',
};

const TableHeader = React.forwardRef(function TableHeader(
  {
    className: headerClassName,
    children,
    isSortable,
    isSortHeader,
    // eslint-disable-next-line react/prop-types
    onClick,
    scope,
    hasMultiSort,
    hasOverflow,
    hasTooltip,
    sortDirection,
    translateWithId: t,
    thStyle,
    initialWidth,
    testId,
    spanGroupRow,
    rowSpan: rowSpanProp,
    ...rest
  },
  ref
) {
  const rowSpan = rowSpanProp ?? spanGroupRow ? '2' : undefined;
  const headerClassNames = classnames(headerClassName, {
    [`${iotPrefix}--table-header--span-group-row`]: spanGroupRow,
  });

  if (!isSortable) {
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <th
        {...rest}
        rowSpan={rowSpan}
        data-testid={testId}
        width={initialWidth}
        className={headerClassNames}
        scope={scope}
        ref={ref}
        style={thStyle}
      >
        {!hasTooltip ? (
          <span className={`${prefix}--table-header-label`}>{children}</span>
        ) : (
          children
        )}
      </th>
    );
  }

  const className = classnames(headerClassName, {
    [`${prefix}--table-sort`]: true,
    [`${prefix}--table-sort--active`]: isSortHeader && sortDirection !== sortStates.NONE,
    [`${prefix}--table-sort--ascending`]: isSortHeader && sortDirection === sortStates.DESC,
  });
  const ariaSort = !isSortHeader ? 'none' : sortDirections[sortDirection];
  const ButtonTag = hasMultiSort || hasOverflow ? `a` : `button`;
  const buttonProps =
    hasMultiSort || hasOverflow
      ? {
          role: 'button',
          tabIndex: 0,
          className,
          onClick,
          onKeyDown: handleSpecificKeyDown(['Enter', 'Space'], onClick),
          ...rest,
        }
      : {
          className,
          onClick,
          ...rest,
        };

  return (
    <th
      rowSpan={rowSpan}
      width={initialWidth}
      scope={scope}
      className={headerClassNames}
      aria-sort={ariaSort}
      ref={ref}
      style={thStyle}
      data-testid={testId}
    >
      <ButtonTag {...buttonProps}>
        {!hasTooltip ? (
          <span className={`${prefix}--table-header-label`}>{children}</span>
        ) : (
          children
        )}
        {sortDirection === sortStates.ASC ? (
          <ArrowUp
            className={`${prefix}--table-sort__icon`}
            aria-label={t('carbon.table.header.icon.description', {
              header: children,
              sortDirection,
              isSortHeader,
              sortStates,
            })}
          />
        ) : null}
        {sortDirection === sortStates.DESC ? (
          <ArrowDown
            className={`${prefix}--table-sort__icon`}
            aria-label={t('carbon.table.header.icon.description', {
              header: children,
              sortDirection,
              isSortHeader,
              sortStates,
            })}
          />
        ) : null}
        <Arrows
          className={`${prefix}--table-sort__icon-unsorted`}
          aria-label={t('carbon.table.header.icon.description', {
            header: children,
            sortDirection,
            isSortHeader,
            sortStates,
          })}
        />
      </ButtonTag>
    </th>
  );
});

TableHeader.propTypes = {
  /**
   * Specify an optional className to be applied to the container node
   */
  className: PropTypes.string,

  /**
   * Pass in children that will be embedded in the table header label
   */
  children: PropTypes.node,

  /**
   * True if the header must span the column group row.
   */
  spanGroupRow: PropTypes.bool,

  hasOverflow: PropTypes.bool,

  hasMultiSort: PropTypes.bool,

  /** does the header have a tooltip, if so do not truncate */
  hasTooltip: PropTypes.bool,
  /**
   * The initial width of the column when hasResize:true. The fixed width
   * if hasResize:false. E.g. '200px'
   */
  initialWidth: PropTypes.string,

  /**
   * Specify whether this header is one through which a user can sort the table
   */
  isSortable: PropTypes.bool,

  /**
   * Specify whether this header is the header by which a table is being sorted
   * by
   */
  isSortHeader: PropTypes.bool,

  /**
   * Hook that is invoked when the header is clicked
   */
  onClick: PropTypes.func,

  /** Applies the HTML attribute rowspan with the number provided */
  rowSpan: PropTypes.number,

  /**
   * Specify the scope of this table header. You can find more info about this
   * attribute at the following URL:
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-scope
   */
  scope: PropTypes.string,

  /**
   * Specify which direction we are currently sorting by, should be one of DESC,
   * NONE, or ASC.
   */
  sortDirection: PropTypes.oneOf(Object.values(sortStates)),

  /**
   * Supply a method to translate internal strings with your i18n tool of
   * choice. Translation keys are available on the `translationKeys` field for
   * this component.
   */
  translateWithId: PropTypes.func,

  // eslint-disable-next-line react/forbid-prop-types
  thStyle: PropTypes.object,

  testId: PropTypes.string,
};

/* istanbul ignore next: ignoring the default onClick */
TableHeader.defaultProps = {
  className: '',
  children: '',
  spanGroupRow: false,
  isSortHeader: false,
  hasTooltip: false,
  hasOverflow: false,
  hasMultiSort: false,
  isSortable: false,
  rowSpan: undefined,
  sortDirection: 'NONE',
  onClick: (onClick) => `${onClick}`,
  scope: 'col',
  translateWithId,
  thStyle: {},
  initialWidth: undefined,
  testId: '',
};

TableHeader.translationKeys = Object.values(translationKeys);

TableHeader.displayName = 'TableHeader';

export default TableHeader;
