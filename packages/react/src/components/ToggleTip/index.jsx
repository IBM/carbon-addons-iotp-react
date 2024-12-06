import * as React from 'react';
import {
  ToggletipLabel,
  Toggletip as CarbonToggleTip,
  ToggletipButton,
  ToggletipContent,
  ToggletipActions,
} from '@carbon/react';
import PropTypes from 'prop-types';
import { Information } from '@carbon/icons-react';

export const ToggleTip = ({
  triggerText,
  triggerBtn,
  direction,
  align,
  renderIcon: IconCustomElement,
  content,
  action,
  useAutoPositioning,
  showIcon,
  toggleTipLabelRef,
  ...other
}) => {
  let newAlign;
  // This function is to pass the old direction, align property to the new align property since The align and direction props have been merged into the align prop
  if (direction === 'bottom' && align === 'center') {
    newAlign = 'bottom';
  } else if (direction === 'bottom' && align === 'end') {
    newAlign = 'bottom-end';
  } else if (direction === 'top' && align === 'start') {
    newAlign = 'top-start';
  } else if (direction === 'top' && align === 'center') {
    newAlign = 'top';
  } else if (direction === 'top' && align === 'end') {
    newAlign = 'top-end';
  } else if (direction === 'right' && align === 'start') {
    newAlign = 'right-start';
  } else if (direction === 'right' && align === 'center') {
    newAlign = 'right';
  } else if (direction === 'right' && align === 'end') {
    newAlign = 'right-end';
  } else if (direction === 'left' && align === 'start') {
    newAlign = 'left-start';
  } else if (direction === 'left' && align === 'center') {
    newAlign = 'left';
  } else if (direction === 'left' && align === 'end') {
    newAlign = 'left-end';
  } else {
    newAlign = 'bottom-start';
  }
  return (
    <>
      {showIcon && triggerText !== '' ? (
        <ToggletipLabel>
          <div ref={toggleTipLabelRef}>{triggerText}</div>
        </ToggletipLabel>
      ) : null}
      <CarbonToggleTip align={newAlign} autoAlign={useAutoPositioning} {...other}>
        {triggerBtn ?? (
          <ToggletipButton>
            {showIcon ? (
              IconCustomElement ? (
                <IconCustomElement />
              ) : (
                <Information />
              )
            ) : (
              <ToggletipLabel>
                <div ref={toggleTipLabelRef}>{triggerText}</div>
              </ToggletipLabel>
            )}
          </ToggletipButton>
        )}
        <ToggletipContent>
          {content}
          <ToggletipActions>{action}</ToggletipActions>
        </ToggletipContent>
      </CarbonToggleTip>
    </>
  );
};

ToggleTip.propTypes = {
  ...ToggleTip.propTypes,
  triggerText: PropTypes.string,
  triggerBtn: PropTypes.node,
  direction: PropTypes.string,
  renderIcon: PropTypes.node,
  content: PropTypes.node,
  action: PropTypes.node,
  useAutoPositioning: PropTypes.bool,
  showIcon: PropTypes.bool,
  toggleTipLabelRef: PropTypes.shape({ current: PropTypes.node }),
};

ToggleTip.defaultProps = {
  ...ToggleTip.defaultProps,
  direction: 'bottom',
  align: 'center',
  triggerText: '',
  useAutoPositioning: false,
  showIcon: true,
  toggleTipLabelRef: undefined,
};

export default ToggleTip;
