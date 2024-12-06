import React from 'react';
import PropTypes from 'prop-types';
import { ContentSwitcher, Switch } from '@carbon/react';

const propTypes = {
  /** Callback from when content switcher is changes */
  onChange: PropTypes.func,
  /** Index of the current item selected */
  selectedIndex: PropTypes.number,
  i18n: PropTypes.shape({
    listText: PropTypes.string,
    gridText: PropTypes.string,
  }),
  testId: PropTypes.string,
};

const defaultProps = {
  onChange: () => {},
  selectedIndex: 0,
  i18n: {
    listText: 'List',
    gridText: 'Grid',
  },
  testId: 'tile-gallery-view-switcher',
};

const TileGalleryViewSwitcher = ({ onChange, selectedIndex, i18n, testId }) => {
  return (
    <ContentSwitcher
      onChange={(event) => onChange(event)}
      selectedIndex={selectedIndex}
      data-testid={testId}
    >
      <Switch name="list" text={i18n.listText} data-testid={`${testId}-list-switch`} />
      <Switch name="grid" text={i18n.gridText} data-testid={`${testId}-grid-switch`} />
    </ContentSwitcher>
  );
};

TileGalleryViewSwitcher.propTypes = propTypes;
TileGalleryViewSwitcher.defaultProps = defaultProps;

export default TileGalleryViewSwitcher;
