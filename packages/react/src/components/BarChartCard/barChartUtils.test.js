/* eslint-disable no-useless-escape */
import { barChartData } from '../../utils/barChartDataSample';
import { BAR_CHART_LAYOUTS, BAR_CHART_TYPES, CARD_SIZES } from '../../constants/LayoutConstants';
import { CHART_COLORS } from '../../constants/CardPropTypes';

import {
  mapValuesToAxes,
  formatChartData,
  formatColors,
  generateTableColumns,
  formatTableData,
  handleTooltip,
  getMaxTicksPerSize,
  generateSampleValues,
  generateSampleValuesForEditor,
} from './barChartUtils';

describe('barChartUtils', () => {
  const formattedTimebasedChartData = [
    {
      date: new Date('2020-02-09T16:23:45.000Z'),
      group: 'Particles',
      key: 1581265425000,
      value: 447,
    },
    {
      date: new Date('2020-02-09T16:23:45.000Z'),
      group: 'Emissions',
      key: 1581265425000,
      value: 120,
    },
    {
      date: new Date('2020-02-10T16:23:45.000Z'),
      group: 'Particles',
      key: 1581351825000,
      value: 450,
    },
    {
      date: new Date('2020-02-10T16:23:45.000Z'),
      group: 'Emissions',
      key: 1581351825000,
      value: 150,
    },
    {
      date: new Date('2020-02-11T16:23:45.000Z'),
      group: 'Particles',
      key: 1581438225000,
      value: 512,
    },
    {
      date: new Date('2020-02-11T16:23:45.000Z'),
      group: 'Emissions',
      key: 1581438225000,
      value: 170,
    },
    {
      date: new Date('2020-02-12T16:23:45.000Z'),
      group: 'Particles',
      key: 1581524625000,
      value: 565,
    },
    {
      date: new Date('2020-02-12T16:23:45.000Z'),
      group: 'Emissions',
      key: 1581524625000,
      value: 200,
    },
  ];

  it('mapValuesToAxes returns axes for non-timebased group charts ', () => {
    // check horizontal layout
    expect(
      mapValuesToAxes(BAR_CHART_LAYOUTS.HORIZONTAL, 'city', null, BAR_CHART_TYPES.GROUPED)
    ).toEqual({
      bottomAxesMapsTo: 'value',
      leftAxesMapsTo: 'key',
    });
    // check vertical layout
    expect(
      mapValuesToAxes(BAR_CHART_LAYOUTS.VERTICAL, 'city', null, BAR_CHART_TYPES.GROUPED)
    ).toEqual({
      bottomAxesMapsTo: 'key',
      leftAxesMapsTo: 'value',
    });
  });

  it('mapValuesToAxes returns axes for timebased group charts ', () => {
    // check horizontal layout
    expect(
      mapValuesToAxes(BAR_CHART_LAYOUTS.HORIZONTAL, 'city', 'timestamp', BAR_CHART_TYPES.GROUPED)
    ).toEqual({
      bottomAxesMapsTo: 'value',
      leftAxesMapsTo: 'date',
    });
    // check vertical layout
    expect(
      mapValuesToAxes(BAR_CHART_LAYOUTS.VERTICAL, 'city', 'timestamp', BAR_CHART_TYPES.GROUPED)
    ).toEqual({
      bottomAxesMapsTo: 'date',
      leftAxesMapsTo: 'value',
    });
  });

  it('mapValuesToAxes returns axes for non-timebased and non-group charts AKA simple', () => {
    // check horizontal layout
    expect(
      mapValuesToAxes(BAR_CHART_LAYOUTS.HORIZONTAL, null, null, BAR_CHART_TYPES.SIMPLE)
    ).toEqual({
      bottomAxesMapsTo: 'value',
      leftAxesMapsTo: 'group',
    });
    // check vertical layout
    expect(mapValuesToAxes(BAR_CHART_LAYOUTS.VERTICAL, null, null, BAR_CHART_TYPES.SIMPLE)).toEqual(
      {
        bottomAxesMapsTo: 'group',
        leftAxesMapsTo: 'value',
      }
    );
  });

  it('formatChartData handles null values', () => {
    const series = [
      {
        dataSourceId: 'particles',
        label: 'Particles',
      },
    ];
    // check horizontal layout
    expect(formatChartData(series, null, 'city', null, BAR_CHART_TYPES.GROUPED)).toEqual([]);
  });

  it('formatChartData returns formatted data for group-based chart', () => {
    const series = [
      {
        dataSourceId: 'particles',
        label: 'Particles',
      },
    ];
    // check horizontal layout
    expect(
      formatChartData(
        series,
        barChartData.quarters.filter((a) => a.quarter === '2020-Q3'),
        'city',
        null,
        BAR_CHART_TYPES.GROUPED
      )
    ).toEqual([
      {
        group: 'Particles',
        key: 'Amsterdam',
        value: 512,
      },
      {
        group: 'Particles',
        key: 'New York',
        value: 442,
      },
      {
        group: 'Particles',
        key: 'Bangkok',
        value: 397,
      },
      {
        group: 'Particles',
        key: 'San Francisco',
        value: 270,
      },
    ]);
    expect(formatChartData(series, null, 'city', null, BAR_CHART_TYPES.GROUPED)).toEqual([]);
  });

  it('formatChartData returns formatted data for time-based and group-based chart', () => {
    const series = [
      {
        dataSourceId: 'particles',
        label: 'Particles',
      },
      {
        dataSourceId: 'emissions',
        label: 'Emissions',
      },
    ];
    // check horizontal layout
    expect(
      formatChartData(
        series,
        barChartData.timestamps.filter((t) => t.city === 'Amsterdam'),
        null,
        'timestamp',
        BAR_CHART_TYPES.STACKED
      )
    ).toEqual([
      {
        date: new Date('2020-02-09T16:23:45.000Z'),
        group: 'Particles',
        key: 1581265425000,
        value: 447,
      },
      {
        date: new Date('2020-02-09T16:23:45.000Z'),
        group: 'Emissions',
        key: 1581265425000,
        value: 120,
      },
      {
        date: new Date('2020-02-10T16:23:45.000Z'),
        group: 'Particles',
        key: 1581351825000,
        value: 450,
      },
      {
        date: new Date('2020-02-10T16:23:45.000Z'),
        group: 'Emissions',
        key: 1581351825000,
        value: 150,
      },
      {
        date: new Date('2020-02-11T16:23:45.000Z'),
        group: 'Particles',
        key: 1581438225000,
        value: 512,
      },
      {
        date: new Date('2020-02-11T16:23:45.000Z'),
        group: 'Emissions',
        key: 1581438225000,
        value: 170,
      },
      {
        date: new Date('2020-02-12T16:23:45.000Z'),
        group: 'Particles',
        key: 1581524625000,
        value: 565,
      },
      {
        date: new Date('2020-02-12T16:23:45.000Z'),
        group: 'Emissions',
        key: 1581524625000,
        value: 200,
      },
    ]);

    // Handle nulls
    expect(formatChartData(series, null, null, 'timestamp', BAR_CHART_TYPES.STACKED)).toEqual([]);
  });

  it('formatChartData returns formatted data for simple, non-time and non-group chart', () => {
    const series = [
      {
        dataSourceId: 'particles',
      },
    ];
    // check horizontal layout
    expect(
      formatChartData(
        series,
        barChartData.quarters.filter((q) => q.quarter === '2020-Q1'),
        'city',
        null,
        BAR_CHART_TYPES.SIMPLE
      )
    ).toEqual([
      {
        group: 'Amsterdam',
        value: 447,
      },
      {
        group: 'New York',
        value: 528,
      },
      {
        group: 'Bangkok',
        value: 435,
      },
      {
        group: 'San Francisco',
        value: 388,
      },
    ]);
    expect(formatChartData(series, null, 'city', null, BAR_CHART_TYPES.SIMPLE)).toEqual([]);
  });

  it('formatChartData returns formatted data for time-based, non-group chart', () => {
    const series = [
      {
        dataSourceId: 'particles',
        label: 'Particles',
      },
    ];
    // check horizontal layout
    expect(
      formatChartData(
        series,
        barChartData.timestamps.filter((t) => t.city === 'Amsterdam'),
        null,
        'timestamp',
        BAR_CHART_TYPES.SIMPLE
      )
    ).toEqual([
      {
        date: new Date('2020-02-09T16:23:45.000Z'),
        group: 'Particles',
        value: 447,
      },
      {
        date: new Date('2020-02-10T16:23:45.000Z'),
        group: 'Particles',
        value: 450,
      },
      {
        date: new Date('2020-02-11T16:23:45.000Z'),
        group: 'Particles',
        value: 512,
      },
      {
        date: new Date('2020-02-12T16:23:45.000Z'),
        group: 'Particles',
        value: 565,
      },
    ]);
    expect(formatChartData(series, null, null, 'timestamp', BAR_CHART_TYPES.SIMPLE)).toEqual([]);
  });

  it('formatChartData doesnt return null values', () => {
    const series = [
      {
        dataSourceId: 'particles',
      },
    ];
    const nullData = [
      {
        quarter: '2020-Q1',
        city: 'Amsterdam',
        particles: null,
      },
      {
        quarter: '2020-Q1',
        city: 'New York',
        particles: 100,
      },
    ];
    // check horizontal layout
    expect(formatChartData(series, nullData, 'city', null, BAR_CHART_TYPES.SIMPLE)).toEqual([
      {
        group: 'New York',
        value: 100,
      },
    ]);
  });

  it('formatChartData returns empty array is series is empty', () => {
    const series = [];
    const emptyData = [];
    // check horizontal layout
    expect(formatChartData(series, emptyData, undefined, null, BAR_CHART_TYPES.SIMPLE)).toEqual([]);
  });

  it('formatColors returns correct format if color is string', () => {
    const series = [
      {
        dataSourceId: 'particles',
        color: 'blue',
        label: 'Particles',
      },
      {
        dataSourceId: 'temperature',
        color: 'yellow',
        label: 'Temperature',
      },
    ];

    const uniqueDatasetNames = ['Particles', 'Temperature'];

    expect(formatColors(series, uniqueDatasetNames)).toEqual({
      scale: { Particles: 'blue', Temperature: 'yellow' },
    });
  });

  it('formatColors returns correct format if color is array', () => {
    const series = [
      {
        dataSourceId: 'particles',
        color: ['blue', 'red', 'green'],
        label: 'Particles',
      },
    ];

    const uniqueDatasetNames = ['Particles', 'Temperature', 'Emissions'];

    expect(formatColors(series, uniqueDatasetNames)).toEqual({
      scale: { Particles: 'blue', Temperature: 'red', Emissions: 'green' },
    });
  });

  it('formatColors returns correct format if color is object', () => {
    const series = [
      {
        dataSourceId: 'particles',
        color: { Particles: 'blue', Temperature: 'red' },
        label: 'Particles',
      },
      {
        dataSourceId: 'temperature',
        label: 'Temperature',
      },
    ];

    const uniqueDatasetNames = ['Particles', 'Temperature'];

    expect(formatColors(series, uniqueDatasetNames)).toEqual({
      scale: { Particles: 'blue', Temperature: 'red' },
    });
  });

  it('formatColors returns default colors if no color is provided', () => {
    const series = [
      {
        dataSourceId: 'particles',
        label: 'Particles',
      },
      {
        dataSourceId: 'temperature',
        label: 'Temperature',
      },
    ];

    const uniqueDatasetNames = ['Particles', 'Temperature'];

    expect(formatColors(series, uniqueDatasetNames)).toEqual({
      scale: { Particles: CHART_COLORS[0], Temperature: CHART_COLORS[1] },
    });
  });

  it('generateTableColumns returns time-based simple bar columns with placeholder text', () => {
    expect(
      generateTableColumns(
        'timestamp',
        null,
        BAR_CHART_TYPES.SIMPLE,
        ['Amsterdam', 'Austin', 'Miami'],
        'my default string'
      )
    ).toEqual([
      {
        id: 'timestamp',
        isSortable: true,
        name: 'Timestamp',
        type: 'TIMESTAMP',
      },
      {
        filter: {
          placeholderText: 'my default string',
        },
        id: 'Amsterdam',
        isSortable: true,
        name: 'Amsterdam',
      },
      {
        filter: {
          placeholderText: 'my default string',
        },
        id: 'Austin',
        isSortable: true,
        name: 'Austin',
      },
      {
        filter: {
          placeholderText: 'my default string',
        },
        id: 'Miami',
        isSortable: true,
        name: 'Miami',
      },
    ]);
  });

  it('generateTableColumns returns non-time-based simple bar columns', () => {
    expect(
      generateTableColumns(
        null,
        'city',
        BAR_CHART_TYPES.SIMPLE,
        ['Amsterdam', 'Austin', 'Miami'],
        null
      )
    ).toEqual([
      {
        id: 'Amsterdam',
        isSortable: true,
        name: 'Amsterdam',
      },
      {
        id: 'Austin',
        isSortable: true,
        name: 'Austin',
      },
      {
        id: 'Miami',
        isSortable: true,
        name: 'Miami',
      },
    ]);
  });

  it('generateTableColumns returns time-based group bar columns', () => {
    expect(
      generateTableColumns(
        'timestamp',
        'city',
        BAR_CHART_TYPES.GROUPED,
        ['Amsterdam', 'Austin', 'Miami'],
        null
      )
    ).toEqual([
      {
        id: 'timestamp',
        isSortable: true,
        name: 'Timestamp',
        type: 'TIMESTAMP',
      },
      {
        id: 'Amsterdam',
        isSortable: true,
        name: 'Amsterdam',
      },
      {
        id: 'Austin',
        isSortable: true,
        name: 'Austin',
      },
      {
        id: 'Miami',
        isSortable: true,
        name: 'Miami',
      },
    ]);
  });
  it('generateTableColumns returns non-time-based group bar columns', () => {
    expect(
      generateTableColumns(
        null,
        'city',
        BAR_CHART_TYPES.STACKED,
        ['Particles', 'Emissions', 'Temperature'],
        null
      )
    ).toEqual([
      {
        id: 'city',
        isSortable: true,
        name: 'City',
      },
      {
        id: 'Particles',
        isSortable: true,
        name: 'Particles',
      },
      {
        id: 'Emissions',
        isSortable: true,
        name: 'Emissions',
      },
      {
        id: 'Temperature',
        isSortable: true,
        name: 'Temperature',
      },
    ]);
  });

  it('formatTableData returns time-based data', () => {
    expect(
      formatTableData(
        'timestamp',
        null,
        BAR_CHART_TYPES.SIMPLE,
        barChartData.timestamps.filter((t) => t.city === 'Amsterdam'),
        formattedTimebasedChartData
      )
    ).toEqual([
      {
        id: 'dataindex-0',
        isSelectable: false,
        values: {
          Emissions: 120,
          Particles: 447,
          timestamp: '02/09/2020 10:23:45',
        },
      },
      {
        id: 'dataindex-1',
        isSelectable: false,
        values: {
          Emissions: 150,
          Particles: 450,
          timestamp: '02/10/2020 10:23:45',
        },
      },
      {
        id: 'dataindex-2',
        isSelectable: false,
        values: {
          Emissions: 170,
          Particles: 512,
          timestamp: '02/11/2020 10:23:45',
        },
      },
      {
        id: 'dataindex-3',
        isSelectable: false,
        values: {
          Emissions: 200,
          Particles: 565,
          timestamp: '02/12/2020 10:23:45',
        },
      },
    ]);
  });

  it('formatTableData returns grouped non-timebased data', () => {
    const groupedFormattedData = [
      {
        group: 'Particles',
        key: 'Amsterdam',
        value: 512,
      },
      {
        group: 'Particles',
        key: 'New York',
        value: 442,
      },
      {
        group: 'Particles',
        key: 'Bangkok',
        value: 397,
      },
      {
        group: 'Particles',
        key: 'San Francisco',
        value: 270,
      },
    ];

    expect(
      formatTableData(
        null,
        'city',
        BAR_CHART_TYPES.GROUPED,
        barChartData.quarters.filter((a) => a.quarter === '2020-Q3'),
        groupedFormattedData
      )
    ).toEqual([
      {
        id: 'dataindex-0',
        isSelectable: false,
        values: {
          Particles: 512,
          city: 'Amsterdam',
        },
      },
      {
        id: 'dataindex-1',
        isSelectable: false,
        values: {
          Particles: 442,
          city: 'New York',
        },
      },
      {
        id: 'dataindex-2',
        isSelectable: false,
        values: {
          Particles: 397,
          city: 'Bangkok',
        },
      },
      {
        id: 'dataindex-3',
        isSelectable: false,
        values: {
          Particles: 270,
          city: 'San Francisco',
        },
      },
    ]);
  });

  it('formatTableData returns simple non-timebased data', () => {
    const simpleFormattedData = [
      {
        group: 'Amsterdam',
        value: 512,
      },
      {
        group: 'New York',
        value: 442,
      },
      {
        group: 'Bangkok',
        value: 397,
      },
      {
        group: 'San Francisco',
        value: 270,
      },
    ];

    expect(
      formatTableData(
        null,
        'city',
        BAR_CHART_TYPES.SIMPLE,
        barChartData.quarters.filter((a) => a.quarter === '2020-Q3'),
        simpleFormattedData
      )
    ).toEqual([
      {
        id: 'dataindex-1',
        isSelectable: false,
        values: {
          Amsterdam: 512,
          Bangkok: 397,
          'New York': 442,
          'San Francisco': 270,
        },
      },
    ]);
  });

  it('handleTooltip returns correct format if data is not time-based', () => {
    const simpleFormattedData = {
      group: 'San Francisco',
      value: 512,
      date: new Date(1581438225000),
    };

    const defaultTooltip = `<ul class='multi-tooltip'><li>
    <div class="datapoint-tooltip ">

      <p class="label">Cities </p>
      <p class="value">San Francisco</p>
    </div>
  </li><li>
    <div class="datapoint-tooltip ">

      <p class="label">Particles </p>
      <p class="value">512</p>
    </div>
  </li><li>
    <div class="datapoint-tooltip ">
      <a style="background-color: #4589ff" class="tooltip-color"></a>
      <p class="label">Group</p>
      <p class="value">Particles</p>
    </div>
  </li></ul>`;

    expect(
      handleTooltip(simpleFormattedData, defaultTooltip, undefined).replace(/\s+/g, '')
    ).toEqual(
      `<ul class="multi-tooltip"><li>
    <div class="datapoint-tooltip ">

      <p class="label">Cities </p>
      <p class="value">San Francisco</p>
    </div>
  </li><li>
    <div class="datapoint-tooltip ">

      <p class="label">Particles </p>
      <p class="value">512</p>
    </div>
  </li><li>
    <div class="datapoint-tooltip ">
      <a style="background-color: #4589ff" class="tooltip-color"></a>
      <p class="label">Group</p>
      <p class="value">Particles</p>
    </div>
  </li></ul>`.replace(/\s+/g, '')
    );
  });

  it('handleTooltip returns correct format if data is array', () => {
    const simpleFormattedData = [
      {
        group: 'Particles',
        value: 565,
        date: new Date(1581438225000),
      },
    ];

    const defaultTooltip = `<ul class='multi-tooltip'><li>
    <div class="datapoint-tooltip ">
      <p class="label">Dates </p>
      <p class="value">Feb 12, 2020</p>
    </div>
  </li><li>
    <div class="datapoint-tooltip ">
      <p class="label">Total </p>
      <p class="value">565</p>
    </div>
  </li><li>
    <div class="datapoint-tooltip ">
      <a style="background-color: #4589ff" class="tooltip-color"></a>
      <p class="label">Group</p>
      <p class="value">Particles</p>
    </div>
  </li></ul>`;

    expect(
      handleTooltip(simpleFormattedData, defaultTooltip, 'timestamp').replace(/\s+/g, '')
    ).toEqual(
      `<ul class="multi-tooltip"><li class="datapoint-tooltip">
            <p class="label">
              02/11/2020 10:23:45</p>
          </li><li>
    <div class="datapoint-tooltip ">
      <p class="label">Total </p>
      <p class="value">565</p>
    </div>
  </li><li>
    <div class="datapoint-tooltip ">
      <a style="background-color: #4589ff" class="tooltip-color"></a>
      <p class="label">Group</p>
      <p class="value">Particles</p>
    </div>
  </li></ul>`.replace(/\s+/g, '')
    );
  });
  describe('getMaxTicksPerSize', () => {
    it('should return the prop number of ticks for all card sizes', () => {
      expect(getMaxTicksPerSize(CARD_SIZES.MEDIUMTHIN)).toBe(2);
      expect(getMaxTicksPerSize(CARD_SIZES.MEDIUM)).toBe(4);
      expect(getMaxTicksPerSize(CARD_SIZES.MEDIUMWIDE)).toBe(6);
      expect(getMaxTicksPerSize(CARD_SIZES.LARGE)).toBe(6);
      expect(getMaxTicksPerSize(CARD_SIZES.LARGETHIN)).toBe(6);
      expect(getMaxTicksPerSize(CARD_SIZES.LARGEWIDE)).toBe(14);
      expect(getMaxTicksPerSize(CARD_SIZES.SMALL)).toBe(10);
      expect(getMaxTicksPerSize(CARD_SIZES.SMALLFULL)).toBe(10);
      expect(getMaxTicksPerSize(CARD_SIZES.SMALLWIDE)).toBe(10);
    });
  });
  describe('generateSampleValues', () => {
    it('should return the proper count based on the given time grain', () => {
      [
        { grain: undefined, expectedCount: 7 },
        { grain: 'hour', expectedCount: 24 },
        { grain: 'day', expectedCount: 7 },
        { grain: 'week', expectedCount: 4 },
        { grain: 'month', expectedCount: 12 },
        { grain: 'year', expectedCount: 5 },
        { grain: 'unknown', expectedCount: 7 },
      ].forEach(({ grain, expectedCount }) => {
        const values = generateSampleValues(
          [
            {
              dataSourceId: 'particles',
              label: 'Particles',
            },
          ],
          'timestamp',
          grain
        );
        expect(values).toHaveLength(expectedCount);
        expect(values).toEqual(
          expect.arrayContaining(
            Array.from(Array(expectedCount)).map(() => ({
              particles: expect.any(Number),
              timestamp: expect.any(Number),
            }))
          )
        );
      });
      const values = generateSampleValues(
        [
          {
            dataSourceId: 'particles',
            label: 'Particles',
          },
        ],
        'timestamp',
        'month',
        'Last Quarter'
      );
      expect(values).toHaveLength(3);
      expect(values).toEqual(
        expect.arrayContaining(
          Array.from(Array(3)).map(() => ({
            particles: expect.any(Number),
            timestamp: expect.any(Number),
          }))
        )
      );
    });
    it('should return the proper count based on the given time range', () => {
      const values = generateSampleValues(
        [
          {
            dataSourceId: 'particles',
            label: 'Particles',
          },
        ],
        'timestamp',
        'month',
        'this year'
      );
      expect(values).toHaveLength(12);
      expect(values).toEqual(
        expect.arrayContaining(
          Array.from(Array(12)).map(() => ({
            particles: expect.any(Number),
            timestamp: expect.any(Number),
          }))
        )
      );
    });
    it('should return the proper count based on the given time range with categoryDataSourceId', () => {
      const values = generateSampleValues(
        [
          {
            dataSourceId: 'particles',
            label: 'Particles',
          },
        ],
        'timestamp',
        'month',
        'this year',
        'city'
      );
      // 48 b/c it generate 4 different data sets as a hard-coded value
      expect(values).toHaveLength(48);
      expect(values).toEqual(
        expect.arrayContaining(
          Array.from(Array(48)).map(() => ({
            city: expect.any(String),
            particles: expect.any(Number),
            timestamp: expect.any(Number),
          }))
        )
      );
    });
    it('should generate random samples of non-timeseries data', () => {
      const values = generateSampleValues(
        [
          {
            dataSourceId: 'particles',
            label: 'Particles',
          },
        ],
        undefined,
        'month',
        'this year',
        'city'
      );
      // 48 b/c it generate 4 different data sets as a hard-coded value
      expect(values).toHaveLength(4);
      expect(values).toEqual(
        expect.arrayContaining(
          Array.from(Array(4)).map(() => ({
            city: expect.any(String),
            particles: expect.any(Number),
          }))
        )
      );
    });
  });
  describe('generateSampleValuesForEditor', () => {
    it('should return the proper count based on the given time grain', () => {
      [
        { grain: undefined, expectedCount: 7 },
        { grain: 'hour', expectedCount: 24 },
        { grain: 'day', expectedCount: 7 },
        { grain: 'week', expectedCount: 4 },
        { grain: 'month', expectedCount: 12 },
        { grain: 'year', expectedCount: 5 },
        { grain: 'unknown', expectedCount: 7 },
      ].forEach(({ grain, expectedCount }) => {
        const values = generateSampleValuesForEditor(
          [
            {
              dataSourceId: 'particles',
              label: 'Particles',
            },
          ],
          'timestamp',
          grain
        );
        expect(values).toHaveLength(expectedCount);
        expect(values).toEqual(
          expect.arrayContaining(
            Array.from(Array(expectedCount)).map(() => ({
              particles: expect.any(Number),
              timestamp: expect.any(Number),
            }))
          )
        );
      });
      const values = generateSampleValuesForEditor(
        [
          {
            dataSourceId: 'particles',
            label: 'Particles',
          },
        ],
        'timestamp',
        'month',
        'Last Quarter'
      );
      expect(values).toHaveLength(3);
      expect(values).toEqual(
        expect.arrayContaining(
          Array.from(Array(3)).map(() => ({
            particles: expect.any(Number),
            timestamp: expect.any(Number),
          }))
        )
      );
    });
    it('should return the proper count based on the given time range', () => {
      const values = generateSampleValuesForEditor(
        [
          {
            dataSourceId: 'particles',
            label: 'Particles',
          },
        ],
        'timestamp',
        'month',
        'this year'
      );
      expect(values).toHaveLength(12);
      expect(values).toEqual(
        expect.arrayContaining(
          Array.from(Array(12)).map(() => ({
            particles: expect.any(Number),
            timestamp: expect.any(Number),
          }))
        )
      );
    });
    it('should return the proper count based on the given time range with categoryDataSourceId', () => {
      const values = generateSampleValuesForEditor(
        [
          {
            dataSourceId: 'particles',
            label: 'Particles',
          },
        ],
        'timestamp',
        'month',
        'this year',
        'city',
        {
          city: ['New York', 'Sydney', 'Amsterdam', 'San Francisco'],
        }
      );
      // 48 b/c it generate 4 different data sets as a hard-coded value
      expect(values).toHaveLength(48);
      expect(values).toEqual(
        expect.arrayContaining(
          Array.from(Array(48)).map(() => ({
            city: expect.any(String),
            particles: expect.any(Number),
            timestamp: expect.any(Number),
          }))
        )
      );
    });
    it('should generate random samples of non-timeseries data', () => {
      const values = generateSampleValuesForEditor(
        [
          {
            dataSourceId: 'particles',
            label: 'Particles',
          },
        ],
        undefined,
        'month',
        'this year',
        'city',
        {
          city: ['New York', 'Sydney', 'Amsterdam', 'San Francisco'],
        }
      );
      expect(values).toHaveLength(4);
      expect(values).toEqual(
        expect.arrayContaining(
          Array.from(Array(4)).map(() => ({
            city: expect.any(String),
            particles: expect.any(Number),
          }))
        )
      );
    });
  });
});
