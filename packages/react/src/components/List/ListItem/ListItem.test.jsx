import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Add, Edit } from '@carbon/react/icons';
import userEvent from '@testing-library/user-event';

import { DragAndDrop } from '../../../utils/DragAndDropUtils';
import { Tag } from '../../Tag';
import { settings } from '../../../constants/Settings';

import { UnconnectedListItem } from './ListItem';

const { iotPrefix } = settings;

describe('ListItem', () => {
  const commonProps = {
    itemWillMove: jest.fn(),
    onItemMoved: jest.fn(),
    connectDragSource: jest.fn(),
    connectDragPreview: jest.fn(),
    isDragging: false,
  };

  it('test ListItem gets rendered', () => {
    render(<UnconnectedListItem id="1" value="some content" index={0} {...commonProps} />);
    expect(screen.getByText('some content')).toBeTruthy();
  });

  it('ListItem with large row and secondary value', () => {
    render(
      <UnconnectedListItem
        id="1"
        value="some content"
        secondaryValue="second"
        index={0}
        isLargeRow
        {...commonProps}
      />
    );
    expect(screen.getByText('some content')).toBeTruthy();
    expect(screen.getByText('second')).toBeTruthy();
  });

  it('ListItemWrapper does not show as selected when it has an editingStyle ', () => {
    const onSelect = jest.fn();
    render(
      <UnconnectedListItem
        id="1"
        value="test"
        isSelectable
        onSelect={onSelect}
        index={0}
        editingStyle="multiple"
        {...commonProps}
        selected
      />
    );

    expect(screen.getByRole('button')).not.toHaveClass(`${iotPrefix}--list-item__selected`);
  });

  it('ListItem when isSelectable set to true', () => {
    const onSelect = jest.fn();
    render(
      <UnconnectedListItem
        id="1"
        value="test"
        isSelectable
        onSelect={onSelect}
        index={0}
        {...commonProps}
      />
    );
    fireEvent.keyPress(screen.getAllByRole('button')[0], {
      key: 'Enter',
      charCode: 13,
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('handles onSelect callback when clicked and isSelectable is set to true', () => {
    const onSelect = jest.fn();
    const { rerender } = render(
      <UnconnectedListItem id="1" value="" isSelectable index={0} {...commonProps} />
    );
    // It handles absence of onSelect callback
    fireEvent.click(screen.getAllByRole('button')[0]);

    rerender(
      <UnconnectedListItem
        id="1"
        value=""
        isSelectable
        onSelect={onSelect}
        index={0}
        {...commonProps}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('handles onExpand callback when expand button gets enter key press', () => {
    const onExpand = jest.fn();
    const { rerender } = render(
      <UnconnectedListItem id="1" value="" isExpandable index={0} {...commonProps} />
    );
    // It handles absence of onExpand callback
    fireEvent.keyPress(screen.getAllByRole('button')[0], {
      key: 'Enter',
      charCode: 13,
    });

    rerender(
      <UnconnectedListItem
        id="1"
        value=""
        isExpandable
        onExpand={onExpand}
        index={0}
        {...commonProps}
      />
    );
    fireEvent.keyPress(screen.getAllByRole('button')[0], {
      key: 'Enter',
      charCode: 13,
    });
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('calls onExpand when expand button is clicked', () => {
    const onExpand = jest.fn();
    render(
      <UnconnectedListItem
        id="1"
        value=""
        isExpandable
        onExpand={onExpand}
        index={0}
        {...commonProps}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('ListItem with Icon', () => {
    const onClick = jest.fn();
    render(
      <UnconnectedListItem
        id="1"
        value="test"
        icon={<Add title="iconTitle" onClick={onClick} />}
        iconPosition="left"
        index={0}
        {...commonProps}
      />
    );
    fireEvent.click(screen.getByTitle('iconTitle'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ListItem with rowActions', () => {
    const rowActionOnClick = jest.fn();
    const rowActions = [<Edit key="edit" title="iconTitle" onClick={rowActionOnClick} />];
    render(
      <UnconnectedListItem id="1" value="test" rowActions={rowActions} index={0} {...commonProps} />
    );
    fireEvent.click(screen.getByTitle('iconTitle'));
    expect(rowActionOnClick).toHaveBeenCalledTimes(1);
  });

  it('ListItem with long value has visible rowActions', () => {
    const rowActionOnClick = jest.fn();
    const rowActions = [<Edit key="edit" title="iconTitle" onClick={rowActionOnClick} />];
    render(
      <UnconnectedListItem
        id="1"
        value="test value with a really long string to ensure that it stretches the length of the ListItem"
        rowActions={rowActions}
        index={0}
        {...commonProps}
      />
    );
    fireEvent.click(screen.getByTitle('iconTitle'));
    expect(rowActionOnClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTitle('iconTitle')).toBeVisible();
  });

  it('ListItem i18n string test', () => {
    const i18nTest = {
      expand: 'expand',
      close: 'close',
    };
    const i18nDefaults = UnconnectedListItem.defaultProps.i18n;
    const { rerender } = render(
      <UnconnectedListItem
        i18n={i18nTest}
        id="1"
        value=""
        isExpandable
        index={0}
        {...commonProps}
      />
    );
    expect(screen.getByLabelText(i18nTest.expand)).toBeInTheDocument();
    expect(screen.queryByLabelText(i18nDefaults.expand)).not.toBeInTheDocument();

    rerender(
      <UnconnectedListItem
        i18n={i18nTest}
        id="1"
        value=""
        isExpandable
        expanded
        index={0}
        {...commonProps}
      />
    );
    expect(screen.getByLabelText(i18nTest.close)).toBeInTheDocument();
    expect(screen.queryByLabelText(i18nDefaults.close)).not.toBeInTheDocument();
  });

  it('shows Tags when available', () => {
    const tags = [
      <Tag type="blue" title="descriptor" key="tag1">
        my tag 1
      </Tag>,
      <Tag type="red" disabled key="tag2">
        my tag 2
      </Tag>,
    ];
    const { rerender } = render(
      <UnconnectedListItem id="1" value="test" index={0} {...commonProps} />
    );
    expect(screen.queryByText('my tag 1')).not.toBeInTheDocument();
    expect(screen.queryByText('my tag 2')).not.toBeInTheDocument();

    rerender(<UnconnectedListItem id="1" value="test" tags={tags} index={0} {...commonProps} />);
    expect(screen.getByText('my tag 1')).toBeVisible();
    expect(screen.getByText('my tag 2')).toBeVisible();
  });

  it('ListItem in edit mode', () => {
    render(
      <UnconnectedListItem id="1" value="test" editingStyle="multiple" index={0} {...commonProps} />
    );
    expect(screen.getByTestId('list-item-editable')).toBeTruthy();
  });

  it('ListItem has three targets in nesting mode', () => {
    const listItemProps = {
      id: '1',
      value: 'test',
      editingStyle: 'single-nesting',
      index: 0,
      renderDropTargets: true,
      isDragging: false,
      connectDragSource: jest.fn(),
      connectDragPreview: jest.fn(),
      onItemMoved: jest.fn(),
      itemWillMove: jest.fn(),
    };

    render(
      <DragAndDrop>
        <UnconnectedListItem {...listItemProps} />
      </DragAndDrop>
    );

    const targets = screen.getAllByTestId('list-target');

    expect(targets.length).toEqual(3);
  });

  it('ListItem has two targets in outside of nesting mode', () => {
    const listItemProps = {
      id: '1',
      value: 'test',
      editingStyle: 'single',
      index: 0,
      renderDropTargets: true,
      isDragging: false,
      connectDragSource: jest.fn(),
      connectDragPreview: jest.fn(),
      onItemMoved: jest.fn(),
      itemWillMove: jest.fn(),
    };

    render(
      <DragAndDrop>
        <UnconnectedListItem {...listItemProps} />
      </DragAndDrop>
    );

    const targets = screen.getAllByTestId('list-target');

    expect(targets.length).toEqual(2);
  });

  it('calls getAllowedDropIds with the draggId prop as param when renderDropTargets is true', () => {
    const listItemProps = {
      id: '1',
      draggingId: '2',
      value: 'test',
      editingStyle: 'single',
      index: 0,
      isDragging: false,
      connectDragSource: jest.fn(),
      connectDragPreview: jest.fn(),
      onItemMoved: jest.fn(),
      itemWillMove: jest.fn(),
      getAllowedDropIds: jest.fn(),
    };

    const { rerender } = render(
      <DragAndDrop>
        <UnconnectedListItem {...listItemProps} />
      </DragAndDrop>
    );
    expect(listItemProps.getAllowedDropIds).not.toHaveBeenCalled();

    rerender(
      <DragAndDrop>
        <UnconnectedListItem {...listItemProps} renderDropTargets />
      </DragAndDrop>
    );

    expect(listItemProps.getAllowedDropIds).toHaveBeenCalledWith('2');
  });

  it('renders drop targets if the id is in result of getAllowedDropIds', () => {
    const listItemProps = {
      id: '1',
      draggingId: '2',
      value: 'test',
      editingStyle: 'single',
      index: 0,
      renderDropTargets: true,
      isDragging: false,
      connectDragSource: jest.fn(),
      connectDragPreview: jest.fn(),
      onItemMoved: jest.fn(),
      itemWillMove: jest.fn(),
      getAllowedDropIds: jest.fn(),
    };

    listItemProps.getAllowedDropIds.mockReturnValue(['1']);

    const { rerender } = render(
      <DragAndDrop>
        <UnconnectedListItem {...listItemProps} />
      </DragAndDrop>
    );

    expect(screen.getAllByTestId('list-target').length).toEqual(2);

    listItemProps.getAllowedDropIds.mockClear();
    listItemProps.getAllowedDropIds.mockReturnValue(['0', '2', '3']);
    rerender(
      <DragAndDrop>
        <UnconnectedListItem {...listItemProps} />
      </DragAndDrop>
    );

    expect(screen.queryAllByTestId('list-target').length).toEqual(0);
  });

  it('should throw a warning in DEV mode when rowActions is an array', () => {
    const { __DEV__ } = global;
    global.__DEV__ = true;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<UnconnectedListItem rowActions={[]} />);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'You have passed an array of nodes to ListItem as rowActions.  This can cause performance problems and has been deprecated.  You should pass a render function instead.'
      )
    );
    global.__DEV__ = __DEV__;
  });

  it('should call onExpand onClick if isExpandable:true', () => {
    const onExpand = jest.fn();
    const { rerender } = render(
      <UnconnectedListItem id="test-item" value="Test item" isExpandable onExpand={onExpand} />
    );

    userEvent.click(screen.getByRole('button', { name: 'Expand' }));

    expect(onExpand).toHaveBeenCalledWith('test-item');
    onExpand.mockClear();

    // don't call if disabled is true
    rerender(
      <UnconnectedListItem
        disabled
        id="test-item"
        value="Test item"
        isExpandable
        onExpand={onExpand}
      />
    );

    userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    expect(onExpand).not.toHaveBeenCalled();
  });

  it('should render rowActions when passed a function', () => {
    const rowActions = jest.fn();
    render(<UnconnectedListItem id="test-item" value="Test item" rowActions={rowActions} />);

    expect(rowActions).toHaveBeenCalled();
  });

  it('should render secondaryValue when passed a function with string return', () => {
    const secondaryValue = jest.fn().mockReturnValue('Test title item');
    render(
      <UnconnectedListItem id="test-item" value="Test item" secondaryValue={secondaryValue} />
    );

    expect(secondaryValue).toHaveBeenCalled();
    expect(screen.getByTitle('Test title item')).toBeVisible();
  });

  it('should render secondaryValue when passed a function', () => {
    const secondaryValue = jest.fn();
    render(
      <UnconnectedListItem id="test-item" value="Test item" secondaryValue={secondaryValue} />
    );

    expect(secondaryValue).toHaveBeenCalled();
  });

  it('should render secondaryValue when passed a function in a large row', () => {
    const secondaryValue = jest.fn();
    render(
      <UnconnectedListItem
        id="test-item"
        value="Test item"
        isLargeRow
        secondaryValue={secondaryValue}
      />
    );

    expect(secondaryValue).toHaveBeenCalled();
  });

  it('should render a large row without secondary value', () => {
    const { container } = render(
      <UnconnectedListItem id="test-item" value="Test item" isLargeRow />
    );

    expect(
      container.querySelectorAll(`.${iotPrefix}--list-item--content--values--main__large`)
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(`${iotPrefix}--list-item--content--values--value__large`)
    ).toHaveLength(0);
  });

  it('should render secondaryValue when passed a value', () => {
    render(<UnconnectedListItem id="test-item" value="Test item" secondaryValue="secondary" />);

    expect(screen.getByTitle('secondary')).toBeVisible();
  });

  it('should render with nestinging levels ', () => {
    const { container } = render(
      <UnconnectedListItem
        id="test-item"
        value="Test item"
        secondaryValue="secondary"
        nestingLevel={1}
      />
    );

    expect(screen.getByTitle('secondary')).toBeVisible();
    expect(container.querySelectorAll(`.${iotPrefix}--list-item--nesting-offset`)).toHaveLength(1);
    expect(container.querySelector(`.${iotPrefix}--list-item--nesting-offset`)).toHaveStyle(
      'width:16px' // 32 - column gap of 16px
    );
  });

  it('should have negative tabIndex when preventRowFocus is true', () => {
    const { rerender } = render(
      <UnconnectedListItem id="test-item" value="Test item" isSelectable />
    );
    expect(screen.getByRole('button')).toHaveAttribute('tabIndex', expect.not.stringMatching('-1'));

    rerender(<UnconnectedListItem id="test-item" value="Test item" isSelectable preventRowFocus />);
    expect(screen.getByRole('button')).toHaveAttribute('tabIndex', expect.stringMatching('-1'));
  });
});
