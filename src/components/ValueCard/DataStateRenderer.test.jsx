import React from 'react';
import { mount } from 'enzyme';
import { Bee16 } from '@carbon/icons-react';

import { settings } from '../../constants/Settings';
import { VALUE_CARD_DATA_STATE, CARD_SIZES } from '../../constants/LayoutConstants';

import DataStateRenderer, { TooltipContent } from './DataStateRenderer';

const { iotPrefix } = settings;

function getDataStateProp() {
  return {
    type: VALUE_CARD_DATA_STATE.NO_DATA,
    label: 'No data available for this score at this time',
    description: 'My description text',
    extraTooltipText: 'Lorem ipsum dolor sit amet',
    learnMoreElement: (
      <a href="#test" className="learn-more-link">
        Learn more
      </a>
    ),
  };
}

describe('ValueCard', () => {
  test('should render custom icon', () => {
    const size = CARD_SIZES.SMALL;
    const myDataState = getDataStateProp();
    myDataState.icon = (
      <Bee16 style={{ fill: 'orange' }}>
        <title>App supplied icon</title>
      </Bee16>
    );
    const wrapper = mount(<DataStateRenderer dataState={myDataState} size={size} />);
    expect(wrapper.find('svg title').text()).toEqual('App supplied icon');
    expect(wrapper.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(0);
    expect(wrapper.find(`svg.${iotPrefix}--data-state-default-error-icon`)).toHaveLength(0);
  });

  test('should use default icons if no app icon is passed down', () => {
    const size = CARD_SIZES.SMALL;
    const myDataState = getDataStateProp();
    const wrapperNoData = mount(
      <DataStateRenderer
        dataState={{ ...myDataState, type: VALUE_CARD_DATA_STATE.NO_DATA }}
        size={size}
      />
    );
    expect(wrapperNoData.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(1);
    expect(wrapperNoData.find(`svg.${iotPrefix}--data-state-default-error-icon`)).toHaveLength(0);

    const wrapperError = mount(
      <DataStateRenderer
        dataState={{ ...myDataState, type: VALUE_CARD_DATA_STATE.ERROR }}
        size={size}
      />
    );
    expect(wrapperError.find(`svg.${iotPrefix}--data-state-default-error-icon`)).toHaveLength(1);
    expect(wrapperError.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(0);
  });

  test('should render icon, label, description for sizes not equal XSMALL', () => {
    const myDataState = getDataStateProp();
    function hasLabelDescription(jsx) {
      const wrapper = mount(jsx);
      expect(wrapper.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(1);
      expect(wrapper.find(`.${iotPrefix}--data-state-grid__label`).text()).toEqual(
        myDataState.label
      );
      expect(wrapper.find(`.${iotPrefix}--data-state-grid__description`).text()).toEqual(
        myDataState.description
      );
    }

    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.XSMALLWIDE} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.SMALL} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.MEDIUM} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.TALL} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.WIDE} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.LARGE} />);
  });

  test('should render only icon for size XSMALL', () => {
    const myDataState = getDataStateProp();
    const wrapper = mount(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.XSMALL} />);

    expect(wrapper.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(1);
    expect(wrapper.find(`.${iotPrefix}--data-state-grid__label`)).toHaveLength(0);
    expect(wrapper.find(`.${iotPrefix}--data-state-grid__description`)).toHaveLength(0);
  });

  test('should contain tooltip for icon, label and description', () => {
    const myDataState = getDataStateProp();

    const wrapper = mount(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.SMALL} />);
    const iconTooltipTrigger = wrapper
      .find(`svg.${iotPrefix}--data-state-default-warning-icon`)
      .closest('.bx--tooltip__label');
    expect(iconTooltipTrigger).toHaveLength(1);

    const labelTooltipTrigger = wrapper
      .find(`.${iotPrefix}--data-state-grid__label`)
      .closest('.bx--tooltip__label');
    expect(labelTooltipTrigger).toHaveLength(1);

    const descriptionTooltipTrigger = wrapper
      .find(`.${iotPrefix}--data-state-grid__description`)
      .closest('.bx--tooltip__label');
    expect(descriptionTooltipTrigger).toHaveLength(1);
  });

  test('should render label, description and extra text in the tooltip when present', () => {
    const myDataState = getDataStateProp();
    const wrapper = mount(<TooltipContent tooltipContent={myDataState} />);

    expect(wrapper.find(`.${iotPrefix}--data-state-tooltip__label`).text()).toEqual(
      myDataState.label
    );

    expect(wrapper.text()).toMatch(RegExp(`.${myDataState.description}.`));
    expect(wrapper.text()).toMatch(RegExp(`.${myDataState.extraTooltipText}.`));
  });

  test('should render learn-more link as anchor link', () => {
    const myDataState = getDataStateProp();
    const wrapper = mount(<TooltipContent tooltipContent={myDataState} />);

    expect(wrapper.find(`a.learn-more-link`).text()).toEqual('Learn more');
  });

  test('should render learn-more link as button with onClick', () => {
    const onLearnMoreClick = jest.fn();
    const myDataState = getDataStateProp();
    myDataState.learnMoreElement = (
      <button type="button" className="learn-more-button" onClick={onLearnMoreClick}>
        Learn more
      </button>
    );
    const wrapper = mount(<TooltipContent tooltipContent={myDataState} />);
    wrapper
      .find('.learn-more-button')
      .props()
      .onClick();
    expect(onLearnMoreClick).toHaveBeenCalled();
  });

  test('should not render extraTooltipText nor learnMoreElement when missing', () => {
    const myDataState = getDataStateProp();
    delete myDataState.learnMoreElement;
    delete myDataState.extraTooltipText;

    const wrapper = mount(<TooltipContent tooltipContent={myDataState} />);

    expect(wrapper.find(`.${iotPrefix}--data-state-tooltip__label`).text()).toEqual(
      myDataState.label
    );
    expect(wrapper.text()).not.toMatch(RegExp(`.${myDataState.description}.`));

    expect(wrapper.text()).not.toMatch(RegExp(`.${myDataState.extraTooltipText}.`));
    expect(wrapper.find('.learn-more-link')).toHaveLength(0);
  });
});
