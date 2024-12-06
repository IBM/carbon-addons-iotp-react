/* Used dependencies */
import React, { Fragment } from 'react';
import { text, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { CheckmarkFilled, Rocket, StarFilled, Activity, Light } from '@carbon/react/icons';
import { green40 } from '@carbon/colors';
import { spacing07 } from '@carbon/layout';

import { OverflowMenu } from '../OverflowMenu';
import { OverflowMenuItem } from '../OverflowMenuItem';
import FullWidthWrapper from '../../internal/FullWidthWrapper';

import TileGallery from './TileGallery';
import TileGallerySection from './TileGallerySection';
import TileGalleryItem from './TileGalleryItem';
import TileGalleryViewSwitcher from './TileGalleryViewSwitcher';
import StatefulTileGallery from './StatefulTileGallery';

const overflowComponent = (
  <OverflowMenu onClick={(evt) => evt.preventDefault()} size="sm">
    <OverflowMenuItem itemText="Edit" onClick={action('Edit')} />
    <OverflowMenuItem itemText="Share" onClick={action('Share')} />
    <OverflowMenuItem itemText="Move" onClick={action('Move')} />
    <OverflowMenuItem itemText="Delete" onClick={action('Delete')} />
  </OverflowMenu>
);

const getContent = () => (
  <Fragment>
    <TileGallerySection
      title={select('Select with/without section', { Title: 'Section 1', None: null }, 'Title')}
    >
      <TileGalleryItem
        title="Card title"
        description="card description"
        moreInfoLink="https://www.ibm.com/br-pt/cloud/internet-of-things?mhsrc=ibmsearch_a&mhq=iot"
        mode="grid"
        thumbnail={<Rocket size={32} fill="black" description="Icon" width={50} height={50} />}
        icon={<CheckmarkFilled fill={green40} onClick={action('clicked')} />}
        afterContent={overflowComponent}
      />
      <TileGalleryItem
        title="Card title"
        description="card description"
        moreInfoLink="https://www.ibm.com/br-pt/cloud/internet-of-things?mhsrc=ibmsearch_a&mhq=iot"
        mode="grid"
        thumbnail={<Activity size={32} fill="black" description="Icon" width={50} height={50} />}
        icon={<CheckmarkFilled fill={green40} onClick={action('clicked')} />}
        afterContent={overflowComponent}
      />
      <TileGalleryItem
        title="Card title"
        description="card description"
        moreInfoLink="https://www.ibm.com/br-pt/cloud/internet-of-things?mhsrc=ibmsearch_a&mhq=iot"
        mode="grid"
        thumbnail={<Light size={32} fill="black" description="Icon" width={50} height={50} />}
        icon={<CheckmarkFilled fill={green40} onClick={action('clicked')} />}
        afterContent={overflowComponent}
      />
    </TileGallerySection>
    <TileGallerySection title="More">
      <TileGalleryItem
        title="Card title"
        description="card description"
        moreInfoLink="https://www.ibm.com/br-pt/cloud/internet-of-things?mhsrc=ibmsearch_a&mhq=iot"
        mode="grid"
        thumbnail={<Light size={32} fill="black" description="Icon" width={50} height={50} />}
        icon={<CheckmarkFilled fill={green40} onClick={action('clicked')} />}
        afterContent={overflowComponent}
      />
    </TileGallerySection>
  </Fragment>
);

export const galleryData = [
  {
    id: 'id1',
    sectionTitle: 'Favorites',
    galleryItems: [
      {
        title: 'Dashboard title',
        description: 'More about your dashboard',
        icon: <StarFilled />,
        afterContent: overflowComponent,
        thumbnail: <Activity size={32} />,
        onClick: action('Card Clicked'),
      },
      {
        title: 'Health',
        description: 'More about your dashboard',
        icon: <StarFilled />,
        afterContent: overflowComponent,
        thumbnail: <Light size={32} />,
        onClick: action('Card Clicked'),
      },
      {
        title: 'Activity',
        description: 'More about your dashboard',
        icon: <StarFilled />,
        afterContent: overflowComponent,
        thumbnail: <Activity size={32} />,
        onClick: action('Card Clicked'),
      },
    ],
  },
  {
    id: 'id2',
    sectionTitle: 'Dashboard Category A',
    galleryItems: [
      {
        title: 'Dashboard title',
        description: 'More about your dashboard',
        icon: <StarFilled />,
        afterContent: overflowComponent,
        thumbnail: <Activity size={32} />,
        onClick: action('Card Clicked'),
      },
      {
        title: 'Dashboard title',
        description: 'More about your dashboard',
        icon: <StarFilled />,
        afterContent: overflowComponent,
        thumbnail: <Light size={32} />,
        onClick: action('Card Clicked'),
      },
      {
        title: 'Dashboard title',
        description: 'More about your dashboard',
        icon: <StarFilled />,
        afterContent: overflowComponent,
        thumbnail: <Activity size={32} />,
        onClick: action('Card Clicked'),
      },
    ],
  },
];

export default {
  title: '1 - Watson IoT/Catalog/Marketplace/TileGallery',
  decorators: [(storyFn) => <FullWidthWrapper>{storyFn()}</FullWidthWrapper>],

  parameters: {
    component: TileGallery,
  },

  excludeStories: ['galleryData'],
};

export const _StatefulTileGallery = () => (
  <StatefulTileGallery
    title="Dashboard"
    hasSearch
    hasSwitcher
    hasButton
    buttonText="Create +"
    galleryData={galleryData}
  />
);

_StatefulTileGallery.storyName = 'Stateful TileGallery';

export const BasicExample = () => (
  <FullWidthWrapper>
    <TileGallery>{getContent()}</TileGallery>
  </FullWidthWrapper>
);

BasicExample.storyName = 'basic example ';

export const TileGalleryItemGrid = () => (
  <TileGalleryItem
    title="Card title"
    description="card description"
    moreInfoLink="https://www.ibm.com/br-pt/cloud/internet-of-things?mhsrc=ibmsearch_a&mhq=iot"
    mode="grid"
    thumbnail={<Rocket size={32} fill="black" description="Icon" width={50} height={50} />}
    icon={<CheckmarkFilled fill={green40} onClick={action('Icon Clicked')} />}
    afterContent={overflowComponent}
    onClick={action('Card Clicked')}
    className="not-active"
  />
);

TileGalleryItemGrid.storyName = 'TileGalleryItem - Grid';

export const TileGalleryItemList = () => (
  <TileGalleryItem
    title="Test"
    description={<div style={{ backgroundColor: 'black' }}>The first one</div>}
    mode="list"
    icon={<StarFilled fill="black" onClick={action('Icon clicked')} />}
    afterContent={overflowComponent}
    onClick={action('Card Clicked')}
  />
);

TileGalleryItemList.storyName = 'TileGalleryItem - List';

export const _TileGalleryViewSwitcher = () => <TileGalleryViewSwitcher />;

_TileGalleryViewSwitcher.storyName = 'TileGalleryViewSwitcher';

export const TileGallerySectionWithTileGalleryItemGrid = () => (
  <FullWidthWrapper>{getContent()}</FullWidthWrapper>
);

TileGallerySectionWithTileGalleryItemGrid.storyName =
  'TileGallerySection with TileGalleryItem Grid';

export const TileGallerySectionWithTileGalleryItemI18N = () => (
  <StatefulTileGallery
    title={text('title', '__Dashboard__')}
    hasSearch
    hasSwitcher
    hasButton
    buttonText={text('button', '__Create__')}
    galleryData={[
      {
        id: 'id1',
        sectionTitle: text('sectionTitle', '__Favorites__'),
        galleryItems: [
          {
            title: text('title', '__Dashboard title__'),
            description: text('description', '__More about your dashboard__'),
            icon: <StarFilled />,
            afterContent: (
              <OverflowMenu
                onClick={(evt) => evt.preventDefault()}
                style={{ height: spacing07 }}
                iconDescription={text('icon description', '__icon description__')}
              >
                <OverflowMenuItem itemText={text('Edit', '__Edit__')} onClick={action('Edit')} />
                <OverflowMenuItem itemText={text('Share', '__Share__')} onClick={action('Share')} />
                <OverflowMenuItem itemText={text('Move', '__Move__')} onClick={action('Move')} />
                <OverflowMenuItem
                  itemText={text('Delete', '__Delete__')}
                  onClick={action('Deleted')}
                />
              </OverflowMenu>
            ),
            thumbnail: <Activity size={32} />,
            onClick: action('Card Clicked'),
          },
        ],
      },
    ]}
    i18n={{
      searchIconDescription: text('i18n.searchIconDescription', '__Search Icon Description__'),
      searchPlaceHolderText: text('i18n.searchPlaceHolderText', '__Search Placeholder__'),
      searchCloseButtonText: text('i18n.searchCloseButtonText', '__Search Close Button__'),
      listText: text('i18n.listText', '__ListText__'),
      gridText: text('i18n.gridText', '__GridText__'),
      descriptionMoreInfo: text('i18n.descriptionMoreInfo', '__DescriptionMoreInfo__'),
    }}
  />
);

TileGallerySectionWithTileGalleryItemI18N.storyName =
  'TileGallerySection with TileGalleryItem - i18n';
