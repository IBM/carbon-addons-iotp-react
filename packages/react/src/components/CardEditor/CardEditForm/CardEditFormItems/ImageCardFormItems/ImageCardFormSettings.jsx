import React from 'react';
import PropTypes from 'prop-types';
import { RadioButtonGroup, RadioButton, FormGroup, Toggle } from '@carbon/react';
import { gray10, gray80, white } from '@carbon/colors';

import { settings } from '../../../../../constants/Settings';
import ColorDropdown from '../../../../ColorDropdown/ColorDropdown';

const { iotPrefix } = settings;

const propTypes = {
  /** card data value */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
    content: PropTypes.shape({
      hideMinimap: PropTypes.bool,
      hideHotspots: PropTypes.bool,
      hideZoomControls: PropTypes.bool,
      id: PropTypes.string,
      displayOption: PropTypes.string,
      background: PropTypes.string,
    }),
    interval: PropTypes.string,
  }),
  /** Callback function when form data changes */
  onChange: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    displayOptions: PropTypes.string,
    colorTitleText: PropTypes.string,
    hideMap: PropTypes.string,
    hideZoom: PropTypes.string,
    zoomLevel: PropTypes.string,
    fit: PropTypes.string,
    stretch: PropTypes.string,
    selectAColor: PropTypes.string,
  }),
  /** Callback function to call to translate common elements */
  translateWithId: PropTypes.func.isRequired,
};

const defaultProps = {
  cardConfig: {},
  i18n: {
    displayOptions: 'Image display options',
    colorTitleText: 'Background color',
    hideMap: 'Hide mini map',
    hideZoom: 'Hide zoom controls',
    zoomLevel: 'Max zoom level',
    fit: 'Fit',
    stretch: 'Stretch',
    selectAColor: 'Select a color',
  },
};

const colors = [
  { carbonColor: gray10, name: 'gray10' },
  { carbonColor: gray80, name: 'gray80' },
  { carbonColor: white, name: 'white' },
];

const ImageCardFormSettings = ({ cardConfig, onChange, i18n, translateWithId }) => {
  const mergedI18n = { ...defaultProps.i18n, ...i18n };
  // Hiding until the UX for this form item is figured out.
  // const [zoom, setZoom] = useState(cardConfig.content.zoomLevel || 0);

  const baseClassName = `${iotPrefix}--card-edit-form`;

  // Hiding until the UX for this form item is figured out.
  // const handleZoomChange = ({ value }) => {
  //   onChange({
  //     ...cardConfig,
  //     content: { ...cardConfig.content, zoomMax: value },
  //   });
  //   setZoom(value);
  // };

  return (
    <div className={`${baseClassName} ${baseClassName}--form-section-image`}>
      <div className={`${baseClassName}--input`}>
        <FormGroup legendText={mergedI18n.displayOptions}>
          <RadioButtonGroup
            name={`${baseClassName}--input-radios`}
            onChange={(evt) =>
              onChange({
                ...cardConfig,
                content: { ...cardConfig.content, displayOption: evt },
              })
            }
            orientation="vertical"
            legend={mergedI18n.displayOptions}
            labelPosition="right"
            valueSelected={cardConfig.content?.displayOption}
          >
            <RadioButton
              data-testid={`${baseClassName}--input-radio1`}
              value="contain"
              id={`${baseClassName}--input-radio-1`}
              labelText={mergedI18n.fit}
            />
            <RadioButton
              data-testid={`${baseClassName}--input-radio3`}
              value="fill"
              id={`${baseClassName}--input-radio-3`}
              labelText={mergedI18n.stretch}
            />
          </RadioButtonGroup>
        </FormGroup>
      </div>
      <div className={`${baseClassName}--input`}>
        <ColorDropdown
          data-testid={`${baseClassName}--input-color-dropdown`}
          titleText={mergedI18n.colorTitleText}
          light
          title={mergedI18n.selectAColor}
          label={mergedI18n.selectAColor}
          colors={colors}
          id={`${baseClassName}--input-color`}
          selectedColor={colors.find(
            (color) => color.carbonColor === cardConfig.content?.background
          )}
          translateWithId={translateWithId}
          onChange={(evt) =>
            onChange({
              ...cardConfig,
              content: {
                ...cardConfig.content,
                background: evt.color.carbonColor,
              },
            })
          }
        />
      </div>
      <div className={`${baseClassName}--input`}>
        <div className={`${baseClassName}--input--toggle-field`}>
          <span>{mergedI18n.hideMap}</span>
          <Toggle
            size="sm"
            data-testid={`${baseClassName}--input-toggle1`}
            id={`${baseClassName}--input-toggle-1`}
            aria-label={mergedI18n.hideMap}
            labelA=""
            labelB=""
            toggled={cardConfig.content?.hideMinimap}
            onToggle={(bool) =>
              onChange({
                ...cardConfig,
                content: { ...cardConfig.content, hideMinimap: bool },
              })
            }
          />
        </div>
      </div>
      <div className={`${baseClassName}--input`}>
        <div className={`${baseClassName}--input--toggle-field`}>
          <span>{mergedI18n.hideZoom}</span>
          <Toggle
            size="sm"
            data-testid={`${baseClassName}--input-toggle2`}
            id={`${baseClassName}--input-toggle-2`}
            aria-label={mergedI18n.hideZoom}
            labelA=""
            labelB=""
            toggled={cardConfig.content?.hideZoomControls}
            onToggle={(bool) =>
              onChange({
                ...cardConfig,
                content: { ...cardConfig.content, hideZoomControls: bool },
              })
            }
          />
        </div>
      </div>
      {/*
        // Hiding until the UX for this form item is figured out.
        <div className={`${baseClassName}--input`}>
          <div className={`${baseClassName}--input--zoom-field`}>
            <Slider
              labelText={mergedI18n.zoomLevel}
              max={100}
              min={0}
              value={zoom}
              onChange={handleZoomChange}
            />
          </div>
        </div> */}
    </div>
  );
};

ImageCardFormSettings.propTypes = propTypes;
ImageCardFormSettings.defaultProps = defaultProps;

export default ImageCardFormSettings;
