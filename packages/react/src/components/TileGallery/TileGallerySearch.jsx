import React from 'react';
import PropTypes from 'prop-types';
import { Search } from '@carbon/react';
import { white } from '@carbon/colors';

const propTypes = {
  /** i18n strings */
  i18n: PropTypes.shape({
    iconDescription: PropTypes.string,
    placeHolderText: PropTypes.string,
    closeButtonText: PropTypes.string,
  }),
  searchValue: PropTypes.string,
  onChange: PropTypes.func,
  width: PropTypes.string,
  testId: PropTypes.string,
};

const defaultProps = {
  i18n: {
    iconDescription: 'Search',
    placeHolderText: '',
    closeButtonText: 'Clear search input',
  },
  searchValue: '',
  onChange: () => {},
  width: '304px',
  testId: 'tile-gallery-search-input',
};

const TileGallerySearch = ({ i18n, searchValue, onChange, width, testId }) => {
  return (
    <div>
      <Search
        style={{ background: white, width }}
        value={searchValue}
        labelText={i18n.iconDescription}
        placeholder={i18n.placeHolderText}
        onChange={(event) => onChange(event)}
        closeButtonLabelText={i18n.closeButtonText}
        id="gallery-search"
        data-testid={testId}
      />
    </div>
  );
};

TileGallerySearch.propTypes = propTypes;
TileGallerySearch.defaultProps = defaultProps;

export default TileGallerySearch;
