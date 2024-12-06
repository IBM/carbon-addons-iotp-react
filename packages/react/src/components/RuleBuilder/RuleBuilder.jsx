import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  Accordion,
  AccordionItem,
  Tag,
  TextInput,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';
import { ToolbarSVGWrapper } from '../Card/CardToolbar';
import Button from '../Button';
import FilterTags from '../FilterTags/FilterTags';
import SelectUsersModal from '../SelectUsersModal/SelectUsersModal';
import StatefulTable from '../Table/StatefulTable';

import RuleBuilderTags from './RuleBuilderTags';
import RuleBuilderEditor from './RuleBuilderEditor';
import { RuleBuilderFilterPropType } from './RuleBuilderPropTypes';

const { iotPrefix } = settings;

const propTypes = {
  className: PropTypes.string,
  /** Text for main tilte of page */
  defaultTitleText: PropTypes.string,
  /** Text for metadata for the filter */
  // metaText: PropTypes.string,
  /** Unique id for particular filter */
  // id: PropTypes.string,
  /**
   * Optional action buttons at top of page and callbacks to handle actions
   */
  actionBar: PropTypes.arrayOf(
    PropTypes.shape({
      actionId: PropTypes.string.isRequired,
      actionLabel: PropTypes.string.isRequired,
      actionIcon: PropTypes.elementType.isRequired,
      actionCallback: PropTypes.func.isRequired,
    })
  ),
  onSave: PropTypes.func.isRequired,

  onCancel: PropTypes.func.isRequired,
  /** Optional rule editor component to overwrite the default */
  ruleEditor: PropTypes.elementType,
  /** filter object of the current selected filter */
  filter: RuleBuilderFilterPropType,
  /**
   * Optional footer buttons and callbacks to handle actions
   */
  footerButtons: PropTypes.arrayOf(
    PropTypes.shape({
      buttonId: PropTypes.string.isRequired,
      buttonLabel: PropTypes.string.isRequired,
      buttonCallback: PropTypes.func.isRequired,
    })
  ),

  onChange: PropTypes.func,
  i18n: PropTypes.shape({
    addUsers: PropTypes.string,
    editorAccess: PropTypes.string,
    readOnlyAccess: PropTypes.string,
    sharingAndPermissions: PropTypes.string,
    filterTabText: PropTypes.string,
    sharingTabText: PropTypes.string,
    clearFilterTitle: PropTypes.string,
    saveLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
  }),

  testId: PropTypes.string,
};

const defaultProps = {
  filter: {
    filterTags: [],
    filterAccess: [],
    filterUsers: [],
  },
  className: null,
  defaultTitleText: 'Undefined',
  // metaText: null,
  // id: null,
  ruleEditor: null,
  actionBar: null,
  footerButtons: null,
  onChange: () => {},
  i18n: {
    addUsersButtonLabel: 'Add users',
    editorAccessLabel: 'Editor access',
    readOnlyAccessLabel: 'Read only access',
    detailsAccordionText: 'Details',
    sharingAccordionText: 'Sharing and permissions',
    filterTabText: 'Filter builder',
    sharingTabText: 'Sharing and preferences',
    filterNameLabel: 'Filter Name',
    tagsLabel: 'Tags (optional)',
    clearFilterTitle: 'Clear Filter',
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    readModalHeaderLabel: `Selected users will have read access`,
    editModalHeaderLabel: `Selected users will have edit access`,
    nameColumnLabel: 'Name',
    typeColumnLabel: 'Type',
    groupTypeLabel: 'Group',
    userTypeLabel: 'User',
    modalPrimaryButtonLabel: 'OK',
  },
  testId: 'rule-builder',
};

const baseClass = `${iotPrefix}--rule-builder-wrap`;

const RuleBuilder = ({
  className,
  defaultTitleText,
  onSave,
  onCancel,
  actionBar,
  footerButtons,
  filter,
  ruleEditor: RuleEditor,
  onChange,
  i18n,
  testId,
}) => {
  const [currentFilter, setCurrentFilter] = React.useState(filter);
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    access: 'READ',
  });
  const mergedI18n = useMemo(
    () => ({
      ...defaultProps.i18n,
      ...i18n,
    }),
    [i18n]
  );

  const Editor = useMemo(() => RuleEditor || RuleBuilderEditor, [RuleEditor]);
  const actions = useMemo(
    () =>
      actionBar?.map((i) => (
        <ToolbarSVGWrapper
          key={i.actionId}
          testId={i.actionId}
          title={i.actionLabel}
          onClick={() => {
            i.actionCallback(currentFilter);
          }}
          iconDescription={i.actionLabel}
          renderIcon={i.actionIcon}
        />
      )),
    [actionBar, currentFilter]
  );

  const footer = useMemo(
    () =>
      footerButtons?.map((i) => (
        <Button
          testId={i.buttonId}
          key={i.buttonId}
          kind="secondary"
          className={`${baseClass}--footer-actions-preview`}
          onClick={() => {
            i.buttonCallback(currentFilter);
          }}
        >
          {i.buttonLabel}
        </Button>
      )),
    [currentFilter, footerButtons]
  );

  const handleOnChange = (update, type) => {
    let updatedFilter;
    switch (type) {
      case 'TITLE':
        updatedFilter = { filterTitleText: update };
        break;
      case 'TAGS':
        updatedFilter = { filterTags: [...(currentFilter?.filterTags ?? []), update] };
        break;
      default:
        updatedFilter = { filterRules: update };
    }
    setCurrentFilter((current) => ({ ...current, ...updatedFilter }));
    onChange(updatedFilter);
  };

  const handleAddAccess = useCallback(
    (access) => () => {
      setModalState({
        access,
        isOpen: true,
      });
    },
    [setModalState]
  );

  const handleCloseModal = useCallback(() => {
    setModalState({
      ...modalState,
      isOpen: false,
    });
  }, [modalState]);

  const handleTagClose = useCallback(
    (tag) => () => {
      setCurrentFilter((prev) => {
        return {
          ...prev,
          filterTags: prev.filterTags.filter((t) => t !== tag),
        };
      });
    },
    []
  );

  const editUsers = useMemo(
    () => currentFilter?.filterAccess?.filter((user) => user.access === 'edit') ?? [],
    [currentFilter]
  );

  const readUsers = useMemo(
    () => currentFilter?.filterAccess?.filter((user) => user.access === 'read') ?? [],
    [currentFilter]
  );

  const handleUserSelect = useCallback(
    (access) => (selectedUsers) => {
      setModalState((prev) => ({
        ...prev,
        isOpen: false,
      }));

      setCurrentFilter((prev) => ({
        ...prev,
        filterAccess: [
          ...(prev.filterAccess?.filter((user) => user.access !== access) ?? []),
          ...selectedUsers.map((user) => ({ ...user, access })),
        ],
      }));
    },
    []
  );

  return (
    <section
      className={classnames(baseClass, className)}
      id={currentFilter?.id}
      // TODO: change this to use only testId in v3.
      data-testid={currentFilter?.id || testId}
    >
      <header className={`${baseClass}--header`}>
        <div>
          <h1 className={`${baseClass}--header-title`} data-testid={`${testId}-title`}>
            {currentFilter?.filterTitleText || defaultTitleText}
          </h1>
          {currentFilter?.filterMetaText && (
            <p data-testid={`${testId}-metatext`} className={`${baseClass}--header-metatext`}>
              {currentFilter?.filterMetaText}
            </p>
          )}
        </div>
        <div className={`${baseClass}--header-actions`}>
          {actions}
          <Button
            className={`${baseClass}--header-actions-save`}
            testId="rule-builder-save"
            onClick={() => onSave(currentFilter)}
            size="sm"
          >
            {mergedI18n.saveLabel}
          </Button>
        </div>
      </header>
      <div className={`${baseClass}--body`}>
        <Tabs data-testid={`${testId}-tabs`} className={`${baseClass}--tabs`}>
          <TabList aria-label="List of tabs">
            <Tab className={`${baseClass}--tab`} data-testid={`${testId}-editor-tab`}>
              {mergedI18n.filterTabText}
            </Tab>
            <Tab className={`${baseClass}--tab`} data-testid={`${testId}-sharing-tab`}>
              {mergedI18n.sharingTabText}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Editor
                defaultRules={currentFilter.filterRules}
                columns={currentFilter.filterColumns}
                onChange={handleOnChange}
                testId={`${testId}-editor`}
              />
            </TabPanel>
            <TabPanel>
              <Accordion>
                <AccordionItem title={mergedI18n.detailsAccordionText} open>
                  <TextInput
                    type="text"
                    id="rule-builder-title-input"
                    className={`${baseClass}--title-input`}
                    labelText={mergedI18n.filterNameLabel}
                    light
                    defaultValue={currentFilter.filterTitleText}
                    placeholder="Untitled 01"
                    onChange={(e) => handleOnChange(e.target.value, 'TITLE')}
                    data-testid={`${testId}-title-input`}
                  />
                  <FilterTags
                    hasOverflow
                    tagContainer={RuleBuilderTags}
                    onChange={handleOnChange}
                    i18n={mergedI18n}
                    testId={`${testId}-tags`}
                  >
                    {currentFilter?.filterTags?.map((tag) => (
                      <Tag
                        key={`tag-${tag}`}
                        filter
                        title={mergedI18n.clearFilterTitle}
                        style={{
                          marginRight: '1rem',
                        }}
                        onClose={handleTagClose(tag)}
                        data-testid={`${testId}-tag-${tag}`}
                      >
                        {tag}
                      </Tag>
                    )) || []}
                  </FilterTags>
                </AccordionItem>
                <AccordionItem title={mergedI18n.sharingAccordionText} open>
                  <div className={`${baseClass}--user-container`}>
                    <StatefulTable
                      id="edit-table"
                      testId={`${testId}-edit-users-table`}
                      secondaryTitle={mergedI18n.editorAccessLabel}
                      options={{
                        hasSearch: true,
                      }}
                      view={{
                        toolbar: {
                          customToolbarContent: (
                            <Button
                              aria-labelledby="add-editors-label"
                              renderIcon={(props) => <Add size={16} {...props} />}
                              id="add-editors-button"
                              kind="ghost"
                              testId="rule-builder-add-edit-users"
                              onClick={handleAddAccess('edit')}
                            >
                              {mergedI18n.addUsersButtonLabel}
                            </Button>
                          ),
                        },
                        table: {},
                      }}
                      data={editUsers.map((user) => ({
                        id: user.name,
                        values: {
                          name: user.name,
                          type:
                            Array.isArray(user.users) && user.users.length > 0
                              ? mergedI18n.groupTypeLabel
                              : mergedI18n.userTypeLabel,
                        },
                      }))}
                      columns={[
                        {
                          id: 'name',
                          name: mergedI18n.nameColumnLabel,
                        },
                        {
                          id: 'type',
                          name: mergedI18n.typeColumnLabel,
                        },
                      ]}
                    />
                    <StatefulTable
                      id="read-table"
                      testId={`${testId}-read-users-table`}
                      secondaryTitle={mergedI18n.readOnlyAccessLabel}
                      options={{
                        hasSearch: true,
                      }}
                      view={{
                        toolbar: {
                          customToolbarContent: (
                            <Button
                              aria-labelledby="read-only-access-label"
                              renderIcon={(props) => <Add size={16} {...props} />}
                              id="add-read-users"
                              kind="ghost"
                              testId="rule-builder-add-read-users"
                              onClick={handleAddAccess('read')}
                            >
                              {mergedI18n.addUsersButtonLabel}
                            </Button>
                          ),
                        },
                        table: {},
                      }}
                      data={readUsers.map((user) => ({
                        id: user.name,
                        values: {
                          name: user.name,
                          type:
                            Array.isArray(user.users) && user.users.length > 0
                              ? mergedI18n.groupTypeLabel
                              : mergedI18n.userTypeLabel,
                        },
                      }))}
                      columns={[
                        {
                          id: 'name',
                          name: mergedI18n.nameColumnLabel,
                        },
                        {
                          id: 'type',
                          name: mergedI18n.typeColumnLabel,
                        },
                      ]}
                    />
                  </div>
                </AccordionItem>
              </Accordion>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
      <footer className={`${baseClass}--footer`}>
        <Button
          kind="secondary"
          className={`${baseClass}--footer-actions-cancel`}
          testId="rule-builder-cancel"
          onClick={onCancel}
        >
          {mergedI18n.cancelLabel}
        </Button>
        {footer}
      </footer>
      <SelectUsersModal
        users={currentFilter?.filterUsers ?? []}
        i18n={{
          modalHeaderLabel: mergedI18n.editModalHeaderLabel,
          primaryButtonLabel: mergedI18n.modalPrimaryButtonLabel,
        }}
        initialSelectedUsers={editUsers}
        onSubmit={handleUserSelect('edit')}
        onClose={handleCloseModal}
        isOpen={modalState.isOpen && modalState.access === 'edit'}
      />
      <SelectUsersModal
        users={currentFilter?.filterUsers ?? []}
        i18n={{
          modalHeaderLabel: mergedI18n.readModalHeaderLabel,
          primaryButtonLabel: mergedI18n.modalPrimaryButtonLabel,
        }}
        initialSelectedUsers={readUsers}
        onSubmit={handleUserSelect('read')}
        onClose={handleCloseModal}
        isOpen={modalState.isOpen && modalState.access === 'read'}
      />
    </section>
  );
};

RuleBuilder.propTypes = propTypes;
RuleBuilder.defaultProps = defaultProps;

export default RuleBuilder;
