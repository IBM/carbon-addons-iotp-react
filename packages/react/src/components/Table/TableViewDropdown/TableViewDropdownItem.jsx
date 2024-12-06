import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { View } from '@carbon/react/icons';

import { settings } from '../../../constants/Settings';

import TableViewItemPropType from './TableViewItemPropTypes';

const { iotPrefix } = settings;

const propTypes = {
  isCompact: PropTypes.bool.isRequired,
  activeViewEdited: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  item: TableViewItemPropType.isRequired,
  i18n: PropTypes.shape({
    view: PropTypes.string,
    edited: PropTypes.string,
  }).isRequired,
  testID: PropTypes.string,
};
const defaultProps = {
  testID: 'TableViewDropdownItem',
};

const TableViewDropdownItem = ({
  item: { customAction, text, icon: Icon, tooltip },
  isSelected,
  activeViewEdited,
  i18n,
  isCompact,
  testID,
}) => {
  const showEdited = isSelected && activeViewEdited && !customAction;
  const editedPostfix = ` - ${i18n.edited}`;
  return (
    <div
      data-testid={testID}
      title={`${tooltip || text}${showEdited ? editedPostfix : ''}`}
      className={classNames(`${iotPrefix}--view-dropdown__item`, {
        [`${iotPrefix}--view-dropdown__item-link`]: customAction,
      })}
    >
      {isSelected && !isCompact ? (
        <span className={`${iotPrefix}--view-dropdown__button-prefix`}>
          <View size={20} />
          <span>{`${i18n.view}: `}</span>
        </span>
      ) : null}
      <span>
        {text}
        {showEdited ? (
          <span className={`${iotPrefix}--view-dropdown__edited-text`}>{editedPostfix}</span>
        ) : null}
      </span>
      {Icon && !isCompact ? (
        <Icon
          className={classNames({
            [`${iotPrefix}--view-dropdown__item-link-icon`]: customAction,
          })}
        />
      ) : null}
    </div>
  );
};

TableViewDropdownItem.propTypes = propTypes;
TableViewDropdownItem.defaultProps = defaultProps;

export default TableViewDropdownItem;
