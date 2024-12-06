import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, text, select } from '@storybook/addon-knobs';
import { assign, isEqual } from 'lodash-es';

import { DragAndDrop } from '../../utils/DragAndDropUtils';
import FullWidthWrapper from '../../internal/FullWidthWrapper';

import Table from './Table';
import StatefulTable from './StatefulTable';
// import TableUserViewManagementREADME from './mdx/TableUserViewManagement.mdx'; //carbon 11
import { getTableData, getTableColumns, getTableActions } from './Table.story.helpers';
import TableViewDropdown from './TableViewDropdown/TableViewDropdown';
import TableSaveViewModal from './TableSaveViewModal/TableSaveViewModal';
import TableManageViewsModal from './TableManageViewsModal/TableManageViewsModal';

const tableData = getTableData();
const tableColumns = getTableColumns();
const tableActions = getTableActions();

export default {
  title: '1 - Watson IoT/Table/User view management',

  parameters: {
    component: Table,
    // docs: {
    //   page: TableUserViewManagementREADME,
    // },
  },
};

export const WithUserViewManagement = () => {
  const selectedTableType = select('Type of Table', ['Table', 'StatefulTable'], 'Table');
  const MyTable = selectedTableType === 'StatefulTable' ? StatefulTable : Table;

  // The initial default state for this story is one with no active filters
  // and no default search value etc, i.e. a view all scenario.
  const baseState = {
    options: {
      hasFilter: true,
      hasSearch: true,
    },
    columns: tableColumns.map((col) => ({
      ...col,
      width: '150px',
      isSortable: true,
    })),
    data: tableData,
    view: {
      table: {
        sort: undefined,
        ordering: tableColumns.map(({ id }) => ({
          columnId: id,
          isHidden: id === 'secretField',
        })),
      },
      filters: [],
      toolbar: {
        activeBar: 'filter',
        search: { defaultValue: '' },
      },
    },
  };

  // Create some mockdata to represent previously saved views.
  // The props can be any subset of the view and columns prop that
  // you need in order to successfully save and load your views.
  const viewExample = {
    description: 'Columns: 7, Filters: 0, Search: pinoc',
    id: 'view1',
    isPublic: true,
    isDeleteable: true,
    isEditable: true,
    title: 'Search view',
    props: {
      view: {
        filters: [],
        table: {
          ordering: baseState.view.table.ordering,
          sort: {},
        },
        toolbar: {
          activeBar: 'column',
          search: { defaultValue: 'pinoc', defaultExpanded: true },
        },
      },
      columns: baseState.columns,
    },
  };
  const viewExample2 = {
    description: 'Columns: 7, Filters: 1, Search:',
    id: 'view2',
    isPublic: false,
    isDeleteable: true,
    isEditable: true,
    title: 'Filters and search view',
    props: {
      view: {
        filters: [{ columnId: 'string', value: 'helping' }],
        table: {
          ordering: baseState.view.table.ordering,
          sort: {
            columnId: 'select',
            direction: 'DESC',
          },
        },
        toolbar: {
          activeBar: 'filter',
          search: { defaultValue: 'help', defaultExpanded: true },
        },
      },
      columns: baseState.columns,
    },
  };

  /** The "store" that holds all the existing views */
  const [viewsStorage, setViewsStorage] = useState([viewExample, viewExample2]);
  /** Tracks if the user has modified the view since it was selected */
  const [selectedViewEdited, setSelectedViewEdited] = useState(false);
  /** The props & metadata of the view currently selected */
  const [selectedView, setSelectedView] = useState(viewExample2);
  /** The props & metadata representing the current state needed by SaveViewModal  */
  const [viewToSave, setViewToSave] = useState(undefined);
  /** The id of the view that is currently the default */
  const [defaultViewId, setDefaultViewId] = useState('view2');
  /** Number of views per page in the TableManageViewModal */
  const manageViewsRowsPerPage = 10;
  /** Current page number in the TableManageViewModal */
  const [manageViewsCurrentPageNumber, setManageViewsCurrentPageNumber] = useState(1);
  /** Current filters in the TableManageViewModal. Can hold 'searchTerm' and 'showPublic' */
  const [manageViewsCurrentFilters, setManageViewsCurrentFilters] = useState({
    searchTerm: '',
    showPublic: true,
  });
  /** Flag needed to open and close the TableManageViewModal */
  const [manageViewsModalOpen, setManageViewsModalOpen] = useState(false);
  /** Collection of filtered views needed for the pagination in the TableManageViewModal */
  const [manageViewsFilteredViews, setManageViewsFilteredViews] = useState(viewsStorage);
  /** Collection of views on the current page in the TableManageViewModal */
  const [manageViewsCurrentPageItems, setManageViewsCurrentPageItems] = useState(
    viewsStorage.slice(0, manageViewsRowsPerPage)
  );
  /** Determine if the TableManageViewModal should list public views  */
  const [manageViewsDisplayPublicDefaultChecked, setManageViewsDisplayPublicDefaultChecked] =
    useState(true);

  // This is the state of the current table.
  const [currentTableState, setCurrentTableState] = useState(
    assign({}, baseState, viewsStorage.find((view) => view.id === defaultViewId)?.props)
  );

  // The selectable items to be presented by the ViewDropDown.
  const selectableViews = useMemo(
    () => viewsStorage.map(({ id, title }) => ({ id, text: title })),
    [viewsStorage]
  );

  // A helper method used to extract the relevant properties from the view and column
  // props. For our example story this is what we store in a saved view.
  const extractCurrentUserView = useCallback(
    ({ view, columns }) => ({
      props: {
        columns,
        view: {
          filters: view.filters,
          table: {
            ordering: view.table.ordering,
            sort: view.table.sort || {},
          },
          toolbar: {
            activeBar: view.toolbar.activeBar,
            search: {
              ...view.toolbar.search,
              defaultValue: currentTableState.view.toolbar?.search?.defaultValue || '',
            },
          },
        },
      },
    }),
    [currentTableState]
  );

  // This effect is needed to determine if the current view has been changed
  // so that this can be reflected in the TableViewDropdown.
  useEffect(() => {
    const currentUserView = extractCurrentUserView(currentTableState);
    const compareView = selectedView || extractCurrentUserView(baseState);
    setSelectedViewEdited(!isEqual(currentUserView.props, compareView.props));
  }, [baseState, currentTableState, extractCurrentUserView, selectedView]);

  /**
   * The TableManageViewsModal is an external component that can be placed outside
   * the table. It is highly customizable and is used to list existing views and
   * provide the user the option to delete and edit the view's metadata. See the
   * TableManageViewsModal story for a more detailed documentation.
   */
  const renderManageViewsModal = () => {
    const showPage = (pageNumber, views) => {
      const rowUpperLimit = pageNumber * manageViewsRowsPerPage;
      const currentItemsOnPage = views.slice(rowUpperLimit - manageViewsRowsPerPage, rowUpperLimit);
      setManageViewsCurrentPageNumber(pageNumber);
      setManageViewsCurrentPageItems(currentItemsOnPage);
    };

    const applyFiltering = ({ searchTerm, showPublic }) => {
      const views = viewsStorage
        .filter(
          (view) =>
            searchTerm === '' || view.title.toLowerCase().search(searchTerm.toLowerCase()) !== -1
        )
        .filter((view) => (showPublic ? view : !view.isPublic));

      setManageViewsFilteredViews(views);
      showPage(1, views);
    };

    const onDelete = (viewId) => {
      if (viewId === selectedView?.id) {
        setSelectedViewEdited(false);
        setSelectedView(undefined);
        setCurrentTableState(baseState);
      }

      const deleteIndex = viewsStorage.findIndex((view) => view.id === viewId);
      setViewsStorage((existingViews) => {
        const modifiedViews = [...existingViews];
        modifiedViews.splice(deleteIndex, 1);
        setManageViewsFilteredViews(modifiedViews);
        showPage(1, modifiedViews);
        return modifiedViews;
      });
    };

    return (
      <TableManageViewsModal
        actions={{
          onDisplayPublicChange: (showPublic) => {
            const newFilters = {
              ...manageViewsCurrentFilters,
              showPublic,
            };
            setManageViewsCurrentFilters(newFilters);
            applyFiltering(newFilters);
            setManageViewsDisplayPublicDefaultChecked(showPublic);
          },
          onSearchChange: (searchTerm = '') => {
            const newFilters = {
              ...manageViewsCurrentFilters,
              searchTerm,
            };
            setManageViewsCurrentFilters(newFilters);
            applyFiltering(newFilters);
          },
          onEdit: (viewId) => {
            setManageViewsModalOpen(false);
            const viewToEdit = viewsStorage.find((view) => view.id === viewId);
            setSelectedView(viewToEdit);
            setViewToSave(viewToEdit);
          },
          onDelete,
          onClearError: action('TableManageViewsModal: onClearManageViewsModalError'),
          onClose: () => setManageViewsModalOpen(false),
        }}
        defaultViewId={defaultViewId}
        error={select('TableManageViewsModal: error', [undefined, 'My error msg'], undefined)}
        isLoading={boolean('TableManageViewsModal: isLoading', false)}
        open={manageViewsModalOpen}
        views={manageViewsCurrentPageItems}
        displayPublicDefaultChecked={manageViewsDisplayPublicDefaultChecked}
        pagination={{
          page: manageViewsCurrentPageNumber,
          onPage: (pageNumber) => showPage(pageNumber, manageViewsFilteredViews),
          maxPage: Math.ceil(manageViewsFilteredViews.length / manageViewsRowsPerPage),
          pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
        }}
      />
    );
  };

  /**
   * The TableViewDropdown is an external component that needs to be passed in
   * via the customToolbarContent and positioned according to the applications needs.
   * Most of the functionality in the TableViewDropdown can be overwritten. See the
   * TableViewDropdown story for a more detailed documentation.
   */
  const renderViewDropdown = () => {
    return (
      <TableViewDropdown
        style={{ order: '-1', width: '300px' }}
        selectedViewId={selectedView?.id}
        selectedViewEdited={selectedViewEdited}
        views={selectableViews}
        actions={{
          onSaveAsNewView: () => {
            setViewToSave({
              id: undefined,
              ...extractCurrentUserView(currentTableState),
            });
          },
          onManageViews: () => {
            setManageViewsModalOpen(true);
            setManageViewsCurrentPageItems(
              viewsStorage
                .slice(0, manageViewsRowsPerPage)
                .filter((view) => !view.isPublic || manageViewsDisplayPublicDefaultChecked)
            );
          },
          onChangeView: ({ id }) => {
            const selectedView = viewsStorage.find((view) => view.id === id);
            setCurrentTableState(assign({}, baseState, selectedView?.props));
            setSelectedView(selectedView);
            setSelectedViewEdited(false);
          },
          onSaveChanges: () => {
            setViewToSave({
              ...selectedView,
              ...extractCurrentUserView(currentTableState),
            });
          },
        }}
      />
    );
  };

  /**
   * The TableSaveViewModal is a an external component that can be placed
   * outside the table. Is is used both for saving new views and for
   * updating existing ones. See the TableSaveViewModal story for a more
   * detailed documentation.
   */
  const renderSaveViewModal = () => {
    const saveView = (viewMetaData) => {
      setViewsStorage((existingViews) => {
        const modifiedStorage = [];
        const saveNew = viewToSave.id === undefined;
        const { isDefault, ...metaDataToSave } = viewMetaData;
        const generatedId = new Date().getTime().toString();

        if (saveNew) {
          const newViewToStore = {
            ...viewToSave,
            ...metaDataToSave,
            id: generatedId,
            isDeleteable: true,
            isEditable: true,
          };
          modifiedStorage.push(...existingViews, newViewToStore);
          setSelectedView(newViewToStore);
        } else {
          const indexToUpdate = existingViews.findIndex((view) => view.id === viewToSave.id);
          const viewsCopy = [...existingViews];
          const modifiedViewToStore = {
            ...viewToSave,
            ...metaDataToSave,
          };
          viewsCopy[indexToUpdate] = modifiedViewToStore;
          setSelectedView(modifiedViewToStore);
          modifiedStorage.push(...viewsCopy);
        }

        if (isDefault) {
          setDefaultViewId(saveNew ? generatedId : viewToSave.id);
        }

        setSelectedViewEdited(false);
        return modifiedStorage;
      });
      setViewToSave(undefined);
    };

    // Simple description example that can be replaced by any string or node.
    // See the TableSaveViewModal story for more examples.
    const getDescription = ({ table, filters, toolbar }) =>
      `Columns: ${table.ordering.filter((col) => !col.isHidden).length},
        Filters: ${filters?.length || 0},
        Search: ${toolbar?.search?.defaultValue}`;

    return (
      viewToSave && (
        <TableSaveViewModal
          actions={{
            onSave: saveView,
            onClose: () => {
              setViewToSave(undefined);
            },
            onClearError: action('TableSaveViewModal: onClearError'),
            onChange: action('TableSaveViewModal: onChange'),
          }}
          sendingData={boolean('TableSaveViewModal: sendingData', false)}
          error={select('TableSaveViewModal: error', [undefined, 'My error msg'], undefined)}
          open
          titleInputInvalid={boolean('TableSaveViewModal: titleInputInvalid', false)}
          titleInputInvalidText={text('TableSaveViewModal: titleInputInvalidText', undefined)}
          viewDescription={getDescription(viewToSave.props.view)}
          initialFormValues={{
            title: viewToSave.title,
            isPublic: viewToSave.isPublic,
            isDefault: viewToSave.id === defaultViewId,
          }}
          i18n={{
            modalTitle: viewToSave.id ? 'Update view' : 'Save new view',
          }}
        />
      )
    );
  };

  return (
    <FullWidthWrapper>
      {renderManageViewsModal()}
      {renderSaveViewModal()}
      <MyTable
        key={`table-story-${selectedView?.id}`}
        id="table"
        {...baseState}
        columns={currentTableState.columns}
        view={{
          ...currentTableState.view,
          // The TableViewDropdown should be inserted as customToolbarContent
          toolbar: {
            ...currentTableState.view.toolbar,
            customToolbarContent: renderViewDropdown(),
          },
        }}
        secondaryTitle="Table with user view management"
        actions={{
          ...tableActions,
          table: {
            ...tableActions.table,
            onColumnResize: (columns) => {
              tableActions.table.onColumnResize(columns);
              setCurrentTableState((state) => ({
                ...state,
                columns,
              }));
            },
            // Simplified sorting for this story. It does not update the data of the table
            // and it ignores direction.
            onChangeSort: (sortOnColumnId) => {
              tableActions.table.onChangeSort(sortOnColumnId);
              setCurrentTableState((state) => ({
                ...state,
                view: {
                  ...state.view,
                  table: {
                    ...state.view.table,
                    sort: {
                      columnId: sortOnColumnId,
                      direction: 'DESC',
                    },
                  },
                },
              }));
            },
          },
          toolbar: {
            ...tableActions.toolbar,
            onApplySearch: (currentSearchValue) => {
              tableActions.toolbar.onApplySearch(currentSearchValue);
              // Here you can use debounce and call the backend to properly filter
              // your data. For this story we simply update the search defaultValue.
              setCurrentTableState((state) => ({
                ...state,
                view: {
                  ...state.view,
                  toolbar: {
                    ...state.view.toolbar,
                    search: { defaultValue: currentSearchValue },
                  },
                },
              }));
            },
            onApplyFilter: (filters) => {
              tableActions.toolbar.onApplyFilter(filters);
              // Simplified filtering for this story. It does not update the data of
              // the table only the actual filters.
              setCurrentTableState((state) => ({
                ...state,
                view: {
                  ...state.view,
                  filters: Object.entries(filters)
                    .filter(([, value]) => value !== '')
                    .map(([key, value]) => ({
                      columnId: key,
                      value,
                    })),
                },
              }));
            },
          },
        }}
        options={{
          ...baseState.options,
          hasResize: true,
          hasFilter: select(
            'hasFilter',
            ['onKeyPress', 'onEnterAndBlur', true, false],
            'onKeyPress'
          ),
          // Enables the behaviour in Table required
          // to fully implement Create and Save Views
          hasUserViewManagement: true,
        }}
      />
    </FullWidthWrapper>
  );
};

WithUserViewManagement.storyName = 'With user view management';
WithUserViewManagement.decorators = [
  (Story) => (
    <DragAndDrop>
      <Story />
    </DragAndDrop>
  ),
];
