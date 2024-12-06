import React, { useRef, useEffect, useState } from 'react';
import { Events, Cloud, Cloudy, Fog, Hail, PartlyCloudy, Rain, Sun } from '@carbon/react/icons';
import { Accordion, AccordionItem } from '@carbon/react';
// The MapboxExample is not exported and is only used by StoryBook
/* eslint-disable-next-line import/no-extraneous-dependencies */
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';

import MapCard from '../MapCard';
import { DragAndDrop } from '../../../utils/DragAndDropUtils';

import Optionsfield from './Optionsfield';
// import './mapbox-example.scss';  carbon 11

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
 * Example implementation with MapCard using the Mapbox map. This code illustrates
 * a simplified version of how MapCard can be used and should not be seen as a
 * production ready component.
 */
const MapboxExample = ({
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
  const [active, setActive] = useState(options[0]);
  const [map, setMap] = useState(null);
  const [activeSideBar, setActiveSideBar] = useState(1);
  const [selectedControls, setSelectedControls] = useState([]);

  const changeState = (i) => {
    setActive(options[i]);
  };

  const toggleControlSelection = (id) => {
    setSelectedControls((state) =>
      selectedControls.includes(id) ? state.filter((currentId) => currentId !== id) : [...state, id]
    );
  };

  const mapControls = [
    {
      hasScroll: true,
      visibleItemsCount: 4,
      group: [
        {
          icon: Hail,
          iconDescription: 'Map scroll hail',
          onClick: () => changeState(0),
        },
        {
          icon: Rain,
          iconDescription: 'Map scroll rain',
          onClick: () => changeState(0),
        },
        {
          icon: Fog,
          iconDescription: 'Map scroll fog',
          onClick: () => changeState(0),
        },
        {
          icon: Cloudy,
          iconDescription: 'Map scroll cloudy',
          onClick: () => changeState(1),
        },
        {
          icon: Cloud,
          iconDescription: 'Map scroll cloud',
          onClick: () => changeState(0),
        },
        {
          icon: PartlyCloudy,
          iconDescription: 'Map scroll partly cloudy',
          onClick: () => changeState(0),
        },

        {
          icon: Sun,
          iconDescription: 'Map scroll sun',
          onClick: () => changeState(0),
        },
      ],
    },
    {
      group: [
        {
          icon: Events,
          iconDescription: 'GDP',
          onClick: () => changeState(1),
        },
        {
          icon: Events,
          iconDescription: 'Population',
          onClick: () => changeState(0),
        },
        {
          icon: Events,
          iconDescription: 'Map control 3A',
          onClick: () => changeState(1),
        },
      ],
    },
    {
      id: 'toggle1',
      kind: 'icon-selection',
      selected: selectedControls.includes('toggle1'),
      icon: Events,
      iconDescription: 'Toggle control 1',
      onClick: () => toggleControlSelection('toggle1'),
    },
    {
      id: 'toggle2',
      kind: 'icon-selection',
      selected: selectedControls.includes('toggle2'),
      icon: Events,
      iconDescription: 'Toggle control 2',
      onClick: () => toggleControlSelection('toggle2'),
    },
    {
      id: 'toggle3',
      kind: 'icon-selection',
      selected: selectedControls.includes('toggle3'),
      icon: Events,
      iconDescription: 'Toggle control 3',
      onClick: () => toggleControlSelection('toggle3'),
    },
  ];

  const layeredControls = [
    {
      id: 'layerControl1',
      selected: selectedControls.includes('layerControl1'),
      kind: 'icon-selection',
      icon: Events,
      iconDescription: 'Toggle Layer control 1',
      onClick: () => {
        toggleControlSelection('layerControl1');
      },
    },
    {
      icon: Events,
      iconDescription: 'Layer control 2',
      onClick: () => changeState(1),
    },
    {
      icon: Events,
      iconDescription: 'Layer control 3',
      onClick: () => changeState(0),
    },
  ];

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

  const settingsContent = () => (
    <Accordion className="settings-accordion" style={{ paddingTop: 0 }}>
      <AccordionItem
        title="GDP vs Population"
        onClick={() => setActiveSideBar(1)}
        open={activeSideBar === 1}
      >
        <Optionsfield options={options} property={active.property} changeState={changeState} />
      </AccordionItem>
      <AccordionItem title="Panel B" onClick={() => setActiveSideBar(2)} open={activeSideBar === 2}>
        More Map settings
      </AccordionItem>
      <AccordionItem title="Panel C" onClick={() => setActiveSideBar(3)} open={activeSideBar === 3}>
        Even more settings
      </AccordionItem>
    </Accordion>
  );

  return (
    <DragAndDrop>
      <MapCard
        id="map-card"
        isExpanded={isExpanded}
        isResizable={isResizable}
        availableActions={availableActions}
        mapControls={mapControls}
        mapContainerRef={mapContainerRef}
        isLegendFullWidth={isLegendFullWidth}
        options={options}
        layeredControls={layeredControls}
        stops={active.stops}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onCardAction={onCardAction}
        i18n={{ cardTitle: active.name }}
        settingsContent={settingsContent}
        isSettingPanelOpen={isSettingPanelOpen}
        {...other}
      />
    </DragAndDrop>
  );
};

MapboxExample.propTypes = propTypes;
MapboxExample.defaultProps = defaultProps;
export default MapboxExample;
