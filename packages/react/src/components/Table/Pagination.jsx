import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '@carbon/react';
import classnames from 'classnames';

import { settings } from '../../constants/Settings';
import useSizeObserver from '../../hooks/useSizeObserver';

const { iotPrefix } = settings;

/**
 * This pagination component hides the items per page selection dropdown if the isItemsPerPageHidden bit is true.
 * It also hides the Items per page and x of x items text if the total width of the pagination bar is less than 500 px.
 * In addition, it narrows padding between 608px and 500px due to overflow issue.
 */
const SizedPagination = ({
  isItemPerPageHidden,
  className,
  preventInteraction,
  disabled,
  testId,
  size,
  ...rest
}) => {
  const [{ width }, paginationRef] = useSizeObserver({ initialWidth: 500 });

  return (
    <>
      <Pagination
        {...rest}
        forwardedRef={paginationRef}
        size={size}
        data-testid={testId}
        disabled={preventInteraction || disabled}
        className={classnames(className, `${iotPrefix}--pagination`, {
          [`${iotPrefix}--pagination--hide-page`]: isItemPerPageHidden,
          [`${iotPrefix}--pagination--hide-select`]: preventInteraction,
          [`${iotPrefix}--pagination--narrow`]: width > 500 && width < 608,
          [`${iotPrefix}--pagination--compact`]: width < 500,
        })}
        style={{
          '--pagination-text-display': width < 500 ? 'none' : 'flex',
        }}
      />
    </>
  );
};

SizedPagination.propTypes = {
  isItemPerPageHidden: PropTypes.bool,
  // It is currently not possible to completely disable the carbon pagination
  // therefor we use this prop to combine disable and hiding of controls.
  preventInteraction: PropTypes.bool,

  disabled: PropTypes.bool,

  size: PropTypes.oneOf(['sm', 'md', 'lg']),

  testId: PropTypes.string,
};

SizedPagination.defaultProps = {
  isItemPerPageHidden: false,
  preventInteraction: false,
  disabled: false,
  testId: 'sized-pagination',
  size: 'lg',
};

export default SizedPagination;
