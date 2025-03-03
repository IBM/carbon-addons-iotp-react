import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { text, object, boolean, select } from '@storybook/addon-knobs';
import { spacing03 } from '@carbon/layout';

import ImageHotspots from './ImageHotspots';
import landscape from './landscape.jpg';
import portrait from './portrait.jpg';
import smallerImage from './MunichBuilding.png';

const hotspots = [
  {
    x: 0,
    y: 0,
    content: <span style={{ padding: spacing03 }}>0:0</span>,
    color: 'green',
    width: 20,
    height: 20,
  },
  {
    x: 0,
    y: 99.9,
    content: <span style={{ padding: spacing03 }}>0:99</span>,
    color: 'green',
    width: 20,
    height: 20,
  },
  {
    x: 99.9,
    y: 99.9,
    content: <span style={{ padding: spacing03 }}>99:99</span>,
    color: 'green',
    width: 20,
    height: 20,
  },
  {
    x: 99.9,
    y: 0,
    content: <span style={{ padding: spacing03 }}>99:0</span>,
    color: 'green',
    width: 20,
    height: 20,
  },
  {
    x: 10,
    y: 20,
    content: <span style={{ padding: spacing03 }}>Hotspot1</span>,
    icon: 'warning',
    color: 'white',
    width: 20,
    height: 20,
  },
  {
    x: 26,
    y: 75,
    type: 'text',
    content: {
      title: 'Facility rooms',
      values: {
        temperature: 35.35,
        humidity: 99,
      },
      attributes: [
        { dataSourceId: 'temperature', label: 'Temperature' },
        { dataSourceId: 'humidity', label: 'Humidity' },
      ],
      locale: 'en',
    },
    bold: true,
    italic: false,
    underline: false,
    fontColor: '#006666',
    fontSize: 16,
    backgroundColor: '#00FF00',
    backgroundOpacity: 50,
    borderColor: '#FFFF00',
    borderWidth: 8,
  },
  {
    x: 50,
    y: 10,
    content: <span style={{ padding: spacing03 }}>Hotspot2</span>,
    icon: 'warning',
  },
  {
    x: 30,
    y: 40,
    content: <span style={{ padding: spacing03 }}>Hotspot3</span>,
  },
  {
    x: 50,
    y: 60,
    content: {
      title: 'Hotspot3',
      values: {
        temperature: 35.35,
        humidity: 99,
      },
      attributes: [
        { dataSourceId: 'temperature', label: 'Temperature' },
        { dataSourceId: 'humidity', label: 'Humidity' },
      ],
      locale: 'en',
    },
    color: 'green',
  },
];

const componentDescription =
  'Displays an image, with optional hotspots, zoom controls, and minimap. ' +
  'When the minimap is enabled, it will only appear when the image is being dragged ' +
  '/ panned, in which it will follow the overlaying panned position.';

export default {
  title: '1 - Watson IoT/Card/ImageCard/ImageHotspots',

  parameters: {
    component: ImageHotspots,
    info: componentDescription,
  },
};

export const LandscapeImageLandscapeContainer = () => {
  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );
  return (
    <div style={{ width: '450px', height: '300px' }}>
      <ImageHotspots
        key={myDisplayOption}
        displayOption={myDisplayOption}
        src={text('Image', landscape)}
        alt={text('Alternate text', 'Sample image')}
        height={300}
        width={450}
        onAddHotspotPosition={action('onAddHotspotPosition')}
        isEditable
        hideZoomControls={boolean('Hide zoom controls', false)}
        hotspots={object('Hotspots', hotspots)}
        hideHotspots={boolean('Hide hotspots', false)}
        hideMinimap={boolean('Hide Minimap', false)}
        minimapBehavior={select('minimapBehavior', ['hide', 'show', 'showOnPan'], 'showOnPan')}
      />
    </div>
  );
};

LandscapeImageLandscapeContainer.storyName = 'landscape image & landscape container';

export const LandscapeImagePortraitContainer = () => {
  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  return (
    <div style={{ width: '250px', height: '300px' }}>
      <ImageHotspots
        key={myDisplayOption}
        displayOption={myDisplayOption}
        src={text('Image', landscape)}
        alt={text('Alternate text', 'Sample image')}
        height={300}
        width={250}
        onAddHotspotPosition={action('onAddHotspotPosition')}
        isEditable
        hideZoomControls={boolean('Hide zoom controls', false)}
        hotspots={object('Hotspots', hotspots)}
        hideHotspots={boolean('Hide hotspots', false)}
        hideMinimap={boolean('Hide Minimap', false)}
        minimapBehavior={select('minimapBehavior', ['hide', 'show', 'showOnPan'], 'showOnPan')}
      />
    </div>
  );
};

LandscapeImagePortraitContainer.storyName = 'landscape image & portrait container';

export const PortraitImageLandscapeContainer = () => {
  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  return (
    <div style={{ width: '450px', height: '300px' }}>
      <ImageHotspots
        key={myDisplayOption}
        displayOption={myDisplayOption}
        src={text('Image', portrait)}
        height={300}
        width={450}
        onAddHotspotPosition={action('onAddHotspotPosition')}
        isEditable
        alt={text('Alternate text', 'Sample image')}
        hideZoomControls={boolean('Hide zoom controls', false)}
        hotspots={object('Hotspots', hotspots)}
        hideHotspots={boolean('Hide hotspots', false)}
        hideMinimap={boolean('Hide Minimap', false)}
        minimapBehavior={select('minimapBehavior', ['hide', 'show', 'showOnPan'], 'showOnPan')}
      />
    </div>
  );
};

PortraitImageLandscapeContainer.storyName = 'portrait image & landscape container';

export const PortraitImagePortraitContainer = () => {
  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  return (
    <div style={{ width: '225px', height: '300px' }}>
      <ImageHotspots
        key={myDisplayOption}
        displayOption={myDisplayOption}
        src={text('Image', portrait)}
        height={300}
        width={225}
        onAddHotspotPosition={action('onAddHotspotPosition')}
        isEditable
        alt={text('Alternate text', 'Sample image')}
        hideZoomControls={boolean('Hide zoom controls', false)}
        hotspots={object('Hotspots', hotspots)}
        hideHotspots={boolean('Hide hotspots', false)}
        hideMinimap={boolean('Hide Minimap', false)}
        minimapBehavior={select('minimapBehavior', ['hide', 'show', 'showOnPan'], 'showOnPan')}
      />
    </div>
  );
};

PortraitImagePortraitContainer.storyName = 'portrait image & portrait container';

export const ImageSmallerThanCardMinimapAndZoomcontrolsShouldBeHidden = () => {
  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  return (
    <div style={{ width: '560px', height: '560px' }}>
      <ImageHotspots
        key={myDisplayOption}
        displayOption={myDisplayOption}
        src={text('Image', smallerImage)}
        height={560}
        width={560}
        onAddHotspotPosition={action('onAddHotspotPosition')}
        isEditable
        alt={text('Alternate text', 'Sample image')}
        hideZoomControls={boolean('Hide zoom controls', false)}
        hotspots={object('Hotspots', hotspots)}
        hideHotspots={boolean('Hide hotspots', false)}
        hideMinimap={boolean('Hide Minimap', false)}
        minimapBehavior={select('minimapBehavior', ['hide', 'show', 'showOnPan'], 'showOnPan')}
      />
    </div>
  );
};

ImageSmallerThanCardMinimapAndZoomcontrolsShouldBeHidden.storyName =
  'image smaller than card, minimap and zoomcontrols should be hidden';

export const EditableWithTextHotspot = () => {
  const WithState = () => {
    const [myHotspots, setMyHotspots] = useState([
      ...hotspots,
      {
        x: 75,
        y: 10,
        type: 'text',
        content: { title: 'Storage' },
        fontSize: 24,
        backgroundColor: '#999999',
        backgroundOpacity: 50,
      },
      {
        x: 75,
        y: 40,
        type: 'text',
        content: { title: '' },
        backgroundColor: '#ffffff',
        backgroundOpacity: 90,
        borderWidth: 1,
        borderColor: '#DDDDDD',
      },
    ]);
    const [selectedHotspotPositions, setSelectedHotspotPositions] = useState([{ x: 75, y: 40 }]);

    const onAddHotspotPosition = (position) => {
      const newHotspot = {
        ...position,
        content: (
          <span
            style={{
              padding: spacing03,
            }}
          >{`Hotspot ${position.x} - ${position.y}`}</span>
        ),
      };
      setMyHotspots([...myHotspots, newHotspot]);
      action('onAddHotspotPosition')(position);
    };

    const onSelectHotspot = (position) => {
      // This example use single select, but we can allow multiple selected hotspots
      // by modifying how onSelectHotspot alters the selectedHotspotPositions state.
      setSelectedHotspotPositions([position]);
      action('onSelectHotspot')(position);
    };

    const onHotspotContentChanged = (position, change) => {
      const modifiedHotspots = myHotspots.map((hotspot) =>
        hotspot.x === position.x && hotspot.y === position.y
          ? { ...hotspot, content: { ...hotspot.content, ...change } }
          : hotspot
      );
      setMyHotspots(modifiedHotspots);
      action('onHotspotContentChanged')(position, change);
    };

    const myDisplayOption = select(
      'displayOption',
      { contain: 'contain', fill: 'fill', undefined },
      undefined
    );

    return (
      <div style={{ width: '450px', height: '300px' }}>
        <ImageHotspots
          key={myDisplayOption}
          displayOption={myDisplayOption}
          isEditable
          onAddHotspotPosition={onAddHotspotPosition}
          onSelectHotspot={onSelectHotspot}
          onHotspotContentChanged={onHotspotContentChanged}
          src={text('Image', landscape)}
          alt={text('Alternate text', 'Sample image')}
          height={300}
          width={450}
          hideZoomControls={boolean('Hide zoom controls', false)}
          hotspots={myHotspots}
          hideHotspots={boolean('Hide hotspots', false)}
          hideMinimap={boolean('Hide Minimap', false)}
          minimapBehavior={select('minimapBehavior', ['hide', 'show', 'showOnPan'], 'showOnPan')}
          selectedHotspots={selectedHotspotPositions}
        />
      </div>
    );
  };

  return <WithState />;
};

EditableWithTextHotspot.storyName = 'Editable with text hotspot';
