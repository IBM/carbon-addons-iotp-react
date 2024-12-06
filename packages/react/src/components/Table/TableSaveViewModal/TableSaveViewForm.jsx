import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, Checkbox } from '@carbon/react';

import { settings } from '../../../constants/Settings';
import { OverridePropTypes } from '../../../constants/SharedPropTypes';

const { prefix, iotPrefix } = settings;

const propTypes = {
  /** Disables the form elements when true */
  disabled: PropTypes.bool,
  /** The state values of the controlled form elements e.g. { title: 'My view 1', isDefault: true } */
  formValues: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
  ).isRequired,
  /** Internationalisation strings */
  i18n: PropTypes.shape({
    titleInputLabelText: PropTypes.string,
    defaultCheckboxLabelText: PropTypes.string,
    publicCheckboxLabelText: PropTypes.string,
  }).isRequired,
  /** Callback for when any of the form element's value changes */
  onChange: PropTypes.func.isRequired,
  /** Used to overide the internal components and props for advanced customisation */
  overrides: PropTypes.shape({
    form: OverridePropTypes,
    titleTextInput: OverridePropTypes,
    viewDescriptionContainer: OverridePropTypes,
    defaultCheckbox: OverridePropTypes,
    publicCheckbox: OverridePropTypes,
  }),
  /** The id of the form elememt that should be initially focused */
  primaryInputId: PropTypes.string,
  /** Id that can be used for testing */
  testID: PropTypes.string,
  /** When true it will show that the title field has invalid input */
  titleInputInvalid: PropTypes.bool,
  /** Used to describe the input validation error for the the title field */
  titleInputInvalidText: PropTypes.string,
  /** A text that describes what this view contains */
  viewDescription: PropTypes.string,
};

const defaultProps = {
  disabled: false,
  overrides: undefined,
  primaryInputId: undefined,
  testID: 'TableSaveViewForm',
  titleInputInvalid: false,
  titleInputInvalidText: undefined,
  viewDescription: undefined,
};

const preventFormSubmission = (e) => e.preventDefault();

const TableSaveViewForm = ({
  formValues,
  disabled,
  i18n: { titleInputLabelText, defaultCheckboxLabelText, publicCheckboxLabelText },
  onChange,
  overrides,
  primaryInputId,
  testID,
  titleInputInvalid,
  titleInputInvalidText,
  viewDescription,
}) => {
  const MyForm = overrides?.form?.component || 'form';
  const MyTitleTextInput = overrides?.titleTextInput?.component || TextInput;
  const MyViewDescriptionContainer = overrides?.viewDescriptionContainer?.component || 'p';
  const MyDefaultCheckbox = overrides?.defaultCheckbox?.component || Checkbox;
  const MyPublicCheckbox = overrides?.publicCheckbox?.component || Checkbox;

  // A developer might override initial form values and not explicitly
  // assign all checkboxes a boolean value, but controlled Checkboxes
  // cannot have an undefined value.
  const enforceControlledCheckbox = (val) => (val !== undefined ? val : false);

  return (
    <MyForm data-testid={testID} onSubmit={preventFormSubmission} {...overrides?.form?.props}>
      <MyTitleTextInput
        name="title"
        data-testid={`${testID}-title-input`}
        value={formValues.title || ''}
        disabled={disabled}
        id={primaryInputId}
        invalid={titleInputInvalid}
        invalidText={titleInputInvalidText}
        labelText={titleInputLabelText}
        onChange={(evt) => {
          onChange({ title: evt.target.value });
        }}
        type="text"
        {...overrides?.titleTextInput?.props}
      />
      <MyViewDescriptionContainer
        className={`${iotPrefix}--save-view-modal__view-description`}
        // eslint-disable-next-line react/no-children-prop
        children={viewDescription}
        {...overrides?.viewDescriptionContainer?.props}
      />
      <fieldset className={`${prefix}--fieldset`}>
        <MyDefaultCheckbox
          name="isDefault"
          data-testid={`${testID}-default-checkbox`}
          checked={enforceControlledCheckbox(formValues.isDefault)}
          disabled={disabled}
          id="save-view-modal-default-checkbox-label"
          labelText={defaultCheckboxLabelText}
          onChange={(checked) => onChange({ isDefault: checked })}
          wrapperClassName={`${iotPrefix}--save-view-modal__default-view-checkbox`}
          {...overrides?.defaultCheckbox?.props}
        />
        <MyPublicCheckbox
          name="isPublic"
          data-testid={`${testID}-public-checkbox`}
          checked={enforceControlledCheckbox(formValues.isPublic)}
          disabled={disabled}
          id="save-view-modal-public-checkbox-label"
          labelText={publicCheckboxLabelText}
          wrapperClassName={`${iotPrefix}--save-view-modal__public-checkbox`}
          onChange={(checked) => onChange({ isPublic: checked })}
          {...overrides?.publicCheckbox?.props}
        />
      </fieldset>
    </MyForm>
  );
};

TableSaveViewForm.propTypes = propTypes;
TableSaveViewForm.defaultProps = defaultProps;

export default TableSaveViewForm;
