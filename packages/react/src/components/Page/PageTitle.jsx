import React from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { spacing03 } from '@carbon/layout';

import { COLORS } from '../../styles/styles';

const StyledPageTitle = styled.div`
  max-width: 50rem;
  flex: 1 1 20%;
`;

const StyledPageSection = styled.span`
  color: ${COLORS.blue};
  padding-right: ${spacing03};
`;

const StyledPageTitleH1 = styled.h1`
  align-items: center;
  display: flex;
  margin-bottom: $spacing-05;
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.25rem;
`;

const propTypes = {
  /** Section is an element that describes the category of this page */
  section: PropTypes.node,
  /** Title of the page  */
  title: PropTypes.node,

  testId: PropTypes.string,
};

const defaultProps = {
  section: null,
  title: null,
  testId: 'page-title',
};

const PageTitle = ({ title, section, testId }) => (
  <StyledPageTitle data-testid={testId}>
    {title ? (
      <StyledPageTitleH1>
        {section ? <StyledPageSection>{`${section} /`}</StyledPageSection> : null}
        {title}
      </StyledPageTitleH1>
    ) : null}
  </StyledPageTitle>
);

PageTitle.propTypes = propTypes;
PageTitle.defaultProps = defaultProps;
export default PageTitle;
