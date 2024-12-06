import React from 'react';
import { text, select, boolean, object } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Bee } from '@carbon/react/icons';
import { spacing05 } from '@carbon/layout';

import dayjs from '../../utils/dayjs';
import { CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';
import { tableColumns, tableData, actions1 } from '../../utils/sample';

import TableCard from './TableCard';
// import TableCardREADME from './TableCard.mdx'; // carbon 11

export default {
  title: '1 - Watson IoT/Card/TableCard',

  parameters: {
    component: TableCard,
    // docs: {
    //   page: TableCardREADME,
    // }, // carbon 11
  },
};

export const WithMultipleActions = () => {
  const size = select(
    'size',
    [CARD_SIZES.MEDIUM, CARD_SIZES.MEDIUMWIDE, CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE],
    CARD_SIZES.LARGEWIDE
  );
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  const tableDataWithActions = tableData.map((item) => {
    return {
      ...item,
      actions: actions1,
    };
  });
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title={text('title', 'Open Alerts')}
        id="table-list"
        tooltip={text('Tooltip text', "Here's a Tooltip")}
        content={{
          columns: tableColumns,
          showHeader: boolean('showHeader', true),
        }}
        values={boolean('no data', false) ? [] : tableDataWithActions}
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
      />
    </div>
  );
};

WithMultipleActions.storyName = 'with multiple actions';

export const WithLinks = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  const cardVariables = object('cardVariables', {
    assetId: '11112',
    company: 'ibm',
  });
  const tableLinkColumns = [
    {
      dataSourceId: 'pressure',
      label: 'Pressure',
    },
    {
      dataSourceId: 'deviceId',
      label: 'Link',
      linkTemplate: {
        href: text('href', 'https://{company}.com/{assetId}'),
        target: select('target', ['_blank', null], '_blank'),
      },
    },
  ];

  const tableLinkData = tableData.slice(0);
  // eslint-disable-next-line no-return-assign, no-param-reassign
  tableLinkData.forEach((row) => (row.values.deviceId = 'Link'));

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title={text('title', 'Open Alerts {assetId}')}
        id="table-list"
        tooltip={text('Tooltip text', "Here's a Tooltip")}
        content={{
          columns: tableLinkColumns,
          showHeader: boolean('showHeader', true),
        }}
        values={boolean('no data', false) ? [] : tableLinkData}
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
        cardVariables={cardVariables}
      />
    </div>
  );
};

WithLinks.storyName = 'with links and variables';

WithLinks.parameters = {
  info: {
    text: `<p>Links can added by providing a linkTemplate prop to the content.columns[i] property.
              2 additional properties can be configured within the linkTemplate object: href and target</p>
          <p>href is the url the link will use. This property is required.</p>
          <p>target is whether you would like to open the link in a new window or not.
              This property defaults to opening in the current window. Use '_blank' to open in a new window
          </p>
          <p> Note: if using row-specific variables in a TableCard href (ie a variable that has a different value per row),
          do NOT pass the cardVariables prop and be sure that your table has reference to the proper value in another column</p>
`,
  },
};

export const WithThresholdsPrecisionAndExpandedRows = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGEWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  const thresholds = [
    {
      dataSourceId: 'pressure',
      comparison: '>=',
      value: 10,
      severity: 1,
      icon: 'bee',
      color: 'black',
      label: text(
        'content.thresholds[].label (pressure severity critical)',
        'Custom Pressure Severity Header'
      ),
      showSeverityLabel: boolean(
        'content.thresholds[].showSeverityLabel (pressure severity critical)',
        true
      ),
      severityLabel: text('content.thresholds[].severityLabel (pressure severity critical)', ''),
    },
    {
      dataSourceId: 'count',
      comparison: '>=',
      value: 10,
      severity: 1, // High threshold, medium, or low used for sorting and defined filtration
      label: text('content.thresholds[].label (count severity critical)', ''),
      showSeverityLabel: boolean(
        'content.thresholds[].showSeverityLabel (count severity critical)',
        true
      ),
      severityLabel: text(
        'content.thresholds[].severityLabel (count severity critical)',
        'Custom Critical'
      ),
    },
    {
      dataSourceId: 'count',
      comparison: '=',
      value: 7,
      severity: 2, // High threshold, medium, or low used for sorting and defined filtration
      showSeverityLabel: boolean(
        'content.thresholds[].showSeverityLabel (count severity moderate)',
        true
      ),
      severityLabel: text('content.thresholds[].severityLabel (count severity moderate)', ''),
    },
    {
      dataSourceId: 'pressure',
      comparison: '>=',
      value: 10,
      severity: 1,
      label: 'Custom Pressure Severity Header',
      showSeverityLabel: boolean(
        'content.thresholds[].showSeverityLabel (pressure severity critical)',
        true
      ),
      severityLabel: text('content.thresholds[].severityLabel (pressure severity critical)', ''),
    },
  ];

  const tableCustomColumns = tableColumns.map((item) =>
    item.dataSourceId === 'count' ? { ...item, precision: 1 } : { ...item }
  );

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title={text('title', 'Open Alerts')}
        id="table-list"
        tooltip={text('Tooltip text', "Here's a Tooltip")}
        content={{
          columns: tableCustomColumns,
          thresholds,
          expandedRows: [
            {
              id: 'long_description',
              label: 'Description',
            },
            {
              id: 'other_description',
              label: 'Other Description',
            },
            {
              id: 'pressure',
              label: 'Pressure',
            },
            {
              id: 'temperature',
              label: 'Temperature',
            },
          ],
          showHeader: boolean('showHeader', true),
        }}
        values={boolean('no data', false) ? [] : tableData}
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
        renderIconByName={(name, props = {}) =>
          name === 'bee' ? (
            <Bee {...props}>
              <title>{props.title}</title>
            </Bee>
          ) : (
            <span>Unknown</span>
          )
        }
      />
    </div>
  );
};

WithThresholdsPrecisionAndExpandedRows.storyName = 'with thresholds, precision and expanded rows';

export const WithThresholdsOnlyWithIcon = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGEWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  const thresholds = [
    // this threshold is applied to the whole row, not a particular attribute
    {
      dataSourceId: 'count',
      comparison: '<',
      value: 5,
      severity: 3, // High threshold, medium, or low used for sorting and defined filtration
      label: text('content.thresholds[].label (count severity)', ''),
      showSeverityLabel: boolean(
        'content.thresholds[].showSeverityLabel (count severity low)',
        true
      ),
      severityLabel: text('content.thresholds[].severityLabel (count severity low)', ''),
    },
    {
      dataSourceId: 'count',
      comparison: '>=',
      value: 10,
      severity: 1, // High threshold, medium, or low used for sorting and defined filtration
      showSeverityLabel: boolean(
        'content.thresholds[].showSeverityLabel (count severity critical)',
        true
      ),
      severityLabel: text(
        'content.thresholds[].severityLabel (count severity critical)',
        'Custom Critical'
      ),
    },
    {
      dataSourceId: 'count',
      comparison: '=',
      value: 7,
      severity: 2, // High threshold, medium, or low used for sorting and defined filtration
      showSeverityLabel: boolean(
        'content.thresholds[].showSeverityLabel (count severity moderate)',
        true
      ),
      severityLabel: text('content.thresholds[].severityLabel (count severity moderate)', ''),
    },
    {
      dataSourceId: 'pressure',
      comparison: '>=',
      value: 10,
      severity: 1,
      label: text('content.thresholds[].label (pressure)', ''),
      showSeverityLabel: boolean('content.thresholds[].showSeverityLabel (pressure)', true),
      severityLabel: text('content.thresholds[].severityLabel (pressure)', ''),
    },
  ];

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title={text('title', 'Open Alerts')}
        id="table-list"
        tooltip={text('Tooltip text', "Here's a Tooltip")}
        content={{
          columns: [...tableColumns.slice(0, 1), tableColumns[2]],
          thresholds,
          showHeader: boolean('showHeader', true),
        }}
        values={boolean('no data', false) ? [] : tableData}
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
      />
    </div>
  );
};

WithThresholdsOnlyWithIcon.storyName = 'with thresholds only with icon';

WithThresholdsOnlyWithIcon.parameters = {
  info: {
    text: `
      If you don't pass the underlying 'pressure' or 'count' column we will show the threshold icon columns at the right of the table
    `,
  },
};

export const WithMatchingThresholds = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');
  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title={text('title', 'Open Alerts')}
        id="table-list"
        tooltip={text('Tooltip text', "Here's a Tooltip")}
        content={{
          columns: tableColumns,
          expandedRows: [{}],
          thresholds: [
            {
              dataSourceId: 'count',
              comparison: '>',
              value: 0,
              severity: 3,
              label: text('content.thresholds[].label (count severity low)', ''),
              showSeverityLabel: boolean(
                'content.thresholds[].showSeverityLabel (count severity low)',
                true
              ),
              severityLabel: text('content.thresholds[].severityLabel (count severity low)', ''),
            },
            {
              dataSourceId: 'count',
              comparison: '>',
              value: 2,
              severity: 1,
              showSeverityLabel: boolean(
                'content.thresholds[].showSeverityLabel (count severity critical)',
                true
              ),
              severityLabel: text(
                'content.thresholds[].severityLabel (count severity critical)',
                ''
              ),
            },
          ],
          showHeader: boolean('showHeader', true),
        }}
        values={
          boolean('no data', false) ? [] : tableData.map((i) => ({ id: i.id, values: i.values }))
        }
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
      />
    </div>
  );
};

WithMatchingThresholds.storyName = 'with matching thresholds';

export const WithCustomColumnWidthAndSort = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGEWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  const tableCustomColumns = tableColumns.map((item) =>
    item.dataSourceId === 'count' ? { ...item, sort: 'DESC', width: 250 } : item
  );

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title={text('title', 'Open Alerts')}
        id="table-list"
        tooltip={text('Tooltip text', "Here's a Tooltip")}
        content={{
          columns: tableCustomColumns,
          showHeader: boolean('showHeader', true),
        }}
        values={boolean('no data', false) ? [] : tableData}
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
      />
    </div>
  );
};

WithCustomColumnWidthAndSort.storyName = 'with custom column width and sort';

export const WithRowExpansionAndRowSpecificLinkVariables = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title="Open Alerts"
        id="table-list"
        tooltip="Here's a Tooltip"
        content={{
          columns: tableColumns,
          expandedRows: [
            {
              id: 'long_description',
              label: 'Description',
              linkTemplate: {
                href: text('href', 'http://ibm.com/{pressure}'),
              },
            },
            {
              id: 'other_description',
              label: 'Other content to show',
            },
            {
              id: 'hour',
              label: 'Time',
              type: 'TIMESTAMP',
            },
          ],
          showHeader: boolean('showHeader', true),
        }}
        values={boolean('no data', false) ? [] : tableData}
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
      />
    </div>
  );
};

WithRowExpansionAndRowSpecificLinkVariables.storyName =
  'with row expansion, row specific link variables, and timestamp';

WithRowExpansionAndRowSpecificLinkVariables.parameters = {
  info: {
    text: ` # Passing variables
  To pass a variable into your card, identify a variable to be used by wrapping it in curly brackets.
  Make sure you have added a prop called 'cardVariables' to your card that is an object with key value pairs such that the key is the variable name and the value is the value to replace it with.
  Optionally you may use a callback as the cardVariables value that will be given the variable and the card as arguments.
  Note: if using row-specific variables in a TableCard href (ie a variable that has a different value per row),
        do NOT pass the cardVariables prop and be sure that your table has reference to the proper value in another column
  `,
  },
};

export const NoRowActions = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title={text('title', 'Open Alerts')}
        id="table-list"
        tooltip={text('Tooltip text', "Here's a Tooltip")}
        content={{
          columns: tableColumns,
          showHeader: boolean('showHeader', true),
        }}
        values={
          boolean('no data', false) ? [] : tableData.map((i) => ({ id: i.id, values: i.values }))
        }
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
      />
    </div>
  );
};

NoRowActions.storyName = 'no row actions';

export const Editable = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title={text('title', 'Open Alerts')}
        id="table-list"
        tooltip={text('Tooltip text', "Here's a Tooltip")}
        content={{
          columns: tableColumns,
          showHeader: boolean('showHeader', true),
        }}
        isEditable
        availableActions={{ edit: true, clone: true, delete: true }}
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
      />
    </div>
  );
};

Editable.storyName = 'editable';

export const WithCustomFilters = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGEWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  const tableColumnsWithCustomFilters = tableColumns.map((column) =>
    column.type !== 'TIMESTAMP'
      ? column
      : {
          ...column,
          filter: {
            ...column.filter,
            filterFunction: (cellValue, filterValue) => {
              const dateString = dayjs(cellValue).format('L HH:mm');
              return dateString.includes(filterValue);
            },
          },
        }
  );

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title="Open Alerts"
        content={{
          columns: tableColumnsWithCustomFilters,
          showHeader: boolean('showHeader', false),
        }}
        values={boolean('no data', false) ? [] : tableData}
        filters={[{ columnId: 'alert', value: 'failure' }]}
        size={CARD_SIZES.LARGEWIDE}
        i18n={{
          clearAllFilters: '__Clear all filters__',
        }}
      />
    </div>
  );
};

WithCustomFilters.storyName = 'with custom filters';

export const NoRangeInToolbar = () => {
  const size = select('size', [CARD_SIZES.LARGE, CARD_SIZES.LARGEWIDE], CARD_SIZES.LARGEWIDE);
  const breakpoint = select('breakpoint', ['lg', 'md', 'sm', 'xs'], 'lg');

  return (
    <div
      style={{
        width: `${getCardMinSize(breakpoint, size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TableCard
        title="Open Alerts"
        id="table-list"
        tooltip="Here's a Tooltip"
        content={{
          columns: tableColumns,
          expandedRows: [
            {
              id: 'long_description',
              label: 'Description',
              linkTemplate: {
                href: text('href', 'http://ibm.com/{pressure}'),
              },
            },
            {
              id: 'other_description',
              label: 'Other content to show',
            },
            {
              id: 'hour',
              label: 'Time',
              type: 'TIMESTAMP',
            },
          ],
        }}
        values={tableData}
        onCardAction={action('onCardAction')}
        size={size}
        isLoading={boolean('isLoading', false)}
        availableActions={{ range: false }}
      />
    </div>
  );
};

NoRangeInToolbar.storyName = 'No range in toolbar';
