import React from 'react';
import classnames from 'classnames';
import { ErrorFilled, WarningFilled } from '@carbon/react/icons';

import { Tooltip } from '../Tooltip';
import { settings } from '../../constants/Settings';
import { ValueContentPropTypes, CardPropTypes } from '../../constants/CardPropTypes';
import { CARD_SIZES, CARD_CONTENT_PADDING, CARD_DATA_STATE } from '../../constants/LayoutConstants';

const { iotPrefix } = settings;
const dsPrefix = `${iotPrefix}--data-state`;

// Testing the tooltip content outside carbon proved difficult.
// So this is exposed for testing purpose.
export const TooltipContent = ({ tooltipContent }) => {
  const { label, description, extraTooltipText, learnMoreElement } = tooltipContent;

  return (
    <span className={`${dsPrefix}-tooltip`}>
      <p className={`${dsPrefix}-tooltip__label`}>{label}</p>
      <p>{description}</p>
      {extraTooltipText && <p>{extraTooltipText}</p>}
      {learnMoreElement}
    </span>
  );
};
TooltipContent.propTypes = {
  tooltipContent: ValueContentPropTypes.dataState.isRequired,
};

const DataStateRenderer = ({ dataState, size, id }) => {
  const { label, description } = dataState;

  const withTooltip = (element, triggerId, tooltipDirection) => {
    return (
      <Tooltip
        showIcon={false}
        useAutoPositioning
        triggerText={element}
        triggerId={triggerId}
        tooltipId={`${triggerId}-tooltip`}
        id={`${triggerId}-tooltip`} // https://github.com/carbon-design-system/carbon/pull/6744
        direction={tooltipDirection || 'bottom'}
      >
        <TooltipContent tooltipContent={dataState} />
      </Tooltip>
    );
  };

  const renderDataStateGridIcon = () => {
    const { type, tooltipDirection } = dataState;
    let { icon } = dataState;
    if (!icon) {
      if (type === CARD_DATA_STATE.ERROR) {
        icon = <ErrorFilled size={24} className={`${dsPrefix}-default-error-icon`} />;
      } else if (type === CARD_DATA_STATE.NO_DATA) {
        icon = <WarningFilled size={24} className={`${dsPrefix}-default-warning-icon`} />;
      }
    }

    return withTooltip(icon, `${dsPrefix}-grid__icon-${id}`, tooltipDirection);
  };

  const renderDataStateGridItems = () => {
    const labelClass = `${dsPrefix}-grid__label`;
    const descriptionClass = `${dsPrefix}-grid__description`;
    return (
      <React.Fragment>
        {renderDataStateGridIcon()}
        {withTooltip(<span className={labelClass}>{label}</span>, `${labelClass}-${id}`)}
        {withTooltip(
          <p className={descriptionClass}>{description}</p>,
          `${descriptionClass}-${id}`
        )}
      </React.Fragment>
    );
  };

  return (
    <div
      className={`${dsPrefix}-container`}
      style={{ '--container-padding': `${CARD_CONTENT_PADDING}px` }}
    >
      <p className={classnames(`${dsPrefix}-dashes`)}>--</p>
      <div className={`${dsPrefix}-grid`}>
        {size === CARD_SIZES.SMALL ||
        size === CARD_SIZES.SMALLWIDE ||
        size === CARD_SIZES.MEDIUMTHIN
          ? renderDataStateGridIcon()
          : renderDataStateGridItems()}
      </div>
    </div>
  );
};

DataStateRenderer.propTypes = {
  size: CardPropTypes.size,
  id: CardPropTypes.id,
  dataState: ValueContentPropTypes.dataState.isRequired,
};
DataStateRenderer.defaultProps = {
  size: CARD_SIZES.MEDIUM,
  id: 'data-state-renderer',
};

export default DataStateRenderer;
