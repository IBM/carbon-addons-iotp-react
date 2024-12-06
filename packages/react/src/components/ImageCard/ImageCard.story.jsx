import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, object, boolean } from '@storybook/addon-knobs';
import { omit } from 'lodash-es';
import { Bee, Checkmark } from '@carbon/react/icons';
import { spacing03, spacing06 } from '@carbon/layout';

import { CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';

import ImageCard from './ImageCard';
import imageFile from './landscape.jpg';

const content = {
  src: imageFile,
  alt: 'Sample image',
  zoomMax: 10,
  hasInsertFromUrl: true,
};

const values = {
  hotspots: [
    {
      x: 35,
      y: 65,
      icon: 'arrowDown',
      color: 'purple',
      content: <span style={{ padding: spacing03 }}>Elevators</span>,
    },
    {
      x: 45,
      y: 25,
      color: '#0f0',
      content: <span style={{ padding: spacing03 }}>Stairs</span>,
    },
    {
      x: 45,
      y: 50,
      color: '#00f',
      content: <span style={{ padding: spacing03 }}>Vent Fan</span>,
    },
    {
      x: 45,
      y: 75,
      icon: 'arrowUp',
      content: <span style={{ padding: spacing03 }}>Humidity Sensor</span>,
    },
  ],
};

export default {
  title: '1 - Watson IoT/Card/ImageCard',

  parameters: {
    component: ImageCard,
  },
};

export const Basic = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing06,
      }}
    >
      <ImageCard
        title={text('title', 'Image')}
        id="image-hotspots"
        breakpoint={breakpoint}
        content={object('content', content)}
        values={{
          hotspots: [
            {
              x: 35,
              y: 65,
              icon: 'User',
              color: 'purple',
              content: {
                title: 'My Device',
                description: 'Description',
                values: { deviceid: '73000', temperature: 35.05 },
                attributes: [
                  {
                    dataSourceId: 'temperature',
                    label: 'Temp',
                    precision: 2,
                  },
                ],
              },
            },
            {
              x: 45,
              y: 75,
              icon: 'Location',
              color: 'purple',
              content: {
                title: 'My Device',
                description: 'Description',
                values: { deviceid: '73000', temperature: 35.05 },
                attributes: [
                  {
                    dataSourceId: 'temperature',
                    label: 'Temp',
                    precision: 2,
                    thresholds: [
                      {
                        comparison: '>',
                        value: 0,
                        icon: 'Warning alt',
                        color: 'red',
                      },
                    ],
                  },
                ],
              },
            },
          ],
        }}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

Basic.storyName = 'basic';

export const WidthDisplayOptions = () => {
  const myDisplayOption = select(
    'displayOption',
    { contain: 'contain', fill: 'fill', undefined },
    undefined
  );

  const myContent = { ...content, displayOption: myDisplayOption };
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing06,
      }}
    >
      <ImageCard
        title={text('title', 'Image')}
        id="image-hotspots"
        breakpoint={breakpoint}
        content={myContent}
        values={{
          hotspots: [
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
              y: 99.99,
              content: <span style={{ padding: spacing03 }}>0:99</span>,
              color: 'green',
              width: 20,
              height: 20,
            },
            {
              x: 99.99,
              y: 99.99,
              content: <span style={{ padding: spacing03 }}>99:99</span>,
              color: 'green',
              width: 20,
              height: 20,
            },
            {
              x: 99.99,
              y: 0,
              content: <span style={{ padding: spacing03 }}>99:0</span>,
              color: 'green',
              width: 20,
              height: 20,
            },
          ],
        }}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

WidthDisplayOptions.story = {
  name: 'with displayOptions',
};

export const CustomRenderIconByName = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <ImageCard
        title={text('title', 'Image')}
        id="image-hotspots"
        content={object('content', content)}
        values={object('values', values)}
        breakpoint="lg"
        size={size}
        renderIconByName={(name, props = {}) =>
          name === 'arrowDown' ? (
            <Bee {...props}>
              <title>{props.title}</title>
            </Bee>
          ) : name === 'arrowUp' ? (
            <Checkmark {...props}>
              <title>{props.title}</title>
            </Checkmark>
          ) : (
            <span>Unknown</span>
          )
        }
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

CustomRenderIconByName.storyName = 'custom renderIconByName';

export const IsEditable = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <ImageCard
        title={text('title', 'Image')}
        isEditable
        id="image-hotspots"
        content={object('content', omit(content, ['src']))}
        values={object('values', values)}
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

IsEditable.storyName = 'isEditable (experimental)';

export const HotspotsAreLoading = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <ImageCard
        title={text('title', 'Image')}
        isLoading={boolean('isLoading', true)}
        id="image-hotspots"
        content={object('content', content)}
        values={object('values', values)}
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

HotspotsAreLoading.storyName = 'hotspots are loading';

export const Error = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <ImageCard
        title={text('title', 'Image')}
        isLoading={boolean('isLoading', true)}
        id="image-hotspots"
        content={object('content', content)}
        values={object('values', values)}
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
        error={text('error', 'API threw Nullpointer')}
      />
    </div>
  );
};

Error.storyName = 'error';

export const ErrorLoadingImage = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <ImageCard
        title={text('title', 'Image')}
        isLoading={boolean('isLoading', true)}
        id="image-hotspots"
        content={object('content', omit(content, ['src']))}
        values={object('values', values)}
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
        error={text('error', `Error no image found called ImageID`)}
      />
    </div>
  );
};

ErrorLoadingImage.storyName = 'error loading image';

export const ValidationError = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing06,
      }}
    >
      <ImageCard
        title={text('title', 'Image')}
        isEditable
        id="image-hotspots"
        content={object('content', omit(content, ['src']))}
        values={object('values', values)}
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
        validateUploadedImage={(image) => `This file is invalid: ${image?.name}`}
      />
    </div>
  );
};

ValidationError.storyName = 'image upload error';
