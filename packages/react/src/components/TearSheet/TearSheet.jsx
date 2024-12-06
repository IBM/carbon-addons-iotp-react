import React, { cloneElement, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Close } from '@carbon/react/icons';
import classnames from 'classnames';

import { settings } from '../../constants/Settings';
import Button from '../Button';

const { iotPrefix } = settings;

const propTypes = {
  /** Index of the active tear sheet provided by TearSheetWrapper */
  idx: PropTypes.number,
  /** Tear sheet title */
  title: PropTypes.string,
  /** Tear sheet description */
  description: PropTypes.string,
  /** Extra content under description */
  headerExtraContent: PropTypes.node,
  /** Additional classNames to be provided for TearSheet component */
  className: PropTypes.string,
  /** onClose optional function. When provided, it will run when the TearSheet is closed */
  onClose: PropTypes.func,
  /** closeAllTearSheets function is provided via TearSheetWrapper component. It should't be overridden */
  closeAllTearSheets: PropTypes.func,
  /** openNextSheet function is provided by TearSheetWrapper component and it shouldn't be overriden. This function can be accessed via children prop to open the next sheet */
  openNextSheet: PropTypes.func,
  /** goToPreviousSheet function is provided by TearSheetWrapper component and it shouldn't be overriden. This function can be accessed via children prop to go back to the previous sheet or close the current one if its index is 0 */
  goToPreviousSheet: PropTypes.func,
  /** i18n messages */
  i18n: PropTypes.shape({
    close: PropTypes.string,
  }),
  children: PropTypes.node,
  testId: PropTypes.string,
};

const defaultProps = {
  idx: undefined,
  title: 'Title',
  description: 'Description',
  closeAllTearSheets: undefined,
  openNextSheet: undefined,
  goToPreviousSheet: undefined,
  headerExtraContent: null,
  className: undefined,
  onClose: undefined,
  i18n: {
    close: 'Close',
  },
  children: undefined,
  // TODO: set default testId in v3.
  testId: '',
};

const TearSheet = ({
  idx,
  title,
  description,
  headerExtraContent,
  className,
  onClose,
  closeAllTearSheets,
  openNextSheet,
  goToPreviousSheet,
  i18n,
  children,
  testId,
}) => {
  const onCloseButton = () => {
    if (onClose) {
      onClose();
      goToPreviousSheet();
    } else {
      goToPreviousSheet();
    }
  };
  return (
    <div
      // TODO: use only testId in v3.
      data-testid={testId || `${iotPrefix}--tear-sheet-${idx}`}
      className={classnames(`${iotPrefix}--tear-sheet`, className)}
    >
      <div
        className={classnames(`${iotPrefix}--tear-sheet--header`, {
          [`${iotPrefix}--tear-sheet--header__extraContent`]: !!headerExtraContent,
        })}
      >
        <Button
          hasIconOnly
          wrapperClasses={`${iotPrefix}--tear-sheet--header__close-btn`}
          kind="ghost"
          renderIcon={Close}
          iconDescription={i18n.close}
          tooltipAlignment="end"
          tooltipPosition="bottom"
          onClick={onCloseButton}
          // TODO: use only testId in v3.
          testId={testId ? `${testId}-close-button-${idx}` : `tearSheetCloseBtn${idx}`}
        />
        <h2>{title}</h2>
        <span className={`${iotPrefix}--tear-sheet--header--description`}>{description}</span>
        {headerExtraContent}
      </div>

      <div className={`${iotPrefix}--tear-sheet--content`}>
        {useMemo(
          () =>
            cloneElement(children, {
              idx,
              openNextSheet,
              goToPreviousSheet,
              closeAllTearSheets,
            }),
          [children, closeAllTearSheets, goToPreviousSheet, idx, openNextSheet]
        )}
      </div>
    </div>
  );
};

TearSheet.propTypes = propTypes;
TearSheet.defaultProps = defaultProps;

export default TearSheet;
