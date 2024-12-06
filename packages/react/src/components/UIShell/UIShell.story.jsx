// This story relies on the readme.md present in the carbon repo, which is not included in the distributed package.
// Enabling the line below causes a build error:
// ERROR in ./node_modules/carbon-components-react/lib/components/UIShell/UIShell-story.js
// Module not found: Error: Can't resolve './README.md' in '/Users/taylorjones/dev/carbon-addons-iot-react/node_modules/carbon-components-react/lib/components/UIShell'
//  @ ./node_modules/carbon-components-react/lib/components/UIShell/UIShell-story.js 17:37-59
//  @ ./src/components/UIShell/UIShell.story.jsx
//  @ ./src/components sync \.story\.jsx$
//  @ ./.storybook/config.js
//  @ multi ./node_modules/@storybook/core/dist/server/common/polyfills.js ./node_modules/@storybook/core/dist/server/preview/globals.js ./.storybook/config.js ./node_modules/webpack-hot-middleware/client.js?reload=true

// export { default as UIShellStory } from 'carbon-components-react/lib/components/UIShell/UIShell-story'
import React from 'react';

export default {
  component: <div>UIShell Story</div>,
};
