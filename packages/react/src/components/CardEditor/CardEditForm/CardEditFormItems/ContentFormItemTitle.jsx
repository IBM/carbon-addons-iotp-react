import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Link, unstable_FeatureFlags as FeatureFlags } from '@carbon/react';
import { Information } from '@carbon/icons-react';

import { settings } from '../../../../constants/Settings';

const { iotPrefix } = settings;

const propTypes = {
  title: PropTypes.string,
  tooltip: PropTypes.shape({
    tooltipText: PropTypes.string,
    href: PropTypes.string,
    linkText: PropTypes.string,
  }),
};

const defaultProps = {
  title: 'Data',
  tooltip: null,
};

const ContentFormItemTitle = ({ title, tooltip }) => {
  const { tooltipText, linkText, href } = tooltip || {};
  return (
    <div className={`${iotPrefix}--card-edit-form--form-section`}>
      {title ? <div>{title}</div> : null}
      <div>
        {tooltip ? (
          <FeatureFlags enableV12DynamicFloatingStyles>
            <Tooltip
              align="left"
              triggerId={`card-edit-form-${title}`}
              tooltipId={`card-edit-form-${title}`}
              label={
                <p>
                  {tooltipText}{' '}
                  {href && linkText ? (
                    <Link href={href} target="_blank" rel="noopener noreferrer">
                      {linkText}
                    </Link>
                  ) : null}
                </p>
              }
            >
              <Information />
            </Tooltip>
          </FeatureFlags>
        ) : null}
      </div>
    </div>
  );
};

ContentFormItemTitle.propTypes = propTypes;
ContentFormItemTitle.defaultProps = defaultProps;
export default ContentFormItemTitle;
