import React from 'react';
import { boolean, number, object, select, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { SettingsAdjust, ShareKnowledge } from '@carbon/react/icons';

import Button from '../Button/Button';

import FlyoutMenu, { FlyoutMenuDirection, FlyoutMenuButtonSize } from './FlyoutMenu';

const CustomFooter = ({ setIsOpen, isOpen }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 64,
        justifyContent: 'space-between',
      }}
    >
      I&apos;m a custom footer! &nbsp;
      <Button onClick={() => setIsOpen(!isOpen)}>Confirm</Button>
    </div>
  );
};

export default {
  title: '1 - Watson IoT/Menus/FlyoutMenu',
};

export const DefaultExample = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <FlyoutMenu
      buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
      renderIcon={ShareKnowledge}
      disabled={boolean('Disabled', false)}
      buttonProps={object('buttonProps', {
        tooltipPosition: 'top',
      })}
      hideTooltip={boolean('Hide tooltip', true)}
      iconDescription={text('iconDescription', 'Helpful description')}
      passive={boolean('Passive Flyout', false)}
      triggerId="test-trigger-id-2"
      light={boolean('Light Mode', false)}
      menuOffset={{
        top: number('Menu Offset top', 0),
        left: number('Menu offset left', 0),
      }}
      onCancel={action('On Cancel Clicked')}
      onApply={action('On Apply Clicked')}
      direction={select('Flyout direction', FlyoutMenuDirection, FlyoutMenuDirection.BottomStart)}
    >
      This is some flyout content
    </FlyoutMenu>
  </div>
);

export const LargeFlyoutExample = () => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <FlyoutMenu
      buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
      renderIcon={ShareKnowledge}
      disabled={boolean('Disabled', false)}
      buttonProps={object('buttonProps', {
        tooltipPosition: 'top',
      })}
      hideTooltip={boolean('Hide tooltip', true)}
      iconDescription={text('iconDescription', 'Helpful description')}
      passive={boolean('Passive Flyout', false)}
      triggerId="test-trigger-id-2"
      light={boolean('Light Mode', true)}
      onCancel={action('On Cancel Clicked')}
      onApply={action('On Apply Clicked')}
    >
      <div>
        <h2>This is a header</h2>

        <p style={{ width: 300 }}>
          Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta
          felis euismod semper.
        </p>

        <div style={{ backgroundColor: '#333333', height: 300, width: 800 }} />
      </div>
    </FlyoutMenu>
  </div>
);

export const CustomFooterExample = () => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <FlyoutMenu
      buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
      renderIcon={SettingsAdjust}
      disabled={boolean('Disabled', false)}
      buttonProps={object('buttonProps', {
        tooltipPosition: 'top',
      })}
      hideTooltip={boolean('Hide tooltip', true)}
      iconDescription={text('iconDescription', 'Helpful description')}
      passive={false}
      customFooter={CustomFooter}
      triggerId="test-trigger-id-2"
      light={boolean('Light Mode', true)}
      onCancel={action('On Cancel Clicked')}
      onApply={action('On Apply Clicked')}
      defaultOpen
      direction={FlyoutMenuDirection.BottomStart}
    >
      <div>
        <h2>This is a header</h2>

        <p style={{ width: 300 }}>
          Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta
          felis euismod semper.
        </p>
      </div>
    </FlyoutMenu>
  </div>
);

export const AutoPositioningExample = () => {
  return (
    <div
      style={{
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
        height: 'calc(100vh - 4rem)',
      }}
    >
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            customFooter={CustomFooter}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.RightStart}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            <div>
              <h2>This is a header</h2>

              <p style={{ width: 300 }}>
                Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula
                porta felis euismod semper.
              </p>
            </div>
          </FlyoutMenu>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.BottomStart}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            This is some flyout content
          </FlyoutMenu>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.LeftStart}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            This is some flyout content
          </FlyoutMenu>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.RightEnd}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            This is some flyout content
          </FlyoutMenu>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.TopStart}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            This is some flyout content
          </FlyoutMenu>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.LeftEnd}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            This is some flyout content
          </FlyoutMenu>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            flex: 1,
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.TopStart}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            This is some flyout content
          </FlyoutMenu>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.TopStart}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            This is some flyout content
          </FlyoutMenu>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <FlyoutMenu
            buttonSize={select('Button Size', FlyoutMenuButtonSize, FlyoutMenuButtonSize.Default)}
            renderIcon={ShareKnowledge}
            disabled={boolean('Disabled', false)}
            buttonProps={object('buttonProps', {
              tooltipPosition: 'top',
            })}
            hideTooltip={boolean('Hide tooltip', true)}
            iconDescription={text('iconDescription', 'Helpful description')}
            passive={boolean('Passive Flyout', false)}
            triggerId="test-trigger-id-2"
            light={boolean('Light Mode', false)}
            menuOffset={{
              top: number('Menu Offset top', 0),
              left: number('Menu offset left', 0),
            }}
            onCancel={action('On Cancel Clicked')}
            onApply={action('On Apply Clicked')}
            direction={FlyoutMenuDirection.TopEnd}
            useAutoPositioning={boolean('Use Auto Position', true)}
          >
            This is some flyout content
          </FlyoutMenu>
        </div>
      </div>
    </div>
  );
};

AutoPositioningExample.storyName = 'autopositioning example';
