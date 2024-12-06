import React from 'react';
import PropTypes from 'prop-types';
import { merge } from 'lodash-es';
import { NumberInput } from '@carbon/react';
import {
  TrashCan,
  InformationFilled,
  TextBold,
  TextItalic,
  TextUnderline,
} from '@carbon/react/icons';

import { settings } from '../../../constants/Settings';
import IconSwitch from '../../IconSwitch/IconSwitch';
import ColorDropdown from '../../ColorDropdown/ColorDropdown';
import Button from '../../Button/Button';
import { isNumberValidForMinMax } from '../../../utils/componentUtilityFunctions';

const { iotPrefix } = settings;

const colorPropType = PropTypes.shape({
  carbonColor: PropTypes.string,
  name: PropTypes.string,
});

const propTypes = {
  /** Specify an optional className to be applied to the container node */
  className: PropTypes.string,
  /** True if the light theme is to be used, defaults to true */
  light: PropTypes.bool,
  /** set of internationalized labels */
  i18n: PropTypes.shape({
    boldLabelText: PropTypes.string,
    infoMessageText: PropTypes.string,
    italicLabelText: PropTypes.string,
    underlineLabelText: PropTypes.string,
    fontColorLabelText: PropTypes.string,
    fontSizeLabelText: PropTypes.string,
    fontSizeInvalidText: PropTypes.string,
    backgroundLabelText: PropTypes.string,
    fillOpacityLabelText: PropTypes.string,
    fillOpacityInvalidText: PropTypes.string,
    borderLabelText: PropTypes.string,
    borderWidthLabelText: PropTypes.string,
    borderWidthInvalidText: PropTypes.string,
    deleteButtonLabelText: PropTypes.string,
    deleteButtonIconDescription: PropTypes.string,
    selectAColor: PropTypes.string,
  }),
  /** Callback i18n function for translating ListBoxMenuIcon SVG title in the MultiSelect component */
  translateWithId: PropTypes.func.isRequired,
  /** Callback for when any of the form element's value changes */
  onChange: PropTypes.func.isRequired,
  /** Callback for when the delete button is clicked */
  onDelete: PropTypes.func.isRequired,
  /** The state values of the controlled form elements */
  formValues: PropTypes.shape({
    bold: PropTypes.bool,
    italic: PropTypes.bool,
    underline: PropTypes.bool,
    content: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        attributes: PropTypes.arrayOf(
          PropTypes.shape({
            dataItemId: PropTypes.string,
            dataSourceId: PropTypes.string,
            label: PropTypes.string,
            precision: PropTypes.number,
          })
        ),
      }),
    ]),
    fontColor: PropTypes.oneOfType([PropTypes.string, colorPropType]),
    fontSize: PropTypes.number,
    backgroundColor: PropTypes.oneOfType([PropTypes.string, colorPropType]),
    backgroundOpacity: PropTypes.number,
    borderColor: PropTypes.oneOfType([PropTypes.string, colorPropType]),
    borderWidth: PropTypes.number,
  }),
  /** Array of colors to be shown for the font colors dropdown */
  fontColors: PropTypes.arrayOf(colorPropType),
  /** Array of colors to be shown for the background colors dropdown */
  backgroundColors: PropTypes.arrayOf(colorPropType),
  /** Array of colors to be shown for the border colors dropdown */
  borderColors: PropTypes.arrayOf(colorPropType),
  /** Minimum Font size */
  minFontSize: PropTypes.number,
  /** Maximum Font size */
  maxFontSize: PropTypes.number,
  /** Minimum Opacity Value */
  minOpacity: PropTypes.number,
  /** Maximum Opacity Value */
  maxOpacity: PropTypes.number,
  /** Minimum Border Width */
  minBorderWidth: PropTypes.number,
  /** Maximum Border Width */
  maxBorderWidth: PropTypes.number,
  /** Set to true to hide all form elements and show the info message */
  showInfoMessage: PropTypes.bool,
};

const defaultProps = {
  className: '',
  light: true,
  i18n: {
    boldLabelText: 'Text Bold',
    infoMessageText:
      'Select an existing label on the image to edit it or hold the CTRL key and click on an empty region to create one',
    italicLabelText: 'Text Italic',
    underlineLabelText: 'Text Underline',
    fontColorLabelText: 'Font color',
    fontSizeLabelText: 'Font Size',
    fontSizeInvalidText: 'Font Size is invalid',
    backgroundLabelText: 'Background',
    fillOpacityLabelText: 'Fill Opacity',
    fillOpacityInvalidText: 'Fill Opacity is invalid',
    borderLabelText: 'Border',
    borderWidthLabelText: 'Border Width',
    borderWidthInvalidText: 'Border Width is invalid',
    deleteButtonLabelText: 'Delete hotspot',
    deleteButtonIconDescription: 'Delete this hotspot',
  },
  formValues: {
    bold: false,
    italic: false,
    underline: false,
    fontColor: undefined,
    fontSize: undefined,
    backgroundColor: undefined,
    backgroundOpacity: undefined,
    borderColor: undefined,
    borderWidth: undefined,
  },
  fontColors: undefined,
  backgroundColors: undefined,
  borderColors: undefined,
  minFontSize: undefined,
  maxFontSize: undefined,
  minOpacity: undefined,
  maxOpacity: undefined,
  minBorderWidth: undefined,
  maxBorderWidth: undefined,
  showInfoMessage: false,
};

const getSelectedColorItem = (color, colorCollection) => {
  return typeof color === 'string' && Array.isArray(colorCollection)
    ? colorCollection.find((colorObj) => colorObj.carbonColor === color)
    : color;
};

const preventFormSubmission = (e) => e.preventDefault();

/**
 * This component renders a form that allows the user to change the style of the text type hotspots
 */
const HotspotTextStyleTab = ({
  className,
  fontColors,
  backgroundColors,
  borderColors,
  formValues,
  light,
  i18n,
  onChange,
  onDelete,
  minFontSize,
  maxFontSize,
  minOpacity,
  maxOpacity,
  minBorderWidth,
  maxBorderWidth,
  showInfoMessage,
  translateWithId,
}) => {
  const {
    boldLabelText,
    infoMessageText,
    italicLabelText,
    underlineLabelText,
    fontColorLabelText,
    fontSizeLabelText,
    fontSizeInvalidText,
    backgroundLabelText,
    fillOpacityLabelText,
    fillOpacityInvalidText,
    borderLabelText,
    borderWidthLabelText,
    borderWidthInvalidText,
    deleteButtonLabelText,
    deleteButtonIconDescription,
    selectAColor,
  } = merge({}, defaultProps.i18n, i18n);

  const {
    bold,
    italic,
    underline,
    fontSize,
    fontColor,
    backgroundColor,
    backgroundOpacity,
    borderColor,
    borderWidth,
  } = formValues;

  const hasNonEditableContent = React.isValidElement(formValues?.content);

  const renderInfoMessage = () => (
    <div className={`${iotPrefix}--hotspot-editor--text-info-message`}>
      <InformationFilled size={24} />
      <p>{infoMessageText}</p>
    </div>
  );

  return (
    <div className={className}>
      {showInfoMessage ? (
        renderInfoMessage()
      ) : (
        <>
          <form
            onSubmit={preventFormSubmission}
            className={`${iotPrefix}--hotspot-text-style-tab__form`}
          >
            <div className={`${iotPrefix}--hotspot-text-style-tab__text-style`}>
              <IconSwitch
                disabled={hasNonEditableContent}
                onClick={() => onChange({ bold: !bold })}
                data-testid="hotspot-bold"
                selected={bold}
                text={boldLabelText}
                renderIcon={() => <TextBold size="16" />}
                index={0}
                light={light}
              />
              <IconSwitch
                disabled={hasNonEditableContent}
                name="italic"
                onClick={() => onChange({ italic: !italic })}
                data-testid="hotspot-italic"
                selected={italic}
                text={italicLabelText}
                renderIcon={() => <TextItalic size="16" />}
                index={1}
                light={light}
              />
              <IconSwitch
                disabled={hasNonEditableContent}
                name="underline"
                onClick={() => onChange({ underline: !underline })}
                data-testid="hotspot-underline"
                selected={underline}
                text={underlineLabelText}
                renderIcon={() => <TextUnderline size="16" />}
                index={2}
                light={light}
              />
            </div>

            <div className={`${iotPrefix}--hotspot-text-style-tab__row`}>
              <ColorDropdown
                disabled={hasNonEditableContent}
                key={fontColor?.carbonColor ?? fontColor}
                id={`${iotPrefix}--hotspot-text-style-tab__font-color`}
                titleText={fontColorLabelText}
                light={light}
                label={selectAColor}
                selectedColor={getSelectedColorItem(fontColor, fontColors)}
                colors={fontColors}
                onChange={(selected) => {
                  onChange({ fontColor: selected.color.carbonColor });
                }}
                translateWithId={translateWithId}
              />

              <NumberInput
                disabled={hasNonEditableContent}
                allowEmpty
                id={`${iotPrefix}--hotspot-text-style-tab__font-size`}
                min={minFontSize}
                max={maxFontSize}
                value={fontSize}
                step={1}
                label={fontSizeLabelText}
                invalidText={fontSizeInvalidText}
                onChange={(event) => {
                  const parsedValue = Number(event.imaginaryTarget.value);
                  if (isNumberValidForMinMax(parsedValue, minFontSize, maxFontSize)) {
                    onChange({
                      fontSize: parsedValue,
                    });
                  }
                }}
              />
            </div>

            <div className={`${iotPrefix}--hotspot-text-style-tab__row`}>
              <ColorDropdown
                key={backgroundColor?.carbonColor ?? backgroundColor}
                id={`${iotPrefix}--hotspot-text-style-tab__background-color`}
                titleText={backgroundLabelText}
                light={light}
                label={selectAColor}
                selectedColor={getSelectedColorItem(backgroundColor, backgroundColors)}
                colors={backgroundColors}
                onChange={(selected) => {
                  onChange({
                    backgroundColor: selected.color.carbonColor,
                  });
                }}
                translateWithId={translateWithId}
              />

              <NumberInput
                id={`${iotPrefix}--hotspot-text-style-tab__background`}
                label={fillOpacityLabelText}
                min={minOpacity}
                max={maxOpacity}
                value={backgroundOpacity}
                step={1}
                light={light}
                invalidText={fillOpacityInvalidText}
                onChange={(event) => {
                  const parsedValue = Number(event.imaginaryTarget.value);
                  if (isNumberValidForMinMax(parsedValue, minOpacity, maxOpacity)) {
                    onChange({
                      backgroundOpacity: parsedValue,
                    });
                  }
                }}
              />
            </div>

            <div className={`${iotPrefix}--hotspot-text-style-tab__row`}>
              <ColorDropdown
                key={borderColor?.carbonColor ?? borderColor}
                id={`${iotPrefix}--hotspot-text-style-tab__border-color`}
                titleText={borderLabelText}
                light={light}
                label={i18n.selectAColor}
                colors={borderColors}
                onChange={(selected) => {
                  onChange({ borderColor: selected.color.carbonColor });
                }}
                translateWithId={translateWithId}
                selectedColor={getSelectedColorItem(borderColor, borderColors)}
              />

              <NumberInput
                id={`${iotPrefix}--hotspot-text-style-tab__border`}
                label={borderWidthLabelText}
                min={minBorderWidth}
                max={maxBorderWidth}
                value={borderWidth}
                step={1}
                light={light}
                invalidText={borderWidthInvalidText}
                onChange={(event) => {
                  const parsedValue = Number(event.imaginaryTarget.value);
                  if (isNumberValidForMinMax(parsedValue, minBorderWidth, maxBorderWidth)) {
                    onChange({
                      borderWidth: parsedValue,
                    });
                  }
                }}
              />
            </div>
          </form>
          <div className={`${iotPrefix}--hotspot-text-style-tab__delete-button-container`}>
            <Button
              kind="ghost"
              renderIcon={(props) => <TrashCan size={32} {...props} />}
              iconDescription={deleteButtonIconDescription}
              onClick={onDelete}
            >
              {deleteButtonLabelText}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

HotspotTextStyleTab.propTypes = propTypes;
HotspotTextStyleTab.defaultProps = defaultProps;

export default HotspotTextStyleTab;
