import { TextInput } from '@carbon/react';
import * as React from 'react';
import PropTypes from 'prop-types';

import { RulesPropType } from './RuleBuilderPropTypes';

const propTypes = {
  rule: RulesPropType.isRequired,
  onChange: PropTypes.func.isRequired,
  renderColumnField: PropTypes.func,
  renderOperandField: PropTypes.func,
  i18n: PropTypes.shape({
    valuePlaceholder: PropTypes.string,
  }),
};

const defaultProps = {
  renderColumnField: undefined,
  renderOperandField: undefined,
  i18n: {
    valuePlaceholder: 'Enter a value',
  },
};

const RuleValueField = ({ rule, onChange, renderColumnField, renderOperandField, i18n }) => {
  if (renderOperandField) {
    return renderOperandField({ value: rule.value, onChange });
  }

  if (renderColumnField) {
    return renderColumnField({ value: rule.value, onChange });
  }

  return (
    <TextInput
      id={`${rule.id}-value`}
      placeholder={i18n.valuePlaceholder}
      light
      labelText=""
      defaultValue={rule.value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={`${rule.id}-value`}
    />
  );
};

RuleValueField.propTypes = propTypes;
RuleValueField.defaultProps = defaultProps;

export default RuleValueField;
