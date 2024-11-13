import React from 'react';
import { action } from '@storybook/addon-actions';
import { spacing05 } from '@carbon/layout';
import { styled } from 'styled-components';

import WizardModal from './WizardModal';

const StyledWizard = styled(WizardModal)`
  .WizardInline-custom-footer-content {
    padding: ${spacing05};
  }
`;

const commonWizardProps = {
  onSubmit: action('submit'),
  onClose: action('close'),
  onBack: action('onBack'),
};

export default {
  title: '1 - Watson IoT/Progress indicator/WizardModal',

  parameters: {
    component: WizardModal,
    docs: {
      inlineStories: false,
    },

    info: `
  Extends ComposedModal to add Carbon's ProgressIndicator and Wizard pages and local state.  Refer to the ComposedModal component for additional props that can be passed
  `,
  },
};

export const BasicWizardModal = () => (
  <WizardModal
    header={{
      label: 'Basic Wizard',
      title: 'Gimme 3 Steps',
    }}
    steps={[
      {
        label: 'step1',
        content: 'page 1',
        onValidate: action('validateStep1'),
      },
      {
        label: 'step2',
        content: 'page 2',
        onValidate: action('validateStep2'),
      },
      {
        label: 'step3',
        content: 'page 3',
        onValidate: action('validateStep3'),
      },
    ]}
    isClickable
    {...commonWizardProps}
  />
);

BasicWizardModal.storyName = 'basic wizard modal';

export const CustomFooter = () => (
  <StyledWizard
    header={{
      label: 'Wizard With Custom Footer ',
      title: 'Gimme 3 Steps',
    }}
    steps={[
      {
        label: 'step1',
        content: 'page 1',
        onValidate: action('validateStep1'),
      },
      {
        label: 'step2',
        content: 'page 2',
        onValidate: action('validateStep2'),
      },
      {
        label: 'step3',
        content: 'page 3',
        onValidate: action('validateStep3'),
      },
    ]}
    footer={{
      leftContent: <p>Custom content</p>,
      previousButtonLabel: 'I18N Previous',
      nextButtonLabel: 'I18N Next',
      submitButtonLabel: 'I18N Submit',
      cancelButtonLabel: 'I18N Cancel',
    }}
    {...commonWizardProps}
  />
);

CustomFooter.storyName = 'custom footer';

export const SendingData = () => (
  <WizardModal
    header={{
      label: 'Basic Wizard',
      title: 'Gimme 3 Steps',
    }}
    steps={[
      {
        label: 'step1',
        content: 'page 1',
        onValidate: action('validateStep1'),
      },
      {
        label: 'step2',
        content: 'page 2',
        onValidate: action('validateStep2'),
      },
      {
        label: 'step3',
        content: 'page 3',
        onValidate: action('validateStep3'),
      },
    ]}
    {...commonWizardProps}
    currentStepIndex={2}
    sendingData
  />
);

SendingData.storyName = 'sending data';
