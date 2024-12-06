import React from 'react';
import PropTypes from 'prop-types';
import { InlineNotification } from '@carbon/react';
import classnames from 'classnames';

import WizardFooter from '../../WizardInline/WizardFooter/WizardFooter';
import WizardContent from '../../WizardInline/WizardContent/WizardContent';
import { settings } from '../../../constants/Settings';

import TableDetailWizardHeader from './TableDetailWizardHeader/TableDetailWizardHeader';
import DetailWizardSidebar from './TableDetailWizardSidebar/TableDetailWizardSidebar';

const { prefix, iotPrefix } = settings;

export const propTypes = {
  /** Title in the header */
  title: PropTypes.string.isRequired,
  /** Id of current step */
  currentItemId: PropTypes.string,
  /** Array of items representing pages of wizard. Must contain id, name, component. Optional: backLabel, nextLabel, nextDisabled */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      component: PropTypes.node.isRequired,
      /** if you return false the onNext or setItem functions will not be called to change the current step */
      onValidate: PropTypes.func,
    })
  ).isRequired,
  /** action when click next button called with no param */
  onNext: PropTypes.func,
  /** action when click back button called with no param */
  onBack: PropTypes.func,
  /** action if the inline wizard is closed or canceled */
  onClose: PropTypes.func,
  /** action triggered if the inline wizard has submitted final step */
  onSubmit: PropTypes.func,
  /** label to show on the cancel button */
  cancelLabel: PropTypes.node,
  /** label to show on the back button */
  backLabel: PropTypes.node,
  /** label to show on the next button */
  nextLabel: PropTypes.node,
  /** label to show on the submit button */
  submitLabel: PropTypes.node,
  /** function to go to item when click ProgressIndicator items. */
  setItem: PropTypes.func,
  /** show labels in Progress Indicator */
  showLabels: PropTypes.bool,
  /** next button disabled */
  nextDisabled: PropTypes.bool,
  /** width of each step in px.  Circle is 24px. Passed to Header */
  stepWidth: PropTypes.number,
  /** is the wizard actively sending data should disable the button */
  sendingData: PropTypes.bool,
  /** Form Error Details */
  error: PropTypes.string,
  /**  Clear the currently shown error, triggered if the user closes the ErrorNotification */
  onClearError: PropTypes.func,
  /** Set the progress indicator button to clickable */
  isClickable: PropTypes.bool,
};

export const defaultProps = {
  showLabels: true,
  nextDisabled: false,
  currentItemId: null,
  stepWidth: 7,
  onNext: null,
  onBack: null,
  setItem: null,
  onClose: null,
  onSubmit: null,
  backLabel: 'Back',
  nextLabel: 'Next',
  cancelLabel: 'Cancel',
  submitLabel: 'Add',
  sendingData: false,
  error: null,
  onClearError: null,
  isClickable: false,
};

const TableDetailWizard = ({
  title,
  currentItemId,
  items,
  onNext,
  onBack,
  setItem,
  showLabels,
  backLabel,
  nextLabel,
  cancelLabel,
  submitLabel,
  onSubmit,
  onClose,
  nextDisabled,
  sendingData,
  stepWidth,
  className,
  error,
  onClearError,
  isClickable,
}) => {
  const currentItemObj = items.find(({ id }) => currentItemId === id) || items[0];
  const currentItemIndex = items.findIndex(({ id }) => currentItemId === id);

  const hasNext = currentItemIndex !== items.length - 1;
  const hasPrev = currentItemIndex !== 0;

  const handleClearError = () => {
    if (onClearError) {
      onClearError();
    }
  };

  const isValid = (callback) => {
    if (currentItemObj && currentItemObj.onValidate) {
      if (currentItemObj.onValidate(currentItemId)) {
        callback();
      } else return;
    }
    callback();
  };

  return (
    <div className={classnames(className, `${iotPrefix}--table-detail-wizard--wizard-wrapper`)}>
      <TableDetailWizardHeader title={title} onClose={onClose} />
      <div className={`${iotPrefix}--table-detail-wizard--wizard-container`}>
        <DetailWizardSidebar
          currentItemId={currentItemId}
          // only go if current step passes validation
          setItem={(id) => isValid(() => setItem(id))}
          items={items}
          showLabels={showLabels}
          stepWidth={stepWidth}
          isClickable={isClickable}
        />
        <div className={`${iotPrefix}--table-detail-wizard--content-container`}>
          <WizardContent component={currentItemObj.component} />
        </div>
      </div>
      {error ? (
        <InlineNotification
          title={error}
          subtitle=""
          kind="error"
          onCloseButtonClick={handleClearError}
          className={`${iotPrefix}--table-detail-wizard--inline-notification`}
        />
      ) : null}
      <div className={classnames(className, `${iotPrefix}--table-detail-wizard--footer`)}>
        <div className={`${prefix}--modal-footer`}>
          <WizardFooter
            backLabel={backLabel}
            nextLabel={nextLabel}
            hasNext={hasNext}
            hasPrev={hasPrev}
            cancelLabel={cancelLabel}
            submitLabel={submitLabel}
            // Validate before next
            onNext={(event) => isValid(() => onNext(event))}
            onBack={onBack}
            onSubmit={onSubmit}
            onCancel={onClose}
            nextDisabled={nextDisabled || false}
            sendingData={sendingData}
          />
        </div>
      </div>
    </div>
  );
};

TableDetailWizard.propTypes = propTypes;
TableDetailWizard.defaultProps = defaultProps;
export default TableDetailWizard;
