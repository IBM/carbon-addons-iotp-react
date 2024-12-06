const path = require('path');
const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MONACO_DIR = path.join(__dirname, 'node_modules/monaco-editor');

module.exports = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  stories: ['./Welcome.story.jsx', '../src/**/*.story.jsx'],
  addons: [
    '@storybook/addon-knobs',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    'storybook-addon-rtl',
    '@storybook/addon-docs',
    'storybook-addon-turbo-build',
    '@storybook/addon-webpack5-compiler-babel',
  ],

  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // High quality 'original source' sourcemaps are slow to generate on initial builds and rebuilds.
    // Using cheap-module-eval-source-map speeds up builds and rebuilds in development while not sacrificing too much source map quality.
    config.devtool = configType === 'DEVELOPMENT' ? 'eval-source-map' : false;

    // Moment.js is quite large, the locales that they bundle in the core as of v2.18 are ignored to keep our bundle size down.
    // https://webpack.js.org/plugins/ignore-plugin/#example-of-ignoring-moment-locales
    // Corrected IgnorePlugin configuration
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-react', '@babel/preset-env'],
        },
      },
    });

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ['typescript', 'javascript', 'css'],
      })
    );

    config.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'coverage'),
        path.resolve(__dirname, 'lib'),
        path.resolve(__dirname, 'css'),
        path.resolve(__dirname, 'es'),
        path.resolve(__dirname, 'scss'),
        path.resolve(__dirname, 'umd'),
        path.resolve(__dirname, 'results'),
      ],
      include: [path.resolve(__dirname, 'src')],
      use: 'babel-loader',
    });
    config.optimization = {
      splitChunks: {
        chunks: 'all',
      },
    };

    // Define our desired scss/css rule
    config.module.rules.push({
      test: /\.s?css$/,
      exclude: [/coverage/, /monaco-editor/],
      sideEffects: true,
      use: [
        // Creates `style` nodes from JS strings
        { loader: 'style-loader' },
        // Translates CSS into CommonJS
        {
          loader: 'css-loader',
          options: { importLoaders: 2 },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                require('autoprefixer')({
                  overrideBrowserslist: ['last 1 version', 'ie >= 11'],
                }),
              ],
            },
          },
        },
        // Compiles Sass to CSS
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              includePaths: [path.resolve(__dirname, '..', '..', '..', 'node_modules')],
            },
          },
        },
      ],
    });

    config.module.rules.push({
      test: /\.css$/,
      include: MONACO_DIR,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    });

    config.module.rules.push({
      test: /\.ttf$/,
      use: ['file-loader'],
      // type: 'asset',
    });

    // add the package local node_modules as the first place to look when resolving modules
    // more info here: https://webpack.js.org/configuration/resolve/#resolvemodules
    config.resolve.modules = [path.resolve(__dirname, '../node_modules'), 'node_modules'];

    return config;
  },
};
