import React, { useState } from 'react';
import { mount } from 'enzyme';
import { Dropdown } from '@carbon/react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { settings } from '../../../constants/Settings';

import TableViewDropdown from './TableViewDropdown';

const { iotPrefix, prefix } = settings;

describe('TableViewDropdown', () => {
  const myViews = [
    {
      id: 'view-1',
      text: 'View 1',
    },
    {
      id: 'view-2',
      text: 'View 2',
    },
    {
      id: 'view-3',
      text: 'View 3',
    },
  ];

  const actions = {
    onSaveAsNewView: jest.fn(),
    onManageViews: jest.fn(),
    onChangeView: jest.fn(),
  };

  const itemSelector = `.${prefix}--list-box__menu-item__option`;
  const iotItemSelector = `.${prefix}--list-box__field .${iotPrefix}--view-dropdown__item`;

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('item rendering', () => {
    it('hides standard actions on isHidingStandardActions:true', () => {
      const { viewAll, saveAsNewView, saveChanges, manageViews, edited } =
        TableViewDropdown.defaultProps.i18n;
      const { rerender } = render(
        <TableViewDropdown
          selectedViewEdited
          selectedViewId="view-1"
          views={myViews}
          actions={actions}
        />
      );
      userEvent.click(screen.getByRole('combobox'));

      expect(screen.getByRole('option', { name: viewAll })).toBeVisible();
      expect(screen.getByRole('option', { name: `View 1 - ${edited}` })).toBeVisible();
      expect(screen.getByRole('option', { name: 'View 2' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'View 3' })).toBeVisible();
      expect(screen.queryByText(manageViews)).not.toBeNull();
      expect(screen.queryByText(saveChanges)).not.toBeNull();
      expect(screen.queryByText(saveAsNewView)).not.toBeNull();

      rerender(<TableViewDropdown isHidingStandardActions views={myViews} actions={actions} />);

      expect(screen.getByRole('option', { name: 'View 1' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'View 2' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'View 3' })).toBeVisible();
      expect(screen.queryByText(manageViews)).toBeNull();
      expect(screen.queryByText(saveChanges)).toBeNull();
      expect(screen.queryByText(saveAsNewView)).toBeNull();

      // Unlikely configuration with an edited selected view when isHidingStandardActions
      // is true but just to make sure none of the default actions items are ever displayed
      // in this scenario
      rerender(
        <TableViewDropdown
          isHidingStandardActions
          selectedViewEdited
          selectedViewId="view-1"
          views={[
            ...myViews,
            {
              id: 'custom-action',
              text: 'Custom test action',
            },
          ]}
          actions={actions}
        />
      );

      expect(screen.getByRole('option', { name: `View 1 - ${edited}` })).toBeVisible();
      expect(screen.getByRole('option', { name: 'View 2' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'View 3' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Custom test action' })).toBeVisible();
      expect(screen.queryByText(manageViews)).toBeNull();
      expect(screen.queryByText(saveChanges)).toBeNull();
      expect(screen.queryByText(saveAsNewView)).toBeNull();
    });

    it('adds a "view all" default item to the start of the list of views', () => {
      const wrapper = mount(
        <TableViewDropdown views={myViews} actions={actions} selectedViewId={myViews[2].id} />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      // actions will be first, then the views
      const viewAllItem = wrapper.find(itemSelector).at(2);
      expect(viewAllItem.text()).toEqual('View All');
    });

    it('adds a "manage views" item at the end of the actions', () => {
      const wrapper = mount(<TableViewDropdown views={myViews} actions={actions} />);
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      // it will be right after the save actions
      const manageViewsItem = wrapper.find(itemSelector).at(1);
      expect(manageViewsItem.text()).toEqual('Manage views');
    });

    it('adds a "save new view" item before the "manage views" item', () => {
      const wrapper = mount(<TableViewDropdown views={myViews} actions={actions} />);
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const saveViewItem = wrapper.find(itemSelector).first();
      expect(saveViewItem.text()).toEqual('Save as new view');
    });

    it('adds a "save view" item before the "manage views" item', () => {
      const wrapper = mount(
        <TableViewDropdown
          views={myViews}
          actions={actions}
          selectedViewEdited
          selectedViewId={myViews[0].id}
        />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const saveViewItem = wrapper.find(itemSelector).at(1);
      expect(saveViewItem.text()).toEqual('Save changes');
    });

    it('doesnt add a "save view" item before the "manage views" item if selectedViewId is unset or view all', () => {
      const wrapper = mount(
        <TableViewDropdown views={myViews} actions={actions} selectedViewEdited />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const saveViewItem = wrapper.find(itemSelector).at(1);
      expect(saveViewItem.text()).not.toEqual('Save changes');
    });

    it('renders an icon for the manage views item', () => {
      const wrapper = mount(
        <TableViewDropdown views={myViews} actions={actions} selectedViewEdited />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const manageViewsItem = wrapper.find(itemSelector).at(2);
      expect(manageViewsItem.exists('svg')).toBeTruthy();
    });

    it('adds a "edited" postfix to selected item & title when selectedViewEdited is true', () => {
      const wrapper = mount(
        <TableViewDropdown views={myViews} actions={actions} selectedViewEdited />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const selectedItem = wrapper.find(iotItemSelector);
      expect(selectedItem.props().title).toEqual('View All - Edited');

      const editedText = wrapper.find(
        `.${prefix}--list-box__field .${iotPrefix}--view-dropdown__edited-text`
      );
      expect(editedText.text()).toEqual(' - Edited');
    });
  });

  describe('selection', () => {
    it('selected the proper item on init', () => {
      const wrapperWithoutInitialDefault = mount(
        <TableViewDropdown views={myViews} actions={actions} />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapperWithoutInitialDefault.find('button').simulate('click');
      const viewAllItem = wrapperWithoutInitialDefault.find(iotItemSelector);
      expect(viewAllItem.props().title).toEqual('View All');

      const wrapperWithInitiallySelected = mount(
        <TableViewDropdown views={myViews} actions={actions} selectedViewId={myViews[0].id} />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapperWithInitiallySelected.find('button').simulate('click');
      const view1Item = wrapperWithInitiallySelected.find(iotItemSelector);
      expect(view1Item.props().title).toEqual('View 1');
    });

    it('can have the selected item set externally after initial render', () => {
      const wrapper = mount(
        <TableViewDropdown views={myViews} actions={actions} selectedViewId={myViews[0].id} />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const view1Item = wrapper.find(iotItemSelector);
      expect(view1Item.props().title).toEqual('View 1');

      wrapper.setProps({ ...wrapper.props(), selectedViewId: myViews[2].id });
      wrapper.update();

      const view3Item = wrapper.find(iotItemSelector);
      expect(view3Item.props().title).toEqual('View 3');
    });
  });

  it('calls the proper actions', () => {
    const onChangeView = jest.fn();
    const wrapper = mount(
      React.createElement(() => {
        // We need to handle the state changes here so that the actual
        // selections based on click events get reflected in the component.
        const [selectedViewId, setSelectedViewId] = useState(undefined);
        return (
          <TableViewDropdown
            views={myViews}
            actions={{
              ...actions,
              onChangeView: onChangeView.mockImplementation((viewItem) => {
                setSelectedViewId(viewItem.id);
              }),
            }}
            selectedViewEdited
            selectedViewId={selectedViewId}
          />
        );
      })
    );

    expect(actions.onSaveAsNewView).not.toBeCalled();
    expect(actions.onManageViews).not.toBeCalled();
    expect(onChangeView).not.toBeCalled();

    const dropdown = wrapper.find('button');

    // The list of options is not rendered to the DOM until the dropdown button has been clicked
    dropdown.simulate('click');
    wrapper.find(itemSelector).last().simulate('click');

    dropdown.simulate('click');
    wrapper.find(itemSelector).at(1).simulate('click');

    dropdown.simulate('click');
    wrapper.find(itemSelector).at(2).simulate('click');

    dropdown.simulate('click');
    wrapper.find(itemSelector).at(3).simulate('click');

    dropdown.simulate('click');
    wrapper.find(itemSelector).first().simulate('click');

    dropdown.simulate('click');
    wrapper.find(itemSelector).at(4).simulate('click');

    expect(actions.onSaveAsNewView).toBeCalledTimes(1);
    expect(actions.onManageViews).toBeCalledTimes(1);
    expect(onChangeView).toBeCalledTimes(4);
  });

  describe('overrides', () => {
    it('can be overridden to use another dropdown component', () => {
      const MyDropdown = React.forwardRef((props, ref) => {
        return (
          <div className="my-dropdown">
            <Dropdown {...props} ref={ref} />
          </div>
        );
      });
      const wrapper = mount(
        <TableViewDropdown
          views={myViews}
          actions={actions}
          overrides={{ dropdown: { component: MyDropdown } }}
        />
      );
      expect(wrapper.exists('.my-dropdown')).toBeTruthy();
    });

    it('can be overridden to use custom Dropdown props', () => {
      const wrapper = mount(
        <TableViewDropdown
          views={myViews}
          actions={actions}
          overrides={{
            dropdown: {
              props: {
                items: [
                  {
                    id: 'view-1',
                    text: 'View 1',
                  },
                ],
              },
            },
          }}
        />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const allItems = wrapper.find(itemSelector);
      expect(allItems.length).toEqual(1);
    });

    it('can be overridden to use another TableViewDropdownItem', () => {
      const wrapper = mount(
        <TableViewDropdown
          views={myViews}
          actions={actions}
          overrides={{
            dropdownItem: {
              component: () => 'myItem',
            },
          }}
        />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const firstItem = wrapper.find(itemSelector).first();
      expect(firstItem.text()).toEqual('myItem');
    });

    it('can be overridden to use custom TableViewDropdownItem props', () => {
      const wrapper = mount(
        <TableViewDropdown
          views={myViews}
          actions={actions}
          overrides={{
            dropdownItem: {
              props: { isCompact: true },
            },
          }}
        />
      );
      // The list of options is not rendered to the DOM until the dropdown button has been clicked
      wrapper.find('button').simulate('click');
      const firstTableViewDropdownItem = wrapper
        .find(itemSelector)
        .first()
        .find('TableViewDropdownItem');
      expect(firstTableViewDropdownItem.props().isCompact).toEqual(true);
    });
  });

  it('i18n string tests', () => {
    jest.spyOn(global, 'ResizeObserver').mockImplementation((callback) => {
      callback([{ contentRect: { width: 200, height: 400 } }]);

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    const i18nTest = {
      view: 'viewz',
      edited: 'edited',
      viewAll: 'view-all',
      saveAsNewView: 'save-as-new',
      saveChanges: 'save-changes',
      manageViews: 'manage-view',
      ariaLabel: 'aria-label',
      tableViewMenu: 'table-view',
    };

    const i18nDefault = TableViewDropdown.defaultProps.i18n;

    render(
      <TableViewDropdown
        views={myViews}
        actions={actions}
        i18n={i18nTest}
        selectedViewEdited
        selectedViewId={myViews[0].id}
      />
    );

    // The list of options is not rendered to the DOM until the dropdown button has been clicked
    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.getAllByText(i18nTest.view, { exact: false })[0]).toBeInTheDocument();
    expect(screen.getAllByText(i18nTest.viewAll)[0]).toBeInTheDocument();
    expect(screen.getAllByText(i18nTest.saveAsNewView)[0]).toBeInTheDocument();
    expect(screen.getAllByText(i18nTest.saveChanges)[0]).toBeInTheDocument();
    expect(screen.getAllByText(i18nTest.manageViews)[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(i18nTest.ariaLabel)[0]).toBeInTheDocument();

    expect(screen.queryByText(i18nDefault.view)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.viewAll)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.saveAsNewView)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.saveChanges)).not.toBeInTheDocument();
    expect(screen.queryByText(i18nDefault.manageViews)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(i18nDefault.ariaLabel)).not.toBeInTheDocument();
  });

  it('should display custom tooltips', () => {
    jest.spyOn(global, 'ResizeObserver').mockImplementation((callback) => {
      callback([{ contentRect: { width: 200, height: 400 } }]);

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    const views = [
      {
        id: 'view-1',
        text: 'View 1',
        tooltip: 'Custom tooltip: View 1',
      },
      {
        id: 'view-2',
        text: 'View 2',
        tooltip: 'Custom tooltip: View 2',
      },
    ];

    const i18nDefault = TableViewDropdown.defaultProps.i18n;

    render(<TableViewDropdown views={views} actions={actions} i18n={i18nDefault} />);

    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.getByTitle('Custom tooltip: View 1')).toBeInTheDocument();
    expect(screen.getByTitle('Custom tooltip: View 2')).toBeInTheDocument();
  });

  it('should add "edited" note to custom tooltip', () => {
    jest.spyOn(global, 'ResizeObserver').mockImplementation((callback) => {
      callback([{ contentRect: { width: 200, height: 400 } }]);

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    const views = [
      {
        id: 'view-1',
        text: 'View 1',
        tooltip: 'Custom tooltip: View 1',
      },
    ];

    const i18nDefault = TableViewDropdown.defaultProps.i18n;

    render(
      <TableViewDropdown
        views={views}
        actions={actions}
        i18n={i18nDefault}
        selectedViewEdited
        selectedViewId={views[0].id}
      />
    );

    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.getAllByTitle('Custom tooltip: View 1 - Edited')).toHaveLength(2);
  });

  it('should fix the title for the selected item', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'ResizeObserver').mockImplementation((callback) => {
      callback([{ contentRect: { width: 200, height: 400 } }]);

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    render(<TableViewDropdown views={myViews} actions={actions} selectedViewId={myViews[0].id} />);

    jest.runAllTimers();
    const button = screen.getByRole('combobox');
    expect(button).toHaveAttribute('title', myViews[0].text);
  });
});
