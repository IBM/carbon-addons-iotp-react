/* eslint-disable import/no-extraneous-dependencies */
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import autoprefixer from 'autoprefixer';
import json from '@rollup/plugin-json';
import css from 'rollup-plugin-import-css';

const packageJson = require('./package.json');

const env = process.env.NODE_ENV || 'development';
const prodSettings = env === 'development' ? [] : [uglify(), filesize()];

const extensions = ['.mjs', '.js', '.jsx', '.json', '.ts'];

const external = (id) => {
  return (
    Object.keys(packageJson.peerDependencies).some((element) => id === element) ||
    Object.keys(packageJson.dependencies).some((element) => id === element) ||
    id.includes('lodash/') ||
    id.includes('core-js/') ||
    id.includes('@babel/runtime')
  );
};

export default [
  // CommonJS & ESM
  {
    input: 'src/index.js',
    preserveModules: true,
    output: [
      {
        dir: 'es',
        format: 'esm',
        preserveModulesRoot: 'src',
      },
      {
        dir: 'lib',
        name: 'CarbonAddonsIoTReact',
        format: 'cjs',
        preserveModulesRoot: 'src',
        exports: 'auto',
      },
    ],
    external,
    plugins: [
      resolve({ extensions }),
      commonjs({ include: /node_modules/ }),
      babel({
        exclude: /node_modules/,
        babelHelpers: 'runtime',
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      json({
        // All JSON files will be parsed by default,
        // but you can also specifically include/exclude files
        exclude: ['node_modules'],
        // for tree-shaking, properties will be declared as
        // variables, using either `var` or `const`
        preferConst: true, // Default: false
        // specify indentation for the generated default export —
        // defaults to '\t'
        indent: '  ',
        // ignores indent and generates the smallest code
        compact: true, // Default: false
        // generate a named export for every property of the JSON object
        namedExports: true, // Default: true
      }),
      css(),
      ...prodSettings,
    ],
  },
  // Compile styles
  {
    input: 'src/styles.scss',
    output: [
      {
        dir: 'tmp',
        format: 'esm',
      },
    ],
    plugins: [
      postcss({
        extract: 'lib/css/carbon-addons-iot-react.css',
        sourceMap: true,
        use: {
          sass: {
            // Include necessary paths for Sass to resolve @use and @import
            includePaths: ['../../node_modules'],
          },
        },
        plugins: [autoprefixer],
      }),
      css(),
    ],
  },
  // Copy all styles to various directories.
  // UMD
  {
    input: 'src/index.js',
    output: [
      {
        file: 'umd/carbon-addons-iot-react.js',
        name: 'CarbonAddonsIoTReact',
        format: 'umd',
        inlineDynamicImports: true,
        globals: {
          classnames: 'classNames',
          'prop-types': 'PropTypes',
          react: 'React',
          'react-dom': 'ReactDOM',
          '@carbon/icons-react': 'CarbonIconsReact',
          '@carbon/react': 'CarbonReact',
          '@carbon/charts': 'CarbonCharts',
          'styled-components': 'styled',
          d3: 'd3',
        },
      },
    ],
    external: [
      'react',
      'react-dom',
      'styled-components',
      'prop-types',
      '@carbon/icons',
      '@carbon/react',
      '@carbon/charts',
      '@carbon/icons-react',
      'd3',
    ],
    plugins: [
      resolve({
        browser: true,
        extensions,
      }),
      commonjs({
        include: /node_modules/,
      }),
      babel({
        exclude: /node_modules/,
        babelHelpers: 'runtime',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      json({
        // All JSON files will be parsed by default,
        // but you can also specifically include/exclude files
        exclude: ['node_modules'],

        // for tree-shaking, properties will be declared as
        // variables, using either `var` or `const`
        preferConst: true, // Default: false

        // specify indentation for the generated default export —
        // defaults to '\t'
        indent: '  ',

        // ignores indent and generates the smallest code
        compact: true, // Default: false

        // generate a named export for every property of the JSON object
        namedExports: true, // Default: true
      }),
      css(),
      copy({
        flatten: false,
        targets: [
          // Sass entrypoint
          { src: 'src/styles.scss', dest: ['lib/scss', 'scss'] },

          // Sass globals
          {
            src: 'src/globals',
            dest: ['lib/scss', 'scss'],
          },

          // Sass components
          {
            src: ['src/components/**/*.scss', '!src/components/**/*.story.scss'],
            dest: ['lib/scss', 'scss'],
          },
          // react-resizable
          {
            src: [
              'node_modules/react-resizable/css/**/*.css',
              'node_modules/react-grid-layout/css/**/*.css',
            ],
            dest: ['es/node_modules', 'lib/node_modules'],
          },
          // Copy CSS from tmp to ./lib/css, 'lib/css' folder is kept b/c flatten:false
          {
            src: ['tmp/lib/css/'],
            dest: ['./'],
          },
        ],
        verbose: env !== 'development', // logs the file copy list on production builds for easier debugging
      }),
      copy({
        flatten: true,
        targets: [
          // Copy CSS from tmp to ./css, 'lib/css' folder isn't kept because flatten:true.
          {
            src: 'tmp/lib/css/*',
            dest: './css/',
          },
        ],
        verbose: env !== 'development', // logs the file copy list on production builds for easier debugging
      }),
      ...prodSettings,
    ],
  },
];
