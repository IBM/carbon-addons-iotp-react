import React from 'react';
import { render, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tree, Add } from '@carbon/react/icons';

import { CARD_SIZES, CARD_TITLE_HEIGHT, CARD_ACTIONS } from '../../constants/LayoutConstants';
import { settings } from '../../constants/Settings';
import Button from '../Button';
import { PICKER_KINDS } from '../../constants/DateConstants';
import { DATE_PICKER_OPTIONS } from '../../constants/CardPropTypes';

import Card from './Card';

const { prefix, iotPrefix } = settings;

const tooltipElement = <div>This is some other text</div>;

const cardProps = {
  title: 'My Title',
  id: 'my card',
  dateTimeMask: 'YYYY-MM-DD HH:mm',
};

describe('Card', () => {
  it('is selectable by testID or testId', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(<Card {...cardProps} size={CARD_SIZES.SMALL} testID="CARD_TEST" />);

    expect(screen.getByTestId('CARD_TEST')).toBeTruthy();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(`The 'testID' prop has been deprecated. Please use 'testId' instead.`)
    );
    jest.resetAllMocks();

    rerender(
      <Card
        {...cardProps}
        subtitle="Subtitle text"
        size={CARD_SIZES.SMALL}
        availableActions={{ range: true, expand: true }}
        testId="card_test"
        footerContent={() => <Button kind="ghost">Footer Content</Button>}
      />
    );
    expect(screen.getByTestId('card_test')).toBeTruthy();
    expect(screen.getByTestId('card_test-content')).toBeTruthy();
    expect(screen.getByTestId('card_test-title')).toBeTruthy();
    expect(screen.getByTestId('card_test-subtitle')).toBeTruthy();
    expect(screen.getByTestId('card_test-header')).toBeTruthy();
    expect(screen.getByTestId('card_test-toolbar')).toBeTruthy();
    expect(screen.getByTestId('card_test-toolbar-expand-button')).toBeTruthy();
    expect(screen.getByTestId('card_test-toolbar-range-picker')).toBeTruthy();
    expect(screen.getByTestId('card_test-footer')).toBeTruthy();
  });

  it('small', () => {
    render(<Card {...cardProps} size={CARD_SIZES.SMALL} />);

    // small should have full header
    expect(screen.getByTestId('Card-header')).toBeVisible();
  });

  it('child size prop', () => {
    const childRenderInTitleCard = jest.fn();

    const { rerender } = render(
      <Card title="My Title" size={CARD_SIZES.MEDIUM}>
        {childRenderInTitleCard}
      </Card>
    );
    expect(childRenderInTitleCard).toHaveBeenCalledWith(
      {
        width: 0,
        height: -CARD_TITLE_HEIGHT,
      },
      expect.anything()
    );

    const childRenderInNoTitleCard = jest.fn();

    rerender(<Card size={CARD_SIZES.MEDIUM}>{childRenderInNoTitleCard}</Card>);
    expect(childRenderInNoTitleCard).toHaveBeenCalledWith(
      {
        width: 0,
        height: 0,
      },
      expect.anything()
    );
  });

  it('render icons', () => {
    const { rerender } = render(
      <Card {...cardProps} size={CARD_SIZES.SMALL} availableActions={{ range: true }} />
    );
    // should render CardRangePicker if isEditable is false
    expect(screen.getAllByTitle('Select time range')[0]).toBeVisible();

    rerender(
      <Card
        {...cardProps}
        size={CARD_SIZES.SMALL}
        availableActions={{ range: true, expand: true }}
      />
    );

    // should render CardRangePicker and Expand
    expect(screen.getAllByTitle('Select time range')[0]).toBeVisible();
    expect(screen.getByTitle('Expand to fullscreen')).toBeVisible();

    rerender(
      <Card {...cardProps} size={CARD_SIZES.SMALL} isEditable availableActions={{ range: true }} />
    );
    // CardRangePicker icon should not render if isEditable prop is true
    expect(screen.queryByTitle('Select time range')).toBeNull();
  });

  it('render custom icons', () => {
    render(
      <Card
        {...cardProps}
        size={CARD_SIZES.SMALL}
        availableActions={{ range: true, expand: true }}
        renderExpandIcon={Tree}
      />
    );

    const button = screen.queryByLabelText('Expand to fullscreen');

    const { container } = render(<Tree aria-hidden="true" aria-label="Expand to fullscreen" />);

    expect(button.firstChild).toEqual(container.firstChild.firstChild);
  });

  it('additional prop based elements', () => {
    const { container, rerender } = render(
      <Card {...cardProps} size={CARD_SIZES.LARGE} tooltip={tooltipElement} />
    );
    // tooltip prop will render a tooltip in the header
    expect(
      container.querySelectorAll(`.${iotPrefix}--card--header .${prefix}--tooltip__trigger`)
    ).toHaveLength(1);
    // without the isLoading prop SkeletonWrapper should not be rendered
    expect(container.querySelectorAll(`.${iotPrefix}--card--skeleton-wrapper`)).toHaveLength(0);
    // with the isLoading prop SkeletonWrapper should  be rendered
    rerender(
      <Card {...cardProps} isLoading size={CARD_SIZES.SMALLWIDE} tooltip={tooltipElement} />
    );
    expect(container.querySelectorAll(`.${iotPrefix}--card--skeleton-wrapper`)).toHaveLength(1);
  });
  it('isExpanded', () => {
    const { container } = render(
      <Card {...cardProps} isExpanded size={CARD_SIZES.LARGE} tooltip={tooltipElement} />
    );
    // isExpanded renders the modal wrapper around it
    expect(container.querySelectorAll(`.${prefix}--modal`)).toHaveLength(1);
  });
  it('card actions for expand/collapse', () => {
    const mockOnCardAction = jest.fn();
    const { rerender } = render(
      <Card
        {...cardProps}
        isExpanded
        size={CARD_SIZES.LARGE}
        tooltip={tooltipElement}
        onCardAction={mockOnCardAction}
        availableActions={{ expand: true }}
      />
    );
    userEvent.click(screen.getByTitle('Close'));
    expect(mockOnCardAction).toHaveBeenCalledWith(cardProps.id, CARD_ACTIONS.CLOSE_EXPANDED_CARD);

    mockOnCardAction.mockClear();
    rerender(
      <Card
        {...cardProps}
        size={CARD_SIZES.LARGE}
        tooltip={tooltipElement}
        onCardAction={mockOnCardAction}
        availableActions={{ expand: true }}
      />
    );
    userEvent.click(screen.getByTitle('Expand to fullscreen'));
    expect(mockOnCardAction).toHaveBeenCalledWith(cardProps.id, CARD_ACTIONS.OPEN_EXPANDED_CARD);
  });

  it('card editable actions', async () => {
    const mockOnCardAction = jest.fn();
    render(
      <Card
        {...cardProps}
        isEditable
        size={CARD_SIZES.LARGE}
        tooltip={tooltipElement}
        onCardAction={mockOnCardAction}
        availableActions={{ edit: true, clone: true, delete: true }}
      />
    );
    fireEvent.click(screen.getAllByTitle('Open and close list of options')[0]);
    const secondElement = await screen.findByText('Clone card');
    fireEvent.click(secondElement);
    expect(mockOnCardAction).toHaveBeenCalledWith(cardProps.id, CARD_ACTIONS.CLONE_CARD);

    // Reopen menu
    fireEvent.click(screen.getAllByTitle('Open and close list of options')[0]);
    mockOnCardAction.mockClear();
    const thirdElement = await screen.findByText('Delete card');
    fireEvent.click(thirdElement);
    expect(mockOnCardAction).toHaveBeenCalledWith(cardProps.id, CARD_ACTIONS.DELETE_CARD);
  });
  it('card actions for default range picker', () => {
    const mockOnCardAction = jest.fn();
    render(
      <Card
        {...cardProps}
        isExpanded
        size={CARD_SIZES.LARGE}
        tooltip={tooltipElement}
        onCardAction={mockOnCardAction}
        availableActions={{ expand: true, range: true }}
      />
    );
    // pop out the calendar
    userEvent.click(screen.getAllByTitle(`Select time range`)[0]);

    // select a default range
    userEvent.click(screen.getByText(`Last 24 hrs`));

    expect(mockOnCardAction).toHaveBeenCalledWith(cardProps.id, CARD_ACTIONS.CHANGE_TIME_RANGE, {
      range: 'last24Hours',
    });
  });

  it('card actions for default range picker using datetimepicker format', () => {
    const mockOnCardAction = jest.fn();
    const { rerender } = render(
      <Card
        {...cardProps}
        isExpanded
        size={CARD_SIZES.LARGE}
        tooltip={tooltipElement}
        onCardAction={mockOnCardAction}
        availableActions={{ expand: true, range: true }}
        timeRangeOptions={{
          last48Hours: { label: 'Last 48 Hours', offset: 48 * 60 },
          last24Hours: { label: 'Last 24 Hours', offset: 24 * 60 },
          last8Hours: { label: 'Last 8 Hours', offset: 8 * 60 },
          last4Hours: { label: 'Last 4 Hours', offset: 4 * 60 },
          last2Hours: { label: 'Last 2 Hours', offset: 2 * 60 },
          lastHour: { label: 'Last Hour', offset: 60 * 60 },
        }}
      />
    );

    expect(screen.getByText('Default')).toBeVisible();

    rerender(
      <Card
        {...cardProps}
        isExpanded
        size={CARD_SIZES.LARGE}
        tooltip={tooltipElement}
        onCardAction={mockOnCardAction}
        availableActions={{ expand: true, range: true }}
        timeRange="last2Hours"
        timeRangeOptions={{
          last48Hours: { label: 'Last 48 Hours', offset: 48 * 60 },
          last24Hours: { label: 'Last 24 Hours', offset: 24 * 60 },
          last8Hours: { label: 'Last 8 Hours', offset: 8 * 60 },
          last4Hours: { label: 'Last 4 Hours', offset: 4 * 60 },
          last2Hours: { label: 'Last 2 Hours', offset: 2 * 60 },
          lastHour: { label: 'Last Hour', offset: 60 * 60 },
        }}
      />
    );

    expect(screen.getByText('Last 2 Hours')).toBeVisible();

    // pop out the calendar
    userEvent.click(screen.getAllByTitle(`Select time range`)[0]);

    // select a default range
    userEvent.click(screen.getByText(`Last 24 Hours`));

    expect(mockOnCardAction).toHaveBeenCalledWith(cardProps.id, CARD_ACTIONS.CHANGE_TIME_RANGE, {
      range: 'last24Hours',
    });
    expect(screen.getByText('Last 24 Hours')).toBeVisible();
  });

  it('card actions for dateTime range picker', () => {
    const mockOnCardAction = jest.fn();
    render(
      <Card
        {...cardProps}
        isExpanded
        size={CARD_SIZES.LARGE}
        tooltip={tooltipElement}
        onCardAction={mockOnCardAction}
        availableActions={{ expand: true, range: DATE_PICKER_OPTIONS.FULL }}
      />
    );
    // pop out the calendar
    userEvent.click(screen.getAllByLabelText(`Calendar`)[0]);

    const hourLabel = 'Last 24 hours';

    // select a default range
    userEvent.click(screen.getByText(hourLabel));

    // apply the default range
    userEvent.click(screen.getByText('Apply'));

    expect(mockOnCardAction).toHaveBeenCalledWith(cardProps.id, CARD_ACTIONS.CHANGE_TIME_RANGE, {
      timeRangeKind: PICKER_KINDS.PRESET,
      timeRangeValue: {
        id: 'item-05',
        label: hourLabel,
        offset: 24 * 60,
        tooltipValue: '2018-09-20 08:57 to Now',
      },
    });

    expect(screen.getByTestId('Card-subtitle')).toHaveTextContent('2018-09-20 08:57 to Now');
  });
  it('card toolbar renders in header only when there are actions', () => {
    const { container, rerender } = render(
      <Card {...cardProps} isExpanded size={CARD_SIZES.SMALL} availableActions={{ expand: true }} />
    );
    expect(
      container.querySelectorAll(`.${iotPrefix}--card--header .${iotPrefix}--card--toolbar`)
    ).toHaveLength(1);

    rerender(<Card {...cardProps} isExpanded size={CARD_SIZES.SMALL} />);
    expect(
      container.querySelectorAll(`.${iotPrefix}--card--header .${iotPrefix}--card--toolbar`)
    ).toHaveLength(0);
  });

  it('render footer only if prop is present', () => {
    const { rerender } = render(
      <Card
        {...cardProps}
        size={CARD_SIZES.SMALL}
        availableActions={{ range: true, expand: true }}
        renderExpandIcon={Tree}
      />
    );

    expect(screen.queryByTestId('card_test-footer')).toBeFalsy();

    rerender(
      <Card
        {...cardProps}
        size={CARD_SIZES.SMALL}
        availableActions={{ range: true, expand: true }}
        renderExpandIcon={Tree}
        footerContent={() => <Button kind="ghost">Footer Content</Button>}
      />
    );

    expect(screen.queryByText(/Footer Content/)).toBeInTheDocument();
  });

  it('should throw a warning if in DEV and availableActions.range is a string', () => {
    const { __DEV__ } = global;
    const { error } = console;
    global.__DEV__ = true;
    console.error = jest.fn();
    render(<Card {...cardProps} availableActions={{ range: 'string' }} />);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'The Card components availableActions.range is an experimental property and may be subject to change.'
      )
    );
    global.__DEV__ = __DEV__;
    console.error = error;
  });

  describe('tooltips', () => {
    const originalGetBoundingClientRect = HTMLDivElement.prototype.getBoundingClientRect;

    beforeEach(() => {
      HTMLDivElement.prototype.getBoundingClientRect = jest.fn(() => ({
        bottom: 76,
        height: 68,
        left: 122,
        right: 410,
        top: 8,
        width: 288,
        x: 122,
        y: 8,
      }));
    });

    afterEach(() => {
      HTMLDivElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });

    it('should warn on combining tooltip and titleTextTooltip', () => {
      const { __DEV__ } = global;
      global.__DEV__ = true;

      jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <Card
          {...cardProps}
          tooltip={<p>I am shown when the info icon is clicked</p>}
          titleTextTooltip={<p>I am shown when the title is clicked</p>}
        />
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('The props titleTextTooltip and tooltip cannot be combined.')
      );

      global.__DEV__ = __DEV__;
    });

    it('should show info icon tooltip', () => {
      const text = 'I am shown when the info icon is clicked';
      const { rerender } = render(<Card title="x" id="my card" tooltip={<p>{text}</p>} />);
      expect(screen.getByRole('button')).toHaveClass(`${prefix}--tooltip__trigger`);
      expect(screen.queryByText(text)).toBeNull();

      userEvent.click(screen.getByRole('button'));
      expect(screen.getByText(text)).toBeVisible();

      rerender(<Card title="x" id="my card" />);
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('should show title text tooltip', () => {
      const text = 'I am shown when the title text is clicked';
      const { rerender } = render(
        <Card title="my title" id="my card" titleTextTooltip={<p>{text}</p>} />
      );
      expect(screen.getByRole('button')).toHaveClass(`${prefix}--tooltip__label`);
      expect(screen.queryByText(text)).toBeNull();

      userEvent.click(screen.getByRole('button'));
      expect(screen.getByText(text)).toBeVisible();

      rerender(<Card title="my title" id="my card" />);
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('should not prepend the title to the external title text tooltip content if there is no overflow', () => {
      const text = 'I am shown when the title text is clicked';
      render(
        <Card testId="card-test" title="my title" id="my card" titleTextTooltip={<p>{text}</p>} />
      );

      userEvent.click(screen.getByRole('button'));

      const tooltipContent = screen.getByTestId('card-test-title-tooltip');
      expect(tooltipContent).toBeVisible();
      expect(within(tooltipContent).getByText(text)).toBeVisible();
      expect(within(tooltipContent).queryByText('my title')).toBeNull();
    });

    it('should show browser tooltip through the title-attribute', () => {
      const titleText = 'I am the title';
      render(<Card testId="card-test" title={titleText} id="my card" />);
      expect(screen.getByTestId('card-test-title')).toHaveAttribute('title', titleText);
    });

    it('should not show browser tooltip through the title-attribute if prop titleTextTooltip is used', () => {
      const titleText = 'I am the title';
      render(
        <Card testId="card-test" title={titleText} id="my card" titleTextTooltip={<p>test</p>} />
      );
      expect(screen.getByTestId('card-test-title')).not.toHaveAttribute('title', titleText);
    });

    describe('tooltips from overflow', () => {
      const originalOffsetWidth = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetWidth'
      );
      const originalScrollWidth = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'scrollWidth'
      );

      const originalClientWidth = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'clientWidth'
      );

      beforeEach(() => {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
          writable: true,
          configurable: true,
          value: 400,
        });
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
          writable: true,
          configurable: true,
          value: 500,
        });
      });

      afterAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', originalScrollWidth);
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', originalClientWidth);
      });

      it('should prepend the title to the external titleTextTooltip content if the title overflows', () => {
        const aLongTitle =
          'A very very long title which will almost certainly overflow and require a tooltip and we must test these things, you know.';
        render(
          <Card
            testId="card-test"
            {...cardProps}
            title={aLongTitle}
            titleTextTooltip="I am shown when the title text is clicked"
          />
        );
        const tooltipButton = screen.getByRole('button', {
          name: aLongTitle,
        });
        expect(tooltipButton).toBeVisible();
        expect(tooltipButton).toHaveClass(`${iotPrefix}--card--title--text__overflow`);
        userEvent.click(tooltipButton);
        expect(tooltipButton).toHaveAttribute('aria-expanded', 'true');

        const tooltipContent = screen.getByTestId('card-test-title-tooltip');
        expect(within(tooltipContent).getByText(aLongTitle)).toBeVisible();
        expect(
          within(tooltipContent).getByText('I am shown when the title text is clicked')
        ).toBeVisible();
      });

      it('should put the title in a tooltip if it overflows', () => {
        const aLongTitle =
          'A very very long title which will almost certainly overflow and require a tooltip and we must test these things, you know.';
        render(<Card {...cardProps} title={aLongTitle} />);
        const tooltipButton = screen.getByRole('button', {
          name: aLongTitle,
        });
        expect(tooltipButton).toBeVisible();
        expect(tooltipButton).toHaveClass(`${iotPrefix}--card--title--text__overflow`);
        userEvent.click(tooltipButton);
        expect(screen.getByTestId('Card-title-tooltip')).toBeVisible();
        expect(tooltipButton).toHaveAttribute('aria-expanded', 'true');
      });

      it('should remove the tooltip if the title changes to a shorter string', async () => {
        const aLongTitle =
          'A very very long title which will almost certainly overflow and require a tooltip and we must test these things, you know.';

        const aShortTitle = 'A Title';
        const { rerender } = render(<Card {...cardProps} title={aLongTitle} />);
        const tooltipButton = screen.getByRole('button', {
          name: aLongTitle,
        });
        expect(tooltipButton).toBeVisible();
        expect(tooltipButton).toHaveClass(`${iotPrefix}--card--title--text__overflow`);
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
          writable: true,
          configurable: true,
          value: 500,
        });
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
          writable: true,
          configurable: true,
          value: 500,
        });
        rerender(<Card {...cardProps} title={aShortTitle} subtitle="This is subtitle" />);
        expect(screen.getByTestId('Card-title-notip')).toBeVisible();
      });

      it('should put the subtitle in a tooltip if it overflows', () => {
        const aLongSubTitle =
          'A very very long subtitle which will almost certainly overflow and require a tooltip and we must test these things, you know.';
        render(<Card {...cardProps} title="A Very Modest Title" subtitle={aLongSubTitle} />);
        const tooltipButton = screen.getByRole('button', {
          name: aLongSubTitle,
        });
        expect(tooltipButton).toBeVisible();
        expect(tooltipButton).toHaveClass(`${iotPrefix}--card--subtitle--text`);
        userEvent.click(tooltipButton);
        expect(screen.getByTestId('Card-subtitle')).toBeVisible();
        expect(tooltipButton).toHaveAttribute('aria-expanded', 'true');
      });

      it('should display tooltip on card title click', () => {
        const title =
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
        const testId = 'Card-title-tooltip';

        render(
          <Card
            style={{ width: '600px', height: '360px' }}
            title={title}
            subtitle="Lorem ipsum"
            hasTitleWrap
            id="facilitycard-basic"
            size={CARD_SIZES.MEDIUM}
            breakpoint="lg"
          />
        );

        expect(screen.queryByTestId(testId)).toBeNull();

        userEvent.click(screen.getByRole('button', { name: title }));
        expect(screen.getByTestId(testId)).toBeDefined();
        expect(screen.getByTestId(testId)).toBeInTheDocument();

        userEvent.click(document.body);
        expect(screen.queryByTestId(testId)).toBeNull();
      });

      it('should display tooltip on card subtitle click', () => {
        const testId = 'Card-subtitle';
        const subtitle =
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

        render(
          <Card
            style={{ width: '600px', height: '360px' }}
            title="Lorem ipsum"
            subtitle={subtitle}
            hasTitleWrap
            id="facilitycard-basic"
            size={CARD_SIZES.MEDIUM}
            breakpoint="lg"
          />
        );

        expect(screen.queryByTestId(testId)).toBeNull();

        userEvent.click(screen.getByRole('button', { name: subtitle }));
        expect(screen.getByTestId(testId)).toBeDefined();
        expect(screen.getByTestId(testId)).toBeInTheDocument();

        userEvent.click(document.body);
        expect(screen.queryByTestId(testId)).toBeNull();
      });

      it('should display tooltip on card info icon click', () => {
        const testId = 'Card-tooltip';

        render(
          <Card
            style={{ width: '600px', height: '360px' }}
            title="Lorem ipsum"
            subtitle="Lorem ipsum dolor"
            hasTitleWrap
            id="facilitycard-basic"
            size={CARD_SIZES.MEDIUM}
            breakpoint="lg"
            tooltip={<p>this is the external tooltip content</p>}
          />
        );

        expect(screen.queryByTestId(testId)).toBeNull();

        userEvent.click(screen.getByRole('button', { name: 'Tooltip info icon' }));
        expect(screen.getByTestId(testId)).toBeDefined();
        expect(screen.getByTestId(testId)).toBeInTheDocument();

        userEvent.click(document.body);
        expect(screen.queryByTestId(testId)).toBeNull();
      });
    });
  });

  it('should show the short error if a small or smallwide card', () => {
    const { rerender } = render(<Card {...cardProps} size={CARD_SIZES.SMALL} error />);
    expect(screen.getByText('Data error.')).toBeVisible();
    rerender(<Card {...cardProps} size={CARD_SIZES.SMALLWIDE} error />);
    expect(screen.getByText('Data error.')).toBeVisible();
  });

  it('should render the prop locale on a date time picker card', () => {
    render(
      <Card
        title="Card with date picker"
        id="facilitycard-with-date-picker"
        size={CARD_SIZES.MEDIUM}
        isLoading={false}
        isEmpty={false}
        isEditable={false}
        isExpanded={false}
        locale="fr"
        breakpoint="lg"
        availableActions={{
          range: 'iconOnly',
        }}
        timeRangeOptions={{
          last48Hours: { label: 'Last 48 Hours', offset: 48 * 60 },
          last24Hours: { label: 'Last 24 Hours', offset: 24 * 60 },
          last8Hours: { label: 'Last 8 Hours', offset: 8 * 60 },
          last4Hours: { label: 'Last 4 Hours', offset: 4 * 60 },
          last2Hours: { label: 'Last 2 Hours', offset: 2 * 60 },
          lastHour: { label: 'Last Hour', offset: 60 * 60 },
        }}
      />
    );

    userEvent.click(screen.getAllByLabelText('Calendar')[0]);
    userEvent.click(screen.getByText('Custom Range'));
    userEvent.click(screen.getByLabelText('Absolute'));
    expect(screen.getByText('lun')).toBeInTheDocument();
    expect(screen.getByText('mar')).toBeInTheDocument();
    expect(screen.getByText('mer')).toBeInTheDocument();
    expect(screen.getByText('jeu')).toBeInTheDocument();
    expect(screen.getByText('ven')).toBeInTheDocument();
    expect(screen.getByText('sam')).toBeInTheDocument();
    expect(screen.getByText('dim')).toBeInTheDocument();
  });

  it('card extra actions(single/multiple)', async () => {
    const mockExtraSingle = jest.fn();
    const mockExtraMultiple = jest.fn();
    const singleExtraAction = {
      id: 'extrasingleaction',
      icon: Add,
      iconDescription: 'Add',
      callback: mockExtraSingle,
    };
    const singleExtraDisabledAction = {
      id: 'extrasingleaction',
      icon: Add,
      iconDescription: 'Add',
      disabled: true,
      callback: mockExtraSingle,
    };
    const multiExtraAction = {
      id: 'extramultiaction',
      iconDescription: 'Settings',
      children: [
        {
          id: 'firstItem',
          itemText: 'Item1',
          callback: mockExtraMultiple,
        },
        {
          id: 'secondItem',
          itemText: 'Item2',
          callback: mockExtraMultiple,
        },
        {
          id: 'thirdItem',
          itemText: 'Item3',
          disabled: true,
          callback: mockExtraMultiple,
        },
        {
          id: 'fourthItem',
          itemText: 'Item4',
          hidden: true,
          callback: mockExtraMultiple,
        },
      ],
    };

    // Test single icon button action

    // when there is no icon description use the global Action Label
    const { rerender } = render(
      <Card
        {...cardProps}
        size={CARD_SIZES.LARGE}
        extraActions={{ ...singleExtraAction, iconDescription: null }}
        availableActions={{
          extra: true,
        }}
      />
    );
    fireEvent.click(screen.getAllByTitle('Action Label')[0]);
    expect(mockExtraSingle).toHaveBeenCalled();
    jest.resetAllMocks();

    render(
      <Card
        {...cardProps}
        size={CARD_SIZES.LARGE}
        extraActions={singleExtraAction}
        availableActions={{
          extra: true,
        }}
      />
    );
    fireEvent.click(screen.getAllByTitle('Add')[0]);
    expect(mockExtraSingle).toHaveBeenCalled();
    jest.resetAllMocks();

    // Test disabled icon button action
    rerender(
      <Card
        {...cardProps}
        size={CARD_SIZES.LARGE}
        extraActions={singleExtraDisabledAction}
        availableActions={{
          extra: true,
        }}
      />
    );
    expect(screen.getAllByTitle('Add')[0]).toBeDisabled();
    expect(mockExtraSingle).not.toHaveBeenCalled();
    jest.resetAllMocks();

    // Test extra action when card isExpanded
    rerender(
      <Card
        {...cardProps}
        size={CARD_SIZES.LARGE}
        extraActions={singleExtraAction}
        isExpanded
        availableActions={{
          extra: true,
          expand: true,
        }}
      />
    );
    fireEvent.click(screen.getAllByTitle('Add')[0]);
    expect(mockExtraSingle).toHaveBeenCalled();
    jest.resetAllMocks();

    // Test multiple extra actions
    rerender(
      <Card
        {...cardProps}
        size={CARD_SIZES.LARGE}
        extraActions={multiExtraAction}
        availableActions={{
          extra: true,
        }}
      />
    );
    fireEvent.click(screen.getAllByTitle('Settings')[0]);
    let firstItem = await screen.findByText('Item1');
    fireEvent.click(firstItem);
    expect(mockExtraMultiple).toHaveBeenCalled();

    // Reopen menu
    fireEvent.click(screen.getAllByTitle('Settings')[0]);
    mockExtraMultiple.mockClear();
    const secondItem = await screen.findByText('Item2');
    fireEvent.click(secondItem);
    expect(mockExtraMultiple).toHaveBeenCalled();

    // Reopen menu to verify disabled item
    fireEvent.click(screen.getAllByTitle('Settings')[0]);
    const thirdItem = await screen.findByText('Item3');
    expect(thirdItem.closest('button')).toBeDisabled();

    // Reopen menu to verify hidden item
    fireEvent.click(screen.getAllByTitle('Settings')[0]);
    expect(screen.queryByText('Item4')).not.toBeInTheDocument();
    jest.resetAllMocks();

    // when there is no icon description use the global Action Label
    rerender(
      <Card
        {...cardProps}
        size={CARD_SIZES.LARGE}
        extraActions={{ ...multiExtraAction, icon: Tree, iconDescription: null }}
        availableActions={{
          extra: true,
        }}
      />
    );
    fireEvent.click(screen.getAllByTitle('Open and close list of options')[0]);

    firstItem = await screen.findByText('Item1');
    fireEvent.click(firstItem);
    expect(mockExtraMultiple).toHaveBeenCalled();
  });

  it('should not have padding when padding="none"', () => {
    render(<Card {...cardProps} size={CARD_SIZES.SMALL} padding="none" />);
    expect(screen.getByTestId('Card-content')).toHaveClass(
      `${iotPrefix}--card__content--no-padding`
    );
  });

  it('should allow override pattern on empty state', () => {
    const MyErrorMessage = ({ body, title, ...props }) => (
      <div data-testid="my-error-message" title={title} {...props}>
        {body}
      </div>
    );
    render(
      <Card
        size={CARD_SIZES.LARGE}
        padding="none"
        error="an error occurred"
        overrides={{
          errorMessage: {
            component: MyErrorMessage,
            props: {
              className: 'my-custom-class',
            },
          },
        }}
      />
    );

    expect(screen.getByTestId('my-error-message')).toBeVisible();
    expect(screen.getByText('an error occurred')).toBeVisible();
    expect(screen.getByText('an error occurred')).toHaveClass('my-custom-class');
    expect(screen.getByText('an error occurred')).toHaveAttribute('title', 'Data error.');
  });
});
