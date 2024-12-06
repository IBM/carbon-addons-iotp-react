import { mount } from 'enzyme';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { Loading } from '@carbon/react';

import { settings } from '../../constants/Settings';

import WizardModal from './WizardModal';

const { prefix, iotPrefix } = settings;

const commonWizardProps = {
  isClickable: true,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  header: {
    title: 'Test Title',
    label: 'test label',
    helptext: 'test help text.',
  },
};

describe('WizardModal', () => {
  it('should be selectable by testId', () => {
    const mockValidateStepFunction = jest.fn();
    render(
      <WizardModal
        {...commonWizardProps}
        steps={[
          {
            label: 'step1',
            content: 'page 1',
            onValidate: mockValidateStepFunction,
          },
          {
            label: 'step2',
            content: 'page 2',
            onValidate: mockValidateStepFunction,
          },
          {
            label: 'step3',
            content: 'page 3',
            onValidate: mockValidateStepFunction,
          },
        ]}
        testId="wizard_modal"
      />
    );

    expect(screen.getByTestId('ComposedModal')).toBeDefined();
    expect(screen.getByTestId('wizard_modal-content')).toBeDefined();
    expect(screen.getByTestId(`${iotPrefix}--progress-indicator-testid`)).toBeDefined();
    expect(screen.getByTestId('wizard_modal-footer')).toBeDefined();
  });
  it('handleNext', () => {
    const mockValidateStepFunction = jest.fn();
    const wrapper = mount(
      <WizardModal
        {...commonWizardProps}
        steps={[
          {
            label: 'step1',
            content: 'page 1',
            onValidate: mockValidateStepFunction,
          },
          {
            label: 'step2',
            content: 'page 2',
            onValidate: mockValidateStepFunction,
          },
          {
            label: 'step3',
            content: 'page 3',
            onValidate: mockValidateStepFunction,
          },
        ]}
      />
    );
    // trigger next
    wrapper.instance().handleNext();
    expect(wrapper.state('step')).toEqual(1);
    expect(mockValidateStepFunction).toHaveBeenCalled();

    mockValidateStepFunction.mockClear();

    // trigger previous
    wrapper.instance().handlePrevious();
    expect(wrapper.state('step')).toEqual(0);
    expect(mockValidateStepFunction).not.toHaveBeenCalled();
  });
  it('validation', () => {
    const wrapper = mount(
      <WizardModal
        {...commonWizardProps}
        steps={[
          { label: 'step1', content: 'page 1' },
          { label: 'step2', content: 'page 2', onValidate: () => false },
          { label: 'step3', content: 'page 3' },
        ]}
      />
    );
    // trigger next
    wrapper.instance().handleNext();
    // step should advance without validation function
    expect(wrapper.state('step')).toEqual(1);

    // trigger next
    wrapper.instance().handleNext();
    // step should NOT advance if validation returns false
    expect(wrapper.state('step')).toEqual(1);

    // trigger next by clicking
    wrapper.instance().handleClick(2);
    // step should NOT advance if validation returns false
    expect(wrapper.state('step')).toEqual(1);

    // trigger next by clicking
    wrapper.instance().handleClick(0);
    // step be allowed to go backwards
    expect(wrapper.state('step')).toEqual(0);
  });
  it('submit', () => {
    const mockValidateStepFunction = jest.fn();
    const wrapper = mount(
      <WizardModal
        {...commonWizardProps}
        steps={[
          { label: 'step1', content: 'page 1' },
          { label: 'step2', content: 'page 2' },
          {
            label: 'step3',
            content: 'page 3',
            onValidate: mockValidateStepFunction,
          },
        ]}
      />
    );
    // Advance to last panel should have a submit button
    wrapper.setState({ step: 2 });

    // Close
    expect(wrapper.find(`.${prefix}--modal-close`)).toHaveLength(1);

    // Previous
    expect(wrapper.find(`.${prefix}--btn--secondary`)).toHaveLength(1);

    // Submit button
    expect(wrapper.find(`.${prefix}--btn--primary`)).toHaveLength(1);

    // Submit button should validate the last page
    wrapper.instance().handleSubmit();
    expect(mockValidateStepFunction).toHaveBeenCalled();
  });
  it('footer and buttons', () => {
    const wrapper = mount(
      <WizardModal
        {...commonWizardProps}
        steps={[
          { label: 'step1', content: 'page 1' },
          { label: 'step2', content: 'page 2' },
          { label: 'step3', content: 'page 3' },
        ]}
        footer={{ leftContent: 'Hi there' }}
      />
    );
    // Close
    expect(wrapper.find(`.${prefix}--modal-close`)).toHaveLength(1);

    // Cancel
    expect(wrapper.find(`.${prefix}--btn--secondary`)).toHaveLength(1);

    // Submit button
    expect(wrapper.find(`.${prefix}--btn--primary`)).toHaveLength(1);

    // Close Next Previous and Cancel
    wrapper.setState({ step: 1 });
    // Close
    expect(wrapper.find(`.${prefix}--modal-close`)).toHaveLength(1);

    // Previous
    expect(wrapper.find(`.${prefix}--btn--secondary`)).toHaveLength(1);

    // Submit button
    expect(wrapper.find(`.${prefix}--btn--primary`)).toHaveLength(1);
    // Close Previous Submit and Cancel
    // Close
    expect(wrapper.find(`.${prefix}--modal-close`)).toHaveLength(1);

    // Previous
    expect(wrapper.find(`.${prefix}--btn--secondary`)).toHaveLength(1);

    // Submit button
    expect(wrapper.find(`.${prefix}--btn--primary`)).toHaveLength(1);
    wrapper.setState({ step: 2 });
  });
  it('sendingData', () => {
    const wrapper = mount(
      <WizardModal
        {...commonWizardProps}
        steps={[
          { label: 'step1', content: 'page 1' },
          { label: 'step2', content: 'page 2' },
          { label: 'step3', content: 'page 3' },
        ]}
        sendingData
      />
    );

    // Should show Loading button
    wrapper.setState({ step: 2 });
    expect(wrapper.find(Loading)).toHaveLength(1);
  });
  it('clicking on previous button or previous step will call onBack', () => {
    const callBack = jest.fn();

    const getStep = (step) => screen.getByTestId(`${iotPrefix}--progress-step-button-main-${step}`);

    render(
      <WizardModal
        {...commonWizardProps}
        onBack={callBack}
        steps={[
          { label: 'step1', content: 'page 1' },
          { label: 'step2', content: 'page 2' },
          { label: 'step3', content: 'page 3' },
        ]}
      />
    );

    // Go to second step
    getStep('step2').click();

    // clicking previous step in progressIndicator will call callBack
    userEvent.click(getStep('step1'));
    expect(callBack).toHaveBeenCalled();
    expect(callBack.mock.calls[0][0]).toBe(0);

    // Go to third step
    getStep('step3').click();

    // clicking on previous button will trigger onBack
    userEvent.click(screen.getByText('Previous'));
    expect(callBack).toHaveBeenCalledTimes(2);
    expect(callBack.mock.calls[1][0]).toBe(1);
  });
  it('clicking on progressIndicator steps will render related content', () => {
    render(
      <WizardModal
        {...commonWizardProps}
        steps={[
          { label: 'step1', content: 'page 1' },
          { label: 'step2', content: 'page 2', onValidate: () => false },
          { label: 'step3', content: 'page 3' },
        ]}
      />
    );

    // analogue to ProgressIndicator test we check if clicking step will show related content
    const [beforeClick1] = screen.getAllByTitle('step1')[0].children;

    screen.getByTestId(`${iotPrefix}--progress-step-button-main-step2`).click();

    // content should be page2
    expect(screen.getAllByTitle('step1')[0].children[0]).not.toContain(beforeClick1);
    expect(screen.getByText('page 2')).toBeDefined();

    // clicking on step3 should not progress the modal
    const [beforeClick2] = screen.getAllByTitle('step2')[0].children;
    screen.getByTestId(`${iotPrefix}--progress-step-button-main-step3`).click();

    expect(screen.getAllByTitle('step2')[0].children[0]).toEqual(beforeClick2);
    expect(screen.getByText('page 2')).toBeDefined();

    // clicking on page 1 should go back to step 1
    screen.getByTestId(`${iotPrefix}--progress-step-button-main-step1`).click();
    expect(screen.getAllByTitle('step1')[0].children[0]).toEqual(beforeClick1);
    expect(screen.getByText('page 1')).toBeDefined();
  });
});
