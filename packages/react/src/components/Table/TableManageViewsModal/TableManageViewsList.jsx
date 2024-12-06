import React from 'react';
import PropTypes from 'prop-types';
import { TrashCan, Edit } from '@carbon/react/icons';
import { Tag } from '@carbon/react';

import { settings } from '../../../constants/Settings';
import { OverridePropTypes } from '../../../constants/SharedPropTypes';
import List from '../../List/List';
import Button from '../../Button';
import { SimplePaginationPropTypes } from '../../SimplePagination/SimplePagination';
import deprecate from '../../../internal/deprecate';

import { ViewsPropType } from './SharedTableManageViewsModalPropTypes';

const { iotPrefix } = settings;

const renderButton = (id, onClick, icon, key, iconText) => (
  <Button
    key={key}
    testId={key}
    hasIconOnly
    iconDescription={iconText}
    kind="ghost"
    onClick={() => {
      onClick(id);
    }}
    renderIcon={icon}
    size="sm"
    tooltipAlignment="center"
    tooltipPosition="left"
  />
);

const getRowActions = (
  { id, isEditable, isDeleteable },
  { onEdit, onDelete, i18n: { editIconText, deleteIconText }, testID }
) => {
  const rowActions = [];
  if (isEditable) {
    const editItemKey = `${testID}-row-action-${id}-edit`;
    const editButton = renderButton(id, onEdit, Edit, editItemKey, editIconText);
    rowActions.push(editButton);
  }
  if (isDeleteable) {
    const deleteItemKey = `${testID}-row-action-${id}-delete`;
    const deleteButton = renderButton(id, onDelete, TrashCan, deleteItemKey, deleteIconText);
    rowActions.push(deleteButton);
  }
  return rowActions;
};

const getRowDescription = ({ description }) => description;

const getRowTags = ({ id }, { defaultViewId, i18n: { defaultLabelText } }) =>
  id === defaultViewId
    ? [
        <Tag type="blue" key="defaultTag">
          {defaultLabelText}
        </Tag>,
      ]
    : undefined;

const getRowTitle = ({ title, isPublic }, publicLabelText, privateLabelText) =>
  `${title} (${isPublic ? publicLabelText : privateLabelText})`;

const propTypes = {
  /** The ID of the view that should be marked as default */
  defaultViewId: PropTypes.string,
  /** Internationalisation strings */
  i18n: PropTypes.shape({
    listTitle: PropTypes.string,
    privateLabelText: PropTypes.string,
    publicLabelText: PropTypes.string,
  }).isRequired,
  /** optional skeleton to be rendered while loading data */
  isLoading: PropTypes.bool,
  /** Used to overide the internal components and props for advanced customisation */
  overrides: PropTypes.shape({
    list: OverridePropTypes,
  }),
  /** SimplePagination at the bottom of list */
  pagination: PropTypes.shape(SimplePaginationPropTypes),
  /** Render prop that takes a view and the props obj and returns the rendered actions in an array */
  rowActionsRenderer: PropTypes.func,
  /** Render prop that takes a view and props obj and returns the rendered tags in an array */
  rowTagsRenderer: PropTypes.func,
  /** Function prop that takes a view, public label and private label and returns the title as a string */
  rowTitleInterpolation: PropTypes.func,
  /** Function prop that takes a view and returns the description as a string */
  rowDescriptionInterpolation: PropTypes.func,
  // TODO: remove deprecated 'testID' in v3
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  /** Id that can be used for testing */
  testId: PropTypes.string,
  /** The views to currently be displayed */
  views: ViewsPropType.isRequired,
};

const defaultProps = {
  defaultViewId: undefined,
  isLoading: false,
  overrides: undefined,
  pagination: undefined,
  rowActionsRenderer: undefined,
  rowDescriptionInterpolation: undefined,
  rowTagsRenderer: undefined,
  rowTitleInterpolation: undefined,
  testId: 'TableManageViewsList',
};

const TableManageViewsList = ({
  defaultViewId,
  i18n: { listTitle, privateLabelText, publicLabelText, ...i18n },
  isLoading,
  overrides,
  pagination,
  rowActionsRenderer = getRowActions,
  rowDescriptionInterpolation = getRowDescription,
  rowTagsRenderer = getRowTags,
  rowTitleInterpolation = getRowTitle,
  testID,
  testId,
  views,
  ...props
}) => {
  const MyList = overrides?.list?.component || List;

  const listItems = views.map((view) => {
    const { id } = view;
    return {
      content: {
        rowActions: () => rowActionsRenderer(view, { ...props, i18n, testID }),
        secondaryValue: rowDescriptionInterpolation(view),
        tags: rowTagsRenderer(view, { ...props, defaultViewId, i18n }),
        value: rowTitleInterpolation(view, publicLabelText, privateLabelText),
      },
      id,
    };
  });

  return (
    <MyList
      testID={testID || testId}
      className={`${iotPrefix}--manage-views-list`}
      isFullHeight
      isLargeRow
      isLoading={isLoading}
      items={listItems}
      title={listTitle}
      pagination={pagination}
      {...overrides?.list?.props}
    />
  );
};

TableManageViewsList.propTypes = propTypes;
TableManageViewsList.defaultProps = defaultProps;

export default TableManageViewsList;
