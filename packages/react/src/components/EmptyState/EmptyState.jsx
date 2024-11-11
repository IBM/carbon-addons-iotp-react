import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ButtonKinds, Link } from '@carbon/react';

import Button from '../Button';
import { settings } from '../../constants/Settings';
import {
  EmptystateErrorIcon as ErrorImage,
  Emptystate404Icon as Error404Image,
  EmptystateDefaultIcon as EmptyImage,
  EmptystateSuccessIcon as SuccessImage,
  EmptystateNotauthorizedIcon as NotAuthImage,
  EmptystateNoresultsIcon as NoResultImage,
} from '../../icons/static';
import deprecate from '../../internal/deprecate';

const { iotPrefix } = settings;

const icons = {
  error: ErrorImage,
  error404: Error404Image,
  empty: EmptyImage,
  'not-authorized': NotAuthImage,
  'no-result': NoResultImage,
  success: SuccessImage,
};

const smallIconProps = {
  width: 64,
  height: 64,
  viewBox: '0 0 80 80',
};

const SMALL_SIZE = 'small';
const DEFAULT_SIZE = 'default';

const props = {
  /** Title of empty state */
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  /** Description of empty state */
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  /** Optional image of state */
  icon: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.oneOf(['error', 'error404', 'empty', 'not-authorized', 'no-result', 'success', '']),
  ]),
  /** Optional action for container */
  action: PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
    onClick: PropTypes.func.isRequired,
    /** primary, secondary, etc from carbon */
    kind: PropTypes.oneOf([...ButtonKinds, 'icon-selection']),
  }),
  /** Optional secondary action for container */
  secondaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  /** Specify an optional className to be applied to the container */
  className: PropTypes.string,
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  /** Specify a testid for testing this component */
  testId: PropTypes.string,
  /** Size of the empty state */
  size: PropTypes.oneOf([DEFAULT_SIZE, SMALL_SIZE]),
  /** Arrangement of the empty state */
  arrangement: PropTypes.oneOf(['stacked', 'inline']),
};

const defaultProps = {
  action: null,
  secondaryAction: null,
  icon: '',
  className: '',
  testId: 'EmptyState',
  size: 'default',
  arrangement: 'stacked',
};

/**
 * Component to set empty states
 * For reference, visit https://pages.github.ibm.com/ai-applications/design/components/empty-states/usage/
 */
const EmptyState = ({
  title,
  icon,
  body,
  action,
  secondaryAction,
  className,
  testId,
  testID,
  size,
  arrangement,
}) => {
  const isSmall = size === SMALL_SIZE;
  return (
    <div
      className={classnames(`${iotPrefix}--empty-state`, className, {
        [`${iotPrefix}--empty-state--inline`]: arrangement === 'inline',
      })}
      // TODO: remove deprecated testID in v3.
      data-testid={testID || testId}
    >
      <div
        className={classnames(`${iotPrefix}--empty-state--content`, {
          [`${iotPrefix}--empty-state--content--with-gap`]: arrangement === 'inline' && !!icon,
        })}
      >
        {icon &&
          React.createElement(typeof icon === 'string' ? icons[icon] : icon, {
            className: classnames(`${iotPrefix}--empty-state--icon`, {
              [`${iotPrefix}--empty-state--icon--sm`]: isSmall,
            }),
            alt: '',
            'data-testid': `${testID || testId}-icon`,
            ...(isSmall && smallIconProps),
          })}
        <h3
          className={classnames(`${iotPrefix}--empty-state--title`, {
            [`${iotPrefix}--empty-state--title--sm`]: isSmall,
          })}
          // TODO: remove deprecated testID in v3.
          data-testid={`${testID || testId}-title`}
        >
          {title}
        </h3>
        {typeof body === 'string' ? (
          <p
            className={`${iotPrefix}--empty-state--text`}
            // TODO: remove deprecated testID in v3.
            data-testid={`${testID || testId}-body`}
          >
            {body}
          </p>
        ) : (
          body
        )}
        {action && (
          <div
            className={`${iotPrefix}--empty-state--action`}
            // TODO: remove deprecated testID in v3.
            data-testid={`${testID || testId}-action`}
          >
            <Button kind={action.kind} onClick={action.onClick} size={isSmall ? 'sm' : 'md'}>
              {action.label}
            </Button>
          </div>
        )}
        {secondaryAction && (
          <div
            className={`${iotPrefix}--empty-state--link`}
            // TODO: remove deprecated testID in v3.
            data-testid={`${testID || testId}-secondaryAction`}
          >
            {secondaryAction.label && (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <Link onClick={secondaryAction.onClick}>{secondaryAction.label}</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = props;
EmptyState.defaultProps = defaultProps;

export default EmptyState;
