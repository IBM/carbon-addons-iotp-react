import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import update from 'immutability-helper';
// The MapboxDragPanelExample is not exported and is only used by StoryBook
/* eslint-disable-next-line import/no-extraneous-dependencies */
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';

import MapCard from '../MapCard';

// import './mapbox-example.scss'; carbon 11
import DragPanel from './DragPanel';

mapboxgl.accessToken =
  'pk.eyJ1IjoiZGF2aWRpY3VzIiwiYSI6ImNrbTN4OWpsZTBjYm0ybnBsaWZkemV6MmgifQ.jpqC4rJzYG6CY3IXc9NLuw';

const propTypes = {
  data: PropTypes.shape({}),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      property: PropTypes.string,
      stops: PropTypes.arrayOf(PropTypes.array),
    })
  ),
  isLegendFullWidth: PropTypes.bool,
  onCardAction: PropTypes.func.isRequired,
  availableActions: PropTypes.shape({
    edit: PropTypes.bool,
    clone: PropTypes.bool,
    delete: PropTypes.bool,
    expand: PropTypes.bool,
    range: PropTypes.bool,
    settings: PropTypes.bool,
  }),
  isSettingPanelOpen: PropTypes.bool,
  isExpanded: PropTypes.bool,
  isResizable: PropTypes.bool,
};

const defaultProps = {
  data: {},
  options: [],
  isLegendFullWidth: false,
  availableActions: {},
  isSettingPanelOpen: false,
  isExpanded: false,
  isResizable: false,
};

/**
 * Example implementation with MapCard using the Mapbox map that also
 * adds and manages draggable panels for related content. This code illustrates
 * a simplified version of how MapCard can be used and should not be seen as a
 * production ready component. The drag functionality is provided by react-dnd and
 * the MapCard provides a dropRef parameter for the ref needed by react-dnd.
 */
const MapboxDragPanelExample = ({
  data,
  options,
  isLegendFullWidth,
  onCardAction,
  availableActions,
  isSettingPanelOpen,
  isExpanded,
  isResizable,
  ...other
}) => {
  const mapContainerRef = useRef(null);
  const active = options[0];
  const [map, setMap] = useState(null);

  // Initialize map when component mounts
  useEffect(
    () => {
      const mapboxMap = new mapboxgl.Map({
        container: mapContainerRef.current,
        // see https://www.carbondesignsystem.com/data-visualization/complex-charts/#mapbox
        style: 'mapbox://styles/carbondesignsystem/ck7c8ce1y05h61ipb2fixfe76',
        center: [5, 34],
        zoom: 1.5,
      });

      mapboxMap.on('load', () => {
        mapboxMap.addSource('countries', {
          type: 'geojson',
          data,
        });

        mapboxMap.setLayoutProperty('country-label', 'text-field', [
          'format',
          ['get', 'name_en'],
          { 'font-scale': 1.2 },
          '\n',
          {},
        ]);

        mapboxMap.addLayer(
          {
            id: 'countries',
            type: 'fill',
            source: 'countries',
          },
          'country-label'
        );

        mapboxMap.setPaintProperty('countries', 'fill-color', {
          property: active.property,
          stops: active.stops,
        });

        mapboxMap.resize();

        setMap(mapboxMap);
      });

      // Clean up on unmount
      return () => mapboxMap.remove();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isExpanded]
  );

  useEffect(() => {
    if (map) {
      map.setPaintProperty('countries', 'fill-color', {
        property: active.property,
        stops: active.stops,
      });
    }
  }, [active, map]);

  const onZoomIn = () => {
    map.zoomIn({ duration: 250 });
  };

  const onZoomOut = () => {
    map.zoomOut({ duration: 250 });
  };

  const [panels, setPanels] = useState({
    panelA: { top: 16, left: 16, width: 100, height: 200, content: <p>I am a draggable panel</p> },
    panelB: {
      top: 50,
      left: 200,
      width: 100,
      height: 200,
      content: 'I am another draggable panel',
    },
  });

  const movePanel = useCallback(
    (id, left, top) => {
      setPanels(
        update(panels, {
          [id]: {
            $merge: { left, top },
          },
        })
      );
    },
    [panels, setPanels]
  );

  const [, drop] = useDrop(
    () => ({
      accept: 'dragPanel',
      drop(item, monitor) {
        const dropZonePadding = 16;
        const delta = monitor.getDifferenceFromInitialOffset();
        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);
        const dropZoneHeight = mapContainerRef.current.clientHeight;
        const dropZoneWidth = mapContainerRef.current.clientWidth;
        const minTop = dropZonePadding;
        const maxTop = dropZoneHeight - dropZonePadding - item.height;
        const minLeft = dropZonePadding;
        const maxLeft = dropZoneWidth - dropZonePadding - item.width;

        const adjustedTop = top < minTop ? minTop : top > maxTop ? maxTop : top;
        const adjustedLeft = left < minLeft ? minLeft : left > maxLeft ? maxLeft : left;

        movePanel(item.id, adjustedLeft, adjustedTop);
        return undefined;
      },
    }),
    [movePanel]
  );

  return (
    <MapCard
      id="map-card"
      dropRef={drop}
      isExpanded={isExpanded}
      isResizable={isResizable}
      availableActions={availableActions}
      mapControls={[]}
      mapContainerRef={mapContainerRef}
      isLegendFullWidth={isLegendFullWidth}
      options={options}
      layeredControls={[]}
      stops={active.stops}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onCardAction={onCardAction}
      i18n={{ cardTitle: active.name }}
      settingsContent={() => null}
      isSettingPanelOpen={isSettingPanelOpen}
      {...other}
    >
      {Object.keys(panels).map((key) => {
        const { left, top, content, height, width } = panels[key];
        return (
          <DragPanel key={key} id={key} left={left} top={top} height={height} width={width}>
            {content}
          </DragPanel>
        );
      })}
    </MapCard>
  );
};

MapboxDragPanelExample.propTypes = propTypes;
MapboxDragPanelExample.defaultProps = defaultProps;
export default MapboxDragPanelExample;
