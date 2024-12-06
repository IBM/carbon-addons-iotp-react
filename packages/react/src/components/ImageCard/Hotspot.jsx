import React from 'react';
import classnames from 'classnames';
import { Tooltip } from '@carbon/react';
import { g10 } from '@carbon/themes';

import { settings } from '../../constants/Settings';
import { hexToRgb } from '../../utils/componentUtilityFunctions';
import { HotspotPropTypes } from '../../constants/SharedPropTypes';
import useSizeObserver from '../../hooks/useSizeObserver';

import CardIcon from './CardIcon';

const { iotPrefix } = settings;
const { ui01, text01, ui03 } = g10;

const propTypes = HotspotPropTypes;

const defaultProps = {
  icon: null,
  iconDescription: '',
  color: 'blue',
  width: 25,
  height: 25,
  renderIconByName: null,
  onClick: null,
  isSelected: false,
  type: 'fixed',
  bold: false,
  italic: false,
  underline: false,
  fontColor: text01,
  fontSize: 14,
  backgroundColor: ui01,
  backgroundOpacity: 100,
  borderColor: ui03,
  borderWidth: 0,
};

/**
 * This component renders a hotspot with content over an image
 */
const Hotspot = ({
  x,
  y,
  content,
  icon,
  iconDescription,
  color,
  width,
  height,
  renderIconByName,
  onClick,
  isSelected,
  className,
  type,
  bold,
  italic,
  underline,
  fontColor,
  fontSize,
  backgroundColor,
  backgroundOpacity,
  borderColor,
  borderWidth,
  ...others
}) => {
  const [containerSize, containerRef] = useSizeObserver();

  const defaultIcon = (
    <svg width={width} height={height}>
      <circle
        cx={width / 2}
        cy={height / 2}
        r={width / 2 - 1}
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="1"
      />
      <circle
        cx={width / 2}
        cy={height / 2}
        r={width / 2 - 1}
        stroke="none"
        fill={color}
        opacity="0.7"
      />
    </svg>
  );

  const iconToRender = icon ? (
    <CardIcon
      icon={icon}
      title={iconDescription}
      color={color}
      width={width}
      height={height}
      renderIconByName={renderIconByName}
    />
  ) : (
    defaultIcon
  );

  const id = `hotspot-${x}-${y}`;
  const { r, g, b } = hexToRgb(backgroundColor);
  const opacity = backgroundOpacity / 100;
  const isTextType = type === 'text';

  const containerWidth = isTextType ? containerSize.width : width;
  const containerHeight = isTextType ? containerSize.height : height;

  return (
    <div
      ref={containerRef}
      data-testid={id}
      style={{
        '--x-pos': x,
        '--y-pos': y,
        '--width': containerWidth,
        '--height': containerHeight,
      }}
      className={classnames(`${iotPrefix}--hotspot-container`, {
        [`${iotPrefix}--hotspot-container--selected`]: isSelected,
        [`${iotPrefix}--hotspot-container--has-icon`]: icon,
        [`${iotPrefix}--hotspot-container--is-text`]: isTextType,
        [`${iotPrefix}--hotspot-container--is-fixed`]: type === 'fixed',
        [`${iotPrefix}--hotspot-container--is-dynamic`]: type === 'dynamic',
      })}
      icon={icon}
    >
      {type === 'fixed' || type === 'dynamic' ? (
        <Tooltip
          {...others}
          autoAlign
          label={content}
          align="bottom"
          onClick={(evt) => {
            if (evt.type === 'click' && onClick) {
              onClick(evt, { x, y });
            }
          }}
        >
          {iconToRender}
        </Tooltip>
      ) : isTextType ? (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <div
          role="complementary"
          style={{
            '--background-color': `rgba( ${r}, ${g}, ${b}, ${opacity})`,
            '--border-color': borderColor,
            '--border-width': borderWidth,
            '--title-font-weight': bold ? 'bold' : 'normal',
            '--title-font-style': italic ? 'italic' : 'normal',
            '--title-text-decoration-line': underline ? 'underline' : 'none',
            '--title-font-color': fontColor,
            '--title-font-size': fontSize,
          }}
          className={`${iotPrefix}--text-hotspot`}
          onClick={(evt) => onClick(evt, { x, y })}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
};

Hotspot.propTypes = propTypes;
Hotspot.defaultProps = defaultProps;

export default Hotspot;
