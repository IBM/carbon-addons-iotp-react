import React from 'react';
import PropTypes from 'prop-types';
import { merge } from 'lodash-es';
import { TrashCan, InformationFilled } from '@carbon/react/icons';
import { TextInput, TextArea } from '@carbon/react';

import Dropdown from '../../Dropdown/Dropdown';
import { settings } from '../../../constants/Settings';
import Button from '../../Button/Button';
import ColorDropdown from '../../ColorDropdown/ColorDropdown';
import {
  HotspotIconPropType,
  OverridePropTypes,
  ColorPropType,
} from '../../../constants/SharedPropTypes';
import { getOverrides } from '../../../utils/componentUtilityFunctions';
import deprecate from '../../../internal/deprecate';

const { iotPrefix } = settings;

const propTypes = {
  /** Array of selectable color objects */
  hotspotIconFillColors: PropTypes.arrayOf(ColorPropType).isRequired,
  /** Array of selectable icon objects. Use icon size 24 for the icon */
  hotspotIcons: PropTypes.arrayOf(HotspotIconPropType),
  /** The state values of the controlled form elements e.g. { title: 'My hotspot 1', description: 'Lorem ipsum' } */
  formValues: PropTypes.shape({
    content: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
    }),
    /** Can be an icon object or just the name if  there is a matching icon in the hotspotIcons array */
    icon: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    /** Can be a colorPropType object or just the carbonColor prop of a colorPropType object */
    color: PropTypes.oneOfType([ColorPropType, PropTypes.string]),
  }),
  /** Internationalisation strings */
  i18n: PropTypes.shape({
    deleteButtonLabelText: PropTypes.string,
    deleteButtonIconDescriptionText: PropTypes.string,
    titleInputLabelText: PropTypes.string,
    titleInputPlaceholderText: PropTypes.string,
    descriptionTextareaLabelText: PropTypes.string,
    descriptionTextareaPlaceholderText: PropTypes.string,
    iconDropdownTitleText: PropTypes.string,
    iconDropdownLabelText: PropTypes.string,
    colorDropdownLabelText: PropTypes.string,
    colorDropdownTitleText: PropTypes.string,
    infoMessageText: PropTypes.string,
  }),
  translateWithId: PropTypes.func.isRequired,
  /** Callback for when any of the form element's value changes */
  onChange: PropTypes.func.isRequired,
  /** Callback for when the delete button is clicked */
  onDelete: PropTypes.func.isRequired,
  /**
   * Used to overide the internal components and props for the text based input
   * if need should arise to manage defaultValue, length or validation etc.
   */
  overrides: PropTypes.shape({
    titleTextInput: OverridePropTypes,
    decriptionTextArea: OverridePropTypes,
  }),
  /** The id of the form elememt that should be initially focused */
  primaryInputId: PropTypes.string,
  /** Show the delete hotspot button */
  showDeleteButton: PropTypes.bool,
  /** Shows the info message if true */
  showInfoMessage: PropTypes.bool,
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  /** Id that can be used for testing */
  testId: PropTypes.string,
};

const defaultProps = {
  hotspotIcons: [],
  formValues: {},
  i18n: {
    deleteButtonLabelText: 'Delete hotspot',
    deleteButtonIconDescriptionText: 'Delete this hotspot',
    titleInputLabelText: 'Title',
    titleInputPlaceholderText: 'Enter title for the tooltip',
    descriptionTextareaLabelText: 'Description',
    descriptionTextareaPlaceholderText: 'Enter description for the tooltip',
    iconDropdownLabelText: 'Select an icon',
    iconDropdownTitleText: 'Icon',
    infoMessageText:
      'Hold the CTRL key and click a position on the image to add a hotspot, or set the X and Y coordinates using dataitems and create hotspots at those positions.',
    colorDropdownLabelText: 'Select a color',
    colorDropdownTitleText: 'Color',
  },
  overrides: undefined,
  primaryInputId: undefined,
  showInfoMessage: false,
  showDeleteButton: true,
  testId: 'HotspotEditorTooltipTab',
};

const preventFormSubmission = (e) => e.preventDefault();

const getSelectedColorItem = (color, hotspotIconFillColors) => {
  return typeof color === 'string' && Array.isArray(hotspotIconFillColors)
    ? hotspotIconFillColors.find((colorObj) => colorObj.carbonColor === color)
    : color;
};

const getSelectedIconItem = (icon, hotspotIcons) => {
  return typeof icon === 'string' && hotspotIcons.length
    ? hotspotIcons.find((iconObj) => iconObj.id === icon)
    : icon;
};

/**
 * This component renders a form for editing the tooltip settings of an existing Hotspot.
 * The title, description, icon and color of this tooltip foor this hotspot
 */
const HotspotEditorTooltipTab = ({
  hotspotIcons,
  hotspotIconFillColors,
  formValues,
  i18n,
  primaryInputId,
  onChange,
  onDelete,
  overrides,
  showInfoMessage,
  showDeleteButton,
  // TODO: remove the deprecated testID prop in v3
  testID,
  testId,
  translateWithId,
}) => {
  const {
    deleteButtonLabelText,
    deleteButtonIconDescriptionText,
    titleInputLabelText,
    titleInputPlaceholderText,
    descriptionTextareaLabelText,
    descriptionTextareaPlaceholderText,
    iconDropdownLabelText,
    iconDropdownTitleText,
    infoMessageText,
    colorDropdownLabelText,
    colorDropdownTitleText,
  } = merge({}, defaultProps.i18n, i18n);

  const currentIconColor = formValues.color?.carbonColor ?? formValues.color ?? 'currentcolor';
  const hasNonEditableContent = React.isValidElement(formValues?.content);

  const renderInfoMessage = () => (
    <div className={`${iotPrefix}--hotspot-editor--tooltip-info-message`}>
      <InformationFilled size={24} />
      <p>{infoMessageText}</p>
    </div>
  );

  const renderColorIconContainer = () => (
    <div
      className={`${iotPrefix}--icon-color-container`}
      style={{ '--icon-fill-color': currentIconColor }}
    >
      <Dropdown
        key={formValues.icon?.id ?? formValues.icon}
        id="tooltip-form-icon"
        items={hotspotIcons}
        label={iconDropdownLabelText}
        light
        onChange={(change) => {
          onChange({ icon: change.selectedItem.id });
        }}
        selectedItem={getSelectedIconItem(formValues?.icon, hotspotIcons)}
        titleText={iconDropdownTitleText}
        type="default"
        translateWithId={translateWithId}
      />

      <ColorDropdown
        key={currentIconColor} // Neded to update the selectedColor after initial render
        selectedColor={getSelectedColorItem(formValues.color, hotspotIconFillColors)}
        id="tooltip-form-color"
        colors={hotspotIconFillColors}
        label={colorDropdownLabelText}
        light
        onChange={(selectedColorItem) => {
          onChange({ color: selectedColorItem.color?.carbonColor });
        }}
        titleText={colorDropdownTitleText}
        translateWithId={translateWithId}
      />
    </div>
  );

  const MyTitleTextInput = overrides?.titleTextInput?.component || TextInput;
  const MyDecriptionTextArea = overrides?.decriptionTextArea?.component || TextArea;

  return (
    <div className={`${iotPrefix}--hotspot-editor-tooltip-tab`}>
      {showInfoMessage ? (
        renderInfoMessage()
      ) : (
        <>
          <form
            className={`${iotPrefix}--hotspot-editor--tooltip-form`}
            data-testid={testID || testId}
            onSubmit={preventFormSubmission}
          >
            <MyTitleTextInput
              disabled={hasNonEditableContent}
              name="title"
              data-testid={`${testID || testId}-title-input`}
              value={formValues.content?.title || ''}
              id={primaryInputId || 'tooltip-form-title'}
              labelText={titleInputLabelText}
              light
              onChange={(evt) => {
                onChange({ content: { title: evt.target.value } });
              }}
              placeholder={titleInputPlaceholderText}
              type="text"
              {...getOverrides(overrides?.titleTextInput?.props)}
            />
            <MyDecriptionTextArea
              disabled={hasNonEditableContent}
              name="description"
              id="tooltip-form-description"
              labelText={descriptionTextareaLabelText}
              light
              onChange={(evt) => {
                onChange({ content: { description: evt.target.value } });
              }}
              placeholder={descriptionTextareaPlaceholderText}
              value={formValues.content?.description || ''}
              {...getOverrides(overrides?.decriptionTextArea?.props)}
            />
            {renderColorIconContainer()}
          </form>
          {showDeleteButton ? (
            <div className={`${iotPrefix}--hotspot-editor-tooltip-tab__delete-button-container`}>
              <Button
                kind="ghost"
                renderIcon={(props) => <TrashCan size={32} {...props} />}
                iconDescription={deleteButtonIconDescriptionText}
                onClick={onDelete}
              >
                {deleteButtonLabelText}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

HotspotEditorTooltipTab.propTypes = propTypes;
HotspotEditorTooltipTab.defaultProps = defaultProps;

export default HotspotEditorTooltipTab;
