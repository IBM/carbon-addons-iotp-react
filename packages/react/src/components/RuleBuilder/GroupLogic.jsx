import { Dropdown } from '@carbon/react';
import * as React from 'react';
import PropTypes from 'prop-types';

import { settings } from '../../constants/Settings';

const { iotPrefix } = settings;

const defaultProps = {
  i18n: {
    all: 'ALL',
    any: 'ANY',
    areTrueStatement: ' of the following are true',
  },
  selected: undefined,
  onChange: () => {},
};

const propTypes = {
  id: PropTypes.string.isRequired,
  i18n: PropTypes.shape({
    all: PropTypes.string,
    any: PropTypes.string,
    areTrueStatement: PropTypes.string,
  }),
  selected: PropTypes.string,
  onChange: PropTypes.func,
};

const GroupLogic = ({ id, i18n, selected, onChange }) => {
  const mergedI18n = React.useMemo(
    () => ({
      ...defaultProps.i18n,
      ...(i18n ?? {}),
    }),
    [i18n]
  );

  const groupLogic = React.useMemo(
    () => [
      {
        id: 'ALL',
        name: mergedI18n.all,
      },
      {
        id: 'ANY',
        name: mergedI18n.any,
      },
    ],
    [mergedI18n.all, mergedI18n.any]
  );

  const initialSelectedItem = React.useMemo(() => {
    const found = groupLogic.find(({ id: logicId }) => logicId === selected);

    if (found) {
      return found;
    }

    return groupLogic && groupLogic[0];
  }, [groupLogic, selected]);

  return (
    <div>
      <div className={`${iotPrefix}--rule-builder-header__dropdown`}>
        <Dropdown
          id={id}
          light
          itemToString={(item) => item.name}
          items={groupLogic}
          label={initialSelectedItem.name}
          initialSelectedItem={initialSelectedItem}
          onChange={onChange}
          data-testid={`${id}-group-logic-dropdown`}
        />
      </div>

      <span>{mergedI18n.areTrueStatement}</span>
    </div>
  );
};

GroupLogic.defaultProps = defaultProps;
GroupLogic.propTypes = propTypes;

export default GroupLogic;
