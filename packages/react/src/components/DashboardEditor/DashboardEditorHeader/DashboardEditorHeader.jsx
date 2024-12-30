import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  TrashCan,
  DocumentImport,
  DocumentExport,
  Maximize,
  Tablet,
  Laptop,
  Screen,
} from '@carbon/react/icons';
import { FileUploaderButton, ContentSwitcher, TextInput } from '@carbon/react';
import { isEmpty } from 'lodash-es';

import { settings } from '../../../constants/Settings';
import Button from '../../Button';
import PageTitleBar from '../../PageTitleBar';
import IconSwitch from '../../IconSwitch/IconSwitch';

const { iotPrefix } = settings;

const propTypes = {
  /** Dashboard title */
  title: PropTypes.node,
  /** initial dashboard data to edit */
  breadcrumbs: PropTypes.arrayOf(PropTypes.node),
  /** if provided, renders edit button next to title linked to this callback */
  onEditTitle: PropTypes.func,
  /** if provided, renders import button linked to this callback
   * onImport(data, setNotification?)
   */
  onImport: PropTypes.func,
  /** if provided, renders export button linked to this callback
   * onExport(dashboardJson)
   */
  onExport: PropTypes.func,
  /** if provided, renders delete button linked to this callback */
  onDelete: PropTypes.func,
  /** If provided, renders cancel button linked to this callback */
  onCancel: PropTypes.func,
  /** If provided, renders submit button linked to this callback
   * onSubmit(dashboardData)
   */
  onSubmit: PropTypes.func,
  /** Whether to disable the submit button */
  isSubmitDisabled: PropTypes.bool,
  /** Whether to set the loading spinner on the submit button */
  isSubmitLoading: PropTypes.bool,
  /** internationalization strings */
  i18n: PropTypes.shape({
    headerEditTitleButton: PropTypes.string,
    headerImportButton: PropTypes.string,
    headerExportButton: PropTypes.string,
    headerDeleteButton: PropTypes.string,
    headerCancelButton: PropTypes.string,
    headerSubmitButton: PropTypes.string,
    headerFitToScreenButton: PropTypes.string,
    headerXlargeButton: PropTypes.string,
    headerLargeButton: PropTypes.string,
    headerMediumButton: PropTypes.string,
    dashboardTitleLabel: PropTypes.string,
    requiredMessage: PropTypes.string,
    saveTitleButton: PropTypes.string,
  }),
  /** The current dashboard's JSON */
  dashboardJson: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  /** currently selected breakpoint which is being held in state by DashboardEditor */
  selectedBreakpointIndex: PropTypes.number,
  /** handler to change the selectedBreakpoint state */
  setSelectedBreakpointIndex: PropTypes.func,
  /** if enabled, renders a ContentSwitcher with IconSwitches that allow for manually changing the breakpoint,
   * regardless of the screen width
   */
  breakpointSwitcher: PropTypes.shape({
    enabled: PropTypes.bool,
    allowedBreakpoints: PropTypes.arrayOf(PropTypes.string),
  }),

  testId: PropTypes.string,
};

const defaultProps = {
  title: null,
  breadcrumbs: [],
  onEditTitle: null,
  onImport: null,
  onExport: null,
  onDelete: null,
  onCancel: null,
  onSubmit: null,
  isSubmitDisabled: false,
  isSubmitLoading: false,
  i18n: {
    headerEditTitleButton: 'Edit title',
    headerImportButton: 'Import',
    headerExportButton: 'Export',
    headerDeleteButton: 'Delete',
    headerCancelButton: 'Cancel',
    headerSubmitButton: 'Save and close',
    headerFitToScreenButton: 'Fit to screen',
    headerLargeButton: 'Large view',
    headerMediumButton: 'Medium view',
    headerSmallButton: 'Small view',
    dashboardTitleLabel: 'Dashboard title',
    requiredMessage: 'Required',
    saveTitleButton: 'Save title',
  },
  selectedBreakpointIndex: null,
  setSelectedBreakpointIndex: null,
  breakpointSwitcher: null,
  testId: 'dashboard-editor-header',
};

const DashboardEditorHeader = ({
  title,
  breadcrumbs,
  onEditTitle,
  onImport,
  onExport,
  onDelete,
  onCancel,
  onSubmit,
  isSubmitDisabled,
  isSubmitLoading,
  i18n,
  dashboardJson,
  selectedBreakpointIndex,
  setSelectedBreakpointIndex,
  breakpointSwitcher,
  testId,
}) => {
  const [isTitleEditMode, setIsTitleEditMode] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(title);
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  const baseClassName = `${iotPrefix}--dashboard-editor-header`;
  const extraContent = (
    <div data-testid={testId} className={`${baseClassName}--right`}>
      <div className={`${baseClassName}--top`} />
      <div className={`${baseClassName}--bottom`}>
        {breakpointSwitcher?.enabled && (
          <ContentSwitcher
            onChange={(e) => setSelectedBreakpointIndex(e.index)}
            selectedIndex={selectedBreakpointIndex}
            className={`${baseClassName}--bottom__switcher`}
            data-testid={`${testId}-breakpoint-switcher`}
          >
            <IconSwitch
              name="fit-to-screen"
              text={mergedI18n.headerFitToScreenButton}
              renderIcon={Maximize}
              index={0}
              testId={`${testId}-fit-to-screen-switch`}
              tooltipPosition="bottom"
            />
            <IconSwitch
              name="large"
              text={mergedI18n.headerLargeButton}
              renderIcon={Screen}
              index={1}
              testId={`${testId}-large-switch`}
              tooltipPosition="bottom"
            />
            <IconSwitch
              name="medium"
              text={mergedI18n.headerMediumButton}
              renderIcon={Laptop}
              index={2}
              testId={`${testId}-medium-switch`}
              tooltipPosition="bottom"
            />
            <IconSwitch
              name="small"
              text={mergedI18n.headerSmallButton}
              renderIcon={Tablet}
              index={3}
              testId={`${testId}-small-switch`}
              tooltipPosition="bottom"
            />
          </ContentSwitcher>
        )}

        {onImport && (
          <FileUploaderButton
            buttonKind="ghost"
            size="md"
            hasIconOnly
            labelText={
              <Button
                kind="ghost"
                size="md"
                iconDescription={mergedI18n.headerImportButton}
                tooltipPosition="bottom"
                tooltipAlignment="center"
                hasIconOnly
                renderIcon={DocumentImport}
              />
            }
            onChange={onImport}
            disableLabelChanges
            accepts={['.json']}
            multiple={false}
            data-testid={`${testId}-file-uploader-button`}
          />
        )}
        {onExport && (
          <Button
            kind="ghost"
            size="md"
            iconDescription={mergedI18n.headerExportButton}
            tooltipPosition="bottom"
            tooltipAlignment="center"
            hasIconOnly
            renderIcon={DocumentExport}
            onClick={() => onExport(dashboardJson)}
            data-testid={`${testId}-export-button`}
          />
        )}
        {onDelete && (
          <Button
            kind="ghost"
            size="md"
            iconDescription={mergedI18n.headerDeleteButton}
            tooltipPosition="bottom"
            tooltipAlignment="center"
            hasIconOnly
            renderIcon={TrashCan}
            onClick={onDelete}
            data-testid={`${testId}-delete-button`}
          />
        )}
        {onCancel && (
          <Button
            kind="secondary"
            size="md"
            onClick={onCancel}
            data-testid={`${testId}-cancel-button`}
          >
            {mergedI18n.headerCancelButton}
          </Button>
        )}
        {onSubmit && (
          <Button
            size="md"
            disabled={isSubmitDisabled}
            onClick={() => onSubmit(dashboardJson)}
            loading={isSubmitLoading}
            data-testid={`${testId}-submit-button`}
          >
            {mergedI18n.headerSubmitButton}
          </Button>
        )}
      </div>
    </div>
  );

  // handle the edit title button
  const handleEditClick = useCallback(() => {
    setIsTitleEditMode(true);
  }, []);

  const editComponents = useMemo(
    () => (
      <>
        <TextInput
          size="sm"
          labelText={mergedI18n.dashboardTitleLabel}
          hideLabel
          id="dashboardTitle"
          name="dashboardTitle"
          value={updatedTitle}
          onChange={(e) => {
            setUpdatedTitle(e.target.value);
          }}
          invalidText={isEmpty(updatedTitle) ?? mergedI18n.requiredMessage}
          invalid={isEmpty(updatedTitle)}
          data-testid={`${testId}-dashboard-title-input`}
        />
        <Button
          kind="ghost"
          size="md"
          title={mergedI18n.headerCancelButton}
          onClick={() => {
            setIsTitleEditMode(false);
            // revert the title back to the original
            setUpdatedTitle(title);
          }}
          testId={`${testId}-cancel-title-button`}
        >
          {mergedI18n.headerCancelButton}
        </Button>
        <Button
          size="md"
          onClick={() => {
            onEditTitle(updatedTitle);
            setIsTitleEditMode(false);
          }}
          testId={`${testId}-save-title-button`}
        >
          {mergedI18n.saveTitleButton}
        </Button>
      </>
    ),
    [
      mergedI18n.dashboardTitleLabel,
      mergedI18n.requiredMessage,
      mergedI18n.headerCancelButton,
      mergedI18n.saveTitleButton,
      updatedTitle,
      testId,
      title,
      onEditTitle,
    ]
  );

  return (
    <PageTitleBar
      breadcrumb={breadcrumbs}
      extraContent={extraContent}
      title={title}
      editable={!!onEditTitle && !isTitleEditMode}
      renderTitleFunction={isTitleEditMode ? () => editComponents : null}
      onEdit={handleEditClick}
      i18n={{ editIconDescription: mergedI18n.headerEditTitleButton }}
      testId={`${testId}-page-title-bar`}
    />
  );
};

DashboardEditorHeader.defaultProps = defaultProps;
DashboardEditorHeader.propTypes = propTypes;

export default DashboardEditorHeader;
