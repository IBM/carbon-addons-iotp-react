import React, { useCallback, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InlineLoading } from '@carbon/react';
import { omit, isEmpty } from 'lodash-es';
import warning from 'warning';

import { findMatchingThresholds } from '../../utils/cardUtilityFunctions';
import { settings } from '../../constants/Settings';
import { HotspotIconPropType, HotspotPropTypes } from '../../constants/SharedPropTypes';
import { keyboardKeys } from '../../constants/KeyCodeConstants';

import Hotspot from './Hotspot';
import ImageControls from './ImageControls';
import HotspotContent from './HotspotContent';

const { iotPrefix } = settings;

const propTypes = {
  /** id of the local image file to display */
  id: PropTypes.string,
  /** source of the local image file to display */
  src: PropTypes.string,
  /** alt tag and shown on mouseover */
  alt: PropTypes.string,
  /** value for object-fit property - 'contain' or 'fill' */
  displayOption: PropTypes.string,
  /** optional array of hotspots to render over the image */
  hotspots: PropTypes.arrayOf(PropTypes.shape(HotspotPropTypes)),
  /** optional features to enable or disable */
  hideZoomControls: PropTypes.bool,
  hideHotspots: PropTypes.bool,
  /* deprecated in favor of minimapBehavior below */
  // eslint-disable-next-line consistent-return
  hideMinimap: (props, propName, componentName) => {
    if (__DEV__) {
      const value = props[propName];
      /* istanbul ignore else */
      if (typeof value !== 'undefined') {
        return new Error(
          `${componentName}: '${propName}' prop is deprecated in favor of 'minimapBehavior="${
            value ? 'hide' : 'show'
          }"'.`
        );
      }
    }
  },
  /* 'hide' always hides the minimap, 'show' always shows the minimap, 'showOnPan' only shows the minimap when panning an image */
  minimapBehavior: PropTypes.oneOf(['hide', 'show', 'showOnPan']),
  /** when true activates mouse event based create & select hotspot fuctionality */
  isEditable: PropTypes.bool,
  isHotspotDataLoading: PropTypes.bool,
  /** Background color to display around the image */
  background: PropTypes.string,
  /** Current height in pixels */
  height: PropTypes.number.isRequired,
  /**
   * Array of identifiable icons used by the hotspots. The icons here will be used to
   * render the hotspot icons unless the renderIconByName prop us used.
   */
  icons: PropTypes.arrayOf(HotspotIconPropType),
  /**
   * Callback when an editable image is clicked without drag, used to add hotspot.
   * Emits position obj {x, y} of hotspot to be added.
   */
  onAddHotspotPosition: PropTypes.func,
  /** Callback when a hotspot is clicked in isEditable mode, emits position obj {x, y} */
  onSelectHotspot: PropTypes.func,
  /**
   * Callback when the hotspot content is changed, emits position obj {x, y}
   * and content change obj, e.g. {title: 'new title value'}
   * */
  onHotspotContentChanged: PropTypes.func,
  /** Current width in pixels */
  width: PropTypes.number.isRequired,
  zoomMax: PropTypes.number,
  renderIconByName: PropTypes.func,
  i18n: PropTypes.shape({
    zoomIn: PropTypes.string,
    zoomOut: PropTypes.string,
    zoomToFit: PropTypes.string,
    titlePlaceholderText: PropTypes.string,
    titleEditableHintText: PropTypes.string,
  }),
  /** locale string to pass for formatting */
  locale: PropTypes.string,
  /** The (unique) positions of the currently selected hotspots */
  selectedHotspots: PropTypes.arrayOf(
    PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
  ),
};

const defaultProps = {
  id: null,
  src: null,
  displayOption: null,
  hotspots: [],
  alt: null,
  hideZoomControls: false,
  hideHotspots: false,
  /* @deprecated in favor of minimapBehavior */
  hideMinimap: undefined,
  minimapBehavior: 'showOnPan',
  isHotspotDataLoading: false,
  isEditable: false,
  onAddHotspotPosition: () => {},
  onSelectHotspot: () => {},
  onHotspotContentChanged: () => {},
  background: '#eee',
  zoomMax: undefined,
  renderIconByName: null,
  i18n: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomToFit: 'Zoom to fit',
    titlePlaceholderText: 'Enter label',
    titleEditableHintText: 'Click to edit label',
  },
  // undefined instead of null allows for functions to set default values
  locale: undefined,
  selectedHotspots: [],
  icons: null,
};

export const prepareDrag = (event, cursor, setCursor) => {
  setCursor({
    ...cursor,
    dragging: false,
    dragPrepared: true,
    imageMousedown: true,
  });

  event.preventDefault();
};

export const startDrag = (event, element, cursor, setCursor) => {
  const cursorX = event.clientX;
  const cursorY = event.clientY;
  /* istanbul ignore else */
  if (element === 'image') {
    setCursor({
      ...cursor,
      cursorX,
      cursorY,
      dragging: true,
      dragPrepared: false,
    });
  }
  event.preventDefault();
};

/** update the image offset based on the dragged point, and the minimap on the relative opposite from the dragged point */
export const whileDrag = (event, cursor, setCursor, image, setImage, minimap, setMinimap) => {
  const cursorX = event.clientX;
  const cursorY = event.clientY;
  const deltaX = cursorX - cursor.cursorX;
  const deltaY = cursorY - cursor.cursorY;
  const newOffsetX = image.offsetX + deltaX;
  const newOffsetY = image.offsetY + deltaY;

  setCursor({
    ...cursor,
    cursorX,
    cursorY,
  });
  setImage({
    ...image,
    offsetX: newOffsetX,
    offsetY: newOffsetY,
  });
  setMinimap({
    ...minimap,
    offsetX: -((minimap.width / image.width) * newOffsetX),
    offsetY: -((minimap.height / image.height) * newOffsetY),
  });
};

/** Make sure that the pointer hasn't left the */
export const stopDrag = (cursor, setCursor) => {
  setCursor({ ...cursor, dragging: false, imageMousedown: false });
};

export const calculateImageWidth = ({
  container,
  orientation,
  ratio,
  scale = 1,
  displayOption,
}) => {
  if (displayOption === 'fill') {
    return container.width * scale;
  }
  return (
    (container.orientation === orientation
      ? orientation === 'landscape'
        ? ratio >= container.ratio
          ? container.width // landscape image bigger than landscape container
          : container.height * ratio // landscape image smaller than landscape container
        : ratio >= container.ratio
        ? container.height / ratio // portrait image bigger than portrait container
        : container.width // portrait image smaller than portrait container
      : orientation === 'landscape'
      ? container.width // landscape image and portrait container
      : container.height / ratio) * scale // portrait image and landscape container
  );
};

export const calculateImageHeight = ({
  container,
  orientation,
  ratio,
  scale = 1,
  displayOption,
}) => {
  if (displayOption === 'fill') {
    return container.height * scale;
  }
  return (
    (container.orientation === orientation
      ? orientation === 'landscape'
        ? ratio >= container.ratio
          ? container.width / ratio // landscape image bigger than landscape container
          : container.height // landscape image smaller than landscape container
        : ratio >= container.ratio
        ? container.height // portrait image bigger than portrait container
        : container.width * ratio // portrait image smaller than portrait container
      : orientation === 'landscape'
      ? container.width / ratio // landscape image and portrait container
      : container.height) * scale // portrait image and landscape container
  );
};

export const calculateHotspotContainerLayout = (
  {
    scale: imageScale,
    orientation: imageOrientation,
    ratio: imageRatio,
    offsetY: imageOffsetY,
    objectFitOffsetY: imageObjectFitOffsetY,
    width: imageWidth,
    height: imageHeight,
  },
  { height: containerHeight, width: containerWidth },
  objectFit
) => {
  let width;
  let height;
  let top;

  // CONTAIN
  if (objectFit === 'contain') {
    if (imageOrientation === 'landscape') {
      width = imageWidth;
      height = imageWidth / imageRatio;
      top = imageScale > 1 ? imageOffsetY : imageObjectFitOffsetY;
    } else if (imageOrientation === 'portrait') {
      width = imageHeight / imageRatio;
      height = imageHeight;
      top = imageOffsetY;
    }
    // FILL
  } else if (objectFit === 'fill') {
    width = imageScale > 1 ? imageWidth : containerWidth;
    height = imageScale > 1 ? imageHeight : containerHeight;
    top = imageOffsetY;
    // NO OBJECT FIT
  } else if (!objectFit) {
    if (imageOrientation === 'landscape') {
      width = imageWidth;
      height = imageWidth / imageRatio;
      top = imageOffsetY;
    } else if (imageOrientation === 'portrait') {
      width = imageHeight / imageRatio;
      height = imageHeight;
      top = imageOffsetY;
    }
  }

  return { width, height, top };
};

export const calculateObjectFitOffset = ({ displayOption, container, image }) => {
  const result = { x: 0, y: 0 };
  if (displayOption === 'contain') {
    result.y = container.height / 2 - image.height / 2;
    result.x = container.width / 2 - image.width / 2;
  }
  return result;
};

/** Sets initialWidth and initialHeight of an image, offsets orientations in the state */
export const onImageLoad = (
  { target: imageLoaded },
  container,
  image,
  setImage,
  minimap,
  setMinimap,
  options,
  setOptions,
  displayOption
) => {
  const { offsetWidth: initialWidth, offsetHeight: initialHeight } = imageLoaded;
  const orientation = initialWidth > initialHeight ? 'landscape' : 'portrait';
  const ratio =
    orientation === 'landscape' ? initialWidth / initialHeight : initialHeight / initialWidth;

  const width = calculateImageWidth({ container, orientation, ratio, displayOption });
  const height = calculateImageHeight({ container, orientation, ratio, displayOption });

  // Because the first zoom is double, the initial image has to be big enough to support
  const resizable = initialWidth > 2 * width || initialHeight > 2 * height;

  setImage({
    ...image,
    initialWidth,
    initialHeight,
    width,
    height,
    scale: 1,
    ratio,
    orientation,
    offsetX: 0,
    offsetY: 0,
    objectFitOffsetY: 0,
    objectFitOffsetX: 0,
  });
  setMinimap({
    ...minimap,
    width: orientation === 'landscape' ? minimap.initialSize : minimap.initialSize / ratio,
    height: orientation === 'portrait' ? minimap.initialSize : minimap.initialSize / ratio,
    guideWidth: orientation === 'landscape' ? minimap.initialSize : minimap.initialSize / ratio,
    guideHeight: orientation === 'portrait' ? minimap.initialSize : minimap.initialSize / ratio,
  });
  setOptions({
    ...options,
    hideZoomControls: options.hideZoomControls || !resizable,
    hideMinimap: options.hideMinimap || !resizable,
    resizable,
    draggable: false,
  });
};

/** Updates the image, minimap and options based on the scale of the new zoom.
 * Will not allow scaling beyond zoomMax */
export const zoom = (
  scale,
  zoomMax,
  container,
  image,
  setImage,
  minimap,
  setMinimap,
  options,
  setOptions,
  displayOption
) => {
  const width = calculateImageWidth({
    container,
    orientation: image.orientation,
    ratio: image.ratio,
    scale,
    displayOption,
  });
  const height = calculateImageHeight({
    container,
    orientation: image.orientation,
    ratio: image.ratio,
    scale,
    displayOption,
  });

  // Reset image position, (i.e. zoom to fit)
  if (scale === 1) {
    const objectFitOffset = calculateObjectFitOffset({ displayOption, container, image });

    setImage({
      ...image,
      width,
      height,
      scale: 1,
      offsetX: 0,
      offsetY: displayOption ? 0 : container.height / 2 - height / 2,
      objectFitOffsetY: objectFitOffset.y,
      objectFitOffsetX: objectFitOffset.x,
    });
    setMinimap({
      ...minimap,
      guideHeight: minimap.height,
      guideWidth: minimap.width,
      offsetX: 0,
      offsetY: 0,
    });
    //
    setOptions({ ...options, draggable: false });
  }
  // Actual zooming in request
  else if (scale > 1) {
    if (
      (zoomMax && scale < zoomMax) ||
      image.initialWidth > width ||
      image.initialHeight > height
    ) {
      const guideWidth =
        container.width >= width ? minimap.width : minimap.width / (width / container.width);
      const guideHeight =
        container.height >= height ? minimap.height : minimap.height / (height / container.height);

      const deltaX = Math.round(width - image.width);
      const deltaY = Math.round(height - image.height);
      const guideDeltaX = Math.round(guideWidth - minimap.guideWidth);
      const guideDeltaY = Math.round(guideHeight - minimap.guideHeight);

      const offsetX = image.offsetX - deltaX / 2;
      const offsetY = image.offsetY - deltaY / 2;
      const guideOffsetX = Math.round(minimap.offsetX - guideDeltaX / 2);
      const guideOffsetY = Math.round(minimap.offsetY - guideDeltaY / 2);

      const offsetXMax = -Math.abs(Math.round(container.width - width));
      const offsetYMax = -Math.abs(Math.round(container.height - height));
      const guideOffsetXMax = Math.round(minimap.width - guideWidth);
      const guideOffsetYMax = Math.round(minimap.height - guideHeight);

      // Reset draggability if we're zooming
      setOptions({ ...options, draggable: true });
      setImage({
        ...image,
        width,
        height,
        scale,
        offsetX:
          offsetX >= 0 || container.width > width
            ? 0
            : image.offsetX <= offsetXMax
            ? offsetXMax
            : offsetX,
        offsetY:
          container.height > height
            ? container.height / 2 - height / 2
            : offsetY >= 0
            ? 0
            : image.offsetY < offsetYMax
            ? offsetYMax
            : offsetY,
        objectFitOffsetY: 0,
        objectFitOffsetX: 0,
      });
      setMinimap({
        ...minimap,
        guideWidth,
        guideHeight,
        offsetX:
          guideOffsetX <= 0
            ? 0
            : minimap.offsetX < guideOffsetXMax
            ? guideOffsetX
            : guideOffsetXMax,
        offsetY:
          guideOffsetY <= 0 || height < container.height
            ? 0
            : minimap.offsetY < guideOffsetYMax
            ? guideOffsetY
            : guideOffsetYMax,
      });
    }
  }
};

/**
 * Since the imageElement is not at the borders of the screen, we need to calculate the X and Y offsets of the Image from the parents
 * @param {*} imageElement
 * @return {object} top, left pixels that indicate where the image is placed on the page
 */
export const getAccumulatedOffset = (imageElement) => {
  // TODO: replace with simpler approach and share as utility function: https://stackoverflow.com/questions/5601659/how-do-you-calculate-the-page-position-of-a-dom-element-when-the-body-can-be-rel
  const offset = {
    top: imageElement.offsetTop,
    left: imageElement.offsetLeft,
  };

  let ancestor = imageElement.offsetParent;

  while (ancestor) {
    offset.top += ancestor.offsetTop;
    offset.left += ancestor.offsetLeft;
    ancestor = ancestor.offsetParent;
  }

  return offset;
};

/**
 * The image element might use the css objectFit which can add some additional offset between the element
 * edges and the actual visual image. This function can tell us if the cursor is on this offset.
 * @param {*} mouseEvent
 * @param {object} image with { height, width, objectFitOffsetY, objectFitOffsetX }
 * @returns
 */
export const cursorIsOnObjectFitOffset = (
  mouseEvent,
  { height, width, objectFitOffsetY, objectFitOffsetX },
  displayOption
) => {
  if (displayOption === 'contain') {
    const accumelatedOffset = getAccumulatedOffset(mouseEvent.currentTarget);
    const posY = mouseEvent.clientY - accumelatedOffset.top;
    const posX = mouseEvent.clientX - accumelatedOffset.left;
    return (
      posY < objectFitOffsetY ||
      posX < objectFitOffsetX ||
      posY > objectFitOffsetY + height ||
      posX > width + objectFitOffsetX
    );
  }
  return false;
};

/** Calculates the mouse click position in percentage and returns the
 * result in a callback if a hotspot should be added */
export const handleMouseUp = ({ event, image, cursor, setCursor, isEditable, callback }) => {
  setCursor((newCursor) => {
    return { ...newCursor, dragPrepared: false, imageMousedown: false };
  });
  // We only trigger the callback if the image is editable and the intitiating
  // mouse down event was on the actual image (as oppose of outside).
  if (isEditable && cursor?.imageMousedown) {
    const accumelatedOffset = getAccumulatedOffset(event.currentTarget);
    const relativePosition = {
      x: event.clientX - (accumelatedOffset.left + image.objectFitOffsetX),
      y: event.clientY - (accumelatedOffset.top + image.objectFitOffsetY),
    };
    const percentagePosition = {
      x: (relativePosition.x / image.width) * 100,
      y: (relativePosition.y / image.height) * 100,
    };
    if (callback) {
      callback(percentagePosition);
    }
  }
};

/** Parent smart component with local state that renders an image with its hotspots */
const ImageHotspots = ({
  hideZoomControls: hideZoomControlsProp,
  hideHotspots: hideHotspotsProp,
  hideMinimap: hideMinimapProp,
  minimapBehavior,
  hotspots,
  i18n,
  background,
  src,
  id,
  height,
  width,
  alt,
  icons,
  isEditable,
  isHotspotDataLoading,
  onAddHotspotPosition,
  onSelectHotspot,
  onHotspotContentChanged,
  zoomMax,
  renderIconByName,
  locale,
  selectedHotspots,
  displayOption,
}) => {
  // Need to keep track of whether the Ctrl key is currently pressed because we want to only add hotspots in that case
  const [isCtrlPressed, setIsCtrlPressed] = useState();
  // Tracks if the crossHair cursor should be allowed based on mouse position
  const [allowCrossHair, setAllowCrossHair] = useState(false);
  // Image needs to be stored in state because we're dragging it around when zoomed in, and we need to keep track of when it loads
  const [image, setImage] = useState({});
  // Minimap needs to be stored in state because we're dragging it around when zoomed in
  const [minimap, setMinimap] = useState({
    initialSize: 100,
    offsetX: 0,
    offsetY: 0,
  });
  const [cursor, setCursor] = useState({});
  // Options need to be stored in state because based on the zoom level they may change
  const [options, setOptions] = useState({
    hideZoomControls: hideZoomControlsProp,
    hideHotspots: hideHotspotsProp,
    hideMinimap: minimapBehavior !== 'show',
  });

  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);

  const handleCtrlKeyUp = useCallback((event) => {
    // Was the control key unpressed
    if (event.key === keyboardKeys.CONTROL) {
      setIsCtrlPressed(false);
    }
  }, []);
  const handleCtrlKeyDown = useCallback((event) => {
    if (event.ctrlKey) {
      setIsCtrlPressed(true);
    }
  }, []);

  // Listen to the control key to add hotspots
  useEffect(() => {
    window.addEventListener('keydown', handleCtrlKeyDown);
    window.addEventListener('keyup', handleCtrlKeyUp);
    return () => {
      window.removeEventListener('keydown', handleCtrlKeyDown);
      window.removeEventListener('keyup', handleCtrlKeyUp);
    };
  }, [handleCtrlKeyDown, handleCtrlKeyUp]);

  useEffect(() => {
    setOptions({
      hideZoomControls: hideZoomControlsProp,
      hideHotspots: hideHotspotsProp,
      hideMinimap: minimapBehavior !== 'show',
    });
  }, [hideZoomControlsProp, hideHotspotsProp, minimapBehavior]);

  const orientation = width > height ? 'landscape' : 'portrait';
  const ratio = orientation === 'landscape' ? width / height : height / width;

  const container = { height, width, ratio, orientation };

  // Once the component mounts set up the container info
  useEffect(
    () => {
      zoom(
        image.scale,
        zoomMax,
        container,
        image,
        setImage,
        minimap,
        setMinimap,
        options,
        setOptions,
        displayOption
      );
    },
    // to prevent needing useDeepCompareEffect, since it's an anti-pattern
    // we split out all the various parts needed by the zoom function and check them
    // individually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      container.height,
      container.width,
      container.ratio,
      container.orientation,
      zoomMax,
      image.initialHeight,
      image.initialWidth,
      image.scale,
      image.orientation,
      image.ratio,
      image.offsetY,
      image.offsetX,
      image.objectFitOffsetY,
      image.objectFitOffsetX,
      image.width,
      image.height,
      minimap.initialSize,
      minimap.height,
      minimap.width,
      minimap.guideHeight,
      minimap.guideWidth,
      minimap.offsetX,
      minimap.offsetY,
      options.hideZoomControls,
      options.hideHotspots,
      options.hideMinimap,
      options.resizable,
      options.draggable,
    ]
  );

  const { dragging, dragPrepared } = cursor;
  const { hideZoomControls, hideHotspots, hideMinimap, draggable } = options;
  const imageLoaded = image.initialWidth && image.initialHeight;

  const containerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
    background,
  };

  const imageStyle = {
    cursor: allowCrossHair && isCtrlPressed ? 'crosshair' : 'auto',
    position: 'relative',
    left: image.offsetX,
    top: image.offsetY,
    height: displayOption === 'fill' ? image.height : image.scale === 1 ? '100%' : 'auto',
    width: displayOption === 'fill' ? image.width : image.scale === 1 ? '100%' : 'auto',
    objectFit: displayOption,
  };

  const onHotspotClicked = useCallback(
    (evt, position) => {
      // It is possible to receive two events here, one Mouse event and one Pointer event.
      // When used in the ImageHotspots component the Pointer event can somehow be from a
      // previously clicked hotspot. See https://github.com/carbon-design-system/carbon-addons-iot-react/issues/1803
      const isPointerEventOfTypeMouse = evt?.pointerType === 'mouse';
      if (!isPointerEventOfTypeMouse && isEditable) {
        onSelectHotspot(position);
      }
    },
    [onSelectHotspot, isEditable]
  );

  const getIconRenderFunction = useCallback(() => {
    return (
      renderIconByName ||
      (Array.isArray(icons)
        ? (name, props) => {
            const Icon = icons.find((iconObj) => iconObj.id === name)?.icon;
            if (!Icon) {
              if (__DEV__) {
                warning(
                  false,
                  `An array of available icons was provided to the ImageHotspots but a hotspot was trying to use an icon with name '${name}' that was not found in that array.`
                );
              }
              return null;
            }
            return <Icon {...props} />;
          }
        : null)
    );
  }, [icons, renderIconByName]);

  // Performance improvement
  const cachedHotspots = useMemo(
    () =>
      hotspots.map((hotspot, index) => {
        const { x, y } = hotspot;
        const hotspotIsSelected = !!selectedHotspots.find((pos) => x === pos.x && y === pos.y);
        // Determine whether the icon needs to be dynamically overridden by a threshold
        const matchingAttributeThresholds = [];
        if (hotspot.content?.attributes) {
          hotspot.content.attributes.forEach(({ thresholds, dataSourceId }) => {
            if (!isEmpty(thresholds) && !isEmpty(hotspot.content?.values)) {
              const attributeThresholds = findMatchingThresholds(
                thresholds.map((threshold) => ({ ...threshold, dataSourceId })),
                hotspot.content?.values,
                dataSourceId
              );
              matchingAttributeThresholds.push(...attributeThresholds);
            }
          });
        }
        return (
          <Hotspot
            {...omit(hotspot, 'content')}
            content={
              React.isValidElement(hotspot.content) ? (
                hotspot.content
              ) : (
                <HotspotContent
                  {...hotspot.content}
                  locale={locale}
                  renderIconByName={getIconRenderFunction()}
                  id={`hotspot-content-${x}-${y}`}
                  isTitleEditable={(isEditable, hotspotIsSelected && hotspot.type === 'text')}
                  onChange={onHotspotContentChanged}
                  i18n={mergedI18n}
                />
              )
            }
            icon={
              !isEmpty(matchingAttributeThresholds)
                ? matchingAttributeThresholds[0].icon
                : hotspot.icon
            }
            color={
              !isEmpty(matchingAttributeThresholds)
                ? matchingAttributeThresholds[0].color
                : hotspot.color
            }
            key={`${x}-${y}-${index}`}
            renderIconByName={getIconRenderFunction()}
            isSelected={hotspotIsSelected}
            onClick={onHotspotClicked}
          />
        );
      }),
    [
      hotspots,
      selectedHotspots,
      locale,
      getIconRenderFunction,
      isEditable,
      onHotspotContentChanged,
      mergedI18n,
      onHotspotClicked,
    ]
  );

  const hotspotsStyle = {
    position: 'absolute',
    left: image.offsetX,
    right: image.offsetX >= 0 ? 0 : 'auto',
    margin: 'auto',
    pointerEvents: 'none',
  };

  if (imageLoaded) {
    if (container.orientation === 'landscape') {
      imageStyle.height = displayOption && image.scale === 1 ? '100%' : image.height;
      if (!displayOption && image.orientation === 'portrait') {
        imageStyle.width = image.height / image.ratio;
      } else if (
        !displayOption &&
        image.orientation === 'landscape' &&
        image.width < container.width
      ) {
        imageStyle.width = image.width;
      }
    } else {
      imageStyle.width = displayOption && image.scale === 1 ? '100%' : image.width;
      imageStyle.height = displayOption ? imageStyle.height : image.height;
    }

    const hotspotLayout = calculateHotspotContainerLayout(image, container, displayOption);
    hotspotsStyle.height = hotspotLayout.height;
    hotspotsStyle.width = hotspotLayout.width;
    hotspotsStyle.top = hotspotLayout.top;
  }
  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  return (
    <div
      onContextMenu={
        isEditable
          ? (event) => {
              // if we're in edit mode, prevent the CTRL-click context menu from popping
              event.preventDefault();
            }
          : undefined
      }
      style={containerStyle}
      onMouseOut={() => {
        if (dragging) {
          // If we leave the container, stop detecting the drag
          stopDrag(cursor, setCursor);
        }
      }}
      onBlur={() => {
        if (dragging) {
          // If we leave the container, stop detecting the drag
          stopDrag(cursor, setCursor);
        }
      }}
    >
      {src ? (
        <img
          id={id}
          className={`${iotPrefix}--image-card-img`}
          src={src}
          alt={alt}
          onLoad={(event) =>
            onImageLoad(
              event,
              container,
              image,
              setImage,
              minimap,
              setMinimap,
              options,
              setOptions,
              displayOption
            )
          }
          style={imageStyle}
          onMouseDown={(evt) => {
            if (!hideZoomControls && draggable) {
              prepareDrag(evt, cursor, setCursor);
            } else {
              setCursor({
                ...cursor,
                imageMousedown: !cursorIsOnObjectFitOffset(evt, image, displayOption),
              });
            }
          }}
          onMouseMove={(evt) => {
            if (!dragging) {
              setAllowCrossHair(
                isEditable && !cursorIsOnObjectFitOffset(evt, image, displayOption)
              );
            }
            if (!hideZoomControls && draggable && dragPrepared) {
              startDrag(evt, 'image', cursor, setCursor);
            } else if (!hideZoomControls && dragging) {
              whileDrag(evt, cursor, setCursor, image, setImage, minimap, setMinimap);
            }
          }}
          onMouseUp={(event) => {
            if (dragging) {
              stopDrag(cursor, setCursor);
            } else {
              handleMouseUp({
                event,
                image,
                cursor,
                setCursor,
                isEditable,
                callback: event.ctrlKey ? onAddHotspotPosition : undefined,
              });
            }
          }}
        />
      ) : null}
      {isHotspotDataLoading ? (
        <InlineLoading
          style={{ position: 'absolute', top: 0 }}
          description="Loading hotspot data..."
          status="active"
        />
      ) : null}
      {!isHotspotDataLoading && !hideHotspots && hotspots ? (
        <div data-testid={`${id}-hotspots-container`} style={hotspotsStyle}>
          {cachedHotspots}
        </div>
      ) : null}
      {!hideZoomControls ? (
        <ImageControls
          i18n={mergedI18n}
          minimap={{ ...minimap, src }}
          draggable={draggable}
          dragging={dragging}
          hideMinimap={minimapBehavior === 'showOnPan' ? !dragging || hideMinimapProp : hideMinimap}
          onZoomToFit={() =>
            zoom(
              1,
              zoomMax,
              container,
              image,
              setImage,
              minimap,
              setMinimap,
              options,
              setOptions,
              displayOption
            )
          }
          onZoomIn={() =>
            zoom(
              image.scale + 1,
              zoomMax,
              container,
              image,
              setImage,
              minimap,
              setMinimap,
              options,
              setOptions,
              displayOption
            )
          }
          onZoomOut={() =>
            zoom(
              image.scale - 1,
              zoomMax,
              container,
              image,
              setImage,
              minimap,
              setMinimap,
              options,
              setOptions,
              displayOption
            )
          }
        />
      ) : null}
    </div>
  );
};

ImageHotspots.propTypes = propTypes;
ImageHotspots.defaultProps = defaultProps;

export default ImageHotspots;
