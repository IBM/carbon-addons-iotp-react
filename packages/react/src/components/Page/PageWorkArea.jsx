import React from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { spacing05, spacing07 } from '@carbon/layout';

const StyledDiv = styled.div`
  width: 100%;
  padding: ${spacing07} ${spacing05};
`;

const propTypes = {
  isOpen: PropTypes.bool,
  children: PropTypes.node.isRequired,
  testId: PropTypes.string,
};

const defaultProps = {
  isOpen: false,
  testId: 'page-work-area',
};

/** work area with transitions */
const PageWorkArea = ({ isOpen, children, testId }) =>
  isOpen ? <StyledDiv data-testid={testId}>{children}</StyledDiv> : null;

PageWorkArea.propTypes = propTypes;
PageWorkArea.defaultProps = defaultProps;
export default PageWorkArea;
