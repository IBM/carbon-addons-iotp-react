import * as React from 'react';
import { Add, TextNewLine } from '@carbon/react/icons';
import PropTypes from 'prop-types';

import Button from '../Button';
import { settings } from '../../constants/Settings';
import deprecate from '../../internal/deprecate';

import GroupLogic from './GroupLogic';
import { GroupLogicPropType } from './RuleBuilderPropTypes';

const { iotPrefix } = settings;

const defaultProps = {
  i18n: {
    addRule: 'Add rule',
    addGroup: 'Add group',
  },
  // the default logic for the primary rule builder group. Can be ALL or ANY
  groupLogic: 'ALL',
  testId: 'rule-builder-header',
};

const propTypes = {
  id: PropTypes.string.isRequired,
  groupLogic: GroupLogicPropType,
  i18n: PropTypes.shape({
    addRule: PropTypes.string,
    addGroup: PropTypes.string,
  }),
  onAddRule: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  // TODO: remove the deprecated 'testID' in v3.
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
};

const RuleBuilderHeader = ({ id, onAddRule, onChange, i18n, groupLogic, testID, testId }) => {
  const mergedI18n = React.useMemo(
    () => ({
      ...defaultProps.i18n,
      ...(i18n ?? {}),
    }),
    [i18n]
  );

  const handleChangeGroupLogic = React.useCallback(
    ({ selectedItem }) => {
      onChange(
        {
          id,
          groupLogic: selectedItem.id,
        },
        true
      );
    },
    [id, onChange]
  );
  return (
    <div
      // TODO: remove the deprecated 'testID' in v3.
      data-testid={testID || testId}
      className={`${iotPrefix}--rule-builder-header`}
    >
      <GroupLogic id={id} selected={groupLogic} onChange={handleChangeGroupLogic} />
      <div className={`${iotPrefix}--rule-builder-header__buttons`}>
        <Button
          // TODO: remove the deprecated 'testID' in v3.
          testId={`${testID || testId}-add-rule-button`}
          kind="ghost"
          renderIcon={(props) => <Add size={32} {...props} />}
          onClick={onAddRule()}
        >
          {mergedI18n.addRule}
        </Button>
        <Button
          // TODO: remove the deprecated 'testID' in v3.
          testId={`${testID || testId}-add-group-button`}
          kind="ghost"
          renderIcon={(props) => <TextNewLine size={32} {...props} />}
          onClick={onAddRule(undefined, true)}
        >
          {mergedI18n.addGroup}
        </Button>
      </div>
    </div>
  );
};

RuleBuilderHeader.defaultProps = defaultProps;
RuleBuilderHeader.propTypes = propTypes;
export default RuleBuilderHeader;
