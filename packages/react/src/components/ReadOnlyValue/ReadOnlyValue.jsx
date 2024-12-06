import React from 'react';
import classnames from 'classnames';
import { SkeletonText } from '@carbon/react';

import { settings } from '../../constants/Settings';

import { ReadOnlyValuePropTypes, ReadOnlyValueDefaultProps } from './ReadOnlyValuePropTypes';

const { iotPrefix } = settings;

const ReadOnlyValue = ({
  type,
  label,
  value,
  className,
  testId,
  isLoading,
  skeletonLoadingValue,
  textAreaAttributes,
}) => (
  <div
    data-testid={testId}
    className={classnames(className, `${iotPrefix}--read-only-value`, {
      [`${iotPrefix}--read-only-value--loading`]: isLoading,
      [`${iotPrefix}--read-only-value__inline`]: type === 'inline' || type === 'inline_small',
      [`${iotPrefix}--read-only-value__inline_small`]: type === 'inline_small',
    })}
  >
    {/* eslint-disable-next-line jsx-a11y/label-has-for */}
    <label data-testid={`${testId}--label`} htmlFor={`readonly-${label}`}>
      {label}
      {isLoading ? (
        <>
          <SkeletonText {...skeletonLoadingValue} />
        </>
      ) : (
        <>
          {typeof value === 'string' ? (
            <textarea
              {...textAreaAttributes}
              data-testid={`${testId}--value`}
              type="text"
              id={`readonly-${label}`}
              name={value}
              value={value}
              readOnly
            />
          ) : (
            <div id={`readonly-${label}`}>{value}</div>
          )}
        </>
      )}
    </label>
  </div>
);

ReadOnlyValue.propTypes = ReadOnlyValuePropTypes;
ReadOnlyValue.defaultProps = ReadOnlyValueDefaultProps;
export default ReadOnlyValue;
