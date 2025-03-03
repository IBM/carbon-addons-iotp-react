import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Close, Scale } from '@carbon/react/icons';
import { omit } from 'lodash-es';

import Button from '../../../../Button';
import {
  DashboardEditorActionsPropTypes,
  DataItemsPropTypes,
  defaultDashboardEditorActionsProps,
} from '../../../../DashboardEditor/editorUtils';
import HotspotEditorModal from '../../../../HotspotEditorModal/HotspotEditorModal';
import { settings } from '../../../../../constants/Settings';
import ContentFormItemTitle from '../ContentFormItemTitle';
import { ImageCardValuesPropType } from '../../../../../constants/CardPropTypes';

const { iotPrefix, prefix } = settings;

const propTypes = {
  /* card value */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
    content: PropTypes.shape({
      id: PropTypes.string,
      src: PropTypes.string,
      zoomMax: PropTypes.number,
      displayOption: PropTypes.string,
    }),
    values: ImageCardValuesPropType,
    interval: PropTypes.string,
  }),
  /* callback when image cardConfig needs to be updated */
  onChange: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    imageFile: PropTypes.string,
    editImage: PropTypes.string,
    image: PropTypes.string,
    close: PropTypes.string,
    dataItemEditorSectionImageTooltipText: PropTypes.string,
  }),
  /** optional link href's for each card type that will appear in a tooltip */
  dataSeriesItemLinks: PropTypes.shape({
    image: PropTypes.string,
  }),
  translateWithId: PropTypes.func.isRequired,
  /** an array of dataItems to be included on each card */
  dataItems: DataItemsPropTypes,
  /** if provided, returns an array of strings which are the dataItems to be allowed
   * on each card
   * getValidDataItems(card, selectedTimeRange)
   */
  getValidDataItems: PropTypes.func,
  /** an object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   */
  availableDimensions: PropTypes.shape({}),
  /** call back to retrieve the dynamic demo hotspots, by default just returns one example dynamic hotspot, override to return true hotspots.
   * See HotspotEditorModal propTypes for params and details */
  onFetchDynamicDemoHotspots: PropTypes.func,
  actions: DashboardEditorActionsPropTypes,
};

const defaultProps = {
  cardConfig: {},
  i18n: {
    imageFile: 'Image file',
    editImage: 'Edit image',
    image: 'Image',
    close: 'Close',
    dataItemEditorSectionImageTooltipText:
      'Add tooltips to hotspots on the image. Show metric or dimension values on the tooltips.',
  },
  dataSeriesItemLinks: null,
  dataItems: [],
  getValidDataItems: null,
  availableDimensions: {},
  onFetchDynamicDemoHotspots: null,
  actions: defaultDashboardEditorActionsProps,
};

const ImageCardFormItems = ({
  cardConfig,
  i18n,
  onChange,
  dataSeriesItemLinks,
  dataItems,
  getValidDataItems,
  availableDimensions,
  translateWithId,
  onFetchDynamicDemoHotspots,
  actions,
}) => {
  const [isHotspotModalShowing, setIsHotspotModalShowing] = useState(false);
  const mergedI18n = { ...defaultProps.i18n, ...i18n };
  const baseClassName = `${iotPrefix}--card-edit-form`;
  const handleShowHotspotEditor = useCallback(() => {
    // if this image card doesn't have a hotspots field, set it
    if (!cardConfig.values) {
      onChange({ ...cardConfig, values: { hotspots: [] } });
    }
    setIsHotspotModalShowing(true);
  }, [cardConfig, onChange]);
  const handleCloseHotspotEditor = useCallback(() => setIsHotspotModalShowing(false), []);

  const handleSaveHotspotEditor = useCallback(
    (cardConfigWithHotspots) => {
      handleCloseHotspotEditor();
      onChange(cardConfigWithHotspots);
    },
    [handleCloseHotspotEditor, onChange]
  );
  return (
    <>
      {isHotspotModalShowing ? (
        <HotspotEditorModal
          cardConfig={cardConfig}
          displayOption={cardConfig.content?.displayOption}
          getValidDataItems={getValidDataItems}
          dataItems={dataItems}
          availableDimensions={availableDimensions}
          onSave={handleSaveHotspotEditor}
          onClose={handleCloseHotspotEditor}
          translateWithId={translateWithId}
          i18n={mergedI18n}
          onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
          actions={actions}
        />
      ) : null}
      <ContentFormItemTitle
        title={mergedI18n.image}
        tooltip={{
          tooltipText: mergedI18n.dataItemEditorSectionImageTooltipText,
          ...(dataSeriesItemLinks?.image
            ? {
                linkText: mergedI18n.dataItemEditorSectionTooltipLinkText,
                href: dataSeriesItemLinks.image,
              }
            : {}),
        }}
      />
      <div className={`${baseClassName}--form-section-image--input`}>
        <label
          id={`${mergedI18n.imageFile}-label`}
          className={`${prefix}--label`}
          htmlFor={mergedI18n.imageFile}
        >
          {mergedI18n.imageFile}
          <input
            id={mergedI18n.imageFile}
            className={`${prefix}--text-input ${prefix}--text__input ${prefix}--text-input--light ${baseClassName}--form-section-image-input`}
            readOnly
            value={cardConfig.content?.id || ''}
          />
          {cardConfig.content?.id ? (
            <Button
              kind="ghost"
              renderIcon={Close}
              size="md"
              iconDescription={mergedI18n.close}
              className={`${baseClassName}--form-section ${baseClassName}--form-section-image-clear-button`}
              onClick={() =>
                // close means clear the image info out of the JSON
                onChange(
                  omit(cardConfig, 'content.id', 'content.src', 'content.alt', 'content.imgState')
                )
              }
            />
          ) : null}
        </label>
        {cardConfig.content?.id ? (
          <Button
            className={`${baseClassName}--form-section-image-btn`}
            size="sm"
            renderIcon={(props) => <Scale size={32} {...props} />}
            onClick={handleShowHotspotEditor}
          >
            {mergedI18n.editImage}
          </Button>
        ) : null}
      </div>
    </>
  );
};

ImageCardFormItems.propTypes = propTypes;
ImageCardFormItems.defaultProps = defaultProps;

export default ImageCardFormItems;
