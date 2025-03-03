import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { InlineNotification, SkeletonText, ErrorBoundary } from '@carbon/react';
import classnames from 'classnames';
import warning from 'warning';

import { settings } from '../../constants/Settings';
import { DASHBOARD_EDITOR_CARD_TYPES, CARD_TYPES } from '../../constants/LayoutConstants';
import DashboardGrid from '../Dashboard/DashboardGrid';
import CardEditor from '../CardEditor/CardEditor';
import ImageGalleryModal, { ImagePropTypes } from '../ImageGalleryModal/ImageGalleryModal';

import DashboardEditorHeader from './DashboardEditorHeader/DashboardEditorHeader';
import DashboardEditorCardRenderer from './DashboardEditorCardRenderer';
import {
  getDefaultCard,
  getDuplicateCard,
  renderBreakpointInfo,
  DataItemsPropTypes,
  renderDefaultIconByName,
  DashboardEditorActionsPropTypes,
  defaultDashboardEditorActionsProps,
} from './editorUtils';

const { iotPrefix } = settings;

const propTypes = {
  /** Dashboard title */
  title: PropTypes.node,
  /** initial dashboard data to edit */
  initialValue: PropTypes.shape({
    cards: PropTypes.arrayOf(PropTypes.object),
    layouts: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }),
  isSummaryDashboard: PropTypes.bool,
  /** supported card types */
  supportedCardTypes: PropTypes.arrayOf(PropTypes.string),
  /**
   * Dictionary of icons that corresponds to both `supportedCardTypes` and `i18n`
   * ex:
   * {
   *  TIMESERIES: <EscalatorDown />,
   *  ALERT: <Code24 />,
   *  CUSTOM: <Basketball32 />,
   *  ANOTHER_CUSTOM: <Automobile32 />,
   * }
   */
  icons: PropTypes.objectOf(PropTypes.node),
  /** if enabled, renders a ContentSwitcher with IconSwitches that allow for manually changing the breakpoint,
   * regardless of the screen width
   */
  breakpointSwitcher: PropTypes.shape({
    enabled: PropTypes.bool,
    initialValue: PropTypes.string,
  }),
  /** if provided, renders header content above preview */
  renderHeader: PropTypes.func,
  /** if provided, is used to render cards in dashboard
   * renderCardPreview( cardConfig: Object,
                        commonCardProps: Object
                        onSelectCard: Function,
                        onDuplicateCard: Function,
                        onRemoveCard: Function,
                        isSelected: Boolean): Node
   */
  renderCardPreview: PropTypes.func,
  /** if provided, renders array elements inside of BreadcrumbItem in header */
  headerBreadcrumbs: PropTypes.arrayOf(PropTypes.element),
  /** if provided, renders node underneath the header and above the dashboard grid */
  notification: PropTypes.node,
  /** if provided, renders edit button next to title */
  isTitleEditable: PropTypes.bool,
  /** if provided, returns an array of strings which are the dataItems to be allowed
   * on each card
   * getValidDataItems(card, selectedTimeRange)
   */
  getValidDataItems: PropTypes.func,
  /** if provided, returns an array of strings which are the timeRanges to be allowed
   * on each card
   * getValidTimeRanges(card, selectedDataItems)
   */
  getValidTimeRanges: PropTypes.func,
  /** if provided, determines the default cardConfig for a new card when it is added
   * getDefaultCard(cardType)
   */
  getDefaultCard: PropTypes.func,
  /** an array of dataItems to be included on each card
   * this prop will be ignored if getValidDataItems is defined
   */
  availableImages: ImagePropTypes,
  dataItems: DataItemsPropTypes,
  /** an object where the keys are available dimensions and the values are the values available for those dimensions
   *  ex: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   */
  availableDimensions: PropTypes.shape({}),
  /** if provided, returns an object where the keys are available dimensions which are the dimensions to be allowed
   * on each card
   * ex response: { manufacturer: ['Rentech', 'GHI Industries'], deviceid: ['73000', '73001', '73002'] }
   * getValidDimensions(card)
   */
  getValidDimensions: PropTypes.func,
  /**
   * if provided this is called before the card form is rendered on the right side of the editor.
   * It is called with the card prop JSON and you return the updated cardConfig.
   * This callback function allows you to add elements for the form to render that are not passed in the main dashboard card JSON
   */
  onRenderCardEditForm: PropTypes.func,
  /** if provided, will update the dashboard json according to its own logic. Is called if a card is edited, or added.
   * Should return an updated card to be rendered
   * onCardChange(updatedCard, template): Card
   */
  onCardChange: PropTypes.func,
  /** if provided, will return the updated layout and layouts
   * onLayoutChange(newLayout, newLayouts)
   */
  onLayoutChange: PropTypes.func,
  /** if provided, allows the consumer to make changes to the cardConfig for preview in the JSON editor modal.
   * onCardJsonPreview(card)
   */
  onCardJsonPreview: PropTypes.func,
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

  /**
   * Callback called when a card is selected, passes back the selected card id
   */
  onCardSelect: PropTypes.func,
  /** Callback called when a card determines what icon render based on a named string in card config
   *    example usage: renderIconByName(name = 'my--checkmark--icon', props = { title: 'A checkmark', etc. })
   */
  renderIconByName: PropTypes.func,
  /** If provided, runs the function when the user clicks submit in the Card code JSON editor
   * onValidateCardJson(cardConfig)
   * @returns Array<string> error strings. return empty array if there is no errors
   */
  onValidateCardJson: PropTypes.func,
  /** callback function to validate the uploaded image */
  onValidateUploadedImage: PropTypes.func,
  /** callback if an image is deleted from the gallery */
  onImageDelete: PropTypes.func,
  /** optional loading prop to render the PageTitleBar loading state */
  isLoading: PropTypes.bool,
  /** internationalization strings */
  i18n: PropTypes.shape({
    // header strings
    headerEditTitleButton: PropTypes.string,
    headerImportButton: PropTypes.string,
    headerExportButton: PropTypes.string,
    headerCancelButton: PropTypes.string,
    headerSubmitButton: PropTypes.string,
    headerDeleteButton: PropTypes.string,
    headerFitToScreenButton: PropTypes.string,
    headerXlargeButton: PropTypes.string,
    headerLargeButton: PropTypes.string,
    headerMediumButton: PropTypes.string,
    layoutInfoXl: PropTypes.string,
    layoutInfoLg: PropTypes.string,
    layoutInfoMd: PropTypes.string,
    dashboardTitleLabel: PropTypes.string,
    requiredMessage: PropTypes.string,
    saveTitleButton: PropTypes.string,

    // card stirngs
    noDataLabel: PropTypes.string,
    defaultCardTitle: PropTypes.string,
    cloneCardLabel: PropTypes.string,
    deleteCardLabel: PropTypes.string,

    // card gallery strings
    galleryHeader: PropTypes.string,
    addCardButton: PropTypes.string,
    openGalleryButton: PropTypes.string,
    closeGalleryButton: PropTypes.string,
    openJSONButton: PropTypes.string,
    searchPlaceholderText: PropTypes.string,
    TIMESERIES: PropTypes.string,
    SIMPLE_BAR: PropTypes.string,
    GROUPED_BAR: PropTypes.string,
    STACKED_BAR: PropTypes.string,
    VALUE: PropTypes.string,
    IMAGE: PropTypes.string,
    TABLE: PropTypes.string,
    ALERT: PropTypes.string,
    LIST: PropTypes.string,

    // image gallery strings
    searchPlaceHolderText: PropTypes.string,
    imageGalleryDeleteLabelText: PropTypes.string,
    imageGalleryDeleteModalLabelText: PropTypes.string,
    imageGalleryDeleteModalTitleText: PropTypes.func,
    imageGalleryGridButtonText: PropTypes.string,
    imageGalleryInstructionText: PropTypes.string,
    imageGalleryListButtonText: PropTypes.string,
    imageGalleryModalLabelText: PropTypes.string,
    imageGalleryModalTitleText: PropTypes.string,
    imageGalleryModalPrimaryButtonLabelText: PropTypes.string,
    imageGalleryModalSecondaryButtonLabelText: PropTypes.string,
    imageGalleryModalCloseIconDescriptionText: PropTypes.string,
    imageGallerySearchPlaceHolderText: PropTypes.string,

    // card form strings
    openEditorButton: PropTypes.string,
    contentTabLabel: PropTypes.string,
    settingsTabLabel: PropTypes.string,
    cardSize_SMALL: PropTypes.string,
    cardSize_SMALLWIDE: PropTypes.string,
    cardSize_MEDIUM: PropTypes.string,
    cardSize_MEDIUMTHIN: PropTypes.string,
    cardSize_MEDIUMWIDE: PropTypes.string,
    cardSize_LARGE: PropTypes.string,
    cardSize_LARGETHIN: PropTypes.string,
    cardSize_LARGEWIDE: PropTypes.string,
    chartType_BAR: PropTypes.string,
    chartType_LINE: PropTypes.string,
    barChartType_SIMPLE: PropTypes.string,
    barChartType_GROUPED: PropTypes.string,
    barChartType_STACKED: PropTypes.string,
    barChartLayout_HORIZONTAL: PropTypes.string,
    barChartLayout_VERTICAL: PropTypes.string,

    errorTitle: PropTypes.string,
    modalTitle: PropTypes.string,
    modalLabel: PropTypes.string,
    modalHelpText: PropTypes.string,
    modalIconDescription: PropTypes.string,
    expandBtnLabel: PropTypes.string,
    modalPrimaryButtonLabel: PropTypes.string,
    modalSecondaryButtonLabel: PropTypes.string,
    cardTitle: PropTypes.string,
    description: PropTypes.string,
    size: PropTypes.string,
    selectASize: PropTypes.string,
    timeRange: PropTypes.string,
    selectATimeRange: PropTypes.string,
    last24HoursLabel: PropTypes.string,
    last7DaysLabel: PropTypes.string,
    lastMonthLabel: PropTypes.string,
    lastQuarterLabel: PropTypes.string,
    lastYearLabel: PropTypes.string,
    thisWeekLabel: PropTypes.string,
    thisMonthLabel: PropTypes.string,
    thisQuarterLabel: PropTypes.string,
    thisYearLabel: PropTypes.string,

    dataItemEditorDataItemTitle: PropTypes.string,
    dataItemEditorDataItemLabel: PropTypes.string,
    dataItemEditorLegendColor: PropTypes.string,
    dataSeriesTitle: PropTypes.string,
    selectDataItems: PropTypes.string,
    dataItem: PropTypes.string,
    edit: PropTypes.string,
    dataItemEditorDataItemCustomLabel: PropTypes.string,
    dataItemEditorDataItemUnit: PropTypes.string,
    dataItemEditorDataItemFilter: PropTypes.string,
    dataItemEditorDataItemThresholds: PropTypes.string,
    dataItemEditorDataItemAddThreshold: PropTypes.string,
    source: PropTypes.string,
    primaryButtonLabelText: PropTypes.string,
    secondaryButtonLabelText: PropTypes.string,
    closeButtonLabelText: PropTypes.string,

    // data series form
    xAxisLabel: PropTypes.string,
    yAxisLabel: PropTypes.string,
    unitLabel: PropTypes.string,
    decimalPrecisionLabel: PropTypes.string,
    maximumDataPointsLabel: PropTypes.string,
    precisionLabel: PropTypes.string,
    showLegendLabel: PropTypes.string,

    // value card form settings
    fontSize: PropTypes.string,
    abbreviateNumbers: PropTypes.string,
    abbreviateNumbersTooltip: PropTypes.string,

    editDataItems: PropTypes.string,
  }),
  /** locale data */
  locale: PropTypes.string,
  /** optional link href's for each card type that will appear in a tooltip */
  dataSeriesItemLinks: PropTypes.shape({
    simpleBar: PropTypes.string,
    groupedBar: PropTypes.string,
    stackedBar: PropTypes.string,
    timeSeries: PropTypes.string,
    value: PropTypes.string,
    custom: PropTypes.string,
    table: PropTypes.string,
    image: PropTypes.string,
  }),
  /** return demo hotspots while we're editing image cards */
  onFetchDynamicDemoHotspots: PropTypes.func,
  /** should we allow resizing cards dynamically */
  isCardResizable: PropTypes.bool,
  onEditDataItems: PropTypes.func,
  testId: PropTypes.string,
  actions: DashboardEditorActionsPropTypes,
};

const defaultProps = {
  initialValue: {
    cards: [],
    layouts: {},
  },
  isSummaryDashboard: false,
  breakpointSwitcher: null,
  supportedCardTypes: Object.keys(DASHBOARD_EDITOR_CARD_TYPES),
  icons: null,
  renderHeader: null,
  renderIconByName: renderDefaultIconByName,
  renderCardPreview: () => null,
  onRenderCardEditForm: null,
  headerBreadcrumbs: null,
  notification: null,
  title: '',
  isTitleEditable: null,
  getValidDataItems: null,
  getValidTimeRanges: null,
  getDefaultCard: null,
  availableImages: [],
  dataItems: [],
  availableDimensions: {},
  getValidDimensions: null,
  onCardChange: null,
  onImageDelete: null,
  onLayoutChange: null,
  onCardJsonPreview: null,
  onCardSelect: null,
  onDelete: null,
  onImport: null,
  onExport: null,
  onCancel: null,
  onSubmit: null,
  isSubmitDisabled: false,
  isSubmitLoading: false,
  onValidateCardJson: null,
  onValidateUploadedImage: null,
  isLoading: false,
  isCardResizable: true,
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
    galleryHeader: 'Gallery',
    openGalleryButton: 'Open gallery',
    closeGalleryButton: 'Back',
    openJSONButton: 'Open JSON editor',
    noDataLabel: 'No data source is defined',
    defaultCardTitle: 'Untitled',
    selectAGroupBy: 'Select a group by',
    layoutInfoLg: 'Edit dashboard at large layout (1057 - 1312px)',
    layoutInfoMd: 'Edit dashboard at medium layout (673 - 1056px)',
    layoutInfoSm: 'Edit dashboard at small layout (481 - 672px)',
    searchPlaceHolderText: 'Enter a value',
    dashboardTitleLabel: 'Dashboard title',
    requiredMessage: 'Required',
    saveTitleButton: 'Save title',
    editDataItems: 'Edit data items',
  },
  locale: 'en',
  dataSeriesItemLinks: null,
  onFetchDynamicDemoHotspots: () => Promise.resolve([{ x: 50, y: 50, type: 'fixed' }]),
  onEditDataItems: null,
  testId: 'dashboard-editor',
  actions: defaultDashboardEditorActionsProps,
};

const LAYOUTS = {
  FIT_TO_SCREEN: { breakpoint: 'lg', index: 0 },
  SMALL: { breakpoint: 'sm', index: 3 },
  MEDIUM: { breakpoint: 'md', index: 2 },
  LARGE: { breakpoint: 'lg', index: 1 },
};
export const baseClassName = `${iotPrefix}--dashboard-editor`;

const DashboardEditor = ({
  title,
  initialValue,
  isCardResizable,
  supportedCardTypes,
  breakpointSwitcher,
  renderHeader,
  renderCardPreview,
  onRenderCardEditForm,
  renderIconByName,
  getValidDataItems,
  getValidTimeRanges,
  getDefaultCard: customGetDefaultCard,
  dataItems,
  availableImages,
  headerBreadcrumbs,
  onImageDelete,
  notification,
  onCardChange,
  onLayoutChange,
  onCardJsonPreview,
  onImport,
  onExport,
  onDelete,
  onCancel,
  onSubmit,
  isSubmitDisabled,
  isSubmitLoading,
  onValidateCardJson,
  onCardSelect,
  onValidateUploadedImage,
  availableDimensions,
  getValidDimensions,
  isSummaryDashboard,
  isLoading,
  i18n,
  locale,
  dataSeriesItemLinks,
  isTitleEditable,
  icons,
  // eslint-disable-next-line react/prop-types
  onFetchDynamicDemoHotspots, // needed for the HotspotEditorModal, see the proptypes for more details
  onEditDataItems,
  testId,
  actions,
}) => {
  React.useEffect(() => {
    if (__DEV__) {
      warning(
        false,
        'The `DashboardEditor` is an experimental component and could be lacking unit test and documentation. Be aware that minor version bumps could introduce breaking changes. For the reasons listed above use of this component in production is highly discouraged'
      );
    }
  }, []);
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  // Need to keep track of whether the image gallery is open or not
  const [isImageGalleryModalOpen, setIsImageGalleryModalOpen] = useState(false);
  // Keep track of whether we need to scroll for new card or not
  const [needsScroll, setNeedsScroll] = useState(false);

  // show the card gallery if no card is being edited
  const [dashboardJson, setDashboardJson] = useState(initialValue);
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState();
  const [selectedBreakpointIndex, setSelectedBreakpointIndex] = useState(
    breakpointSwitcher?.initialValue
      ? LAYOUTS[breakpointSwitcher.initialValue].index
      : LAYOUTS.FIT_TO_SCREEN.index
  );
  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    breakpointSwitcher?.initialValue
      ? LAYOUTS[breakpointSwitcher.initialValue].breakpoint
      : LAYOUTS.FIT_TO_SCREEN.breakpoint
  );

  // update imagesToUpload whenever images are removed from dashboardJson cards
  useEffect(() => {
    const dashboardJsonImages = dashboardJson?.cards
      ?.filter((card) => card?.type === CARD_TYPES.IMAGE)
      .map((card) => ({ id: card?.content?.id, src: card?.content?.src }));

    if (imagesToUpload?.length) {
      setImagesToUpload((prevImagesToUpload) =>
        prevImagesToUpload.filter((image) =>
          dashboardJsonImages.some(
            (dashboardImage) => dashboardImage.id === image?.id && dashboardImage.src === image?.src
          )
        )
      );
    }
    // this should only execute when dashboardJson is updated; imagesToUpload is not needed as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardJson]);

  useEffect(() => {
    // if the loaded template changes, we need to update the state
    setDashboardJson(initialValue);
  }, [initialValue]);

  // force a window resize so that react-grid-layout will trigger its reorder / resize
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [selectedBreakpointIndex]);

  const scrollContainerRef = useRef();
  // when a new card is added, scroll to the bottom of the page. Instead of trying to attach the ref to the card itself,
  // check if the scrollHeight has changed in the scroll container, meaning a new card has been added
  useEffect(() => {
    if (scrollContainerRef.current && needsScroll) {
      scrollContainerRef.current.scrollTo({
        left: 0,
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setNeedsScroll(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollContainerRef.current?.scrollHeight, needsScroll]);

  /**
   * callback to parent when the card is selected
   */
  const handleCardSelect = useCallback(
    (card) => {
      setSelectedCardId(card?.id);
      /* istanbul ignore else */
      if (onCardSelect) {
        onCardSelect(card);
      }
    },
    [onCardSelect]
  );

  /**
   * Adds a default, empty card to the preview
   * @param {string} type card type
   */
  const addCard = useCallback(
    (type) => {
      const defaultCard = customGetDefaultCard // Use the default card specified by the consumer if it exists
        ? customGetDefaultCard(type, mergedI18n)
        : getDefaultCard(type, mergedI18n);

      // notify consumers that the card has been added in onCardChange if we don't have an explicit customGetDefaultCard passed
      const cardConfig =
        onCardChange && !customGetDefaultCard
          ? onCardChange(defaultCard, dashboardJson)
          : defaultCard;

      setDashboardJson((prevDashboardJson) => ({
        ...prevDashboardJson,
        cards: [...prevDashboardJson.cards, cardConfig],
      }));
      handleCardSelect(cardConfig);
      setNeedsScroll(true);
    },
    [customGetDefaultCard, dashboardJson, handleCardSelect, mergedI18n, onCardChange]
  );

  /**
   * Adds a cloned card with a new unique id to the preview and place it next to the original card
   * @param {string} id
   */
  const duplicateCard = useCallback(
    (id) => {
      let selectedCard;
      setDashboardJson((prevDashboardJson) => {
        selectedCard = prevDashboardJson.cards.find((card) => card.id === id);
        const cardConfig = getDuplicateCard(selectedCard);
        const originalCardIndex = prevDashboardJson.cards.findIndex((card) => card.id === id);
        prevDashboardJson.cards.splice(originalCardIndex, 0, cardConfig);
        return {
          ...prevDashboardJson,
          cards: prevDashboardJson.cards,
        };
      });
      handleCardSelect(selectedCard);
      setNeedsScroll(true);
    },
    [handleCardSelect]
  );

  /**
   * Deletes a card from the preview
   * @param {string} id
   */
  const removeCard = useCallback(
    (id) =>
      setDashboardJson((prevDashboardJson) => ({
        ...prevDashboardJson,
        cards: prevDashboardJson.cards.filter((i) => i.id !== id),
      })),
    []
  );

  const handleOnCardChange = useCallback(
    (cardConfig) => {
      // need to handle resetting the src of the image for image cards based on the id
      if (cardConfig.type === CARD_TYPES.IMAGE) {
        if (
          cardConfig.content?.imgState !== 'new' &&
          !imagesToUpload.some((image) => image.id === cardConfig.content.id)
        ) {
          // eslint-disable-next-line no-param-reassign
          cardConfig.content.src = availableImages?.find(
            (image) => image.id === cardConfig.content.id
          )?.src;
        } else if (
          cardConfig.type === CARD_TYPES.IMAGE &&
          cardConfig.content.imgState === 'new' &&
          !imagesToUpload.some((image) => image.id === cardConfig.content.id)
        ) {
          /* istanbul ignore else */
          if (cardConfig.content.id && cardConfig.content.src) {
            setImagesToUpload((prevImagesToUpload) => [
              ...prevImagesToUpload,
              { id: cardConfig.content.id, src: cardConfig.content.src },
            ]);
          }
        } else if (
          cardConfig.content.imgState !== 'new' &&
          imagesToUpload.some((image) => image.id === cardConfig.content.id)
        ) {
          // eslint-disable-next-line no-param-reassign
          cardConfig.content.src = imagesToUpload?.find(
            (image) => image.id === cardConfig.content.id
          )?.src;
        }
      }

      // TODO: this is really inefficient
      setDashboardJson((prevDashboardJson) => ({
        ...prevDashboardJson,
        cards: prevDashboardJson.cards.map((card) =>
          card.id === cardConfig.id
            ? onCardChange
              ? onCardChange(cardConfig, prevDashboardJson)
              : cardConfig
            : card
        ),
      }));
    },
    [availableImages, imagesToUpload, onCardChange]
  );

  const handleCardResize = useCallback(
    ({ id, size }) => {
      let cardConfig = dashboardJson.cards.find((card) => card.id === id);
      // Update the card with the new image information
      cardConfig = {
        ...cardConfig,
        size,
      };
      handleOnCardChange(cardConfig);
    },
    [dashboardJson.cards, handleOnCardChange]
  );

  const handleClose = useCallback(() => setIsImageGalleryModalOpen(false), []);
  // Show the image gallery
  const handleShowImageGallery = useCallback(() => setIsImageGalleryModalOpen(true), []);

  const handleImageSelection = useCallback(
    (selectedImage) => {
      let cardConfig = dashboardJson.cards.find((card) => card.id === selectedCardId);
      // Update the card with the new image information
      cardConfig = {
        ...cardConfig,
        content: { ...cardConfig.content, ...selectedImage },
      };
      handleOnCardChange(cardConfig);
      setIsImageGalleryModalOpen(false);
    },
    [dashboardJson.cards, handleOnCardChange, selectedCardId]
  );
  const handleEditTitle = useCallback(
    (newTitle) =>
      setDashboardJson((prevDashboardJson) => ({ ...prevDashboardJson, title: newTitle })),
    []
  );

  return isLoading ? (
    <div data-testid={`${testId}-loading`} className={baseClassName}>
      <SkeletonText width="30%" />
    </div>
  ) : (
    <div data-testid={testId} className={baseClassName}>
      <div
        className={classnames(`${baseClassName}--content`, {
          // enables overflow: auto if a specific breakpoint is selected so the width can be managed
          [`${baseClassName}__overflow`]: selectedBreakpointIndex !== LAYOUTS.FIT_TO_SCREEN.index,
        })}
        ref={scrollContainerRef}
      >
        {renderHeader ? (
          renderHeader()
        ) : (
          <DashboardEditorHeader
            title={dashboardJson?.title || title}
            breadcrumbs={headerBreadcrumbs}
            onImport={onImport}
            onExport={() => onExport(dashboardJson, imagesToUpload)}
            onDelete={onDelete}
            onCancel={onCancel}
            onSubmit={(params) => onSubmit(params, imagesToUpload)}
            isSubmitDisabled={isSubmitDisabled}
            isSubmitLoading={isSubmitLoading}
            i18n={mergedI18n}
            onEditTitle={isTitleEditable && handleEditTitle}
            dashboardJson={dashboardJson}
            selectedBreakpointIndex={selectedBreakpointIndex}
            setSelectedBreakpointIndex={setSelectedBreakpointIndex}
            breakpointSwitcher={breakpointSwitcher}
            testId={`${testId}-header`}
          />
        )}
        {notification}
        <div
          className={classnames(`${baseClassName}--preview`, {
            // enables overflow: auto if a specific breakpoint is selected so the width can be managed
            [`${baseClassName}--preview__selected-breakpoint`]:
              selectedBreakpointIndex !== LAYOUTS.FIT_TO_SCREEN.index,
          })}
        >
          <div
            className={classnames({
              [`${baseClassName}--preview__outline`]:
                selectedBreakpointIndex !== LAYOUTS.FIT_TO_SCREEN.index,
              [`${baseClassName}--preview__sm`]: selectedBreakpointIndex === LAYOUTS.SMALL.index,
              [`${baseClassName}--preview__md`]: selectedBreakpointIndex === LAYOUTS.MEDIUM.index,
              [`${baseClassName}--preview__lg`]: selectedBreakpointIndex === LAYOUTS.LARGE.index,
            })}
          >
            {breakpointSwitcher?.enabled &&
              // only show breakpoint info if fit to screen is not selected
              selectedBreakpointIndex !== LAYOUTS.FIT_TO_SCREEN.index && (
                <div className={`${baseClassName}--preview__breakpoint-info`}>
                  {renderBreakpointInfo(currentBreakpoint, mergedI18n)}
                </div>
              )}
            <div className={`${baseClassName}--preview__grid-container`}>
              <ErrorBoundary
                fallback={
                  <InlineNotification
                    title="Dashboard editor error"
                    subtitle="Something went wrong. Please refresh the page."
                    kind="error"
                    lowContrast
                    data-testid={`${testId}-error-notification`}
                  />
                }
              >
                <ImageGalleryModal
                  open={isImageGalleryModalOpen}
                  content={availableImages}
                  onClose={handleClose}
                  onSubmit={handleImageSelection}
                  onDelete={onImageDelete}
                  gridButtonText={i18n.imageGalleryGridButtonText}
                  instructionText={i18n.imageGalleryInstructionText}
                  listButtonText={i18n.imageGalleryListButtonText}
                  modalLabelText={i18n.imageGalleryModalLabelText}
                  modalTitleText={i18n.imageGalleryModalTitleText}
                  modalPrimaryButtonLabelText={i18n.imageGalleryModalPrimaryButtonLabelText}
                  modalSecondaryButtonLabelText={i18n.imageGalleryModalSecondaryButtonLabelText}
                  modalCloseIconDescriptionText={i18n.imageGalleryModalCloseIconDescriptionText}
                  searchPlaceHolderText={i18n.imageGallerySearchPlaceHolderText}
                  deleteLabelText={i18n.imageGalleryDeleteLabelText}
                  deleteModalLabelText={i18n.imageGalleryDeleteModalLabelText}
                  deleteModalTitleText={i18n.imageGalleryDeleteModalTitleText}
                  testId={`${testId}-image-gallery-modal`}
                />
                <DashboardGrid
                  isEditable
                  breakpoint={currentBreakpoint}
                  onBreakpointChange={(newBreakpoint) => {
                    setCurrentBreakpoint(newBreakpoint);
                  }}
                  layouts={dashboardJson.layouts}
                  onLayoutChange={(newLayout, newLayouts) => {
                    if (onLayoutChange) {
                      onLayoutChange(newLayout, newLayouts);
                    }
                    setDashboardJson((prevDashboardJson) => ({
                      ...prevDashboardJson,
                      layouts: newLayouts,
                    }));
                  }}
                  onResizeStop={handleCardResize}
                  supportedLayouts={['lg', 'md', 'sm']}
                  testId={`${testId}-grid`}
                >
                  {dashboardJson?.cards?.map((cardConfig) => {
                    const isSelected = cardConfig.id === selectedCardId;
                    return (
                      <DashboardEditorCardRenderer
                        {...cardConfig}
                        locale={locale}
                        key={cardConfig.id}
                        isResizable={isCardResizable}
                        i18n={mergedI18n}
                        isSelected={isSelected}
                        availableDimensions={availableDimensions}
                        onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
                        renderCardPreview={renderCardPreview}
                        onCardChange={handleOnCardChange}
                        onRemove={removeCard}
                        onDuplicate={duplicateCard}
                        baseClassName={baseClassName}
                        onValidateUploadedImage={onValidateUploadedImage}
                        onShowImageGallery={handleShowImageGallery}
                        renderIconByName={renderIconByName}
                        setSelectedCardId={handleCardSelect}
                      />
                    );
                  })}
                </DashboardGrid>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      <div className={`${baseClassName}--sidebar`}>
        <ErrorBoundary
          fallback={
            <InlineNotification
              title="Dashboard editor error"
              subtitle="Something went wrong. Please refresh the page."
              kind="error"
              lowContrast
              data-testid={`${testId}-sidebar-error-notification`}
            />
          }
        >
          <CardEditor
            cardConfig={dashboardJson.cards.find((card) => card.id === selectedCardId)}
            isSummaryDashboard={isSummaryDashboard}
            onShowGallery={() => handleCardSelect(null)}
            onChange={handleOnCardChange}
            onRenderCardEditForm={onRenderCardEditForm}
            getValidDataItems={getValidDataItems}
            getValidTimeRanges={getValidTimeRanges}
            dataItems={dataItems}
            onAddCard={addCard}
            onValidateCardJson={onValidateCardJson}
            onCardJsonPreview={onCardJsonPreview}
            supportedCardTypes={supportedCardTypes}
            icons={icons}
            getValidDimensions={getValidDimensions}
            availableDimensions={availableDimensions}
            i18n={mergedI18n}
            currentBreakpoint={currentBreakpoint}
            dataSeriesItemLinks={dataSeriesItemLinks}
            onFetchDynamicDemoHotspots={onFetchDynamicDemoHotspots}
            onEditDataItems={onEditDataItems}
            actions={actions}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

DashboardEditor.propTypes = propTypes;
DashboardEditor.defaultProps = defaultProps;

export default DashboardEditor;
