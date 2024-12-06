import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { red50, blue50, green50 } from '@carbon/colors';
import { InformationSquareFilled, InformationFilled } from '@carbon/react/icons';

import HotspotEditorTooltipTab from './HotspotEditorTooltipTab';

describe('HotspotEditorTooltipTab', () => {
  const getColors = () => [
    { carbonColor: red50, name: 'red' },
    { carbonColor: green50, name: 'green' },
    { carbonColor: blue50, name: 'blue' },
  ];

  const getIcons = () => [
    {
      id: 'InformationSquareFilled24',
      icon: InformationSquareFilled,
      text: 'Information square filled',
    },
    {
      id: 'InformationFilled24',
      icon: InformationFilled,
      text: 'Information filled',
    },
  ];

  it('renders info message alone', () => {
    const infoMessage = 'My info message';
    render(
      <HotspotEditorTooltipTab
        i18n={{ infoMessageText: infoMessage }}
        showInfoMessage
        hotspotIcons={getIcons()}
        onChange={() => {}}
        onDelete={() => {}}
        translateWithId={() => {}}
        hotspotIconFillColors={getColors()}
      />
    );

    expect(screen.getByText(infoMessage)).toBeVisible();
    expect(screen.queryAllByText('Title')).toHaveLength(0);
    expect(screen.queryAllByText('Description')).toHaveLength(0);
    expect(screen.queryAllByText('Icon')).toHaveLength(0);
    expect(screen.queryAllByText('Color')).toHaveLength(0);
  });

  it('calls onChange as title and description are typed into', () => {
    const onChange = jest.fn();
    render(
      <HotspotEditorTooltipTab
        hotspotIcons={getIcons()}
        onChange={onChange}
        onDelete={() => {}}
        translateWithId={() => {}}
        hotspotIconFillColors={getColors()}
      />
    );

    userEvent.type(screen.getByTitle('Enter title for the tooltip'), 'test');
    expect(onChange).toHaveBeenCalledWith({ content: { title: 't' } });
    expect(onChange).toHaveBeenCalledWith({ content: { title: 'e' } });
    expect(onChange).toHaveBeenCalledWith({ content: { title: 's' } });
    expect(onChange).toHaveBeenCalledWith({ content: { title: 't' } });
    expect(onChange).toHaveBeenCalledTimes(4);

    userEvent.type(screen.getByLabelText('Description'), 'ok');
    expect(onChange).toHaveBeenCalledWith({ content: { description: 'o' } });
    expect(onChange).toHaveBeenCalledWith({ content: { description: 'k' } });
    expect(onChange).toHaveBeenCalledTimes(6);
  });

  it('calls onChange when color and icon dropdowns are changed ', () => {
    const onChange = jest.fn();
    render(
      <HotspotEditorTooltipTab
        hotspotIconFillColors={getColors()}
        hotspotIcons={getIcons()}
        onChange={onChange}
        onDelete={() => {}}
        translateWithId={() => {}}
      />
    );

    userEvent.click(screen.getByText('Select a color'));
    const firstItem = screen.getAllByRole('option')[0];
    userEvent.click(firstItem);
    expect(onChange).toHaveBeenCalledWith({
      color: getColors()[0].carbonColor,
    });

    userEvent.click(screen.getByText('Select an icon'));
    const firstItemIcon = screen.getAllByRole('option')[0];
    userEvent.click(firstItemIcon);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: getIcons()[0].id,
      })
    );
  });

  it('renders preset values ', () => {
    const description = 'My description';
    const title = 'My Title';
    const colorObj = getColors()[1];
    render(
      <HotspotEditorTooltipTab
        formValues={{
          color: colorObj,
          icon: getIcons()[1],
          content: { title, description },
        }}
        hotspotIconFillColors={getColors()}
        hotspotIcons={getIcons()}
        onChange={() => {}}
        onDelete={() => {}}
        translateWithId={() => {}}
      />
    );

    expect(screen.getByText(description)).toBeVisible();
    expect(screen.getByDisplayValue(title)).toBeVisible();
    expect(screen.getByText(colorObj.name)).toBeVisible();
    expect(screen.getByText(getIcons()[1].text)).toBeVisible();
  });

  it('renders preset color string & icon string value', () => {
    const colorObj = getColors()[1];
    const colorString = colorObj.carbonColor;
    const iconObj = getIcons()[1];
    const iconString = iconObj.id;
    render(
      <HotspotEditorTooltipTab
        formValues={{
          color: colorString,
          icon: iconString,
        }}
        hotspotIconFillColors={getColors()}
        hotspotIcons={getIcons()}
        onChange={() => {}}
        onDelete={() => {}}
        translateWithId={() => {}}
      />
    );

    expect(screen.getByText(colorObj.name)).toBeVisible();
    expect(screen.getByText(iconObj.text)).toBeVisible();
  });

  it('disables text input controls when content is an element', () => {
    render(
      <HotspotEditorTooltipTab
        formValues={{
          content: <span>I am an element</span>,
        }}
        hotspotIconFillColors={getColors()}
        hotspotIcons={getIcons()}
        onChange={() => {}}
        onDelete={() => {}}
        translateWithId={() => {}}
      />
    );

    expect(screen.getByRole('textbox', { name: 'Title' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeDisabled();
  });

  it('calls onDelete when Delete hotspot button is clicked', () => {
    const onDelete = jest.fn();
    const { rerender } = render(
      <HotspotEditorTooltipTab
        hotspotIconFillColors={getColors()}
        hotspotIcons={getIcons()}
        onChange={() => {}}
        onDelete={onDelete}
        showDeleteButton={false}
        translateWithId={() => {}}
      />
    );
    expect(
      screen.queryAllByText(HotspotEditorTooltipTab.defaultProps.i18n.deleteButtonLabelText)
    ).toHaveLength(0);

    rerender(
      <HotspotEditorTooltipTab
        hotspotIconFillColors={getColors()}
        hotspotIcons={getIcons()}
        onChange={() => {}}
        showDeleteButton
        onDelete={onDelete}
        translateWithId={() => {}}
      />
    );
    userEvent.click(
      screen.getByRole('button', {
        name: HotspotEditorTooltipTab.defaultProps.i18n.deleteButtonLabelText,
      })
    );
    expect(onDelete).toHaveBeenCalled();
  });
});
