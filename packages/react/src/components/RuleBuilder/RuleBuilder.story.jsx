import React from 'react';
import { action } from '@storybook/addon-actions';
import { Star, Share, TrashCan } from '@carbon/react/icons';

import StoryNotice, { experimentalStoryTitle } from '../../internal/StoryNotice';

import RuleBuilder from './RuleBuilder';
import { columns, TEST_TREE_DATA } from './RuleBuilderEditor.story';

export const Experimental = () => <StoryNotice componentName="RuleBuilder" experimental />;
Experimental.storyName = experimentalStoryTitle;

export default {
  title: '2 - Watson IoT Experimental/☢️ RuleBuilder',
  parameters: {
    component: RuleBuilder,
  },
};

const actions = [
  {
    actionId: 'favorite',
    actionLabel: 'Favorite',
    actionIcon: Star,
    actionCallback: action('favorite'),
  },
  {
    actionId: 'share',
    actionLabel: 'Share',
    actionIcon: Share,
    actionCallback: action('share'),
  },
  {
    actionId: 'delete',
    actionLabel: 'Delete',
    actionIcon: TrashCan,
    actionCallback: action('delete'),
  },
];

const getDate = (realDate = false) => {
  return realDate === false
    ? 'Thursday, February 25, 2021'
    : new Date().toLocaleDateString('en', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};

const filter = {
  filterId: 'story-filter',
  /** Text for main tilte of page */
  filterTitleText: 'My Filter',
  /** Text for metadata for the filter */
  filterMetaText: `last updated: ${getDate()}`,
  /** tags associated with particular filter */
  filterTags: ['fav', 'other-tag'],
  /** users that have access to particular filter */
  filterAccess: [
    {
      username: 'Example-User',
      email: 'example@pal.com',
      name: 'Example User',
      access: 'edit',
    },
    {
      username: 'Other-User',
      email: 'other@pal.com',
      name: 'Other User',
      access: 'read',
    },
  ],
  /** All possible users that can be granted access */
  filterUsers: [
    {
      id: 'teams',
      name: 'Teams',
      groups: [
        {
          id: 'team-a',
          name: 'Team A',
          users: [
            {
              username: '@tpeck',
              email: 'tpeck@pal.com',
              name: 'Templeton Peck',
            },
            {
              username: '@jsmith',
              email: 'jsmith@pal.com',
              name: 'John Smith',
            },
          ],
        },
      ],
    },
    {
      username: 'Example-User',
      email: 'example@pal.com',
      name: 'Example User',
    },
    {
      username: 'Test-User',
      email: 'test@pal.com',
      name: 'Test User',
    },
    {
      username: 'Other-User',
      email: 'other@pal.com',
      name: 'Other User',
    },
  ],
  /**
   * the rules passed into the component. The RuleBuilder is a controlled component, so
   * this works the same as passing defaultValue to a controlled input component.
   */
  filterRules: TEST_TREE_DATA,
  filterColumns: columns,
};

const footerButtons = [
  {
    buttonId: 'preview',
    buttonLabel: 'Preview results',
    buttonCallback: action('preview'),
  },
  {
    buttonId: 'apply',
    buttonLabel: 'Apply',
    buttonCallback: action('apply'),
  },
];

export const ruleBuilder = () => (
  <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
    <RuleBuilder
      filter={{
        filterColumns: columns,
        filterRules: {
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
        },
      }}
      onChange={action('onChange')}
      actionBar={actions}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
      footerButtons={footerButtons}
    />
  </div>
);

ruleBuilder.storyName = 'new filter';

export const ruleBuilderWithRules = () => (
  <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
    <RuleBuilder
      actionBar={actions}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
      footerButtons={footerButtons}
      filter={filter}
    />
  </div>
);

ruleBuilderWithRules.storyName = 'with existing filter rules';
