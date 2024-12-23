import React from 'react';
import { mount } from '@cypress/react';

import dayjs from '../../utils/dayjs';
import { settings } from '../../constants/Settings';

import DateTimePicker, { INTERVAL_VALUES, PICKER_KINDS } from './DateTimePicker';

const { iotPrefix, prefix } = settings;

describe('DateTimePicker', () => {
  beforeEach(() => {
    cy.viewport(1680, 900);
  });
  it('should pick a new absolute ranges', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2021, 7, 1, 12, 34, 0),
            end: new Date(2021, 7, 6, 10, 49, 0),
          },
        }}
      />
    );

    cy.findByText('08/01/2021 12:34 to 08/06/2021 10:49').should('be.visible').click();

    cy.findByText('Custom range').should('be.visible');
    cy.findByText('August').should('be.visible');
    cy.findByLabelText('Year').should('have.value', '2021');
    cy.findByLabelText('August 8, 2021').click();
    cy.findByLabelText('August 8, 2021').should('have.class', 'selected');
    cy.findByLabelText('August 6, 2021').should('have.class', 'selected');
    cy.findByText('Apply')
      .click()
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'ABSOLUTE',
          timeRangeValue: {
            end: Cypress.sinon.match.any,
            endDate: '08/08/2021',
            endTime: '10:49',
            start: Cypress.sinon.match.any,
            startDate: '08/06/2021',
            startTime: '12:34',
          },
        });
      });
  });

  it('should disable apply button when absolute TimePickerSpinner inputs are invalid ', () => {
    const { i18n } = DateTimePicker.defaultProps;
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2021, 7, 1, 12, 34, 0),
            end: new Date(2021, 7, 6, 10, 49, 0),
          },
        }}
      />
    );

    cy.findByText('08/01/2021 12:34 to 08/06/2021 10:49').should('be.visible').click();

    cy.findByLabelText(i18n.startTimeLabel).type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}91:35'
    );
    cy.findByText(i18n.applyBtnLabel).should('be.disabled');

    cy.findByLabelText(i18n.startTimeLabel).type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}11:35'
    );
    cy.findByText(i18n.applyBtnLabel).should('not.be.disabled');

    cy.findByLabelText(i18n.endTimeLabel).type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}11:61'
    );
    cy.findByText(i18n.applyBtnLabel).should('be.disabled');

    // set time to 11:00
    cy.findByLabelText(i18n.endTimeLabel).type('{backspace}{backspace}00');
    cy.findByText(i18n.applyBtnLabel).should('not.be.disabled');
  });

  it('should disable apply button when relative TimePickerSpinner input is invalid ', () => {
    const { i18n } = DateTimePicker.defaultProps;
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(<DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" hasTimeInput />);

    cy.findAllByLabelText('Calendar').eq(0).click();
    cy.findByText('Custom Range').click();

    cy.findByPlaceholderText('hh:mm').type('91:35');

    cy.findByText(i18n.applyBtnLabel).should('be.disabled');

    cy.findByPlaceholderText('hh:mm').type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}11:35'
    );
    cy.findByText(i18n.applyBtnLabel).should('not.be.disabled');
  });

  it('should not parse when relativeToWhen is empty', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            relativeToWhen: '',
          },
        }}
      />
    );

    cy.findAllByLabelText('Calendar').eq(0).click();
    cy.findByPlaceholderText('hh:mm').should('be.visible').type('12:04');
    cy.findByRole('button', { name: 'Apply' })
      .click()
      .should(() => {
        expect(onApply).to.have.been.calledWith({
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            relativeToWhen: '',
            relativeToTime: '12:04',
          },
        });
      });
    cy.findByTestId('date-time-picker__field').should('contain.text', '');
  });

  it('should parse time after 5 characters have been typed', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            relativeToWhen: INTERVAL_VALUES.MINUTES,
            relativeToTime: '',
          },
        }}
      />
    );

    cy.findAllByLabelText('Calendar').eq(0).click();
    cy.findByLabelText('Increment number').click();
    cy.findByPlaceholderText('hh:mm').should('be.visible').type('12:04');
    cy.findByRole('button', { name: 'Apply' })
      .click()
      .should(() => {
        expect(onApply).to.have.been.calledWith({
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            lastNumber: 1,
            relativeToWhen: INTERVAL_VALUES.MINUTES,
            relativeToTime: '12:04',
            end: Cypress.sinon.match.any,
            start: Cypress.sinon.match.any,
          },
        });
      });
  });

  it('should be able to navigate by keyboard', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2021, 7, 1, 12, 34, 0),
            end: new Date(2021, 7, 6, 10, 49, 0),
          },
        }}
      />
    );

    cy.findByText('08/01/2021 12:34 to 08/06/2021 10:49').should('be.visible');
    cy.get('body').realPress('Tab');
    cy.findByRole('dialog').should('be.visible');
    cy.findByRole('button', { name: /08\/01\/2021 12:34 to 08\/06\/2021 10:49/ })
      .should('be.focused')
      .type('{enter}');
    cy.findByText('Custom range').should('be.visible');
    cy.findByText('August').should('be.visible');
    cy.findByLabelText('Year').should('have.value', '2021');
    // this _should_ tab from the input to the absolute label, but unfortunately it doesn't in the test
    // because the `tab()` call is still experimental, so manually focus it instead to mimic the
    // behavior in the browser.
    // cy.focused().realPress('Tab')
    cy.findByLabelText('Absolute').focus().should('be.focused').type('{leftarrow}');
    cy.findByText('Relative to').should('be.visible');
    cy.findByLabelText('Relative').focus().should('be.focused').type('{rightarrow}');
    cy.findByLabelText('Absolute').should('be.focused');
    cy.findByText('Custom range').should('be.visible');
    cy.findByLabelText('Absolute').should('be.focused').realPress('Tab');
    cy.focused().invoke('attr', 'id').should('eq', 'picker-test-date-picker-input-start');
    cy.focused().type('{downarrow}{downarrow}{enter}');
    cy.findByLabelText('August 6, 2021').should('have.class', 'selected');
    cy.findByLabelText('August 13, 2021').should('have.class', 'selected');
    cy.focused().realPress('Tab').realPress('Tab');
    cy.findByLabelText('Start time')
      .should('be.focused')
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}11:35');
    cy.focused().realPress('Tab');
    cy.findAllByTitle('Increment hours').eq(0).should('be.focused');
    cy.focused().realPress('Tab');
    cy.findAllByTitle('Decrement hours').eq(0).should('be.focused');
    cy.focused().realPress('Tab');
    cy.findByLabelText('End time')
      .should('be.focused')
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}12:39');
    cy.focused().realPress('Tab');
    cy.findAllByTitle('Increment hours').eq(1).should('be.focused');
    cy.focused().realPress('Tab');
    cy.findAllByTitle('Decrement hours').eq(1).should('be.focused');
    cy.focused().realPress('Tab');
    cy.focused().should('contain.text', 'Back');
    cy.focused().realPress('Tab');
    cy.focused()
      .should('contain.text', 'Apply')
      .type('{enter}')
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'ABSOLUTE',
          timeRangeValue: {
            end: Cypress.sinon.match.any,
            endDate: '08/13/2021',
            endTime: '12:39',
            start: Cypress.sinon.match.any,
            startDate: '08/06/2021',
            startTime: '11:35',
          },
        });
      });
  });

  it('should be able to navigate the preset list with a keyboard', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(<DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" />);

    cy.findAllByRole('button', { name: 'Last 30 minutes' }).eq(0).click();
    cy.findByText('Custom Range').should('be.visible');
    // add the focus() call because cypress loses it too easily
    // and the type command will call click to re-gain focus which
    // actually causes the picker to close. :-\
    cy.findAllByRole('button', { name: /Last 30 minutes/ })
      .focus()
      .type('{downarrow}', { force: true });
    cy.findByText('Custom Range').should('be.focused');
    cy.focused().type('{downarrow}');
    cy.findAllByText('Last 30 minutes').eq(1).should('be.focused');
    cy.focused().type('{downarrow}');
    cy.findByText('Last 1 hour').should('be.focused');
    cy.focused().type('{downarrow}');
    cy.findByText('Last 6 hours').should('be.focused');
    cy.focused().type('{downarrow}');
    cy.findByText('Last 12 hours').should('be.focused');
    cy.focused().type('{downarrow}');
    cy.findByText('Last 24 hours').should('be.focused');
    cy.focused().type('{downarrow}');
    cy.findByText('Custom Range').should('be.focused');
    cy.focused().type('{uparrow}');
    cy.findByText('Last 24 hours').should('be.focused');
    cy.focused().type('{uparrow}');
    cy.findByText('Last 12 hours').should('be.focused');
    cy.focused().type('{leftarrow}');
    cy.findByText('Last 12 hours').should('be.focused');
    cy.focused().type('{rightarrow}');
    cy.findByText('Last 12 hours').should('be.focused');
    cy.focused().type('{uparrow}');
    cy.findByText('Last 6 hours')
      .should('be.focused')
      .type('{enter}')
      .should('have.class', `${iotPrefix}--date-time-picker__listitem--preset-selected`);
    // tab to the apply button
    cy.focused().realPress('Tab').realPress('Tab').realPress('Tab').realPress('Tab');
    cy.focused()
      .type('{enter}')
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'PRESET',
          timeRangeValue: {
            id: 'item-03',
            label: 'Last 6 hours',
            offset: 360,
          },
        });
      });
  });

  it('should close when `Escape` is pressed', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(<DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" />);

    cy.get('body').realPress('Tab');
    cy.focused().type('{enter}');
    cy.findByText('Last 12 hours').should('be.visible');
    cy.focused().type('{esc}');
    cy.findByText('Last 12 hours').should('not.be.visible');
  });

  it("should do nothing when `ArrowDown` is pressed if it isn't open.", () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(<DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" />);

    cy.get('body').realPress('Tab');
    cy.focused().type('{downarrow}');
    cy.findByText('Last 12 hours').should('not.be.visible');
  });

  it("should do nothing when `ArrowDown` is pressed if it's not a custom range", () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        defaultValue={{
          timeRangeKind: PICKER_KINDS.RELATIVE,
          timeRangeValue: {
            lastNumber: 20,
            lastInterval: 'MINUTES',
            relativeToWhen: 'TODAY',
            relativeToTime: '13:30',
          },
        }}
      />
    );

    cy.get('body').realPress('Tab');
    cy.focused().click().type('{downarrow}');
    cy.findAllByRole('button').eq(0).should('be.focused');
  });

  it('should pick ranges across months', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    // the calendar in Flatpickr does not respect MockDate or cy.clock, so we must resort to using
    // the current date, but picking specific days to test and format the dynamic output as expected
    const now = dayjs();
    const thisMonthLabel = now.format(`MMMM [12], YYYY`);
    const lastMonth = now.subtract(1, 'month');
    const lastMonthLabel = lastMonth.format(`MMMM [20], YYYY`);
    mount(
      <DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" hasTimeInput={false} />
    );

    cy.findByRole('button', { name: 'Last 30 minutes' }).should('be.visible').click();
    cy.findByText('Custom Range').should('be.visible').click();
    cy.findByText('Absolute').should('be.visible').click();
    cy.get(`.flatpickr-prev-month`).click();
    cy.findByLabelText(lastMonthLabel).click();
    cy.findByLabelText(lastMonthLabel).should('have.class', 'selected');
    cy.get(`.flatpickr-next-month`).click();
    cy.findByLabelText(thisMonthLabel).click();
    cy.findByLabelText(thisMonthLabel).should('have.class', 'selected');
    cy.findByText('Apply')
      .click()
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'ABSOLUTE',
          timeRangeValue: {
            end: Cypress.sinon.match.any,
            endDate: now.format(`MM/[12]/YYYY`),
            endTime: null,
            start: Cypress.sinon.match.any,
            startDate: lastMonth.format(`MM/[20]/YYYY`),
            startTime: null,
          },
        });
      });
  });

  it('should close on click outside if relative date was selected', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(<DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" />);

    cy.findByRole('button', { name: 'Last 30 minutes' }).click();
    cy.findByText('Custom Range').should('be.visible').click();
    cy.findByTitle('Increment number').should('be.visible').click();
    cy.get('body').click();

    cy.findByText('Custom range').should('not.exist');
    cy.findAllByRole('button').eq(0).contains('Last 30 minutes');
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should close on click outside if absolute date was selected', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(<DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" />);

    cy.findByRole('button', { name: 'Last 30 minutes' }).click();
    cy.findByText('Custom Range').should('be.visible').click();
    cy.findByText('Absolute').should('be.visible').click();
    cy.get('body').click();

    cy.findByText('Custom range').should('not.exist');
    cy.findAllByRole('button').eq(0).contains('Last 30 minutes');
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should close dropdown on field click', () => {
    mount(<DateTimePicker onApply={cy.stub()} onCancel={cy.stub()} id="picker-test" />);
    cy.findByLabelText('Calendar').click();
    cy.findByRole('listbox').should('be.visible');
    // unsaved changes
    cy.findByText('Last 1 hour').click();
    // close dropdown on clicking the field icon
    cy.findByLabelText('Calendar').click();
    cy.findByRole('listbox').should('not.exist');
    cy.findAllByRole('button').eq(0).contains('Last 30 minutes');
  });

  it('should reset to default value from props when clicked outside', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            start: new Date(2021, 7, 1, 12, 34, 0),
            end: new Date(2021, 7, 6, 10, 49, 0),
          },
        }}
      />
    );

    cy.findByText('08/01/2021 12:34 to 08/06/2021 10:49').click();
    cy.findByText('Relative').should('be.visible').click();
    cy.get('body').click();

    cy.findByRole('button').contains('08/01/2021 12:34 to 08/06/2021 10:49');
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should close appropriate dropdown on click outside', () => {
    const testIdOne = 'picker-test-1';
    const testIdTwo = 'picker-test-2';
    mount(
      <div
        style={{
          display: 'flex',
        }}
      >
        <DateTimePicker testId={testIdOne} hasTimeInput />
        <DateTimePicker testId={testIdTwo} hasTimeInput />
      </div>
    );

    cy.findByTestId(`${testIdOne}__field`).click();
    cy.findAllByRole('listbox').should('have.length', 1);

    cy.findByTestId(`${testIdTwo}__field`).click();
    cy.findAllByRole('listbox').should('have.length', 1);
  });

  it('should close tooltip when dropdown is closed by click outside', () => {
    mount(<DateTimePicker onApply={cy.stub()} onCancel={cy.stub()} id="picker-test" />);
    cy.findByRole('button', { name: 'Last 30 minutes' }).as('dropdownTrigger');

    cy.get('@dropdownTrigger').trigger('mouseover');
    cy.findByRole('dialog').should('have.class', `${prefix}--tooltip__content`).and('be.visible');
    cy.get('@dropdownTrigger').trigger('mouseout');

    cy.get('@dropdownTrigger').click();
    cy.get('body').click();

    cy.findByRole('dialog').should('not.exist');
  });

  it('should close tooltip on Apply click', () => {
    mount(<DateTimePicker onApply={cy.stub()} onCancel={cy.stub()} id="picker-test" />);

    cy.findByRole('dialog').should('not.exist');
    cy.findByRole('button', { name: 'Last 30 minutes' }).click();
    cy.findByRole('button', { name: 'Apply' }).click();

    cy.findByRole('dialog').should('not.exist');
  });

  describe('should reset to last saved value if closed by click outside', () => {
    it('with default relative value', () => {
      mount(
        <DateTimePicker
          onApply={cy.stub()}
          onCancel={cy.stub()}
          id="picker-test"
          hasTimeInput
          defaultValue={{
            timeRangeKind: PICKER_KINDS.RELATIVE,
            timeRangeValue: {
              relativeToWhen: INTERVAL_VALUES.MINUTES,
              relativeToTime: '',
            },
          }}
        />
      );

      // Select some date in relative range
      cy.findAllByLabelText('Calendar').eq(0).click();
      cy.findByPlaceholderText('hh:mm').type('13:30');
      cy.findByText('Apply').click();
      // Unsaved changes
      cy.findAllByLabelText('Calendar').eq(0).click();
      cy.findByText('Absolute').should('be.visible').click();
      cy.findAllByText('25').click({ multiple: true, force: true });
      cy.findAllByText('26').click({ multiple: true, force: true });
      cy.findByLabelText('Start time').type('11:30');
      cy.get('body').click();
      // Preserves only saved changes
      cy.findByRole('button', { name: /13:30/i }).should('be.visible');
    });

    it('with default absolute value', () => {
      mount(
        <DateTimePicker
          onApply={cy.stub()}
          onCancel={cy.stub()}
          id="picker-test"
          hasTimeInput
          defaultValue={{
            timeRangeKind: PICKER_KINDS.ABSOLUTE,
            timeRangeValue: {
              start: new Date(2021, 7, 1, 12, 34, 0),
              end: new Date(2021, 7, 6, 10, 49, 0),
            },
          }}
        />
      );
      // Select some date in absolute range
      cy.findByTestId('date-time-picker__field').click();
      cy.findByLabelText('Start time').focus().clear();
      cy.findByLabelText('Start time').type('11:11');
      cy.findByText('Apply').click();
      // Unsaved changes in relative range
      cy.findByTestId('date-time-picker__field').click();
      cy.findByText('Relative').should('be.visible').click();
      cy.findByPlaceholderText('hh:mm').type('13:30');
      cy.get('body').click();
      // Preserves only saved changes
      cy.findByTestId('date-time-picker__field').should(
        'have.text',
        '08/01/2021 11:11 to 08/06/2021 10:49'
      );
    });
  });
});
