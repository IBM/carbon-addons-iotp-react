import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { DatePicker, DatePickerInput, NumberInput } from '@carbon/react';

import { settings } from '../../constants/Settings';

import RuleBuilderEditor from './RuleBuilderEditor';

const { prefix } = settings;

export const columns = [
  { id: 'column1', name: 'Column 1' },
  { id: 'column2', name: 'Column 2' },
  { id: 'column3', name: 'Column 3' },
];

export const TEST_TREE_DATA = {
  id: '14p5ho3pcu',
  groupLogic: 'ALL',
  rules: [
    {
      id: 'rsiru4rjba',
      columnId: 'column1',
      operand: 'EQ',
      value: '45',
    },
    {
      id: '34bvyub9jq',
      columnId: 'column2',
      operand: 'LT',
      value: '14',
    },
    {
      id: 'i34imt0geh',
      groupLogic: 'ANY',
      rules: [
        {
          id: 'ewc2z5kyfu',
          columnId: 'column2',
          operand: 'GTOET',
          value: '46',
        },
        {
          id: 'hks7h2zin4',
          columnId: 'column1',
          operand: 'LT',
          value: '45',
        },
        {
          id: 'qzn8477mbg',
          groupLogic: 'ALL',
          rules: [
            {
              id: 'wg9hlv197c',
              columnId: '',
              operand: '',
              value: '',
            },
            {
              id: 'eobo3s5tie',
              groupLogic: 'ALL',
              rules: [
                {
                  id: '7kadk2wfv8',
                  columnId: 'column1',
                  operand: 'EQ',
                  value: '44',
                },
                {
                  id: '49mf09vjhn',
                  columnId: 'column2',
                  operand: 'EQ',
                  value: '46',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const EmptyRuleBuilderStory = () => (
  <RuleBuilderEditor
    defaultRules={{
      id: '14p5ho3pcu',
      groupLogic: 'ALL',
      rules: [
        {
          id: 'rsiru4rjba',
          columnId: '',
          operand: '',
          value: '',
        },
      ],
    }}
    columns={columns}
    onChange={action('onChange')}
  />
);

EmptyRuleBuilderStory.storyName = 'with an empty tree';

export const RuleBuilderEditorNestedRulesStory = () => (
  <RuleBuilderEditor
    columns={columns}
    defaultRules={TEST_TREE_DATA}
    onChange={action('onChange')}
  />
);

RuleBuilderEditorNestedRulesStory.storyName = 'with a deeply nested rule tree';

export const RuleBuilderCustomOperandsAndFieldRenderer = () => (
  <RuleBuilderEditor
    defaultRules={{
      id: '14p5ho3pcu',
      groupLogic: 'ALL',
      rules: [
        {
          id: 'rsiru4rjba',
          columnId: '',
          operand: '',
          value: '',
        },
      ],
    }}
    columns={[
      {
        id: 'column1',
        name: 'Date',
        operands: [
          { id: 'before', name: 'Before' },
          { id: 'after', name: 'After' },
        ],
        renderField: ({ value, onChange }) => (
          <DatePicker
            light
            onChange={onChange}
            defaultValue={value}
            dateFormat="m/d/Y"
            datePickerType="single"
          >
            <DatePickerInput
              id="date-picker-default-id"
              placeholder="mm/dd/yyyy"
              labelText=""
              light
            />
          </DatePicker>
        ),
      },
      {
        id: 'column2',
        name: 'Integer',
        renderField: ({ value, onChange }) => (
          <NumberInput
            light
            id="column2-input"
            defaultValue={value}
            onChange={(e) => onChange(e.imaginaryTarget.value)}
          />
        ),
      },
      {
        id: 'column3',
        name: 'HTML Input',
        operands: [{ id: 'includes', name: 'Includes' }],
        renderField: ({ value, onChange }) => (
          <input
            className={`${prefix}--text-input ${prefix}--text__input ${prefix}--text-input--light`}
            type="text"
            defaultValue={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ),
      },
    ]}
    onChange={action('onChange')}
  />
);

RuleBuilderCustomOperandsAndFieldRenderer.storyName =
  'with custom column operands and field renderers';

export default {
  title: '2 - Watson IoT Experimental/☢️ RuleBuilder/RuleBuilderEditor',
  decorators: [withKnobs],

  parameters: {
    component: RuleBuilderEditor,
  },
  excludeStories: ['columns', 'TEST_TREE_DATA'],
};
