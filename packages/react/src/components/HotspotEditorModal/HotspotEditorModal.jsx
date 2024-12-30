import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ContentSwitcher,
  Switch,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  InlineNotification,
  InlineLoading,
} from '@carbon/react';
import { pick, sortBy } from 'lodash-es';
import update from 'immutability-helper';
import { gray50, red50, green50, blue50 } from '@carbon/colors';
import warning from 'warning';

import { HotspotIconPropType, ColorPropType } from '../../constants/SharedPropTypes';
import ImageHotspots from '../ImageCard/ImageHotspots';
import ComposedModal from '../ComposedModal';
import { settings } from '../../constants/Settings';
import {
  validThresholdIcons,
  validThresholdColors,
  validHotspotIcons,
  DashboardEditorActionsPropTypes,
} from '../DashboardEditor/editorUtils';
import useSizeObserver from '../../hooks/useSizeObserver';

import HotspotEditorTooltipTab from './HotspotEditorTooltipTab/HotspotEditorTooltipTab';
import HotspotTextStyleTab from './HotspotTextStyleTab/HotspotTextStyleTab';
import HotspotEditorDataSourceTab from './HotspotEditorDataSourceTab/HotspotEditorDataSourceTab';
import { hotspotTypes, useHotspotEditorState } from './hooks/hotspotStateHook';
import DynamicHotspotSourcePicker from './DynamicHotspotSourcePicker/DynamicHotspotSourcePicker';

const { iotPrefix } = settings;

/* istanbul ignore next */
const noop = () => {};

const selectableColors = [
  { carbonColor: gray50, name: 'gray' },
  { carbonColor: red50, name: 'red' },
  { carbonColor: green50, name: 'green' },
  { carbonColor: blue50, name: 'blue' },
];

const propTypes = {
  /** an object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   */
  availableDimensions: PropTypes.shape({}),
  /** Array of selectable color objects for text hotspot background */
  backgroundColors: PropTypes.arrayOf(ColorPropType),

  /** Array of selectable color objects for text hotspot border */
  borderColors: PropTypes.arrayOf(ColorPropType),

  cardConfig: PropTypes.shape({
    content: PropTypes.shape({
      alt: PropTypes.string,
      src: PropTypes.string,
      image: PropTypes.string,
      hideMinimap: PropTypes.bool,
      hideHotspots: PropTypes.bool,
      hideZoomControls: PropTypes.bool,
      id: PropTypes.string,
    }),
    description: PropTypes.string,
    id: PropTypes.string,
    size: PropTypes.string,
    title: PropTypes.string,
    /**
     * If this prop is present the HotspotEditorModal will place new and existing thresholds here
     * instead of under each hotspot in cardConfig.values.hotspots.
     */
    thresholds: PropTypes.arrayOf(
      PropTypes.shape({
        dataSourceId: PropTypes.string,
        comparison: PropTypes.string,
        value: PropTypes.number,
        color: PropTypes.string,
        icon: PropTypes.string,
      })
    ),
    type: PropTypes.string,
    values: PropTypes.shape({
      hotspots: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,

  dataItems: PropTypes.arrayOf(
    PropTypes.shape({
      dataSourceId: PropTypes.string,
      label: PropTypes.string,
      unit: PropTypes.string,
    })
  ),
  /** Default border width in px for new text hotspots */
  defaultBorderWidth: PropTypes.number,
  /** Default background fill opacity for new text hotspots */
  defaultBackgroundOpacity: PropTypes.number,
  /** Default font size in px for new text hotspots */
  defaultFontSize: PropTypes.number,
  defaultHotspotType: PropTypes.oneOf([
    hotspotTypes.FIXED,
    hotspotTypes.TEXT,
    hotspotTypes.DYNAMIC,
  ]),
  /** value for object-fit property - 'contain' or 'fill' */
  displayOption: PropTypes.string,

  /** Array of selectable color objects for text hotspot font */
  fontColors: PropTypes.arrayOf(ColorPropType),

  getValidDataItems: PropTypes.func,
  /** Array of selectable color objects for hotspot icon fill */
  hotspotIconFillColors: PropTypes.arrayOf(ColorPropType),
  /** Array of selectable icon objects for the hotspots adds to the default icons */
  hotspotIcons: PropTypes.arrayOf(HotspotIconPropType),

  imageId: PropTypes.string,
  imageZoomMax: PropTypes.number,

  /** Maximum Border Width */
  maxBorderWidth: PropTypes.number,
  /** Maximum Font size */
  maxFontSize: PropTypes.number,
  /** Maximum number of dynamic hotspots to load */
  maxHotspots: PropTypes.number,
  /** Maximum Opacity Value */
  maxOpacity: PropTypes.number,

  /** Minimum Opacity Value */
  minOpacity: PropTypes.number,
  /** Minimum Border Width */
  minBorderWidth: PropTypes.number,
  /** Callback for modal cancel button and close icon button */
  onClose: PropTypes.func.isRequired,
  /**
   * Callback to fetch dynamic hotspots. Should returns a Promise that resolves to an array of demo hotspots
   * matching the x & y source.  Called with one param, an object with 3 values
   * {
   *  maxHotspots: maximum number to return,
   *  xSource: the name of the data item to use as the xSource,
   *  ySource: the name of the data item to use as the ySource
   * }.
   * */
  onFetchDynamicDemoHotspots: PropTypes.func,
  /** Callback for modal save button returns the entire updated card config */
  onSave: PropTypes.func.isRequired,
  /** Should the dialog be open or not */
  open: PropTypes.bool,

  /** the label of the hotspot modal */
  label: PropTypes.string,
  showTooManyHotspotsInfo: PropTypes.bool,

  i18n: PropTypes.shape({
    fixedTypeDataSourceTabLabelText: PropTypes.string,
    fixedTypeTooltipTabLabelText: PropTypes.string,
    hotspotsText: PropTypes.string,
    labelsText: PropTypes.string,
    loadingDynamicHotspotsText: PropTypes.string,
    modalHeaderTitleText: PropTypes.string,
    modalIconDescriptionText: PropTypes.string,
    cancelButtonLabelText: PropTypes.string,
    saveButtonLabelText: PropTypes.string,
    textStyleLabelText: PropTypes.string,
    textTypeDataSourceTabLabelText: PropTypes.string,
    tooManyHotspotsInfoText: PropTypes.string,
  }),
  /** Callback i18n function for translating ListBoxMenuIcon SVG title in the MultiSelect component */
  translateWithId: PropTypes.func,

  testId: PropTypes.string,
  actions: DashboardEditorActionsPropTypes,
};

const defaultProps = {
  availableDimensions: {},
  backgroundColors: selectableColors,
  borderColors: selectableColors,
  dataItems: [],
  defaultBackgroundOpacity: 100,
  defaultBorderWidth: 0,
  defaultFontSize: 12,
  defaultHotspotType: hotspotTypes.FIXED,
  displayOption: null,
  fontColors: selectableColors,
  getValidDataItems: undefined,
  hotspotIconFillColors: validThresholdColors,
  hotspotIcons: validHotspotIcons,
  imageId: undefined,
  imageZoomMax: undefined,
  maxBorderWidth: 50,
  maxFontSize: 50,
  maxHotspots: 10,
  maxOpacity: 100,
  minBorderWidth: 0,
  minOpacity: 0,
  onFetchDynamicDemoHotspots: undefined,
  open: true,
  showTooManyHotspotsInfo: false,
  label: undefined,
  i18n: {
    fixedTypeDataSourceTabLabelText: 'Data source',
    fixedTypeTooltipTabLabelText: 'Tooltip',
    hotspotsText: 'Hotspots',
    labelsText: 'Labels',
    loadingDynamicHotspotsText: 'Locating hotspots',
    modalHeaderTitleText: 'Edit image',
    modalIconDescriptionText: 'Close',
    cancelButtonLabelText: 'Cancel',
    saveButtonLabelText: 'Save',
    textStyleLabelText: 'Text style',
    textTypeDataSourceTabLabelText: 'Data source',
    tooManyHotspotsInfoText: 'There are more hotspots than can be shown',
  },
  translateWithId: (idToTranslate) => {
    switch (idToTranslate) {
      default:
        return '';
      case 'clear.all':
        return 'Clear all';
      case 'open.menu':
        return 'Open menu';
      case 'close.menu':
        return 'Close menu';
    }
  },
  testId: 'hotspot-editor-modal',
  actions: {
    onEditDataItem: noop,
    dataSeriesFormActions: {
      hasAggregationsDropDown: noop,
      hasDataFilterDropdown: noop,
      onAddAggregations: noop,
    },
  },
};

const getSelectedHotspotsList = (selectedHotspot, hotspots) => {
  return selectedHotspot
    ? selectedHotspot.type === hotspotTypes.DYNAMIC
      ? hotspots.filter((hotspot) => hotspot.type === hotspotTypes.DYNAMIC)
      : [selectedHotspot]
    : [];
};

const HotspotEditorModal = ({
  availableDimensions,
  backgroundColors,
  borderColors,
  cardConfig,
  dataItems,
  defaultBorderWidth,
  defaultBackgroundOpacity,
  defaultFontSize,
  defaultHotspotType,
  displayOption,
  fontColors,
  getValidDataItems,
  hotspotIconFillColors,
  hotspotIcons,
  imageId,
  imageZoomMax,
  label,
  maxBorderWidth,
  maxFontSize,
  maxHotspots,
  maxOpacity,
  minOpacity,
  minBorderWidth,
  onClose,
  onFetchDynamicDemoHotspots,
  onSave: onSaveCallback,
  open,
  showTooManyHotspotsInfo,
  i18n,
  translateWithId,
  testId,
  actions,
}) => {
  React.useEffect(() => {
    if (__DEV__) {
      warning(
        false,
        'The `HotspotEditorModal` is an experimental component and could be lacking unit test and documentation. Be aware that minor version bumps could introduce breaking changes. For the reasons listed above use of this component in production is highly discouraged'
      );
    }
  }, []);
  const initialHotspots = cardConfig.values?.hotspots || [];
  const myDataItems = useMemo(
    () => sortBy(getValidDataItems ? getValidDataItems(cardConfig) : dataItems, 'label'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getValidDataItems, dataItems] // watching the card config for changes will simply load this too many times
  );
  const {
    currentType,
    hotspots,
    selectedHotspot,
    dynamicHotspotsLoading,
    dynamicHotspotSourceX,
    dynamicHotspotSourceY,
    addHotspot,
    clearDynamicHotspotsSource,
    deleteSelectedHotspot,
    setLoadingDynamicHotspots,
    setSelectedHotspot,
    setDynamicHotspots,
    switchCurrentType,
    updateHotspotDataSource,
    updateHotspotTooltip,
    updateTextHotspotStyle,
    updateTextHotspotContent,
    updateDynamicHotspotSourceX,
    updateDynamicHotspotSourceY,
  } = useHotspotEditorState({
    initialState: {
      hotspots: initialHotspots.filter((hotspot) => hotspot.type !== hotspotTypes.DYNAMIC),
      currentType: defaultHotspotType,
    },
  });

  const hasNonEditableContent = React.isValidElement(selectedHotspot?.content);
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  const [modalContentSize, modelContentRef] = useSizeObserver();

  const {
    backgroundLabelText,
    boldLabelText,
    borderLabelText,
    borderWidthInvalidText,
    cancelButtonLabelText,
    colorDropdownLabelText,
    colorDropdownTitleText,
    deleteButtonLabelText,
    deleteButtonIconDescriptionText,
    descriptionTextareaLabelText,
    descriptionTextareaPlaceholderText,
    fillOpacityLabelText,
    fillOpacityInvalidText,
    fixedTypeDataSourceTabLabelText,
    fixedTypeTooltipInfoText,
    fixedTypeTooltipTabLabelText,
    fontSizeInvalidText,
    hotspotsText,
    iconDropdownLabelText,
    iconDropdownTitleText,
    italicLabelText,
    labelsText,
    loadingDynamicHotspotsText,
    modalHeaderTitleText,
    modalIconDescriptionText,
    saveButtonLabelText,
    textStyleLabelText,
    textTypeStyleInfoText,
    textTypeDataSourceTabLabelText,
    titleInputLabelText,
    titleInputPlaceholderText,
    tooManyHotspotsInfoText,
    underlineLabelText,
    fontColorLabelText,
    fontSizeLabelText,
    borderWidthLabelText,
    deleteButtonIconDescription,
    selectAColor,
  } = mergedI18n;

  const onSave = () => {
    const filteredHotspots = hotspots.filter((hotspot) => hotspot.type !== hotspotTypes.DYNAMIC);
    const aDynamicHotspotDemo = hotspots.find((hotspot) => hotspot.type === hotspotTypes.DYNAMIC);
    if (aDynamicHotspotDemo) {
      filteredHotspots.push({
        ...aDynamicHotspotDemo,
        x: dynamicHotspotSourceX,
        y: dynamicHotspotSourceY,
      });
    }

    const hotspotsWithoutExampleValues = filteredHotspots.map((hotspot) =>
      update(hotspot, { content: { $unset: ['values'] } })
    );

    const updatedCardConfig = update(cardConfig, {
      values: {
        hotspots: {
          $set: hotspotsWithoutExampleValues,
        },
      },
    });

    onSaveCallback(updatedCardConfig);
  };

  const loadDemoHotspots = async (xSource, ySource, configToApply = { content: {} }) => {
    if (xSource && ySource && onFetchDynamicDemoHotspots) {
      setLoadingDynamicHotspots(true);
      setDynamicHotspots([]);
      const demoHotspots = await onFetchDynamicDemoHotspots({
        maxHotspots,
        xSource,
        ySource,
      });
      setDynamicHotspots(
        demoHotspots.map(({ x, y }) => ({
          x,
          y,
          ...configToApply,
          type: hotspotTypes.DYNAMIC,
        }))
      );
      setSelectedHotspot(demoHotspots?.[0]);
      setLoadingDynamicHotspots(false);
    }
  };

  useEffect(
    () => {
      // Fetch and configure initial dynamic demo hotspots if the initial
      // list of hotspots contain a dynamic hotspot to use as configuration.
      const dynamicHotspot = initialHotspots.find(
        (hotspot) => hotspot.type === hotspotTypes.DYNAMIC
      );
      if (dynamicHotspot) {
        const { x, y, ...config } = dynamicHotspot;
        updateDynamicHotspotSourceX(x);
        updateDynamicHotspotSourceY(y);
        loadDemoHotspots(x, y, config);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialHotspots]
  );

  const imageHotspotsIcons = useMemo(() => {
    const correctFormatedThresholdIcons = validThresholdIcons.map((icon) => ({
      id: icon.name,
      icon: icon.carbonIcon.type,
      text: icon.name,
    }));
    return [...hotspotIcons, ...correctFormatedThresholdIcons];
  }, [hotspotIcons]);

  const hotspotDefaults = {
    borderWidth: defaultBorderWidth,
    backgroundOpacity: defaultBackgroundOpacity,
    fontSize: defaultFontSize,
  };

  const renderDataSourceTab = () => {
    return selectedHotspot ? (
      <HotspotEditorDataSourceTab
        availableDimensions={availableDimensions}
        key={`${selectedHotspot?.x}${selectedHotspot?.y}`} // Regenerate when hotspot change
        hotspot={selectedHotspot}
        cardConfig={update(cardConfig, {
          content: {
            hotspots: { $set: [selectedHotspot] },
          },
        })}
        i18n={mergedI18n}
        translateWithId={translateWithId}
        dataItems={myDataItems}
        onChange={updateHotspotDataSource}
        testId={`${testId}-data-source-tab`}
        actions={actions}
      />
    ) : null;
  };

  const renderHotspotsPage = () => {
    return (
      <>
        <DynamicHotspotSourcePicker
          i18n={mergedI18n}
          dataSourceItems={myDataItems}
          onXValueChange={(newXSource) => {
            updateDynamicHotspotSourceX(newXSource);
            loadDemoHotspots(newXSource, dynamicHotspotSourceY);
          }}
          onYValueChange={(newYSource) => {
            updateDynamicHotspotSourceY(newYSource);
            loadDemoHotspots(newYSource, dynamicHotspotSourceX);
          }}
          selectedSourceIdX={dynamicHotspotSourceX}
          selectedSourceIdY={dynamicHotspotSourceY}
          onClear={clearDynamicHotspotsSource}
          translateWithId={translateWithId}
          // TODO: pass testId in v3 to override defaults
          // testId={`${testId}-hotspot-source-picker`}
        />
        {showTooManyHotspotsInfo ? (
          <InlineNotification
            kind="info"
            title={tooManyHotspotsInfoText}
            data-testid={`${testId}-too-many-hotspots-notification`}
          />
        ) : null}

        {dynamicHotspotsLoading ? (
          <InlineLoading
            className={`${iotPrefix}--hotspot-editor-modal__dynamic-loading`}
            description={loadingDynamicHotspotsText}
            data-testid={`${testId}-loading-hotspots`}
          />
        ) : (
          <Tabs selected={0}>
            <TabList>
              <Tab>{fixedTypeTooltipTabLabelText}</Tab>
              <Tab disabled={hasNonEditableContent}>{fixedTypeDataSourceTabLabelText}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <HotspotEditorTooltipTab
                  showDeleteButton={!(selectedHotspot?.type === hotspotTypes.DYNAMIC)}
                  showInfoMessage={!selectedHotspot}
                  hotspotIcons={imageHotspotsIcons}
                  hotspotIconFillColors={hotspotIconFillColors}
                  formValues={selectedHotspot}
                  onChange={updateHotspotTooltip}
                  onDelete={deleteSelectedHotspot}
                  i18n={{
                    deleteButtonLabelText,
                    deleteButtonIconDescriptionText,
                    titleInputLabelText,
                    titleInputPlaceholderText,
                    descriptionTextareaLabelText,
                    descriptionTextareaPlaceholderText,
                    iconDropdownLabelText,
                    iconDropdownTitleText,
                    colorDropdownLabelText,
                    colorDropdownTitleText,
                    infoMessageText: fixedTypeTooltipInfoText,
                  }}
                  translateWithId={translateWithId}
                  testId={`${testId}-tooltip-tab`}
                />
              </TabPanel>
              <TabPanel>{hasNonEditableContent ? null : renderDataSourceTab()}</TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </>
    );
  };

  const renderTextHotspotPage = () => {
    return (
      <Tabs selected={0} data-testid={`${testId}-hotspot-text-tabs`}>
        <TabList>
          <Tab>{textStyleLabelText}</Tab>
          <Tab disabled={hasNonEditableContent}>{textTypeDataSourceTabLabelText}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <HotspotTextStyleTab
              maxBorderWidth={maxBorderWidth}
              maxFontSize={maxFontSize}
              maxOpacity={maxOpacity}
              minOpacity={minOpacity}
              minBorderWidth={minBorderWidth}
              fontColors={fontColors}
              backgroundColors={backgroundColors}
              borderColors={borderColors}
              formValues={selectedHotspot}
              onChange={updateTextHotspotStyle}
              onDelete={deleteSelectedHotspot}
              showInfoMessage={!selectedHotspot}
              i18n={{
                boldLabelText,
                infoMessageText: textTypeStyleInfoText,
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
              }}
              translateWithId={translateWithId}
            />
          </TabPanel>
          <TabPanel>{hasNonEditableContent ? null : renderDataSourceTab()}</TabPanel>
        </TabPanels>
      </Tabs>
    );
  };

  return (
    <ComposedModal
      data-testid={`${testId}--hotspot-editor-modal`}
      selectorPrimaryFocus=".cds--modal-header"
      className={`${iotPrefix}--hotspot-editor-modal`}
      header={{
        label,
        title: modalHeaderTitleText,
      }}
      iconDescription={modalIconDescriptionText}
      isFullScreen
      onClose={onClose}
      onSubmit={onSave}
      open={open}
      passiveModal={false}
      footer={{
        primaryButtonLabel: saveButtonLabelText,
        secondaryButtonLabel: cancelButtonLabelText,
        isPrimaryButtonDisabled: dynamicHotspotsLoading,
      }}
    >
      <div ref={modelContentRef}>
        {modalContentSize.height && modalContentSize.width && (
          <ImageHotspots
            onHotspotContentChanged={updateTextHotspotContent}
            height={modalContentSize.height}
            hotspots={hotspots}
            icons={imageHotspotsIcons}
            imageZoomMax={imageZoomMax}
            isEditable
            i18n={pick(
              mergedI18n,
              'zoomIn',
              'zoomOut',
              'zoomToFit',
              'titlePlaceholderText',
              'titleEditableHintText'
            )}
            isHotspotDataLoading={dynamicHotspotsLoading}
            onAddHotspotPosition={(position) => {
              addHotspot({
                position,
                hotspotDefaults,
              });
            }}
            onSelectHotspot={setSelectedHotspot}
            selectedHotspots={getSelectedHotspotsList(selectedHotspot, hotspots)}
            src={cardConfig.content.src}
            id={imageId}
            width={modalContentSize.width}
            displayOption={displayOption}
          />
        )}
      </div>
      <div>
        <ContentSwitcher
          onChange={(e) => {
            switchCurrentType(e.name === 'labels' ? hotspotTypes.TEXT : hotspotTypes.FIXED);
          }}
          selectedIndex={currentType === hotspotTypes.TEXT ? 1 : 0}
          data-testid={`${testId}-content-switcher`}
        >
          <Switch
            key="hotspots"
            name="hotspots"
            text={hotspotsText}
            data-testid={`${testId}-hotspots-switch`}
          />
          <Switch
            key="labels"
            name="labels"
            text={labelsText}
            data-testid={`${testId}-labels-switch`}
          />
        </ContentSwitcher>
        {currentType === hotspotTypes.TEXT ? renderTextHotspotPage() : renderHotspotsPage()}
      </div>
    </ComposedModal>
  );
};

HotspotEditorModal.propTypes = propTypes;
HotspotEditorModal.defaultProps = defaultProps;
export default HotspotEditorModal;
