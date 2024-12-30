import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Erase } from '@carbon/react/icons';
import classnames from 'classnames';
import { IconButton } from '@carbon/react';

import { settings } from '../../../constants/Settings';
import { Dropdown } from '../../Dropdown';
import deprecate from '../../../internal/deprecate';

const { iotPrefix } = settings;

const propTypes = {
  /** List of data source objects. The same list is used for bothe the x and the y coordinate dropdown */
  dataSourceItems: PropTypes.arrayOf(
    PropTypes.shape({
      dataSourceId: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  id: PropTypes.string,
  /** totally clear the dynamic hotspots */
  onClear: PropTypes.func.isRequired,
  onXValueChange: PropTypes.func.isRequired,
  onYValueChange: PropTypes.func.isRequired,
  selectedSourceIdX: PropTypes.string,
  selectedSourceIdY: PropTypes.string,
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
  i18n: PropTypes.shape({
    clearIconDescription: PropTypes.string,
    xCoordinateDropdownTitleText: PropTypes.string,
    xCoordinateDropdownLabelText: PropTypes.string,
    yCoordinateDropdownTitleText: PropTypes.string,
    yCoordinateDropdownLabelText: PropTypes.string,
  }),
  translateWithId: PropTypes.func.isRequired,
};

const defaultProps = {
  id: 'dynamic-hotspot-source-picker',
  selectedSourceIdX: undefined,
  selectedSourceIdY: undefined,
  testId: 'dynamic-hotspot-source-picker',
  i18n: {
    clearIconDescription: 'Clear coordinate sources',
    xCoordinateDropdownTitleText: 'X coordinate',
    xCoordinateDropdownLabelText: 'Select data item',
    yCoordinateDropdownTitleText: 'Y coordinate',
    yCoordinateDropdownLabelText: 'Select data item',
  },
};

/**
 * This component renders a form where the user can selection which dataSources to use
 * for the X and Y positions
 */
const DynamicHotspotSourcePicker = ({
  dataSourceItems,
  id,
  onClear,
  onXValueChange,
  onYValueChange,
  selectedSourceIdX,
  selectedSourceIdY,
  // TODO: remove deprecated testID prop in v3.
  testID,
  testId,
  i18n,
  translateWithId,
}) => {
  const classname = `${iotPrefix}--dynamic-hotspot-source-picker`;
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  const {
    clearIconDescription,
    xCoordinateDropdownTitleText,
    xCoordinateDropdownLabelText,
    yCoordinateDropdownTitleText,
    yCoordinateDropdownLabelText,
  } = mergedI18n;
  return (
    <div data-testid={testID || testId} className={classname}>
      <Dropdown
        key={`${id}-x-coordinate-dropdown-${selectedSourceIdX}`}
        data-testid={`${testID || testId}-x-coordinate-dropdown`}
        selectedItem={dataSourceItems.find((item) => item.dataSourceId === selectedSourceIdX)}
        id={`${id}-x-coordinate-dropdown`}
        titleText={xCoordinateDropdownTitleText}
        label={xCoordinateDropdownLabelText}
        items={dataSourceItems}
        itemToString={(item) => item.label}
        translateWithId={translateWithId}
        onChange={(change) => {
          onXValueChange(change.selectedItem.dataSourceId);
        }}
      />
      <Dropdown
        key={`${id}-y-coordinate-dropdown-${selectedSourceIdY}`}
        data-testid={`${testID || testId}-y-coordinate-dropdown`}
        selectedItem={dataSourceItems.find((item) => item.dataSourceId === selectedSourceIdY)}
        id={`${id}-y-coordinate-dropdown`}
        titleText={yCoordinateDropdownTitleText}
        label={yCoordinateDropdownLabelText}
        items={dataSourceItems}
        translateWithId={translateWithId}
        itemToString={(item) => item.label}
        onChange={(change) => {
          onYValueChange(change.selectedItem.dataSourceId);
        }}
      />
      <IconButton
        data-testid={`${testID || testId}-clear-dropdown`}
        className={classnames(`${classname}__clear-button`, {
          [`${classname}__clear-button--invisible`]: !selectedSourceIdX || !selectedSourceIdY,
        })}
        kind="ghost"
        size="md"
        renderIcon={Erase}
        label={clearIconDescription}
        autoAlign
        onClick={onClear}
      />
    </div>
  );
};

DynamicHotspotSourcePicker.propTypes = propTypes;
DynamicHotspotSourcePicker.defaultProps = defaultProps;
export default DynamicHotspotSourcePicker;
