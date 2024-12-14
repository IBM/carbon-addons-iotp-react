import React from 'react';
import { mount } from '@cypress/react';
import { onlyOn } from '@cypress/skip-test';
import MockDate from 'mockdate';

import { settings } from '../../constants/Settings';
import dayjs from '../../utils/dayjs';
import { INTERVAL_VALUES, PICKER_KINDS } from '../../constants/DateConstants';

import DateTimePicker from './DateTimePickerV2';

const { iotPrefix } = settings;

describe('DateTimePickerV2', () => {
  const getRect = ($el) => $el[0].getBoundingClientRect();

  beforeEach(() => {
    cy.viewport(1680, 900);
  });

  it('should clsoe the flyout when scrolling parent to bottom', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <div style={{ backgroundColor: 'blue' }}>
        <div
          id="parent"
          style={{
            height: '20rem',
            paddingTop: '10rem',
            paddingBottom: '1000rem',
            paddingLeft: '1rem',
            width: 300,
            backgroundColor: 'red',
            overflow: 'scroll',
          }}
        >
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
        </div>
      </div>
    );

    cy.findAllByLabelText('Calendar').eq(0).click();

    let previousDateTimeInputTop;
    cy.get('#picker-test-iot--date-time-pickerv2__wrapper')
      .then(getRect)
      .then((rect) => {
        previousDateTimeInputTop = rect.top;
      });

    let previousFlyoutMenuTop;
    cy.get('#flyout-tooltip')
      .then(getRect)
      .then((rect) => {
        previousFlyoutMenuTop = rect.top;
      });

    expect(previousFlyoutMenuTop).equal(previousDateTimeInputTop);

    cy.get('#parent').scrollTo('top', { duration: 1000 });
    cy.get('#flyout-tooltip').should('not.exist');
  });

  it('should close the flyout when scrolling parent to the right', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <div style={{ backgroundColor: 'blue' }}>
        <div
          id="parent"
          style={{
            height: '20rem',
            paddingTop: '10rem',
            paddingBottom: '1000rem',
            paddingLeft: '1rem',
            width: 300,
            backgroundColor: 'red',
            overflow: 'scroll',
          }}
        >
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
        </div>
      </div>
    );

    cy.findAllByLabelText('Calendar').eq(0).click();

    let previousDateTimeInputLeft;
    cy.get('#picker-test-iot--date-time-pickerv2__wrapper')
      .then(getRect)
      .then((rect) => {
        previousDateTimeInputLeft = rect.left;
      });

    let previousFlyoutMenuLeft;
    cy.get('#flyout-tooltip')
      .then(getRect)
      .then((rect) => {
        previousFlyoutMenuLeft = rect.left;
      });

    expect(previousFlyoutMenuLeft).equal(previousDateTimeInputLeft);

    cy.get('#parent').scrollTo('left', { duration: 1000 });
    cy.get('#flyout-tooltip').should('not.exist');
  });

  it('should re-position the flyout when scrolling parent to bottom (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <div style={{ backgroundColor: 'blue' }}>
        <div
          id="parent"
          style={{
            height: '20rem',
            paddingTop: '10rem',
            paddingBottom: '1000rem',
            paddingLeft: '1rem',
            width: 300,
            backgroundColor: 'red',
            overflow: 'scroll',
          }}
        >
          <DateTimePicker
            onApply={onApply}
            onCancel={onCancel}
            id="picker-test"
            hasTimeInput
            useNewTimeSpinner
            defaultValue={{
              timeRangeKind: PICKER_KINDS.ABSOLUTE,
              timeRangeValue: {
                start: new Date(2021, 7, 1, 12, 34, 0),
                end: new Date(2021, 7, 6, 10, 49, 0),
              },
            }}
          />
        </div>
      </div>
    );

    cy.findAllByLabelText('Calendar').eq(0).click();

    let previousDateTimeInputTop;
    cy.get('#picker-test-iot--date-time-pickerv2__wrapper')
      .then(getRect)
      .then((rect) => {
        previousDateTimeInputTop = rect.top;
      });

    let previousFlyoutMenuTop;
    cy.get('#flyout-tooltip')
      .then(getRect)
      .then((rect) => {
        previousFlyoutMenuTop = rect.top;
      });

    expect(previousFlyoutMenuTop).equal(previousDateTimeInputTop);

    cy.get('#parent').scrollTo('top', { duration: 1000 });
    cy.get('#flyout-tooltip').should('not.exist');
  });

  it('should close the flyout when scrolling parent to the right (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <div style={{ backgroundColor: 'blue' }}>
        <div
          id="parent"
          style={{
            height: '20rem',
            paddingTop: '10rem',
            paddingBottom: '1000rem',
            paddingLeft: '1rem',
            width: 300,
            backgroundColor: 'red',
            overflow: 'scroll',
          }}
        >
          <DateTimePicker
            onApply={onApply}
            onCancel={onCancel}
            id="picker-test"
            hasTimeInput
            useNewTimeSpinner
            defaultValue={{
              timeRangeKind: PICKER_KINDS.ABSOLUTE,
              timeRangeValue: {
                start: new Date(2021, 7, 1, 12, 34, 0),
                end: new Date(2021, 7, 6, 10, 49, 0),
              },
            }}
          />
        </div>
      </div>
    );

    cy.findAllByLabelText('Calendar').eq(0).click();

    let previousDateTimeInputLeft;
    cy.get('#picker-test-iot--date-time-pickerv2__wrapper')
      .then(getRect)
      .then((rect) => {
        previousDateTimeInputLeft = rect.left;
      });

    let previousFlyoutMenuLeft;
    cy.get('#flyout-tooltip')
      .then(getRect)
      .then((rect) => {
        previousFlyoutMenuLeft = rect.left;
      });

    expect(previousFlyoutMenuLeft).equal(previousDateTimeInputLeft);

    cy.get('#parent').scrollTo('left', { duration: 1000 });
    cy.get('#flyout-tooltip').should('not.exist');
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
    cy.findAllByLabelText('Increment hours').eq(0).click();
    cy.findByLabelText('End time').type('{backspace}{backspace}{backspace}{backspace}{backspace}');
    cy.findByLabelText('End time').type('12:34');
    cy.findByText('Apply')
      .click()
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'ABSOLUTE',
          timeRangeValue: {
            end: Cypress.sinon.match.any,
            endDate: '08/08/2021',
            endTime: '12:34',
            start: Cypress.sinon.match.any,
            startDate: '08/06/2021',
            startTime: '13:34',
            humanValue: '08/06/2021 13:34 to 08/08/2021 12:34',
            tooltipValue: '08/06/2021 13:34 to 08/08/2021 12:34',
          },
        });
      });
  });

  it('should pick a new absolute ranges same date', () => {
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
    cy.findByLabelText('August 8, 2021').click();
    cy.get('#picker-test-date-picker-input-start').blur();
    cy.findByLabelText('August 8, 2021').click();
    cy.findByLabelText('August 8, 2021').should('have.class', 'selected');
    cy.findByLabelText('End time').type('{backspace}{backspace}{backspace}{backspace}{backspace}');
    cy.findByLabelText('End time').type('12:35');
    cy.findByText('Apply')
      .click()
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'ABSOLUTE',
          timeRangeValue: {
            end: Cypress.sinon.match.any,
            endDate: '08/08/2021',
            endTime: '12:35',
            start: Cypress.sinon.match.any,
            startDate: '08/08/2021',
            startTime: '12:34',
            humanValue: '08/08/2021 12:34 to 08/08/2021 12:35',
            tooltipValue: '08/08/2021 12:34 to 08/08/2021 12:35',
          },
        });
      });
  });

  it('should pick a new absolute ranges (new time spinner 24 hours with AM/PM)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <div style={{ justifyContent: 'center' }}>
        <DateTimePicker
          useNewTimeSpinner
          dateTimeMask="YYYY-MM-DD HH:mm A"
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
          style={{ zIndex: 6000 }}
        />
      </div>
    );

    cy.findByText('2021-08-01 12:34 PM to 2021-08-06 10:49 AM').should('be.visible').click();

    cy.findByText('Custom range').should('be.visible');
    cy.findByText('August').should('be.visible');
    cy.findByLabelText('Year').should('have.value', '2021');
    cy.findByLabelText('August 8, 2021').click();
    cy.findByLabelText('August 8, 2021').should('have.class', 'selected');
    cy.findByLabelText('August 6, 2021').should('have.class', 'selected');
    cy.get('#picker-test-1').clear();
    cy.get('#picker-test-1').click().focus().type('{moveToStart}{del}{del}13');

    cy.get('#picker-test-2')
      .click()
      .focus()
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}12:34');
    cy.findByText('Apply')
      .click()
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'ABSOLUTE',
          timeRangeValue: {
            ISOStart: Cypress.sinon.match.any,
            ISOEnd: Cypress.sinon.match.any,
            end: Cypress.sinon.match.any,
            endDate: '08/08/2021',
            endTime: '12:34',
            start: Cypress.sinon.match.any,
            startDate: '08/06/2021',
            startTime: '13:34',
            humanValue: '2021-08-06 13:34 PM to 2021-08-08 12:34 PM',
            tooltipValue: '2021-08-06 13:34 PM to 2021-08-08 12:34 PM',
          },
          timeSingleValue: null,
        });
      });
  });

  it('should pick a new absolute ranges (new time spinner 12 hours with AM/PM)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <div style={{ justifyContent: 'center' }}>
        <DateTimePicker
          useNewTimeSpinner
          dateTimeMask="YYYY-MM-DD hh:mm A"
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
          style={{ zIndex: 6000 }}
        />
      </div>
    );

    cy.findByText('2021-08-01 12:34 PM to 2021-08-06 10:49 AM').should('be.visible').click();

    cy.findByText('Custom range').should('be.visible');
    cy.findByText('August').should('be.visible');
    cy.findByLabelText('Year').should('have.value', '2021');
    cy.findByLabelText('August 8, 2021').click();
    cy.findByLabelText('August 8, 2021').should('have.class', 'selected');
    cy.findByLabelText('August 6, 2021').should('have.class', 'selected');
    cy.get('#picker-test-1').clear();
    cy.get('#picker-test-1').click().focus().type('{moveToStart}{del}{del}01');

    cy.get('#picker-test-2')
      .click()
      .focus()
      .type(
        '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}12:34 PM'
      );
    cy.findByText('Apply')
      .click()
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'ABSOLUTE',
          timeRangeValue: {
            ISOStart: Cypress.sinon.match.any,
            ISOEnd: Cypress.sinon.match.any,
            end: Cypress.sinon.match.any,
            endDate: '08/08/2021',
            endTime: '12:34 PM',
            start: Cypress.sinon.match.any,
            startDate: '08/06/2021',
            startTime: '01:34 PM',
            humanValue: '2021-08-06 01:34 PM to 2021-08-08 12:34 PM',
            tooltipValue: '2021-08-06 01:34 PM to 2021-08-08 12:34 PM',
          },
          timeSingleValue: null,
        });
      });
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
            startDate: '2021-08-01',
            startTime: '12:34',
            endDate: '2021-08-06',
            endTime: '10:49',
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

  it('should disable apply button when absolute TimePickerSpinner inputs are invalid (new time spinner) ', () => {
    const { i18n } = DateTimePicker.defaultProps;
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        useNewTimeSpinner
        dateTimeMask="YYYY-MM-DD HH:mm A"
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        defaultValue={{
          timeRangeKind: PICKER_KINDS.ABSOLUTE,
          timeRangeValue: {
            startDate: '2021-08-01',
            startTime: '12:34',
            endDate: '2021-08-06',
            endTime: '10:49',
          },
        }}
      />
    );

    cy.findByText('2021-08-01 12:34 PM to 2021-08-06 10:49 AM').should('be.visible').click();
    cy.get('#picker-test-1').type('{backspace}{backspace}{backspace}{backspace}{backspace}91:35');
    cy.findByText(i18n.applyBtnLabel).should('be.disabled');

    cy.get('#picker-test-1').type('{backspace}{backspace}{backspace}{backspace}{backspace}11:35');

    cy.findByText(i18n.applyBtnLabel).should('not.be.disabled');

    cy.get('#picker-test-2').type('{backspace}{backspace}{backspace}{backspace}{backspace}11:61');
    cy.findByText(i18n.applyBtnLabel).should('be.disabled');
  });

  it('should not disable apply button for single select', () => {
    const onApply = cy.stub();
    const onClear = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onClear={onClear}
        id="picker-test"
        hasTimeInput
        useNewTimeSpinner
        datePickerType="single"
        showRelativeOption={false}
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34',
          },
        }}
      />
    );

    // open calendar
    cy.findAllByLabelText('Calendar').eq(0).click();
    cy.findByRole('button', { name: 'Clear' }).click();
    expect(onClear).to.be.callCount(0);

    // open calender again
    cy.findAllByLabelText('Calendar').eq(0).click();
    cy.findByRole('button', { name: 'Apply' }).click();
    expect(onApply).to.be.callCount(0);

    // errpr messages should show up after click on apply button
    cy.findByText('Date is required').should('exist');
    cy.findByText('The time entered is invalid').should('exist');
  });

  it('should open the flyout when hitting enter', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <div style={{ width: '600px', padding: '3rem', marginLeft: '300px' }}>
        <DateTimePicker
          onApply={onApply}
          onCancel={onCancel}
          id="picker-test"
          hasTimeInput
          hasIconOnly
          defaultValue={{
            timeRangeKind: PICKER_KINDS.ABSOLUTE,
            timeRangeValue: {
              start: new Date(2021, 7, 1, 12, 34, 0),
              end: new Date(2021, 7, 6, 10, 49, 0),
            },
          }}
        />
      </div>
    );

    cy.findByTestId('date-time-picker-datepicker-flyout-button').trigger('keydown', {
      key: 'Home',
    });
    cy.findByText('Custom range').should('not.exist');
    cy.findByTestId('date-time-picker-datepicker-flyout-button').trigger('keydown', {
      key: 'Enter',
    });
    cy.findByText('Custom range').should('be.visible');
  });

  it('should open the flyout when hitting enter (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <div style={{ width: '600px', padding: '3rem', marginLeft: '300px' }}>
        <DateTimePicker
          useNewTimeSpinner
          onApply={onApply}
          onCancel={onCancel}
          id="picker-test"
          hasTimeInput
          hasIconOnly
          defaultValue={{
            timeRangeKind: PICKER_KINDS.ABSOLUTE,
            timeRangeValue: {
              start: new Date(2021, 7, 1, 12, 34, 0),
              end: new Date(2021, 7, 6, 10, 49, 0),
            },
          }}
        />
      </div>
    );

    cy.findByTestId('date-time-picker-datepicker-flyout-button').trigger('keydown', {
      key: 'Home',
    });
    cy.findByText('Custom range').should('not.exist');
    cy.findByTestId('date-time-picker-datepicker-flyout-button').trigger('keydown', {
      key: 'Enter',
    });
    cy.findByText('Custom range').should('be.visible');
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
            humanValue: '',
            tooltipValue: '',
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
            humanValue: Cypress.sinon.match((value) => {
              return value.includes('12:04');
            }),
            tooltipValue: Cypress.sinon.match((value) => {
              return value.includes('12:04');
            }),
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
            humanValue: '08/06/2021 11:35 to 08/13/2021 12:39',
            start: Cypress.sinon.match.any,
            startDate: '08/06/2021',
            startTime: '11:35',
            tooltipValue: '08/06/2021 11:35 to 08/13/2021 12:39',
          },
        });
      });
  });

  it('should be able to navigate by keyboard (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        useNewTimeSpinner
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
        style={{ zIndex: 6000 }}
      />
    );

    cy.findByText('08/01/2021 12:34 to 08/06/2021 10:49').should('be.visible').click();
    cy.focused().type('{enter}');
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

    cy.get('#picker-test-1').should('be.focused').type('{moveToStart}{del}0');
    cy.findByTestId('date-time-picker-spinner').should('exist');
    cy.focused().realPress('Enter');
    cy.findByTestId('date-time-picker-spinner').should('not.exist');

    cy.focused().realPress('Tab');
    cy.get('#picker-test-2').should('be.focused').type('{moveToStart}{del}{del}12');
    cy.findByTestId('date-time-picker-spinner').should('exist');
    cy.focused().realPress('Enter');

    cy.focused().realPress('Tab');
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
            ISOStart: Cypress.sinon.match.any,
            ISOEnd: Cypress.sinon.match.any,
            end: Cypress.sinon.match.any,
            endDate: '08/13/2021',
            endTime: '12:49',
            humanValue: '08/06/2021 02:34 to 08/13/2021 12:49',
            start: Cypress.sinon.match.any,
            startDate: '08/06/2021',
            startTime: '02:34',
            tooltipValue: '08/06/2021 02:34 to 08/13/2021 12:49',
          },
          timeSingleValue: null,
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
    cy.focused().should('contain.text', 'Apply');
    cy.findByText('Apply')
      .focus()
      .type('{enter}')
      .should(() => {
        // the calendar in Flatpickr does not respect MockDate or cy.clock, so we must resort to using
        // the current date, but picking specific ranges to test and format the dynamic output as expected
        const now = dayjs();
        const lastSixHours = now.subtract(6, 'hours');
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'PRESET',
          timeRangeValue: {
            id: 'item-03',
            label: 'Last 6 hours',
            offset: 360,
            tooltipValue: `${lastSixHours.format('L HH:mm')} to Now`,
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
    cy.findByText('Last 12 hours').should('not.exist');
  });

  it('should close when `Escape` is pressed (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" useNewTimeSpinner />
    );

    cy.get('body').realPress('Tab');
    cy.focused().type('{enter}');
    cy.findByText('Last 12 hours').should('be.visible');
    cy.focused().type('{esc}');
    cy.findByText('Last 12 hours').should('not.exist');
  });

  it("should do nothing when `ArrowDown` is pressed if it isn't open.", () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(<DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" />);

    cy.get('body').realPress('Tab');
    cy.focused().type('{downarrow}');
    cy.findByText('Last 12 hours').should('not.exist');
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
    cy.findByRole('button', { name: 'Apply' })
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
            humanValue: `${lastMonth.format(`MM/[20]/YYYY`)} to ${now.format(`MM/[12]/YYYY`)}`,
            tooltipValue: `${lastMonth.format(`MM/[20]/YYYY`)} to ${now.format(`MM/[12]/YYYY`)}`,
          },
        });
      });
  });

  it('should pick ranges across months (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    // the calendar in Flatpickr does not respect MockDate or cy.clock, so we must resort to using
    // the current date, but picking specific days to test and format the dynamic output as expected
    const now = dayjs();
    const thisMonthLabel = now.format(`MMMM [12], YYYY`);
    const lastMonth = now.subtract(1, 'month');
    const lastMonthLabel = lastMonth.format(`MMMM [20], YYYY`);
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput={false}
        useNewTimeSpinner
      />
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
    cy.findByRole('button', { name: 'Apply' })
      .click()
      .should(() => {
        expect(onApply).to.be.calledWith({
          timeRangeKind: 'ABSOLUTE',
          timeRangeValue: {
            ISOStart: Cypress.sinon.match.any,
            ISOEnd: Cypress.sinon.match.any,
            end: Cypress.sinon.match.any,
            endDate: now.format(`MM/[12]/YYYY`),
            endTime: null,
            start: Cypress.sinon.match.any,
            startDate: lastMonth.format(`MM/[20]/YYYY`),
            startTime: null,
            humanValue: `${lastMonth.format(`MM/[20]/YYYY`)} to ${now.format(`MM/[12]/YYYY`)}`,
            tooltipValue: `${lastMonth.format(`MM/[20]/YYYY`)} to ${now.format(`MM/[12]/YYYY`)}`,
          },
          timeSingleValue: null,
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
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should close dropdown on field click', () => {
    mount(<DateTimePicker onApply={cy.stub()} onCancel={cy.stub()} id="picker-test" />);

    cy.findByRole('button', { name: 'Last 30 minutes' }).click();
    cy.findByRole('dialog').should('be.visible');
    // unsaved changes
    cy.findByText('Last 1 hour').click();
    // closing dropdown by clicking on field icon
    cy.findAllByLabelText('Calendar').eq(0).click();
    cy.findByRole('dialog').should('not.exist');
  });

  it('should close dropdown on field click (new time spinner)', () => {
    mount(
      <DateTimePicker onApply={cy.stub()} onCancel={cy.stub()} id="picker-test" useNewTimeSpinner />
    );

    cy.findByRole('button', { name: 'Last 30 minutes' }).click();
    cy.findByRole('dialog').should('be.visible');
    // unsaved changes
    cy.findByText('Last 1 hour').click();
    // closing dropdown by clicking on field icon
    cy.findAllByLabelText('Calendar').eq(0).click();
    cy.findByRole('dialog').should('not.exist');
  });

  it('should close on click outside if relative date was selected (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" useNewTimeSpinner />
    );

    cy.findByRole('button', { name: 'Last 30 minutes' }).click();
    cy.findByText('Custom Range').should('be.visible').click();
    cy.findByTitle('Increment number').should('be.visible').click();
    cy.get('body').click();

    cy.findByText('Custom range').should('not.exist');
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
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should close on click outside if absolute date was selected (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker onApply={onApply} onCancel={onCancel} id="picker-test" useNewTimeSpinner />
    );

    cy.findByRole('button', { name: 'Last 30 minutes' }).click();
    cy.findByText('Custom Range').should('be.visible').click();
    cy.findByText('Absolute').should('be.visible').click();
    cy.get('body').click();

    cy.findByText('Custom range').should('not.exist');
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should reset to default absolute value from props when clicked outside', () => {
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

    cy.findAllByRole('button').eq(0).contains('08/01/2021 12:34 to 08/06/2021 10:49');
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should reset to default absolute value from props on click outside (new time spinner)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        useNewTimeSpinner
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

    cy.findAllByRole('button').eq(0).contains('08/01/2021 12:34 to 08/06/2021 10:49');
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should reset to default absolute value from props on click outside (single select)', () => {
    const onApply = cy.stub();
    const onCancel = cy.stub();
    mount(
      <DateTimePicker
        onApply={onApply}
        onCancel={onCancel}
        id="picker-test"
        hasTimeInput
        useNewTimeSpinner
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34',
          },
        }}
      />
    );

    cy.findByText('04/01/2020 12:34').click();
    cy.findByText('Relative').should('be.visible').click();
    cy.get('body').click();

    cy.findAllByRole('button').eq(0).contains('04/01/2020 12:34');
    expect(onApply).to.be.callCount(0);
    expect(onCancel).to.be.callCount(0);
  });

  it('should close appropriate dropdown', () => {
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
    cy.findAllByRole('dialog').should('have.length', 1);

    cy.findByTestId(`${testIdTwo}__field`).click();
    cy.findAllByRole('dialog').should('have.length', 1);
  });

  it('should close appropriate dropdown (new time spinner)', () => {
    const testIdOne = 'picker-test-1';
    const testIdTwo = 'picker-test-2';
    mount(
      <div
        style={{
          display: 'flex',
        }}
      >
        <DateTimePicker testId={testIdOne} hasTimeInput useNewTimeSpinner />
        <DateTimePicker testId={testIdTwo} hasTimeInput useNewTimeSpinner />
      </div>
    );

    cy.findByTestId(`${testIdOne}__field`).click();
    cy.findAllByRole('dialog').should('have.length', 1);

    cy.findByTestId(`${testIdTwo}__field`).click();
    cy.findAllByRole('dialog').should('have.length', 1);
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
      // Unsaved changes in relative range
      cy.findAllByLabelText('Calendar').eq(0).click();
      cy.findByText('Absolute').should('be.visible').click();
      cy.findAllByText('25').click({ multiple: true, force: true });
      cy.findAllByText('26').click({ multiple: true, force: true });
      cy.findByLabelText('Start time').type('14:30');

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

    it('single select with value', () => {
      mount(
        <DateTimePicker
          onApply={cy.stub()}
          onCancel={cy.stub()}
          id="picker-test"
          hasTimeInput
          useNewTimeSpinner
          datePickerType="single"
          defaultValue={{
            timeRangeKind: PICKER_KINDS.SINGLE,
            timeSingleValue: {
              startDate: '2020-04-01',
              startTime: '12:34',
            },
          }}
        />
      );
      // Select some date in absolute range
      cy.findByTestId('date-time-picker__field').click();
      cy.findByLabelText('Start time').focus().clear();
      cy.findByLabelText('Start time').type('11:11{enter}');
      cy.findByText('Apply').click();

      // Unsaved changes in relative range
      cy.findByTestId('date-time-picker__field').click();
      cy.findByLabelText('Start time').focus().clear();
      cy.get('body').click();
      // Preserves only saved changes
      cy.findByTestId('date-time-picker__field').should('have.text', '04/01/2020 11:11');
    });

    it('with default absolute value (new time spinner)', () => {
      mount(
        <DateTimePicker
          onApply={cy.stub()}
          onCancel={cy.stub()}
          id="picker-test"
          hasTimeInput
          useNewTimeSpinner
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
      cy.findByLabelText('Start time').focus();
      cy.findByText('35').click().type('{enter}');
      cy.findByText('Apply').click();

      // Unsaved changes in relative range
      cy.findByTestId('date-time-picker__field').click();
      cy.findByText('Relative').should('be.visible').click();
      cy.findByPlaceholderText('hh:mm').type('13:30');

      cy.get('body').click();
      // Preserves only saved changes
      cy.findByTestId('date-time-picker__field').should(
        'have.text',
        '08/01/2021 12:35 to 08/06/2021 10:49'
      );
    });
  });

  it('single select should preserve empty value', () => {
    mount(
      <DateTimePicker
        onApply={cy.stub()}
        onCancel={cy.stub()}
        onClear={cy.stub()}
        id="picker-test"
        hasTimeInput
        useNewTimeSpinner
        datePickerType="single"
        dateTimeMask="YYYY-MM-DD HH:mm"
        defaultValue={{
          timeRangeKind: PICKER_KINDS.SINGLE,
          timeSingleValue: {
            startDate: '2020-04-01',
            startTime: '12:34',
          },
        }}
      />
    );
    // Clear value
    cy.findByTestId('date-time-picker__field').click();
    cy.findByText('Clear').click();
    cy.findByTestId('date-time-picker__field').should('have.text', 'YYYY-MM-DD HH:mm');
    // Unsaved changes
    cy.findByTestId('date-time-picker__field').click();
    cy.findAllByText('28').click({ multiple: true, force: true });
    cy.findByLabelText('Start time').type('11:11{enter}');
    cy.get('body').click();
    // Empty value preserved
    cy.findByTestId('date-time-picker__field').should('have.text', 'YYYY-MM-DD HH:mm');
  });

  describe('visual regression tests', () => {
    beforeEach(() => {
      MockDate.set(1537538254000);
    });
    afterEach(() => {
      MockDate.reset();
    });

    it('should position the flyout menu correctly in RTL', () => {
      cy.window().then((win) => {
        win.document.querySelectorAll('html')[0].setAttribute('dir', 'rtl');
      });
      mount(
        <div style={{ padding: '1rem' }}>
          <DateTimePicker id="picker-test" hasIconOnly menuOffset={{ top: 0, left: -1 }} />
        </div>
      );
      cy.findByTestId('date-time-picker').click();
      onlyOn('headless', () => {
        cy.compareSnapshot('v2-icon-only-rtl');
      });
    });

    it('should position the flyout menu correctly in RTL with icon only', () => {
      cy.window().then((win) => {
        win.document.querySelectorAll('html')[0].setAttribute('dir', 'rtl');
      });
      mount(
        <div style={{ padding: '1rem' }}>
          <DateTimePicker id="picker-test" menuOffset={{ top: 0, left: 287 }} />
        </div>
      );
      cy.findByTestId('date-time-picker').click();
      onlyOn('headless', () => {
        cy.compareSnapshot('v2-rtl');
      });
    });
  });
});
