import React, { useRef, useEffect, useState } from 'react';
import { Events } from '@carbon/react/icons';
import { Accordion, AccordionItem } from '@carbon/react';
import PropTypes from 'prop-types';
// The OpenLayersExample is not exported and is only used by StoryBook
/* eslint-disable import/no-extraneous-dependencies */
import mapboxgl from 'mapbox-gl';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import VectorSource from 'ol/source/Vector';
import MapboxVector from 'ol/layer/MapboxVector';
import VectorImage from 'ol/layer/VectorImage';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import { defaults } from 'ol/control';
/* eslint-enable import/no-extraneous-dependencies */

import MapCard from '../MapCard';

import Optionsfield from './Optionsfield';
// import './open-layers-example.scss'; Carbon 11

mapboxgl.accessToken =
  'pk.eyJ1IjoiZGF2aWRpY3VzIiwiYSI6ImNrbTN4OWpsZTBjYm0ybnBsaWZkemV6MmgifQ.jpqC4rJzYG6CY3IXc9NLuw';

const view = new View({
  center: fromLonLat([5, 35]),
  zoom: '2.5',
});

const getColor = (feature, featureName = 'population') => {
  const gdp = feature.get('gdp_md_est');
  const pop = feature.get('pop_est');
  if (featureName === 'population') {
    switch (true) {
      case pop > 1000000 && pop < 5000000:
        return '#f4bfb6';
      case pop > 5000000 && pop < 10000000:
        return '#f1a8a5';
      case pop > 10000000 && pop < 50000000:
        return '#ee8f9a';
      case pop > 50000000 && pop < 100000000:
        return '#ec739b';
      case pop > 100000000 && pop < 250000000:
        return '#dd5ca8';
      case pop > 250000000 && pop < 500000000:
        return '#c44cc0';
      case pop > 500000000 && pop < 1000000000:
        return '#9f43d7';
      case pop > 1000000000:
        return '#6e40e6';
      default:
        return '#f8d5cc';
    }
  } else {
    switch (true) {
      case gdp > 5000 && gdp < 10000:
        return '#f4bfb6';
      case gdp > 10000 && gdp < 50000:
        return '#ee8f9a';
      case gdp > 50000 && gdp < 100000:
        return '#ec739b';
      case gdp > 100000 && gdp < 250000:
        return '#dd5ca8';
      case gdp > 250000 && gdp < 5000000:
        return '#c44cc0';
      case gdp > 5000000 && gdp < 10000000:
        return '#9f43d7';
      case gdp > 10000000:
        return '#6e40e6';
      default:
        return '#f8d5cc';
    }
  }
};

const gdp = new VectorImage({
  source: new VectorSource({
    url: 'https://raw.githubusercontent.com/mapbox/mapbox-react-examples/master/data-overlay/src/data.json',
    format: new GeoJSON(),
  }),
  visible: true,
  title: 'GDP',
  style: (feature) => {
    return new Style({
      fill: new Fill({
        color: getColor(feature, 'GDP'),
      }),
    });
  },
});

const population = new VectorImage({
  source: new VectorSource({
    url: 'https://raw.githubusercontent.com/mapbox/mapbox-react-examples/master/data-overlay/src/data.json',
    format: new GeoJSON(),
  }),
  visible: false,
  title: 'Population',
  style: (feature) => {
    return new Style({
      fill: new Fill({
        color: getColor(feature),
      }),
    });
  },
});

const propTypes = {
  data: PropTypes.shape(PropTypes.any),
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
};

const defaultProps = {
  data: {},
  options: [],
  isLegendFullWidth: false,
  availableActions: {},
  isSettingPanelOpen: false,
  isExpanded: false,
};

/**
 * Example implementation with MapCard using the Open Layers map. This code illustrates
 * a simplified version of how MapCard can be used and should not be seen as a
 * production ready component.
 */
const OpenLayersExample = ({
  data,
  options,
  isLegendFullWidth,
  onCardAction,
  isSettingPanelOpen,
  availableActions,
  isExpanded,
  ...other
}) => {
  const mapContainerRef = useRef(null);
  const [active, setActive] = useState(options[0]);
  const [map, setMap] = useState(null);
  const [activeSideBar, setActiveSideBar] = useState(1);

  // Initialize map when component mounts
  useEffect(() => {
    const mapObject = new Map({
      layers: [
        new MapboxVector({
          styleUrl: 'mapbox://styles/carbondesignsystem/ck7c8ce1y05h61ipb2fixfe76',
          accessToken:
            'pk.eyJ1IjoiZGF2aWRpY3VzIiwiYSI6ImNrbTN4OWpsZTBjYm0ybnBsaWZkemV6MmgifQ.jpqC4rJzYG6CY3IXc9NLuw',
        }),
      ],
      title: 'Main',
      controls: defaults({
        rotate: false,
        zoom: false,
      }),
      view,
      loadTilesWhileAnimating: true,
    });
    mapObject.setTarget(mapContainerRef.current);
    mapObject.addLayer(gdp);
    mapObject.addLayer(population);
    setMap(mapObject);

    return () => mapObject.setTarget(undefined);
  }, [isExpanded]);

  const changeState = (i) => {
    setActive(options[i]);
    map.getLayers().forEach((lyr) => {
      if (lyr.get('title')) {
        lyr.setVisible(!lyr.get('visible'));
      }
    });
  };

  const mapControls = [
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
      icon: Events,
      iconDescription: 'Map control 1',
      onClick: () => changeState(0),
    },
    {
      icon: Events,
      iconDescription: 'Map control 2',
      onClick: () => changeState(1),
    },
    {
      icon: Events,
      iconDescription: 'Map control 3',
      onClick: () => changeState(0),
    },
  ];

  const layeredControls = [
    {
      icon: Events,
      iconDescription: 'Map control 1',
      onClick: () => changeState(0),
    },
    {
      icon: Events,
      iconDescription: 'Map control 2',
      onClick: () => changeState(1),
    },
    {
      icon: Events,
      iconDescription: 'Map control 3',
      onClick: () => changeState(0),
    },
  ];

  const onZoomIn = () => {
    map.getView().animate({
      zoom: map.getView().getZoom() + 1,
      duration: 250,
    });
  };

  const onZoomOut = () => {
    map.getView().animate({
      zoom: map.getView().getZoom() - 1,
      duration: 250,
    });
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
    <MapCard
      id="map-card"
      isExpanded={isExpanded}
      mapControls={mapControls}
      availableActions={availableActions}
      mapContainerRef={mapContainerRef}
      isLegendFullWidth={isLegendFullWidth}
      options={options}
      layeredControls={layeredControls}
      stops={active.stops}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      changeState={changeState}
      onCardAction={onCardAction}
      i18n={{ cardTitle: active.name }}
      settingsContent={settingsContent}
      isSettingPanelOpen={isSettingPanelOpen}
      {...other}
    />
  );
};

OpenLayersExample.propTypes = propTypes;
OpenLayersExample.defaultProps = defaultProps;
export default OpenLayersExample;
