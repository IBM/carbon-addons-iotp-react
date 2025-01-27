import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';
import { spacing09 } from '@carbon/layout';

import { settings } from '../../constants/Settings';
import Button from '../Button';
import { COLORS, PADDING, SIZES } from '../../styles/styles';

const { prefix } = settings;

const StyledNavigationContainer = styled.div`
  position: relative;
  background-color: ${COLORS.white};
  padding-top: ${spacing09};

  div[role='tablist'] {
    padding-left: ${PADDING.horizontalWrapPadding};
    padding-right: ${PADDING.horizontalWrapPadding};
    align-items: center;
    height: 100%;
    block-size: auto;
    button.cds--tabs__nav-item {
      width: 10rem;
      height: 100%;
      align-items: flex-end;

      @media (min-width: 42em) {
        a.${prefix}--tabs__nav-link {
          height: 100%;
        }
      }
    }

    margin-left: 0rem;
  }
  @media (min-width: 42em) {
    padding-top: 0;

    nav::after {
      background: ${COLORS.lightGrey};
      content: '';
      height: 1px;
      left: 0;
      position: absolute;
      bottom: -1px;
      width: 100%;
    }
  }
`;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background-color: white;
  opacity: 0.5;
  z-index: 1000;
`;

const StyledTabToContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  .${prefix}--tabs-trigger {
    background-color: ${COLORS.white};
  }
`;

const StyledTabContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const StyledTabChildren = styled.div`
  background: ${COLORS.superLightGray};
  padding-left: ${PADDING.horizontalWrapPadding};
  padding-right: ${PADDING.horizontalWrapPadding};
`;

const StyledActions = styled.div`
  display: flex;
  flex-flow: row nowrap;
  display: flex;
  align-items: center;
  position: absolute;
  padding-left: ${PADDING.horizontalWrapPadding};
  padding-right: 0;
  height: ${SIZES.navigationBarHeight};
  top: 0px;
  right: 0px;
  z-index: 2;
`;

const propTypes = {
  /** Array of props to pass through to the tabs */
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node,
      children: PropTypes.node,
    })
  ).isRequired,
  /** Array of props to pass through to the action buttons */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      kind: PropTypes.string,
      children: PropTypes.node,
      onClick: PropTypes.func,
    })
  ),
  /** If a tab isn't selected, should that tabs contents be removed from the DOM? */
  hidden: PropTypes.bool,
  /** listen to tab change if you want to trigger something on change, not fired on the initial render.  Sends the selected tab id */
  onSelectionChange: PropTypes.func,
  /** TEMP: component to render Hero within Nav Bar across all tab content, we think the tabs will move down over the table and different content will show for each */
  hero: PropTypes.node,
  /** workarea renders directly above tabs if passed */
  workArea: PropTypes.node,

  testId: PropTypes.string,
};

const defaultProps = {
  actions: [],
  /** by default I think we should hide any TabContent that's not selected */
  hidden: false,
  hero: null,
  onSelectionChange: null,
  workArea: null,
  testId: 'navigation-bar',
};

/**
 * This component is just wrapping up the Carbon Tabs, adding some optional action buttons at the right side.  And for now automatically rendering a page hero component across all tabs
 */
const NavigationBar = ({ tabs, hero, actions, onSelectionChange, workArea, testId, ...others }) => (
  <Fragment>
    {workArea || null}
    <StyledNavigationContainer data-testid={testId} hasActions={actions.length > 0}>
      {workArea ? <StyledOverlay /> : null}
      {hero}
      <StyledTabToContent>
        <Tabs
          data-testid={`${testId}-tabs`}
          {...others}
          onSelectionChange={(index) => onSelectionChange && onSelectionChange(tabs[index].id)}
        >
          <TabList aria-label={testId}>
            {tabs.map(({ children, id, label, ...other }) => (
              <Tab key={id} {...other}>
                {label}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabs.map(({ children }) => (
              <TabPanel>
                <StyledTabContent>
                  <StyledTabChildren>{children}</StyledTabChildren>
                </StyledTabContent>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </StyledTabToContent>
      {actions && actions.length > 0 ? (
        <StyledActions data-testid={`${testId}-actions`}>
          {actions.map(({ id, ...other }) => (
            <Button key={id} {...other} testId={`${testId}-button-${id}`} />
          ))}
        </StyledActions>
      ) : null}
    </StyledNavigationContainer>
  </Fragment>
);

NavigationBar.propTypes = propTypes;
NavigationBar.defaultProps = defaultProps;

export default NavigationBar;
