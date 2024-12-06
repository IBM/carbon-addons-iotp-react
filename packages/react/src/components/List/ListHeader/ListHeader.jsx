import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Search } from '@carbon/react';

import { settings } from '../../../constants/Settings';
import { handleSpecificKeyDown } from '../../../utils/componentUtilityFunctions';

const { iotPrefix } = settings;

const propTypes = {
  title: PropTypes.string,
  buttons: PropTypes.arrayOf(PropTypes.node),
  search: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.string,
    id: PropTypes.string,
    hasFastSearch: PropTypes.bool,
  }),
  i18n: PropTypes.shape({
    searchPlaceHolderText: PropTypes.string,
    clearSearchIconDescription: PropTypes.string,
  }),
  testId: PropTypes.string,
};

const defaultProps = {
  buttons: [],
  search: {
    onChange: () => {},
    value: '',
    hasFastSearch: true,
  },
  i18n: {
    searchPlaceHolderText: 'Enter a value',
  },
  title: null,
  testId: 'list-header',
};

const ListHeader = ({ title, buttons, search, i18n, testId }) => {
  const previousSearchValueRef = useRef(search?.value);
  const hasFastSearch = search?.hasFastSearch !== false;
  const handleSearch = (e) => {
    const { value: currentValue } = e.target;
    const { current: previousValue } = previousSearchValueRef;
    if (previousValue !== currentValue) {
      search.onChange(e);
      previousSearchValueRef.current = currentValue;
    }
  };

  return (
    <div data-testid={testId} className={`${iotPrefix}--list-header-container`}>
      {title || (buttons && buttons.length > 0) ? (
        <div className={`${iotPrefix}--list-header`}>
          <div className={`${iotPrefix}--list-header--title`}>{title}</div>
          <div className={`${iotPrefix}--list-header--btn-container`}>{buttons}</div>
        </div>
      ) : null}
      {search ? (
        <div className={`${iotPrefix}--list-header--search`}>
          <Search
            closeButtonLabelText={i18n.clearSearchIconDescription}
            id={search.id || `${iotPrefix}--list-header--search`}
            placeholder={i18n.searchPlaceHolderText}
            onChange={hasFastSearch !== false ? handleSearch : undefined}
            onBlur={hasFastSearch ? undefined : handleSearch}
            onKeyDown={handleSpecificKeyDown(['Enter'], handleSearch)}
            onClear={() => handleSearch({ target: { value: '' } })}
            size="md"
            value={search.value}
            labelText={i18n.searchPlaceHolderText}
            data-testid={`${testId}-search-input`}
          />
        </div>
      ) : null}
    </div>
  );
};

ListHeader.propTypes = propTypes;
ListHeader.defaultProps = defaultProps;

export default ListHeader;
