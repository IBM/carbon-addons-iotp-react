export const COLORS = {
  RED: 'rgb(217,3,103)',
  BLUE: 'rgb(25,98,253)',
  YELLOW: 'rgb(254,213,34)',
  PURPLE: '#8A3FFC',
  TEAL: '#009C98',
  MAGENTA: '#EE538B',
  CYAN: '#0072C3',
};

export const CARD_SIZES = {
  SMALL: 'SMALL',
  SMALLWIDE: 'SMALLWIDE',
  SMALLFULL: 'SMALLFULL',
  SMALLTHICK: 'SMALLTHICK',
  MEDIUMTHIN: 'MEDIUMTHIN',
  MEDIUM: 'MEDIUM',
  MEDIUMTHICK: 'MEDIUMTHICK',
  MEDIUMWIDE: 'MEDIUMWIDE',
  LARGETHIN: 'LARGETHIN',
  LARGE: 'LARGE',
  LARGETHICK: 'LARGETHICK',
  LARGEWIDE: 'LARGEWIDE',
};

export const LEGACY_CARD_SIZES = {
  XSMALL: 'XSMALL',
  XSMALLWIDE: 'XSMALLWIDE',
  TALL: 'TALL',
  WIDE: 'WIDE',
  XLARGE: 'XLARGE',
  ...CARD_SIZES,
};

export const CARD_TYPES = {
  BAR: 'BAR',
  DONUT: 'DONUT',
  CUSTOM: 'CUSTOM',
  GAUGE: 'GAUGE',
  IMAGE: 'IMAGE',
  LIST: 'LIST',
  PIE: 'PIE',
  TABLE: 'TABLE',
  TIMESERIES: 'TIMESERIES',
  VALUE: 'VALUE',
  METER_CHART: 'METER_CHART',
  SPARKLINE_CHART: 'SPARKLINE_CHART',
  STACKED_AREA_CHART: 'STACKED_AREA_CHART',
};

export const CARD_ACTIONS = {
  OPEN_EXPANDED_CARD: 'OPEN_EXPANDED_CARD',
  CLOSE_EXPANDED_CARD: 'CLOSE_EXPANDED_CARD',
  UPDATE_DATA: 'UPDATE_DATA',
  EDIT_CARD: 'EDIT_CARD',
  CLONE_CARD: 'CLONE_CARD',
  DELETE_CARD: 'DELETE_CARD',
  CHANGE_TIME_RANGE: 'CHANGE_TIME_RANGE',
  ON_CARD_CHANGE: 'ON_CARD_CHANGE',
  ON_SETTINGS_CLICK: 'ON_SETTINGS_CLICK',
};

export const DASHBOARD_SIZES = {
  LARGE: 'lg',
  MAX: 'max',
  MEDIUM: 'md',
  SMALL: 'sm',
  XLARGE: 'xl',
  XSMALL: 'xs',
};

export const DASHBOARD_COLUMNS = {
  max: 16,
  xl: 16,
  lg: 16,
  md: 8,
  sm: 8,
  xs: 4,
};

export const DASHBOARD_BREAKPOINTS = {
  max: 1584,
  xl: 1312,
  lg: 1056,
  md: 672,
  sm: 480,
  xs: 320,
};

export const DASHBOARD_CONTAINER_PADDING = {
  max: [0, 0],
  xl: [0, 0],
  lg: [0, 0],
  md: [0, 0],
  sm: [0, 0],
  xs: [0, 0],
};

export const ROW_HEIGHT = {
  max: 144,
  xl: 144,
  lg: 144,
  md: 144,
  sm: 144,
  xs: 144,
};

/** The amount of space to preserve between cards */
export const GUTTER = 16;

/*
 * How many rows and columns should each card cross at each layout size
 */

export const CARD_DIMENSIONS = {
  XSMALL: {
    // TODO: remove once we've removed these deprecated sizes
    max: { w: 2, h: 1 },
    xl: { w: 2, h: 1 },
    lg: { w: 4, h: 1 },
    md: { w: 4, h: 1 },
    sm: { w: 2, h: 1 },
    xs: { w: 4, h: 1 },
  },
  XSMALLWIDE: {
    // TODO: remove once we've removed these deprecated sizes
    max: { w: 4, h: 1 },
    xl: { w: 4, h: 1 },
    lg: { w: 4, h: 1 },
    md: { w: 4, h: 1 },
    sm: { w: 4, h: 2 },
    xs: { w: 4, h: 1 },
  },
  TALL: {
    // TODO: remove once we've removed these deprecated sizes
    max: { w: 4, h: 4 },
    xl: { w: 4, h: 4 },
    lg: { w: 4, h: 4 },
    md: { w: 4, h: 4 },
    sm: { w: 4, h: 4 },
    xs: { w: 4, h: 4 },
  },
  WIDE: {
    // TODO: remove once we've removed these deprecated sizes
    max: { w: 8, h: 2 },
    xl: { w: 8, h: 2 },
    lg: { w: 8, h: 2 },
    md: { w: 8, h: 2 },
    sm: { w: 4, h: 2 },
    xs: { w: 4, h: 2 },
  },
  XLARGE: {
    // TODO: remove once we've removed these deprecated sizes
    max: { w: 16, h: 4 },
    xl: { w: 16, h: 4 },
    lg: { w: 16, h: 4 },
    md: { w: 8, h: 4 },
    sm: { w: 4, h: 4 },
    xs: { w: 4, h: 4 },
  },
  SMALL: {
    max: { w: 4, h: 1 },
    xl: { w: 4, h: 1 },
    lg: { w: 4, h: 1 },
    md: { w: 2, h: 1 },
    sm: { w: 2, h: 1 },
    xs: { w: 4, h: 1 },
  },
  SMALLWIDE: {
    max: { w: 8, h: 1 },
    xl: { w: 8, h: 1 },
    lg: { w: 8, h: 1 },
    md: { w: 4, h: 1 },
    sm: { w: 4, h: 1 },
    xs: { w: 4, h: 1 },
  },
  SMALLFULL: {
    max: { w: 16, h: 1 },
    xl: { w: 16, h: 1 },
    lg: { w: 16, h: 1 },
    md: { w: 8, h: 1 },
    sm: { w: 8, h: 1 },
    xs: { w: 4, h: 1 },
  },
  MEDIUMTHIN: {
    max: { w: 4, h: 2 },
    xl: { w: 4, h: 2 },
    lg: { w: 4, h: 2 },
    md: { w: 4, h: 2 },
    sm: { w: 4, h: 2 },
    xs: { w: 4, h: 2 },
  },
  MEDIUM: {
    max: { w: 8, h: 2 },
    xl: { w: 8, h: 2 },
    lg: { w: 8, h: 2 },
    md: { w: 8, h: 2 },
    sm: { w: 4, h: 2 },
    xs: { w: 4, h: 2 },
  },
  MEDIUMWIDE: {
    max: { w: 16, h: 2 },
    xl: { w: 16, h: 2 },
    lg: { w: 16, h: 2 },
    md: { w: 8, h: 2 },
    sm: { w: 4, h: 2 },
    xs: { w: 4, h: 2 },
  },
  LARGETHIN: {
    max: { w: 4, h: 4 },
    xl: { w: 4, h: 4 },
    lg: { w: 4, h: 4 },
    md: { w: 4, h: 4 },
    sm: { w: 4, h: 4 },
    xs: { w: 4, h: 4 },
  },
  LARGE: {
    max: { w: 8, h: 4 },
    xl: { w: 8, h: 4 },
    lg: { w: 8, h: 4 },
    md: { w: 8, h: 4 },
    sm: { w: 4, h: 4 },
    xs: { w: 4, h: 4 },
  },
  LARGEWIDE: {
    max: { w: 16, h: 4 },
    xl: { w: 16, h: 4 },
    lg: { w: 16, h: 4 },
    md: { w: 8, h: 4 },
    sm: { w: 4, h: 4 },
    xs: { w: 4, h: 4 },
  },
  SMALLTHICK: {
    max: { w: 12, h: 1 },
    xl: { w: 12, h: 1 },
    lg: { w: 12, h: 1 },
    md: { w: 8, h: 1 },
    sm: { w: 8, h: 1 },
    xs: { w: 4, h: 1 },
  },
  MEDIUMTHICK: {
    max: { w: 12, h: 2 },
    xl: { w: 12, h: 2 },
    lg: { w: 12, h: 2 },
    md: { w: 8, h: 2 },
    sm: { w: 8, h: 2 },
    xs: { w: 4, h: 2 },
  },
  LARGETHICK: {
    max: { w: 12, h: 4 },
    xl: { w: 12, h: 4 },
    lg: { w: 12, h: 4 },
    md: { w: 8, h: 4 },
    sm: { w: 8, h: 4 },
    xs: { w: 4, h: 4 },
  },
};

export const CARD_LAYOUTS = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
};

export const CARD_TITLE_HEIGHT = 48;
export const CARD_CONTENT_PADDING = 16;

export const TIME_SERIES_TYPES = {
  BAR: 'BAR',
  LINE: 'LINE',
};

export const CARD_DATA_STATE = { NO_DATA: 'NO_DATA', ERROR: 'ERROR' };

export const BAR_CHART_TYPES = {
  SIMPLE: 'SIMPLE',
  GROUPED: 'GROUPED',
  STACKED: 'STACKED',
};

export const BAR_CHART_LAYOUTS = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
};

// If the card is too small, the chart will be too small when the zoom bar renders
export const ZOOM_BAR_ENABLED_CARD_SIZES = [
  CARD_SIZES.MEDIUMWIDE,
  CARD_SIZES.LARGE,
  CARD_SIZES.LARGEWIDE,
];

// its difficult to see the charts below medium sizes
export const ALLOWED_CHART_CARD_SIZES = [
  CARD_SIZES.MEDIUM,
  CARD_SIZES.MEDIUMTHIN,
  CARD_SIZES.MEDIUMTHICK,
  CARD_SIZES.MEDIUMWIDE,
  CARD_SIZES.LARGE,
  CARD_SIZES.LARGETHIN,
  CARD_SIZES.LARGETHICK,
  CARD_SIZES.LARGEWIDE,
];

export const ALLOWED_CARD_SIZES_PER_TYPE = {
  TIMESERIES: ALLOWED_CHART_CARD_SIZES,
  BAR: ALLOWED_CHART_CARD_SIZES,
  TABLE: [
    CARD_SIZES.MEDIUMTHIN,
    CARD_SIZES.MEDIUM,
    CARD_SIZES.MEDIUMWIDE,
    CARD_SIZES.MEDIUMTHICK,
    CARD_SIZES.LARGETHIN,
    CARD_SIZES.LARGE,
    CARD_SIZES.LARGEWIDE,
    CARD_SIZES.LARGETHICK,
  ],
  ALERT: [
    CARD_SIZES.MEDIUMTHIN,
    CARD_SIZES.MEDIUM,
    CARD_SIZES.MEDIUMTHICK,
    CARD_SIZES.MEDIUMWIDE,
    CARD_SIZES.LARGETHIN,
    CARD_SIZES.LARGE,
    CARD_SIZES.LARGEWIDE,
    CARD_SIZES.LARGETHICK,
  ],
};

export const DASHBOARD_EDITOR_CARD_TYPES = {
  VALUE: CARD_TYPES.VALUE,
  TIMESERIES: CARD_TYPES.TIMESERIES,
  IMAGE: CARD_TYPES.IMAGE,
  TABLE: CARD_TYPES.TABLE,
  SIMPLE_BAR: 'SIMPLE_BAR',
  GROUPED_BAR: 'GROUPED_BAR',
  STACKED_BAR: 'STACKED_BAR',
  LIST: 'LIST',
  ALERT: 'ALERT',
};
