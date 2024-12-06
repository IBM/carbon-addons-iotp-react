import React from 'react';
import { mount } from 'enzyme';
import { Bee } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';
import { CARD_DATA_STATE, CARD_SIZES } from '../../constants/LayoutConstants';

import DataStateRenderer, { TooltipContent } from './DataStateRenderer';

const { iotPrefix, prefix } = settings;

function getDataStateProp() {
  return {
    type: CARD_DATA_STATE.NO_DATA,
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
  it('should render custom icon', () => {
    const size = CARD_SIZES.SMALL;
    const myDataState = getDataStateProp();
    myDataState.icon = (
      <Bee style={{ fill: 'orange' }}>
        <title>App supplied icon</title>
      </Bee>
    );
    const wrapper = mount(<DataStateRenderer dataState={myDataState} size={size} />);
    expect(wrapper.find('svg title').text()).toEqual('App supplied icon');
    expect(wrapper.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(0);
    expect(wrapper.find(`svg.${iotPrefix}--data-state-default-error-icon`)).toHaveLength(0);
  });

  it('should use default icons if no app icon is passed down', () => {
    const size = CARD_SIZES.SMALL;
    const myDataState = getDataStateProp();
    const wrapperNoData = mount(
      <DataStateRenderer
        dataState={{ ...myDataState, type: CARD_DATA_STATE.NO_DATA }}
        size={size}
      />
    );
    expect(wrapperNoData.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(1);
    expect(wrapperNoData.find(`svg.${iotPrefix}--data-state-default-error-icon`)).toHaveLength(0);

    const wrapperError = mount(
      <DataStateRenderer dataState={{ ...myDataState, type: CARD_DATA_STATE.ERROR }} size={size} />
    );
    expect(wrapperError.find(`svg.${iotPrefix}--data-state-default-error-icon`)).toHaveLength(1);
    expect(wrapperError.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(0);
  });

  it('should render icon, label, description for sizes not equal SMALL, SMALLWIDE or MEDIUMTHIN', () => {
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

    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.MEDIUM} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.MEDIUMWIDE} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.LARGE} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.LARGETHIN} />);
    hasLabelDescription(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.LARGEWIDE} />);
  });

  it('should render only icon for size SMALL', () => {
    const myDataState = getDataStateProp();
    const wrapper = mount(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.SMALL} />);

    expect(wrapper.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(1);
    expect(wrapper.find(`.${iotPrefix}--data-state-grid__label`)).toHaveLength(0);
    expect(wrapper.find(`.${iotPrefix}--data-state-grid__description`)).toHaveLength(0);
  });

  it('should render only icon for size SMALLWIDE', () => {
    const myDataState = getDataStateProp();
    const wrapper = mount(
      <DataStateRenderer dataState={myDataState} size={CARD_SIZES.SMALLWIDE} />
    );

    expect(wrapper.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(1);
    expect(wrapper.find(`.${iotPrefix}--data-state-grid__label`)).toHaveLength(0);
    expect(wrapper.find(`.${iotPrefix}--data-state-grid__description`)).toHaveLength(0);
  });

  it('should render only icon for size MEDIUMTHIN', () => {
    const myDataState = getDataStateProp();
    const wrapper = mount(
      <DataStateRenderer dataState={myDataState} size={CARD_SIZES.MEDIUMTHIN} />
    );

    expect(wrapper.find(`svg.${iotPrefix}--data-state-default-warning-icon`)).toHaveLength(1);
    expect(wrapper.find(`.${iotPrefix}--data-state-grid__label`)).toHaveLength(0);
    expect(wrapper.find(`.${iotPrefix}--data-state-grid__description`)).toHaveLength(0);
  });

  it('should contain tooltip for icon, label and description', () => {
    const myDataState = getDataStateProp();

    const wrapper = mount(<DataStateRenderer dataState={myDataState} size={CARD_SIZES.MEDIUM} />);
    const iconTooltipTrigger = wrapper
      .find(`svg.${iotPrefix}--data-state-default-warning-icon`)
      .closest(`.${prefix}--tooltip__label`);
    expect(iconTooltipTrigger).toHaveLength(1);

    const labelTooltipTrigger = wrapper
      .find(`.${iotPrefix}--data-state-grid__label`)
      .closest(`.${prefix}--tooltip__label`);
    expect(labelTooltipTrigger).toHaveLength(1);

    const descriptionTooltipTrigger = wrapper
      .find(`.${iotPrefix}--data-state-grid__description`)
      .closest(`.${prefix}--tooltip__label`);
    expect(descriptionTooltipTrigger).toHaveLength(1);
  });

  it('should render label, description and extra text in the tooltip when present', () => {
    const myDataState = getDataStateProp();
    const wrapper = mount(<TooltipContent tooltipContent={myDataState} />);

    expect(wrapper.find(`.${iotPrefix}--data-state-tooltip__label`).text()).toEqual(
      myDataState.label
    );

    expect(wrapper.text()).toMatch(RegExp(`.${myDataState.description}.`));
    expect(wrapper.text()).toMatch(RegExp(`.${myDataState.extraTooltipText}.`));
  });

  it('should render learn-more link as anchor link', () => {
    const myDataState = getDataStateProp();
    const wrapper = mount(<TooltipContent tooltipContent={myDataState} />);

    expect(wrapper.find(`a.learn-more-link`).text()).toEqual('Learn more');
  });

  it('should render learn-more link as button with onClick', () => {
    const onLearnMoreClick = jest.fn();
    const myDataState = getDataStateProp();
    myDataState.learnMoreElement = (
      <button type="button" className="learn-more-button" onClick={onLearnMoreClick}>
        Learn more
      </button>
    );
    const wrapper = mount(<TooltipContent tooltipContent={myDataState} />);
    wrapper.find('.learn-more-button').props().onClick();
    expect(onLearnMoreClick).toHaveBeenCalled();
  });

  it('should not render extraTooltipText nor learnMoreElement when missing', () => {
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
