import { ToastNotification } from '@carbon/react';
import PropTypes from 'prop-types';
import React from 'react';
import { spacing03 } from '@carbon/layout';

export const deprecatedStoryTitle = '️⛔ Deprecation Notice ';
export const experimentalStoryTitle = '️⚠️ Experimental Notice ';

const propTypes = {
  /** Name of the component that story is about */
  componentName: PropTypes.string.isRequired,
  /** Name of the component replacing the deprecated component */
  replacementComponentName: PropTypes.string,
  /** Is this a deprecation or experimental notice */
  experimental: PropTypes.bool,
};

const defaultProps = {
  replacementComponentName: '',
  experimental: false,
};

const StoryNotice = ({ componentName, replacementComponentName, experimental }) => {
  const noticeTitle = experimental ? 'Experimental Component Notice' : 'Deprecation Notice';
  const noticeSubTitle = experimental
    ? `${componentName} is an  experimental component and may have changing APIs with no major version bump and/or insufficient test coverage. Use of this component in production is discouraged.`
    : `${componentName} has been deprecated and will be removed in the next major version of carbon-addons-iot-react.`;

  return (
    <>
      <ToastNotification
        caption={
          replacementComponentName
            ? `Refactor usages of ${componentName} to use ${replacementComponentName} instead.`
            : null
        }
        hideCloseButton
        iconDescription=""
        kind={experimental ? 'warning-alt' : 'warning'}
        notificationType="toast"
        role="alert"
        style={{
          marginBottom: spacing03,
          minWidth: '30rem',
        }}
        subtitle={noticeSubTitle}
        timeout={0}
        title={noticeTitle}
      />
      {experimental && (
        <div style={{ marginTop: '1rem' }}>
          <a href="https://github.com/carbon-design-system/carbon-addons-iot-react/blob/next/packages/react/docs/guides/experimental-components.md">
            Learn more about experimental components
          </a>
        </div>
      )}
    </>
  );
};

StoryNotice.propTypes = propTypes;
StoryNotice.defaultProps = defaultProps;

export default StoryNotice;
