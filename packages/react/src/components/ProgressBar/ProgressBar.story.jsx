import React from 'react';
import { text, number, boolean } from '@storybook/addon-knobs';
import { Bee, WarningFilled } from '@carbon/react/icons';
import { green20, green30, green40, green50, red60, yellow30, yellow50 } from '@carbon/colors';

// import ProgressBarREADME from './ProgressBar.mdx'; //carbon 11
import ProgressBar from './ProgressBar';

export default {
  title: '1 - Watson IoT/Progress bar',

  parameters: {
    component: ProgressBar,
    // docs: {
    //   page: ProgressBarREADME,
    // }, //carbon 11
  },
};

const props = ({ light } = {}) => ({
  label: text('Label text (label)', 'Progress bar label'),
  helperText: text('Helper text (helperText)', 'Optional helper text'),
  hideLabel: boolean('Hide the label (hideLabel)', false),
  inline: boolean('Show the inline variant without label or icons (inline)', false),
  value: number('Current value (value)', 75),
  valueUnit: text('The unit displayed with the text value above the bar (valueUnit)', '%'),
  max: number('Maximum value (max)', 100),
  light: boolean('Turn the progress bar white--for use on a gray background (light)', light),
});

const ProgressBarContainer = ({ maxWidth = 300, children, light = false }) => (
  <div style={{ maxWidth, backgroundColor: !light ? '#FFF' : 'transparent', padding: '1rem' }}>
    {children}
  </div>
);

export const Default = () => {
  return (
    <ProgressBarContainer>
      <ProgressBar {...props()} />
    </ProgressBarContainer>
  );
};

Default.storyName = 'default';

export const WithLight = () => {
  return (
    <ProgressBarContainer light>
      <ProgressBar {...props({ light: true })} />
    </ProgressBarContainer>
  );
};

WithLight.storyName = 'with light';

export const WithIcon = () => {
  return (
    <ProgressBarContainer>
      <ProgressBar {...props()} renderIcon={WarningFilled} />
    </ProgressBarContainer>
  );
};

WithIcon.storyName = 'with icon';

export const WithThresholds = () => {
  return (
    <ProgressBarContainer>
      <ProgressBar
        {...props()}
        label="Mon, Oct 5"
        valueUnit="%"
        thresholds={[
          {
            comparison: '<',
            value: 80,
            color: {
              fill: yellow30,
              stroke: yellow50,
            },
          },
          {
            comparison: (value) => value >= 80 && value < 90,
            color: {
              fill: green20,
              stroke: green50,
            },
          },
          {
            comparison: (value) => value >= 90 && value < 95,
            color: {
              fill: green30,
              stroke: green50,
            },
          },
          {
            comparison: (value) => value >= 95 && value <= 100,
            color: {
              fill: green40,
              stroke: green50,
            },
            icon: (props) => <Bee {...props} />,
          },
          {
            comparison: '>',
            value: 100,
            color: red60,
            icon: WarningFilled,
          },
        ]}
      />
    </ProgressBarContainer>
  );
};

WithThresholds.storyName = 'with thresholds';

export const WithRenderIconByName = () => {
  return (
    <ProgressBarContainer>
      <ProgressBar
        {...props()}
        label="Mon, Oct 5"
        valueUnit="%"
        renderIconByName={(name, props) => {
          switch (name) {
            case 'warning':
              return <WarningFilled {...props} fill="white" />;
            case 'bee':
              return <Bee {...props} stroke="purple" />;
            default:
              return null;
          }
        }}
        thresholds={[
          {
            comparison: '<',
            value: 80,
            color: {
              fill: yellow30,
              stroke: yellow50,
            },
            icon: 'bee',
          },
          {
            comparison: (value) => value >= 80 && value < 90,
            color: {
              fill: green20,
              stroke: green50,
            },
            icon: 'warning',
          },
          {
            comparison: (value) => value >= 90 && value < 95,
            color: {
              fill: green30,
              stroke: green50,
            },
          },
          {
            comparison: (value) => value >= 95 && value <= 100,
            color: {
              fill: green40,
              stroke: green50,
            },
            icon: (props) => <Bee {...props} />,
          },
          {
            comparison: '>',
            value: 100,
            color: red60,
            icon: WarningFilled,
          },
        ]}
      />
    </ProgressBarContainer>
  );
};

WithRenderIconByName.storyName = 'with renderIconByName';
