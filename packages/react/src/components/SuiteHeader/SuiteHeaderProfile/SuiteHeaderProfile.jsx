/* eslint-disable no-script-url */

import React from 'react';
import PropTypes from 'prop-types';
import { ButtonSkeleton, SkeletonText } from '@carbon/react';

import Button from '../../Button';
import { settings } from '../../../constants/Settings';
import { handleSpecificKeyDown } from '../../../utils/componentUtilityFunctions';

const defaultProps = {
  username: '',
  displayName: '',
  profileLink: 'javascript:void(0)',
  onRequestLogout: null,
  i18n: {
    profileTitle: 'Profile',
    profileButton: 'Manage profile',
    logoutButton: 'Log out',
  },
  testId: 'suite-header-profile',
};

const propTypes = {
  username: PropTypes.string,
  displayName: PropTypes.string,
  profileLink: PropTypes.string,
  onProfileClick: PropTypes.func.isRequired,
  onRequestLogout: PropTypes.func,
  i18n: PropTypes.shape({
    profileTitle: PropTypes.string,
    profileButton: PropTypes.string,
    logoutButton: PropTypes.string,
  }),
  testId: PropTypes.string,
};

const SuiteHeaderProfile = ({
  username,
  displayName,
  profileLink,
  onProfileClick,
  onRequestLogout,
  i18n,
  testId,
}) => {
  const mergedI18N = { ...defaultProps.i18n, ...i18n };
  const baseClassName = `${settings.iotPrefix}--suite-header-profile`;
  const chipText = (displayName || '')
    .split(' ')
    .map((i) => i.charAt(0))
    .join('');
  return (
    <div data-testid={testId} className={baseClassName}>
      <h5>{mergedI18N.profileTitle}</h5>
      {username ? (
        <>
          <div className={`${baseClassName}--user`}>
            <div className={`${baseClassName}--user--chip`}>{chipText}</div>
            <div className={`${baseClassName}--user--detail`}>
              <div>
                <strong>{displayName}</strong>
              </div>
              <div>{username}</div>
            </div>
          </div>
          <div
            className={`${baseClassName}--manage-button${
              onRequestLogout ? '' : ` ${baseClassName}--manage-button--no-logout`
            }`}
          >
            <Button
              kind="secondary"
              size="sm"
              testId={`${testId}--profile`}
              onClick={onProfileClick}
              onKeyDown={handleSpecificKeyDown(['Enter', ' '], onProfileClick)}
              href={profileLink}
              rel="noopener noreferrer"
            >
              {mergedI18N.profileButton}
            </Button>
          </div>
          {onRequestLogout && (
            <div className={`${baseClassName}--logout`}>
              <Button kind="secondary" testId={`${testId}--logout`} onClick={onRequestLogout}>
                {mergedI18N.logoutButton}
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <div
            className={`${baseClassName}--loading${
              onRequestLogout ? '' : ` ${baseClassName}--loading--no-logout`
            }`}
            data-testid="suite-header-profile--loading"
          >
            <SkeletonText paragraph lineCount={3} width="80%" />
          </div>
          {onRequestLogout && (
            <div className={`${baseClassName}--logout ${baseClassName}--logout--loading`}>
              <ButtonSkeleton />
            </div>
          )}
        </>
      )}
    </div>
  );
};

SuiteHeaderProfile.propTypes = propTypes;
SuiteHeaderProfile.defaultProps = defaultProps;

export default SuiteHeaderProfile;
