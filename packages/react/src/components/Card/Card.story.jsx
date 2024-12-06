import React from 'react';
import { text, select, boolean, object, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Tree, Add } from '@carbon/react/icons';
import { ContentSwitcher } from '@carbon/react';

import { settings } from '../../constants/Settings';
import { CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';
import Table from '../Table/Table';
import Button from '../Button';
import IconSwitch from '../IconSwitch/IconSwitch';
import { INTERVAL_VALUES, RELATIVE_VALUES, PICKER_KINDS } from '../../constants/DateConstants';

// import CardREADME from './Card.mdx'; carbon 11
import Card from './Card';

const { prefix } = settings;

export const getDataStateProp = () => ({
  label: text('dataState.label', 'No data available for this score at this time'),
  description: text(
    'dataState.description',
    'The last successful score was 68 at 13:21 - 10/21/2019 but wait, there is more, according to the latest test results this line is too long.'
  ),
  extraTooltipText: text(
    'dataState.extraTooltipText',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  ),
  learnMoreElement: (
    <a className={`${prefix}--link`} href="#top">
      Learn more
    </a>
  ),
});

export default {
  title: '1 - Watson IoT/Card/Card',

  parameters: {
    component: Card,
    // docs: {
    //   page: CardREADME,
    // },
  },

  excludeStories: ['getDataStateProp'],
};

const CardStoryStateManager = ({ children }) => {
  const [selected, setSelected] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const handleClick = (e) => {
    setSelected(true);
    action('onClick')(e);
  };
  const handleBlur = (e) => {
    if (
      !e.currentTarget.contains(e.relatedTarget) ||
      (e.target === e.currentTarget && e.relatedTarget === null)
    ) {
      setSelected(false);
    }
    action('onBlur')(e);
  };

  const handleCardAction = (cardId, cardAction) => {
    if (cardAction === 'OPEN_EXPANDED_CARD') {
      setExpanded(true);
    }

    if (cardAction === 'CLOSE_EXPANDED_CARD') {
      setExpanded(false);
    }

    action('onCardAction')(cardId, cardAction);
  };

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      ...child.props,
      onClick: handleClick,
      onBlur: handleBlur,
      isSelected: selected,
      isExpanded: expanded,
      onCardAction: handleCardAction,
    });
  });
};

export const Basic = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: 20,
      }}
    >
      <CardStoryStateManager>
        <Card
          title={text('title', 'Card title')}
          id="facilitycard-basic"
          size={size}
          isLoading={boolean('isloading', false)}
          isEmpty={boolean('isEmpty', false)}
          isEditable={boolean('isEditable', false)}
          breakpoint={breakpoint}
          availableActions={object('availableActions', {
            range: true,
            expand: true,
            edit: true,
            clone: false,
            delete: false,
          })}
          renderExpandIcon={Tree}
          onFocus={action('onFocus')}
          tabIndex={0}
          padding={select(
            'Apply padding to the card content or not (padding)',
            ['default', 'none'],
            'default'
          )}
        />
      </CardStoryStateManager>
    </div>
  );
};

Basic.storyName = 'basic stateful example with custom expand icon';

export const WithEllipsedTitleTooltipExternalTooltip = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  const extraaction = select('extra actions', ['Single', 'Multiple'], 'Single');
  const singleExtraAction = {
    id: 'extrasingleaction',
    icon: Add,
    iconDescription: 'Add',
    callback: action('extra single action icon clicked.'),
  };
  const multiExtraAction = object('Multiple extra action', {
    id: 'extramultiaction',
    iconDescription: 'Settings',
    children: [
      {
        id: 'firstItem',
        itemText: 'Item1',
        callback: action('extra three dot action item1 clicked.'),
      },
      {
        id: 'secondItem',
        itemText: 'Item2',
        callback: action('extra three dot action item2 clicked.'),
      },
      {
        id: 'thirdItem',
        itemText: 'Item3',
        disabled: true,
        callback: action('extra three dot action item3 clicked.'),
      },
      {
        id: 'fourthItem',
        itemText: 'Item4',
        hidden: true,
        callback: action('extra three dot action item4 clicked.'),
      },
    ],
  });
  const demoTitleTextTooltip = boolean('demo title text tooltip (titleTextTooltip)', false);
  const demoIconTooltip = boolean('demo info icon tooltip (tooltip)', true);
  const hasTitleWrap = demoTitleTextTooltip ? false : boolean('wrap title', true);

  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <Card
        title={text(
          'title',
          'Card Title that should be truncated and presented in a tooltip while the cards also has an external tooltip.'
        )}
        subtitle={select(
          'subtitle',
          ['lorem ipsum lorem ipsum santi spiritu sanctum sentorum isabella luccesse', undefined],
          'lorem ipsum lorem ipsum santi spiritu sanctum sentorum isabella luccesse'
        )}
        hasTitleWrap={hasTitleWrap}
        id="facilitycard-basic"
        size={size}
        isLoading={boolean('isloading', false)}
        isEmpty={boolean('isEmpty', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        breakpoint={breakpoint}
        availableActions={object('availableActions', {
          range: false,
          expand: true,
          edit: false,
          clone: true,
          delete: true,
          extra: true,
        })}
        onCardAction={action('onCardAction')}
        onFocus={action('onFocus')}
        onBlur={action('onBlur')}
        onClick={action('onClick')}
        tabIndex={0}
        footerContent={() => (
          <Button size="md" kind="ghost">
            Footer Content
          </Button>
        )}
        tooltip={demoIconTooltip ? <p>this is the external tooltip content</p> : undefined}
        titleTextTooltip={
          demoTitleTextTooltip ? (
            <>
              <p>This is the external tooltip definition shown when the title is clicked</p>
              <Button style={{ marginTop: '16px' }} onClick={action('tooltip button clicked')}>
                Take action
              </Button>
            </>
          ) : undefined
        }
        extraActions={extraaction === 'Single' ? singleExtraAction : multiExtraAction}
      />
    </div>
  );
};

WithEllipsedTitleTooltipExternalTooltip.storyName =
  'with ellipsed title tooltip & external tooltip';

export const BasicWithRenderProp = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <Card
        title={text('title', 'Card with render prop')}
        id="facilitycard-basic"
        size={size}
        isLoading={boolean('isloading', false)}
        isEmpty={boolean('isEmpty', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        breakpoint={breakpoint}
        availableActions={object('availableActions', {
          range: true,
          expand: true,
          edit: true,
          clone: false,
          delete: false,
        })}
        onCardAction={action('onCardAction')}
        onFocus={action('onFocus')}
        onBlur={action('onBlur')}
        onClick={action('onClick')}
        tabIndex={0}
        footerContent={() => (
          <Button size="md" kind="ghost">
            Footer Content
          </Button>
        )}
      >
        {(childSize) => (
          <p>
            Content width is {childSize.width} and height is {childSize.height}
          </p>
        )}
      </Card>
    </div>
  );
};

BasicWithRenderProp.storyName = 'with render prop';

export const WithCustomRangeSelector = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <Card
        title={text('title', 'Card Title')}
        id="facilitycard-with-loading"
        size={size}
        isLoading={boolean('isLoading', false)}
        isEmpty={boolean('isEmpty', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        breakpoint="lg"
        onCardAction={action('onCardAction')}
        availableActions={{
          range: true,
        }}
        timeRangeOptions={object('timeRangeOptions', {
          last8Hours: 'Last 8 Hours',
          last4Hours: 'Last 4 Hours',
          last2Hours: 'Last 2 Hours',
          lastHour: 'Last Hour',
          this8Hours: 'This 8 Hours',
          this4Hours: 'This 4 Hours',
          this2Hours: 'This 2 Hours',
          thisHour: 'This Hour',
        })}
      />
    </div>
  );
};

WithCustomRangeSelector.storyName = 'with custom range selector';

export const WithDateTimePickerRangeSelector = () => {
  const dateTimePickerSetting = select('range', [true, false], true);
  return (
    <div style={{ width: text(`card width`, '300px'), margin: 20 }}>
      <Card
        title="Card with date picker"
        id="facilitycard-with-date-picker"
        size={CARD_SIZES.MEDIUM}
        isLoading={false}
        isEmpty={false}
        isEditable={false}
        isExpanded={false}
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        breakpoint="lg"
        onCardAction={action('onCardAction')}
        availableActions={{
          range: dateTimePickerSetting,
        }}
        timeRangeOptions={object('timeRangeOptions', {
          last48Hours: { label: 'Last 48 Hours', offset: 48 * 60 },
          last24Hours: { label: 'Last 24 Hours', offset: 24 * 60 },
          last8Hours: { label: 'Last 8 Hours', offset: 8 * 60 },
          last4Hours: { label: 'Last 4 Hours', offset: 4 * 60 },
          last2Hours: { label: 'Last 2 Hours', offset: 2 * 60 },
          lastHour: { label: 'Last Hour', offset: 60 * 60 },
        })}
      />
    </div>
  );
};

WithDateTimePickerRangeSelector.storyName = 'with datetimepicker range selector';

export const WithDateTimePickerRangeSelectorExistingValue = () => {
  const defaultRelativeValue = {
    timeRangeKind: PICKER_KINDS.RELATIVE,
    timeRangeValue: {
      lastNumber: 20,
      lastInterval: INTERVAL_VALUES.MINUTES,
      relativeToWhen: RELATIVE_VALUES.TODAY,
      relativeToTime: '13:30',
    },
  };
  const dateTimePickerSetting = select('range', [true, false], true);
  return (
    <div style={{ width: `400px`, margin: 20 }}>
      <Card
        title={text('title', 'Card Title')}
        id="facilitycard-with-datepicker-existing-value"
        size={CARD_SIZES.MEDIUM}
        isLoading={false}
        isEmpty={false}
        isEditable={false}
        isExpanded={false}
        breakpoint="lg"
        locale={select('locale', ['fr', 'en', 'es', 'de'], 'en')}
        onCardAction={action('onCardAction')}
        availableActions={{
          range: dateTimePickerSetting,
        }}
        timeRange={defaultRelativeValue}
        timeRangeOptions={object('timeRangeOptions', {
          last48Hours: { id: 'last48Hours', label: 'Last 48 Hours', offset: 48 * 60 },
          last24Hours: { id: 'last24Hours', label: 'Last 24 Hours', offset: 24 * 60 },
          last8Hours: { id: 'last8Hours', label: 'Last 8 Hours', offset: 8 * 60 },
          last4Hours: { id: 'last4Hours', label: 'Last 4 Hours', offset: 4 * 60 },
          last2Hours: { id: 'last2Hours', label: 'Last 2 Hours', offset: 2 * 60 },
          lastHour: { id: 'lastHour', label: 'Last Hour', offset: 60 },
        })}
      />
    </div>
  );
};

WithDateTimePickerRangeSelectorExistingValue.storyName =
  'with datetimepicker range selector with existing value';

export const SizeGallery = () => {
  return Object.keys(CARD_SIZES).map((i) => (
    <React.Fragment key={`card-${i}`}>
      <h3>{i}</h3>
      <div
        style={{
          width: `${getCardMinSize('lg', CARD_SIZES[i]).x}px`,
          margin: 20,
        }}
      >
        <Card
          title={text('title', 'Card Title')}
          id={`facilitycard-size-gallery-${i}`}
          size={CARD_SIZES[i]}
          isLoading={boolean('isLoading', false)}
          isEmpty={boolean('isEmpty', true)}
          isEditable={boolean('isEditable', false)}
          isExpanded={boolean('isExpanded', false)}
          breakpoint="lg"
          availableActions={{ range: i !== CARD_SIZES.SMALL }}
          onCardAction={action('onCardAction')}
        />
      </div>
    </React.Fragment>
  ));
};

SizeGallery.storyName = 'size gallery';

export const Error = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <Card
        title={text('title', 'Card Title')}
        id="facilitycard-error"
        size={size}
        error={text('error', 'API threw Nullpointer')}
        isLoading={boolean('isLoading', false)}
        breakpoint="lg"
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

Error.storyName = 'with error';

export const EmptyStatWithFooter = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <Card
        title={text('title', 'Card with render prop')}
        id="facilitycard-basic"
        size={size}
        isLoading={boolean('isloading', false)}
        isEmpty={boolean('isEmpty', true)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        breakpoint={breakpoint}
        availableActions={object('availableActions', {
          range: true,
          expand: true,
          edit: true,
          clone: false,
          delete: false,
        })}
        onCardAction={action('onCardAction')}
        onFocus={action('onFocus')}
        onBlur={action('onBlur')}
        onClick={action('onClick')}
        tabIndex={0}
        footerContent={() => (
          <Button size="sm" kind="ghost">
            Footer Content
          </Button>
        )}
      />
    </div>
  );
};

EmptyStatWithFooter.storyName = 'empty state with footer';

export const CardWithChartTypeMeter = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <Card
        title={text('title', 'Card with render prop')}
        id="facilitycard-basic"
        size={size}
        isLoading={boolean('isloading', false)}
        isEmpty={boolean('isEmpty', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        breakpoint={breakpoint}
        availableActions={object('availableActions', {
          range: false,
          expand: true,
          edit: false,
          clone: false,
          delete: false,
        })}
        onCardAction={action('onCardAction')}
        onFocus={action('onFocus')}
        onBlur={action('onBlur')}
        onClick={action('onClick')}
        tabIndex={0}
        footerContent={() => (
          <Button size="sm" kind="ghost">
            Footer Content
          </Button>
        )}
        type={text('type', 'METER_CHART')}
        data={object('data', [
          {
            group: 'Install',
            value: 100,
          },
          {
            group: 'Limited users',
            value: 200,
          },
          {
            group: 'Base users',
            value: 300,
          },
          {
            group: 'Premium users',
            value: 200,
          },
          {
            group: 'Cron tasks',
            value: 100,
          },
          {
            group: 'Reports',
            value: 150,
          },
        ])}
        content={{
          peak: number('content.peak', 2000),
          meterTotal: number('content.meterTotal', 1000),
          meterUnit: text('content.meterUnit', 'AppPoints'),
          totalFormatter: (total) => text('content.totalFormatter', `${total} custom formatter`),
          color: {
            pairing: {
              option: 5,
            },
          },
          legendPosition: 'top',
          status: object('content.status', {
            success: [0, 300],
            warning: [300, 900],
            danger: [900, 2000],
          }),
        }}
      />
    </div>
  );
};

CardWithChartTypeMeter.storyName = 'card with type prop - meter chart';

export const CardWithChartTypeSparkline = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <Card
        title={text('title', 'Card with render prop')}
        id="facilitycard-basic"
        size={size}
        isLoading={boolean('isloading', false)}
        isEmpty={boolean('isEmpty', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        breakpoint={breakpoint}
        availableActions={object('availableActions', {
          range: false,
          expand: true,
          edit: false,
          clone: false,
          delete: false,
        })}
        onCardAction={action('onCardAction')}
        onFocus={action('onFocus')}
        onBlur={action('onBlur')}
        onClick={action('onClick')}
        tabIndex={0}
        footerContent={() => (
          <Button size="sm" kind="ghost">
            Footer Content
          </Button>
        )}
        type={text('type', 'SPARKLINE_CHART')}
        data={object('data', [
          {
            group: 'Dataset 1',
            date: 1558453860000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558453920000,
            value: 5,
          },
          {
            group: 'Dataset 1',
            date: 1558453980000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454040000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454100000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454160000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454280000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454340000,
            value: 6,
          },
          {
            group: 'Dataset 1',
            date: 1558454460000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454520000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454580000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454640000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558454700000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454760000,
            value: 2,
          },
          {
            group: 'Dataset 1',
            date: 1558454820000,
            value: 4,
          },
          {
            group: 'Dataset 1',
            date: 1558454880000,
            value: 1,
          },
          {
            group: 'Dataset 1',
            date: 1558454940000,
            value: 1,
          },
          {
            group: 'Dataset 1',
            date: 1558455000000,
            value: 3,
          },
          {
            group: 'Dataset 1',
            date: 1558455060000,
            value: 2,
          },
        ])}
        content={{
          xLabel: text('content.xLabel', 'xlabel prop'),
          yLabel: text('content.yLabel', 'y label prop'),
          xProperty: text('content.xProperty', 'date'),
          yProperty: text('content.yProperty', 'value'),
          color: {
            pairing: {
              option: 4,
            },
            gradient: {
              enabled: true,
            },
          },
          listContent: object('content.listContent', [
            { label: 'Target', value: 1000 },
            { label: 'Mean', value: 756 },
            { label: 'Peak', value: 1045 },
          ]),
        }}
      />
    </div>
  );
};

CardWithChartTypeSparkline.storyName = 'card with type prop - sparkline chart';

export const CardWithChartTypeStackedArea = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <Card
        title={text('title', 'Card with render prop')}
        id="facilitycard-basic"
        size={size}
        isLoading={boolean('isloading', false)}
        isEmpty={boolean('isEmpty', false)}
        isEditable={boolean('isEditable', false)}
        isExpanded={boolean('isExpanded', false)}
        breakpoint={breakpoint}
        availableActions={object('availableActions', {
          range: false,
          expand: true,
          edit: false,
          clone: false,
          delete: false,
        })}
        onCardAction={action('onCardAction')}
        onFocus={action('onFocus')}
        onBlur={action('onBlur')}
        onClick={action('onClick')}
        tabIndex={0}
        footerContent={() => (
          <Button size="sm" kind="ghost">
            Footer Content
          </Button>
        )}
        type={text('type', 'STACKED_AREA_CHART')}
        data={object('data', [
          {
            group: 'Dummy',
            date: '2019-01-01T02:00:00.000Z',
            value: 10000,
          },

          {
            group: 'Dummy 2',
            date: '2019-01-05T02:00:00.000Z',
            value: 65000,
          },
          {
            group: 'Dummy 3',
            date: '2019-01-05T02:00:00.000Z',
            value: 65000,
          },
          {
            group: 'Dummy',
            date: '2019-01-02T02:00:00.000Z',
            value: 50400,
          },

          {
            group: 'Dummy 2',
            date: '2019-01-03T02:00:00.000Z',
            value: 32200,
          },
          {
            group: 'Dummy 3',
            date: '2019-01-07T02:00:00.000Z',
            value: 59293,
          },
        ])}
        content={{
          xLabel: text('content.xLabel', 'xlabel prop'),
          yLabel: text('content.yLabel', 'y label prop'),
          xProperty: text('content.xProperty', 'date'),
          yProperty: text('content.yProperty', 'value'),
          color: {
            pairing: {
              option: 4,
            },
          },
        }}
      />
    </div>
  );
};

CardWithChartTypeStackedArea.storyName = 'card with type prop - stacked are chart';

export const ImplementingACustomCard = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const isEditable = boolean('isEditable', false);
  const title = text('title', 'Custom Card Title');
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div style={{ width: `${getCardMinSize(breakpoint, size).x}px`, margin: 20 }}>
      <Card
        title={title}
        id="mycard"
        size={size}
        values={[{ timestamp: 12341231231, value1: 'my value' }]}
        availableActions={{ range: size !== CARD_SIZES.SMALL, expand: true }}
        onCardAction={action('onCardAction')}
        hideHeader
        padding={select(
          'Apply padding to the card content or not (padding)',
          ['default', 'none'],
          'none'
        )}
      >
        {!isEditable
          ? (_$, { cardToolbar, values }) => (
              <Table
                id="my table"
                secondaryTitle={title}
                columns={[
                  {
                    id: 'value1',
                    name: 'String',
                    filter: { placeholderText: 'enter a string' },
                  },
                  {
                    id: 'timestamp',
                    name: 'Date',
                    filter: { placeholderText: 'enter a date' },
                  },
                ]}
                data={values.map((value, index) => ({
                  id: `rowid-${index}`,
                  values: value,
                }))}
                view={{ toolbar: { customToolbarContent: cardToolbar } }}
              />
            )
          : 'Fake Sample Data'}
      </Card>
    </div>
  );
};

ImplementingACustomCard.storyName = 'implementing a custom card';

ImplementingACustomCard.parameters = {
  inline: true,
  source: true,
  info: {
    text: `
  To develop a custom card component.
   - Create a new card component that uses the base Card component
   - See the simple SampleCustomCard in the source code of this story for an example
   - If you want to hide the title/toolbar, do not pass a title prop
   - (Optionally, if you want to use the card in a Dashboard) Extend the Card Renderer so the Dashboard knows how to render your card type
   - (Optionally, if you want to use the card in a Dashboard) Create a validator for this card type within "utils/schemas/validators" and add it to the validateDashboardJSON function used to validate dashboards on import.

   ## Data flow for a card in the dashboard
   All data loading for a card goes through the dashboard's onFetchData function.  There are two ways to trigger a refetch of data for a card.  The first is to directly interact
   with the Card's range controls.  The second is for the Dashboard to trigger that all of the cards need a reload by updating it's isLoading bit.  The CardRenderer component will call the onSetupCard function of the dashboard first
   for each card (if it exists), then will call the onFetchData function for the dashboard.
   `,
  },
};

export const BasicWithCustomAction = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: 20,
      }}
    >
      <CardStoryStateManager>
        <Card
          title={text('title', 'Card title')}
          id="facilitycard-basic"
          size={size}
          isLoading={boolean('isloading', false)}
          isEmpty={boolean('isEmpty', false)}
          isEditable={boolean('isEditable', false)}
          breakpoint={breakpoint}
          availableActions={object('availableActions', {
            range: false,
            expand: false,
            edit: false,
            clone: false,
            delete: false,
            extra: true,
          })}
          renderExpandIcon={Tree}
          onFocus={action('onFocus')}
          tabIndex={0}
          padding={select(
            'Apply padding to the card content or not (padding)',
            ['default', 'none'],
            'default'
          )}
          footerContent={() => (
            <Button size="md" kind="ghost">
              Footer Content
            </Button>
          )}
          extraActions={{
            id: 'switcherLink',
            content: (
              <ContentSwitcher
                onChange={action('onChangeSwitcher')}
                selectedIndex={0}
                style={{ height: 'auto' }}
              >
                <IconSwitch
                  name="one"
                  onClick={action('Tree icon')}
                  text="Graphical View"
                  renderIcon={Tree}
                  size="small"
                />
                <IconSwitch
                  name="two"
                  onClick={action('Add icon')}
                  text="Source View"
                  renderIcon={Add}
                  size="small"
                />
              </ContentSwitcher>
            ),
          }}
        />
      </CardStoryStateManager>
    </div>
  );
};

BasicWithCustomAction.storyName = 'basic example with custom actions';
