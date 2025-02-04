import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { find, pick } from 'lodash-es';
import classnames from 'classnames';

import { useResize } from '../../internal/UseResizeObserver';
import { settings } from '../../constants/Settings';
import { getLayout } from '../../utils/componentUtilityFunctions';
import {
  GUTTER,
  ROW_HEIGHT,
  CARD_DIMENSIONS,
  DASHBOARD_BREAKPOINTS,
  DASHBOARD_COLUMNS,
  DASHBOARD_CONTAINER_PADDING,
  CARD_SIZES,
} from '../../constants/LayoutConstants';
import { DashboardLayoutPropTypes } from '../../constants/CardPropTypes';

const { iotPrefix } = settings;

const GridLayout = WidthProvider(Responsive);

export const DashboardGridPropTypes = {
  /** Array of elements to render in the grid (recommended that you use our Card component) */
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  /** current screen breakpoint which determine which dashboard layout to use */
  breakpoint: PropTypes.oneOf(['max', 'xl', 'lg', 'md', 'sm', 'xs']),
  /** Is the dashboard currently in the editable state */
  isEditable: PropTypes.bool,
  /** current set of react-grid-layout rules for laying the cards out
   * Layout is an array of objects with the format:
   * {x: number, y: number, w: number, h: number}
   * The index into the layout must match the key used on each item component.
   * If you choose to use custom keys, you can specify that key in the layout
   * array objects like so:
   * {i: string, x: number, y: number, w: number, h: number}
   */
  layouts: PropTypes.shape({
    max: PropTypes.arrayOf(DashboardLayoutPropTypes),
    xl: PropTypes.arrayOf(DashboardLayoutPropTypes),
    lg: PropTypes.arrayOf(DashboardLayoutPropTypes),
    md: PropTypes.arrayOf(DashboardLayoutPropTypes),
    sm: PropTypes.arrayOf(DashboardLayoutPropTypes),
    xs: PropTypes.arrayOf(DashboardLayoutPropTypes),
  }),
  /** Array of layouts that are supported by this component. Defaults to all layouts */
  supportedLayouts: PropTypes.arrayOf(PropTypes.oneOf(['max', 'xl', 'lg', 'md', 'sm', 'xs'])),
  /**
   * Optionally listen to layout changes to update a dashboard template
   * Calls back with (currentLayout: Layout, allLayouts: {[key: $Keys<breakpoints>]: Layout}) => void,
   */
  onLayoutChange: PropTypes.func,
  /** Optionally listen to window resize events to update a dashboard template */
  onBreakpointChange: PropTypes.func,
  /** Callback for when a card has been resized */
  onResizeStop: PropTypes.func,
  /** Callback for when a card has been resized by drag */
  onCardSizeChange: PropTypes.func,

  testId: PropTypes.string,
  useCSSTransforms: PropTypes.bool,
};

const defaultProps = {
  breakpoint: 'lg',
  isEditable: false,
  layouts: {},
  supportedLayouts: Object.keys(DASHBOARD_BREAKPOINTS),
  onLayoutChange: null,
  onBreakpointChange: null,
  onResizeStop: null,
  onCardSizeChange: null,
  testId: 'dashboard-grid',
  useCSSTransforms: true,
};

const getClosestMatchingSizes = ({ sortedSizes, value, dimension }) => {
  const closestLargerSize = sortedSizes.find((size) => size[dimension] > value);
  const closestDimensionValue = closestLargerSize
    ? closestLargerSize[dimension]
    : sortedSizes[sortedSizes.length - 1][dimension];
  return sortedSizes.filter((size) => size[dimension] === closestDimensionValue);
};

const getMatchingCardSizesByDimension = ({ breakpointSizes, ...rest }) => {
  const { value, dimension } = rest;
  const sortedSizes = breakpointSizes.sort((a, b) => a[dimension] - b[dimension]);
  const matchingSizes = sortedSizes.filter((size) => size[dimension] === value);
  return matchingSizes.length ? matchingSizes : getClosestMatchingSizes({ sortedSizes, ...rest });
};

/**
 * Returns the closest larger matching card size (SMALL, MEDIUM etc) based on the
 * dimensions (height first) of a layoutItems.
 * @param {*} layoutItem a layoutItem with modified dimensions
 * @param {*} breakpointSizes list of card size objects for a specific breakpoint
 */
export const getMatchingCardSize = (layoutItem, breakpointSizes) => {
  const sizesMatchingHeight = getMatchingCardSizesByDimension({
    breakpointSizes,
    value: layoutItem.h,
    dimension: 'h',
  });
  return getMatchingCardSizesByDimension({
    breakpointSizes: sizesMatchingHeight,
    value: layoutItem.w,
    dimension: 'w',
  })[0];
};

/**
 * Used to generate a list card size objects for a specific breakpoint.
 * The list objects have the props 'h', 'w' and 'name' where name is the card size name.
 * @param {*} breakpoint
 * @param {*} cardDimensions see CARD_DIMENSIONS
 * @param {*} cardSizes see CARD_SIZES
 */
export const getBreakPointSizes = (breakpoint, cardDimensions, cardSizes) => {
  return (
    Object.entries(cardDimensions)
      .map(([name, breakpoints]) => ({
        ...breakpoints[breakpoint],
        name,
      }))
      // Filter out legacy sizes
      .filter((entry) => cardSizes[entry.name])
  );
};

/**
 * This function finds an existing layout for each dashboard breakpoint, validates it, and or generates a new one to return
 * @param {Object} layouts a keyed object of each layout for each breakpoint
 * @param {Array<Object>} cards an array of the card props for each card
 * @param {Array<string>} supportedLayouts
 */
export const findLayoutOrGenerate = (layouts, cards, supportedLayouts) => {
  // iterate through each breakpoint
  return supportedLayouts.reduce((acc, layoutName) => {
    let layout = layouts && layouts[layoutName];
    // If layouts exists and there is one for each card
    if (layout && layout.length === cards.length) {
      // We need to set the width and height based on the card.size using CARD_DIMENSIONS
      layout = layout.map((cardLayout) => {
        const matchingCard = find(cards, { id: cardLayout.i });
        return {
          ...cardLayout,
          ...(matchingCard ? { ...CARD_DIMENSIONS[matchingCard.size][layoutName] } : {}),
        };
      });
    } else {
      // generate the layout if we're not passed one from the parent or if the layouts are missing for any breakpoints
      layout = getLayout(layoutName, cards, DASHBOARD_COLUMNS, CARD_DIMENSIONS, layout);
    }

    // Add the resizable flag
    const layoutWithResizableItems = layout.map((cardFromLayout) => {
      const matchingCard = find(cards, { id: cardFromLayout.i });
      return {
        ...cardFromLayout,
        isResizable: matchingCard?.isResizable,
      };
    });

    return {
      ...acc,
      [layoutName]: layoutWithResizableItems,
    };
  }, {});
};

const formatResizeResponse = (params) => ({
  layout: params[0],
  oldItem: params[1],
  newItem: params[2],
  placeholder: params[3],
  event: params[4],
  element: params[5],
});

/**
 * Renders the grid of cards according to the standardized PAL patterns for IoT.
 *
 * This is a stateless component but it does have some caching to help optimize performance.
 *
 * Gutter size and card dimensions, row heights, dashboard breakpoints, and column grids are standardized across IoT,
 * it passes this information down to each cards as it renders them.
 *
 * If the dashboardgrid is set to editable mode, it supports dragging and dropping the cards around.
 * On each change to card position, the onLayoutChange callback will be triggered.
 *
 * If the window is resized, the onBreakpointChange event will be fired.
 *
 * You can also pass any of the additional properties documented here:
 * https://github.com/STRML/react-grid-layout#grid-layout-props
 */
const DashboardGrid = ({
  children,
  breakpoint,
  isEditable,
  layouts,
  supportedLayouts,
  onLayoutChange,
  onBreakpointChange,
  onCardSizeChange,
  onResizeStop: onResizeStopCallback,
  testId,
  useCSSTransforms,
  ...others
}) => {
  const gridRef = useResize(useRef(null));
  // Unfortunately can't use React.Children.map because it breaks the original key which breaks react-grid-layout
  const childrenArray = useMemo(() => children, [children]);
  const generatedLayouts = useMemo(
    () =>
      findLayoutOrGenerate(
        layouts,
        childrenArray.map((card) => card.props),
        supportedLayouts
      ),
    [childrenArray, layouts, supportedLayouts]
  );
  const cachedMargin = useMemo(() => [GUTTER, GUTTER], []);

  const handleLayoutChange = useCallback(
    (layout, allLayouts) => {
      if (onLayoutChange) {
        onLayoutChange(layout, allLayouts);
      }
    },
    [onLayoutChange]
  );

  // listen for the width to be adjusted and then dispatch the resize event
  // Work around for a bug in React-Grid-Layout. Issue here: https://github.com/STRML/react-grid-layout/issues/1204
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridRef?.current?.clientWidth]);

  // add the common measurements and key to the card so that the grid layout can find it
  const cards = useMemo(() => {
    return childrenArray.map((card) =>
      React.cloneElement(card, {
        key: card.props.id,
        dashboardBreakpoints: DASHBOARD_BREAKPOINTS,
        cardDimensions: CARD_DIMENSIONS,
        dashboardColumns: DASHBOARD_COLUMNS,
        rowHeight: ROW_HEIGHT,
      })
    );
  }, [childrenArray]);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  useEffect(() => {
    const animationFramePromise = requestAnimationFrame(() => {
      setShouldAnimate(isEditable);
    });
    return () => animationFramePromise && cancelAnimationFrame(animationFramePromise);
  }, [isEditable]);

  const breakpointSizes = useMemo(
    () => getBreakPointSizes(breakpoint, CARD_DIMENSIONS, CARD_SIZES),
    [breakpoint]
  );

  const onCardResize = (...params) => {
    const [, oldLayoutItem, layoutItem, placeholder] = params;
    const rowsJumped = layoutItem.y - oldLayoutItem.y;
    const colsJumped = layoutItem.x - oldLayoutItem.x;

    const jumpAdjustedlayoutItem = {
      ...layoutItem,
      h: layoutItem.h + rowsJumped,
      w: layoutItem.w + colsJumped,
    };

    const matchedSize = getMatchingCardSize(jumpAdjustedlayoutItem, breakpointSizes);

    const renderedCardSizeName = cards.find((card) => card.props.id === layoutItem.i).props.size;
    placeholder.h = matchedSize.h;
    placeholder.w = matchedSize.w;
    layoutItem.h = matchedSize.h;
    layoutItem.w = matchedSize.w;
    if (renderedCardSizeName !== matchedSize.name && onCardSizeChange) {
      const gridResponse = formatResizeResponse(params);
      onCardSizeChange(
        {
          id: layoutItem.i,
          size: matchedSize.name,
        },
        gridResponse
      );
    }
  };

  const onResizeStop = (...params) => {
    const [, oldLayoutItem, layoutItem] = params;
    const newSize = getMatchingCardSize(layoutItem, breakpointSizes);
    const oldSize = getMatchingCardSize(oldLayoutItem, breakpointSizes);
    /* istanbul ignore else */
    if (newSize !== oldSize) {
      layoutItem.h = newSize.h;
      layoutItem.w = newSize.w;
      /* istanbul ignore else */
      if (onResizeStopCallback) {
        const gridResponse = formatResizeResponse(params);
        onResizeStopCallback(
          {
            id: layoutItem.i,
            size: newSize.name,
          },
          gridResponse
        );
      }
    }
  };

  return (
    <div data-testid={testId} style={{ flex: 1 }} ref={gridRef}>
      <GridLayout
        className={classnames(`${iotPrefix}--dashboard-grid`, {
          // Stop the initial animation unless we need to support editing drag-and-drop
          [`${iotPrefix}--dashboard-grid__animate`]: shouldAnimate,
        })}
        key={shouldAnimate} // forced to throw away and regen the GridLayout as it doesn't update when className is updated for shouldAnimate
        layouts={generatedLayouts}
        cols={DASHBOARD_COLUMNS}
        breakpoints={pick(DASHBOARD_BREAKPOINTS, supportedLayouts)}
        margin={cachedMargin}
        containerPadding={DASHBOARD_CONTAINER_PADDING}
        rowHeight={ROW_HEIGHT[breakpoint]}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={onBreakpointChange}
        onResize={onCardResize}
        onResizeStop={onResizeStop}
        isResizable={false}
        isDraggable={isEditable}
        useCSSTransforms={useCSSTransforms}
        {...others}
      >
        {cards}
      </GridLayout>
    </div>
  );
};

DashboardGrid.propTypes = DashboardGridPropTypes;
DashboardGrid.defaultProps = defaultProps;
export default DashboardGrid;
