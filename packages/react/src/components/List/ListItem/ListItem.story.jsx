import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, boolean } from '@storybook/addon-knobs';
import { Edit, Star, StarFilled } from '@carbon/react/icons';

import Button from '../../Button';
import { OverflowMenu } from '../../OverflowMenu';
import { OverflowMenuItem } from '../../OverflowMenuItem';
import { Tag } from '../../Tag';

import { UnconnectedListItem as ListItem } from './ListItem';

// Since we are only interested in rendering the ListItem in isolation, and not the
// interaction, we'll supply an identity function to stub the connector methods that
// are usually provided by DndProvider, but are unessecary here.
const identity = (el) => el;
const dndProps = {
  connectDragSource: identity,
  connectDragPreview: identity,
  index: 0,
  dragPreviewText: '',
  isDragging: false,
  renderDropTargets: false,
  onItemMoved: identity,
  itemWillMove: identity,
};

export default {
  title: '1 - Watson IoT/List/ListItem',

  parameters: {
    component: ListItem,
  },
};

export const BasicWKnobs = () => {
  const value = text('value', 'List Item');
  const title = text('title', 'List Item title/hover text');
  const secondaryValue = text('secondaryValue', undefined);
  const iconName = select('icon', ['none', 'Star16', 'StarFilled16']);
  const iconComponent =
    iconName === 'Star16' ? Star : iconName === 'StarFilled16' ? StarFilled : null;
  const rowActionSet = select('row action example', ['none', 'single', 'multi'], 'none');
  const tagsConfig = select('tags example', ['none', 'single', 'multi'], 'none');

  const rowActionComponent =
    rowActionSet === 'single'
      ? () => [
          <Button
            tooltipPosition={document.dir === 'ltr' ? 'left' : 'right'}
            key="list-item-edit"
            style={{ color: 'black' }}
            renderIcon={Edit}
            hasIconOnly
            kind="ghost"
            size="sm"
            onClick={() => action('row action clicked')}
            iconDescription="Edit"
          />,
        ]
      : rowActionSet === 'multi'
      ? () => [
          <OverflowMenu flipped={document.dir !== 'rtl'} size="sm">
            <OverflowMenuItem itemText="Edit" />
            <OverflowMenuItem itemText="Add" />
            <OverflowMenuItem itemText="Delete" hasDivider isDelete />
          </OverflowMenu>,
        ]
      : () => [];
  const tagsData =
    tagsConfig === 'single'
      ? [
          <Tag type="blue" title="descriptor" key="tag1">
            default
          </Tag>,
        ]
      : tagsConfig === 'multi'
      ? [
          <Tag type="blue" title="descriptor" key="tag1">
            default
          </Tag>,
          <Tag type="red" disabled key="tag2">
            disabled tag
          </Tag>,
        ]
      : undefined;
  return (
    <div style={{ width: 400 }}>
      <ListItem
        {...dndProps}
        id="list-item"
        value={value}
        title={title}
        secondaryValue={secondaryValue}
        icon={iconComponent ? React.createElement(iconComponent) : null}
        iconPosition={select('iconPosition', ['left', 'right'], 'right')}
        isSelectable={boolean('isSelectable', false)}
        selected={boolean('selected', false)}
        onSelect={action('onSelect')}
        isExpandable={boolean('isExpandable', false)}
        expanded={boolean('expanded', false)}
        onExpand={action('onExpand')}
        isCategory={boolean('isCategory', false)}
        isLargeRow={boolean('isLargeRow', false)}
        nestingLevel={select('nestingLevel', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0)}
        rowActions={rowActionComponent}
        tags={tagsData}
      />
    </div>
  );
};

BasicWKnobs.storyName = 'basic w/ knobs';

export const WithValue = () => (
  <div style={{ width: 400 }}>
    <ListItem {...dndProps} id="list-item" value="List Item" />
  </div>
);

WithValue.storyName = 'with value';

export const WithSecondaryValue = () => (
  <div style={{ width: 400 }}>
    <ListItem {...dndProps} id="list-item" value="List Item" secondaryValue="Secondary Value" />
  </div>
);

WithSecondaryValue.storyName = 'with secondaryValue';

export const TestingSecondaryValueOverflow = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value="List Item this could be a really long value that can't quite fit"
      secondaryValue="Secondary Value could also be a really, extraordinarily long value"
      isLargeRow={boolean('isLargeRow', true)}
    />
  </div>
);

TestingSecondaryValueOverflow.storyName = 'testing secondaryValue overflow';

export const WithIcon = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value="List Item"
      icon={<Star />}
      iconPosition={select('iconPosition', ['left', 'right'])}
    />
  </div>
);

WithIcon.storyName = 'with icon';

export const WithIsSelectable = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value="Selectable List Item"
      secondaryValue={text('secondaryValue', '')}
      isSelectable
      onSelect={action('onSelect')}
      isLargeRow={boolean('isLargeRow', false)}
    />
  </div>
);

WithIsSelectable.storyName = 'with isSelectable';

export const WithIsLargeRow = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value="List Item"
      secondaryValue="With isLargeRow, the secondary value serves primarily as a description field for the list item"
      isLargeRow={boolean('isLargeRow', true)}
    />
  </div>
);

WithIsLargeRow.storyName = 'with isLargeRow';

export const TestingIsLargeRowOverflow = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value="List Item this could be a reaaaaaaaaaaally really long value"
      secondaryValue="With isLargeRow, the secondary value serves primarily as a description field for the list item.  If the content is too wide for the list item, it will be visible in a tooltip."
      isLargeRow={boolean('isLargeRow', true)}
    />
  </div>
);

TestingIsLargeRowOverflow.storyName = 'testing isLargeRow overflow';

export const WithIsExpandable = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value="Expandable List Item"
      secondaryValue={text('secondaryValue', '')}
      isExpandable
      onExpand={action('onExpand')}
      isLargeRow={boolean('isLargeRow', false)}
    />
  </div>
);

WithIsExpandable.storyName = 'with isExpandable';

export const WithIsCategory = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value="List Item"
      secondaryValue={text('secondaryValue', '')}
      isExpandable
      onExpand={action('onExpand')}
      isCategory
    />
  </div>
);

WithIsCategory.storyName = 'with isCategory';

export const WithSingleRowAction = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value={text('value', 'List Item')}
      secondaryValue={text('secondaryValue', 'Secondary Value')}
      rowActions={() => [
        <Button
          tooltipPosition={document.dir === 'ltr' ? 'left' : 'right'}
          key="list-item-edit"
          style={{ color: 'black' }}
          renderIcon={Edit}
          hasIconOnly
          kind="ghost"
          size="sm"
          onClick={() => action('row action clicked')}
          iconDescription="Edit"
        />,
      ]}
    />
  </div>
);

WithSingleRowAction.storyName = 'with single row action';

export const WithDisabled = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value={text('value', 'List Item')}
      secondaryValue={text('secondaryValue', 'Secondary Value')}
      disabled={boolean('disabled', true)}
      isSelectable={boolean('isSelectable', true)}
      rowActions={() => [
        <Button
          tooltipPosition={document.dir === 'ltr' ? 'left' : 'right'}
          key="list-item-edit"
          style={{ color: 'black' }}
          renderIcon={Edit}
          hasIconOnly
          disabled={boolean('action disabled', true)}
          kind="ghost"
          size="sm"
          onClick={() => action('row action clicked')}
          iconDescription="Edit"
        />,
      ]}
    />
  </div>
);

WithDisabled.storyName = 'with disabled';

export const WithOverflowMenuRowActions = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value={text(
        'value',
        'List Item with really long values does it ellipse when I get really long text'
      )}
      isExpandable={boolean('isExpandable', true)}
      onExpand={action('onExpand')}
      rowActions={() => [
        <OverflowMenu
          key="ListItem-action-overflow-menu"
          flipped={document.dir !== 'rtl'}
          size="sm"
        >
          <OverflowMenuItem key="ListItem-action-overflow-Edit" itemText="Edit" />
          <OverflowMenuItem key="ListItem-action-overflow-Add" itemText="Add" />
          <OverflowMenuItem key="ListItem-action-overflow-Delete" itemText="Delete" />
          <OverflowMenuItem
            key="ListItem-action-overflow-Danger"
            itemText="Danger option"
            hasDivider
            isDelete
          />
        </OverflowMenu>,
      ]}
    />
  </div>
);

WithOverflowMenuRowActions.storyName = 'with OverflowMenu row actions';

export const WithTags = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value={text('value', 'List Item')}
      tags={[
        <Tag type="blue" title="descriptor" key="tag1">
          default
        </Tag>,
        <Tag type="red" disabled key="tag2">
          disabled tag
        </Tag>,
      ]}
    />
  </div>
);

WithTags.storyName = 'with Tags';

export const WithSecondaryValueObject = () => (
  <div style={{ width: 400 }}>
    <ListItem
      {...dndProps}
      id="list-item"
      value={text('value', 'List Item')}
      secondaryValue={{
        value: () => <div>Secondary value object</div>,
        label: 'Secondary value object',
      }}
    />
  </div>
);

WithSecondaryValueObject.storyName = 'with secondary value an object';
