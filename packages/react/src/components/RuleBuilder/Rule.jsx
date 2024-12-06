import * as React from 'react';
import { Dropdown } from '@carbon/react';
import { Add, Subtract, TextNewLine } from '@carbon/react/icons';
import PropTypes from 'prop-types';

import { settings } from '../../constants/Settings';
import Button from '../Button';

import GroupLogic from './GroupLogic';
import {
  RuleBuilderColumnsPropType,
  RuleGroupPropType,
  RulesPropType,
} from './RuleBuilderPropTypes';
import RuleValueField from './RuleValueField';

const { iotPrefix } = settings;

const defaultProps = {
  i18n: {
    all: 'ALL',
    any: 'ANY',
    contains: 'Contains',
    lessThan: 'Less than',
    lessThanOrEqual: 'Less than or equal to',
    notEqual: 'Not equal',
    equals: 'Equals',
    greaterThanOrEqual: 'Greater than or equal to',
    greaterThan: 'Greater than',
    selectAColumn: 'Select a column',
    selectAnOperand: 'Select an operand',
  },
};

const propTypes = {
  rule: PropTypes.oneOfType([RulesPropType, RuleGroupPropType]).isRequired,
  // see RuleBuilderEditor proptypes for details.
  columns: RuleBuilderColumnsPropType.isRequired,

  /**
   * Function passed from RuleBuilderEditor that takes two optional parameters. The id is
   * used to find this rule in the tree and insert the new rule (or group) after it.
   *
   * @param {string} id the Id of the rule where the add button was clicked.
   * @param {boolean} isGroup A boolean indicating if the new rule to be added is a rule group
   */
  onAddRule: PropTypes.func.isRequired,

  /**
   * Factory function passed from RuleBuilderEditor that takes one parameter. The id is
   * used to find this rule in the tree and remove it.
   *
   * @param {string} id the Id of the rule where the remove button was clicked.
   */
  onRemoveRule: PropTypes.func.isRequired,

  /**
   * The onChange callback called on any updates to this rule.
   * For example, if the value field of a rule were changed the callback would contain two parameters the changed object:
   * { id: 'ruleid-1', value: 'new-value' } and a boolean of false indicating it was a nested rule that was changed.
   *
   * However, if the root groupLogic were changed from ALL to ANY. The callback would contain:
   * { id: 'groupid-x', groupLogic: 'ANY' }, and a boolean of true indicating the root tree was changed.
   *
   * Finally, if any other properties of the rule were changes (column or operand) the onChange callback would contain:
   * { id: 'ruleid-y', columnId: 'new-column-id' } or { id: 'ruleid-', operand: 'new-operand-id' }
   *
   * @param {object} changed On object containing the rule id, and the parameters that have been updated.
   * @param {boolean} isRoot Did this change happen to the root object of the tree or nested down.
   */
  onChange: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    all: PropTypes.string,
    any: PropTypes.string,
    contains: PropTypes.string,
    lessThan: PropTypes.string,
    lessThanOrEqual: PropTypes.string,
    notEqual: PropTypes.string,
    equals: PropTypes.string,
    greaterThanOrEqual: PropTypes.string,
    greaterThan: PropTypes.string,
    selectAColumn: PropTypes.string,
    selectAnOperand: PropTypes.string,
  }),
};

const Rule = ({ rule, onAddRule, onRemoveRule, onChange, columns, i18n }) => {
  const { id: ruleId, operand, columnId, groupLogic, rules } = rule;

  const mergedI18n = React.useMemo(
    () => ({
      ...defaultProps.i18n,
      ...(i18n ?? {}),
    }),
    [i18n]
  );

  const defaultOperands = React.useMemo(
    () => [
      {
        id: 'NEQ',
        name: mergedI18n.notEqual,
      },
      {
        id: 'LT',
        name: mergedI18n.lessThan,
      },
      {
        id: 'LTOET',
        name: mergedI18n.lessThanOrEqual,
      },
      {
        id: 'EQ',
        name: mergedI18n.equals,
      },
      {
        id: 'GTOET',
        name: mergedI18n.greaterThanOrEqual,
      },
      {
        id: 'GT',
        name: mergedI18n.greaterThan,
      },
      {
        id: 'CONTAINS',
        name: mergedI18n.contains,
      },
    ],
    [mergedI18n]
  );

  const getColumnById = React.useMemo(
    () => (id) => {
      return columns?.find(({ id: colId }) => id === colId);
    },
    [columns]
  );

  const selectedColumn = React.useMemo(() => {
    return getColumnById(columnId);
  }, [columnId, getColumnById]);

  const columnOperands = React.useMemo(() => {
    if (selectedColumn && selectedColumn.operands) {
      return selectedColumn.operands;
    }

    return defaultOperands;
  }, [defaultOperands, selectedColumn]);

  const getOperandById = React.useMemo(
    () => (opId) => {
      return columnOperands.find(({ id }) => id === opId);
    },
    [columnOperands]
  );

  const getOperandByColumnId = React.useMemo(
    () => (id) => {
      const col = getColumnById(id);
      const operands = (col && col.operands) || defaultOperands;

      const foundOp = operands.find((op) => op.id === operand);

      if (foundOp) {
        return foundOp.id;
      }

      return operands[0].id;
    },
    [defaultOperands, getColumnById, operand]
  );

  const handleChangeOperand = React.useCallback(
    ({ selectedItem }) => {
      onChange({
        id: ruleId,
        operand: selectedItem.id,
      });
    },
    [ruleId, onChange]
  );

  const handleChangeColumn = React.useCallback(
    ({ selectedItem }) => {
      onChange({
        id: ruleId,
        columnId: selectedItem.id,
        operand: getOperandByColumnId(selectedItem.id),
      });
    },
    [getOperandByColumnId, onChange, ruleId]
  );

  const handleChangeValue = React.useCallback(
    (newValue) => {
      onChange({
        id: ruleId,
        value: newValue,
      });
    },
    [ruleId, onChange]
  );

  const handleChangeGroupLogic = React.useCallback(
    ({ selectedItem }) => {
      onChange({
        id: ruleId,
        groupLogic: selectedItem.id,
      });
    },
    [ruleId, onChange]
  );

  const selectedOperand = React.useMemo(() => {
    return getOperandById(operand);
  }, [getOperandById, operand]);

  if (groupLogic && Array.isArray(rules)) {
    return (
      <div className={`${iotPrefix}--rule-builder-rule--group`}>
        <GroupLogic
          id={ruleId}
          selected={groupLogic}
          onChange={handleChangeGroupLogic}
          i18n={mergedI18n}
        />
        {rules.map((subRule) => (
          <Rule
            rule={{ ...subRule }}
            key={subRule.id}
            onAddRule={onAddRule}
            onRemoveRule={onRemoveRule}
            onChange={onChange}
            columns={columns}
          />
        ))}
      </div>
    );
  }

  return (
    <div data-testid={`${ruleId}-rule`} className={`${iotPrefix}--rule-builder-rule`}>
      <Dropdown
        id={`${ruleId}-column-dropdown`}
        light
        items={columns}
        label={(selectedColumn && selectedColumn.name) || mergedI18n.selectAColumn}
        itemToString={(item) => item.name}
        selectedItem={selectedColumn}
        initialSelectedItem={selectedColumn}
        onChange={handleChangeColumn}
        data-testid={`${ruleId}-column-dropdown`}
      />
      <Dropdown
        id={`${ruleId}-operand-dropdown`}
        light
        items={columnOperands}
        itemToString={(item) => item.name}
        label={(selectedOperand && selectedOperand.name) || mergedI18n.selectAnOperand}
        selectedItem={selectedOperand}
        initialSelectedItem={selectedOperand}
        onChange={handleChangeOperand}
        data-testid={`${ruleId}-operand-dropdown`}
      />
      <RuleValueField
        rule={rule}
        onChange={handleChangeValue}
        renderColumnField={selectedColumn?.renderField}
        renderOperandField={selectedOperand?.renderField}
      />
      <div className={`${iotPrefix}--rule-builder-rule__actions`}>
        <Button
          hasIconOnly
          renderIcon={(props) => <Subtract size={16} {...props} />}
          kind="ghost"
          tooltipPosition="top"
          iconDescription="Remove rule"
          onClick={onRemoveRule(ruleId)}
          testId={`${ruleId}-remove-rule-button`}
        />
        <Button
          hasIconOnly
          renderIcon={(props) => <Add size={16} {...props} />}
          kind="ghost"
          tooltipPosition="top"
          iconDescription="Add new rule"
          onClick={onAddRule(ruleId)}
          testId={`${ruleId}-add-rule-button`}
        />
        <Button
          hasIconOnly
          renderIcon={(props) => <TextNewLine size={16} {...props} />}
          kind="ghost"
          tooltipPosition="top"
          iconDescription="Add new rule group"
          onClick={onAddRule(ruleId, true)}
          testId={`${ruleId}-add-group-button`}
        />
      </div>
    </div>
  );
};

Rule.defaultProps = defaultProps;
Rule.propTypes = propTypes;

export default Rule;
