module.exports = {
  collectCoverageFrom: [
    'src/components/**/*.js?(x)',
    '!src/**/*.story.js?(x)',
    '!src/**/hooks/*.js',
    '!src/components/SuiteHeader/util/suiteHeaderData.js',
    '!src/components/FileUploader/stories/*.jsx',
    '!src/components/Table/AsyncTable/*.js?(x)',
    '!src/components/WizardInline/**/*.js?(x)',
    '!src/components/Page/(EditPage|PageHero).jsx',
    '!src/components/Dashboard/(Dashboard|CardRenderer).jsx',
    '!src/components/MapCard/storyFiles/*.jsx',
    '!src/components/**/*.test.e2e.jsx',
    '!src/components/StorybookSnapshots.test.js',
    '!src/components/Table/Table.test.helpers.jsx',
    '!src/components/Table/Table.story.helpers.jsx',
    '!src/components/Table/TableColumnCustomizationModal/tableColumnCustomizationTestUtils.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/', '/coverage/'],
  coverageReporters: ['html', 'text-summary', 'lcov', 'json'],
  coverageDirectory: 'jest/coverage',
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    // set coverage to 90 for all items except those who are covered by e2e cypress tests
    './src/components/**/!(TimeSeriesCard|BarChartCard|DashboardEditor|ListTarget|PageTitleBar|DateTimePickerV2|DateTimePicker|HeaderActionGroup|DashboardEditorCardRenderer|CardCodeEditor|SimpleList|index|ListContent|List|VirtualListContent|TableMultiSortRow|TableColumnCustomizationModal|ListBuilder|SidePanel|ListSpinner|DateTimePickerV2WithTimeSpinner|DateTimePickerV2WithoutTimeSpinner).jsx':
      {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    './src/components/List/ListItem/ListTarget.jsx': {
      branches: 88,
    },
    './src/components/List/List.jsx': {
      functions: 85,
    },
    './src/components/List/ListContent/ListContent.jsx': {
      functions: 88,
    },
    './src/components/List/VirtualListContent/VirtualListContent.jsx': {
      functions: 89,
    },
    './src/components/PageTitleBar/PageTitleBar.jsx': {
      statements: 81,
      branches: 81,
      lines: 80,
    },
    './src/components/DateTimePicker/DateTimePickerV2.jsx': {
      branches: 84,
    },
    './src/components/DateTimePicker/DateTimePicker.jsx': {
      statements: 79,
      branches: 79,
      lines: 80,
      functions: 78,
    },
    './src/components/Header/HeaderActionGroup.jsx': {
      statements: 51,
      branches: 20,
      lines: 50,
      functions: 56,
    },
    './src/components/DashboardEditor/DashboardEditorCardRenderer.jsx': {
      branches: 87,
    },
    './src/components/CardCodeEditor/CardCodeEditor.jsx': {
      functions: 88,
    },
    './src/components/List/SimpleList/SimpleList.jsx': {
      functions: 88,
    },
    './src/components/Tooltip/index.jsx': {
      branches: 87,
    },
    './src/components/Table/TableMultiSortModal/TableMultiSortRow.jsx': {
      statements: 46,
      branches: 18,
      lines: 46,
      functions: 71,
    },
    './src/components/Table/TableColumnCustomizationModal/TableColumnCustomizationModal.jsx': {
      functions: 86,
    },
    './src/components/ListBuilder/ListBuilder.jsx': {
      functions: 88,
    },
    './src/components/SidePanel/SidePanel.jsx': {
      statements: 81,
      branches: 80,
      lines: 86,
      functions: 63,
    },
    './src/components/TimePicker/ListSpinner.jsx': {
      statements: 46,
      branches: 42,
      lines: 49,
      functions: 38,
    },
  },
  globals: {
    __DEV__: false,
  },
  setupFiles: ['<rootDir>/config/jest/setup.js'],
  testEnvironment: 'jest-environment-jsdom-sixteen',
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTest.js'],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.js?(x)',
    '<rootDir>/**/?(*.)(spec|test).js?(x)',
    '<rootDir>/**/?(*.)test.a11y.js?(x)',
  ],
  testURL: 'http://localhost',
  transform: {
    // '^.+\\.story\\.jsx?$': '@storybook/addon-storyshots/injectFileName',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.s?css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
    '^.+\\.mdx$': '@storybook/addon-docs/jest-transform-mdx',
  },
  testPathIgnorePatterns: ['/config/', '/lib/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@carbon/charts|@storybook/addon-docs|lodash-es)).+(.jsx?)',
    '/__mocks__/.+(.jsx?)',
  ],
  watchPathIgnorePatterns: ['/coverage/', '/results/', '/.git/'],
  moduleFileExtensions: ['js', 'json', 'jsx'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  moduleNameMapper: {
    // rewrite carbon-components(-react) es imports to lib/cjs imports because jest doesn't support es modules
    '@carbon/icons-react/es/(.*)': '@carbon/icons-react/lib/$1',
    '@carbon/react/es/(.*)': '@carbon/react/lib/$1',
  },
};
