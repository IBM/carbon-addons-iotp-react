import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown } from '@carbon/react/icons';
import classnames from 'classnames';

import Button from '../Button';
import { settings } from '../../constants/Settings';
import { MapControlPropType } from '../../constants/CardPropTypes';

const { iotPrefix } = settings;
const BASE_CLASS_NAME = `${iotPrefix}--map-scroll-controls`;

const propTypes = {
  /** The list of controls placed in the scrollable group */
  controls: PropTypes.arrayOf(MapControlPropType).isRequired,
  scrollUpIconDescriptionText: PropTypes.string,
  scrollDownIconDescriptionText: PropTypes.string,
  tooltipPosition: PropTypes.string,
  testId: PropTypes.string,
  /** Number of visible items shown between the scroll buttons */
  visibleItemsCount: PropTypes.number,
};

const defaultProps = {
  visibleItemsCount: 6,
  testId: 'map-scroll-controls',
  tooltipPosition: 'left',
  scrollUpIconDescriptionText: 'Scroll up',
  scrollDownIconDescriptionText: 'Scroll down',
};

const ScrollingControls = ({
  controls,
  visibleItemsCount,
  tooltipPosition,
  scrollUpIconDescriptionText,
  scrollDownIconDescriptionText,
  testId,
}) => {
  const scrollContainerRef = useRef();
  const buttonHeightPx = 40;
  const scrollBy = (visibleItemsCount - 1 || 1) * buttonHeightPx;
  const [scrollDownDisabled, setScrollDownDisabled] = useState(false);
  const [scrollUpDisabled, setScrollUpDisabled] = useState(true);

  const handleScrolling = (distance) => {
    const container = scrollContainerRef.current;
    const scrollingDown = distance > 0;

    container.scrollBy({ left: 0, top: distance, behavior: 'smooth' });
    setScrollUpDisabled(Math.abs(container.scrollTop) + distance === 0);
    setScrollDownDisabled(
      scrollingDown &&
        container.scrollHeight - (Math.abs(container.scrollTop) + scrollBy) ===
          container.clientHeight
    );
  };

  return (
    <div data-testid={testId} className={classnames(`${BASE_CLASS_NAME}__container`)}>
      <Button
        testId={`${testId}-scroll-up`}
        className={classnames(`${BASE_CLASS_NAME}__btn`, `${BASE_CLASS_NAME}__scroll-btn`)}
        disabled={scrollUpDisabled}
        kind="ghost"
        size="md"
        hasIconOnly
        tooltipPosition={tooltipPosition}
        renderIcon={(props) => <ChevronUp size={16} {...props} />}
        iconDescription={scrollUpIconDescriptionText}
        onClick={() => handleScrolling(scrollBy * -1)}
      />
      {scrollUpDisabled ? null : <div className={`${BASE_CLASS_NAME}__gradient`} />}
      <div
        data-testid={`${testId}-scroll-area`}
        ref={scrollContainerRef}
        style={{
          [`--visble-items-count`]: visibleItemsCount,
          [`--scroll-area-height`]: `${visibleItemsCount * buttonHeightPx}px`,
        }}
        className={classnames(`${BASE_CLASS_NAME}__scroll-area`)}
      >
        {controls.map((control, i) => {
          return (
            <Button
              className={`${BASE_CLASS_NAME}__btn`}
              key={`${control.iconDescription}-${i}`}
              kind="ghost"
              size="md"
              hasIconOnly
              tooltipPosition={tooltipPosition}
              renderIcon={control.icon}
              iconDescription={control.iconDescription}
              onClick={control.onClick}
            />
          );
        })}
      </div>
      {scrollDownDisabled ? null : (
        <div
          className={classnames(
            `${BASE_CLASS_NAME}__gradient`,
            `${BASE_CLASS_NAME}__gradient--flipped`
          )}
        />
      )}
      <Button
        testId={`${testId}-scroll-down`}
        className={classnames(`${BASE_CLASS_NAME}__btn`, `${BASE_CLASS_NAME}__scroll-btn`)}
        disabled={scrollDownDisabled}
        kind="ghost"
        size="md"
        hasIconOnly
        tooltipPosition={tooltipPosition}
        renderIcon={(props) => <ChevronDown size={16} {...props} />}
        iconDescription={scrollDownIconDescriptionText}
        onClick={() => handleScrolling(scrollBy)}
      />
    </div>
  );
};

ScrollingControls.defaultProps = defaultProps;
ScrollingControls.propTypes = propTypes;
export default ScrollingControls;
