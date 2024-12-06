import React from 'react';
import PropTypes from 'prop-types';
import { ContentSwitcher, Switch } from '@carbon/react';
import { styled } from 'styled-components';

import { settings } from '../../constants/Settings';

const { prefix } = settings;
const StyledContentSwitcher = styled(ContentSwitcher)`
  && {
    height: auto;
    margin-bottom: $spacing-05;
    justify-content: flex-start;

    .${prefix}--content-switcher-btn {
      position: relative;
      max-width: 10rem;
    }
  }
`;

const propTypes = {
  /** The switcher actions */
  switcher: PropTypes.shape({
    onChange: PropTypes.func,
    selectedIndex: PropTypes.number,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.string,
      })
    ).isRequired,
  }),
  testId: PropTypes.string,
};

const defaultProps = {
  switcher: {
    onChange: null,
    selectedIndex: null,
  },
  testId: 'page-switcher',
};

const PageSwitcher = ({ switcher: { onChange, selectedIndex, options }, testId }) => (
  <StyledContentSwitcher
    onChange={(id) => onChange(id)}
    selectedIndex={selectedIndex}
    data-testid={testId}
  >
    {options.map((item) => (
      <Switch
        key={item.id}
        text={item.text}
        data-tip={item.text}
        data-testid={`${testId}-switch-${item.id}`}
      />
    ))}
  </StyledContentSwitcher>
);

PageSwitcher.propTypes = propTypes;
PageSwitcher.defaultProps = defaultProps;

export default PageSwitcher;
