import React from 'react';
import { select, boolean, array } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import CodeEditor from './CodeEditor';

export default {
  title: '1 - Watson IoT/CodeEditor',
  parameters: {
    component: CodeEditor,
    docs: {
      inlineStories: false,
    },
  },
};

export const Default = () => (
  <CodeEditor
    language={select('Editor language', ['css', 'json', 'javascript'])}
    onCopy={action('onCopy')}
    initialValue=".className{ background: #800080;}"
    light={boolean('Light (light)', false)}
    hasUpload={boolean('Has upload button (hasUpload)', true)}
    accept={array('Accepted file types (accept)', ['.scss', '.css'], ',')}
    onCodeEditorChange={action('onCodeEditorChange')}
    disabled={boolean('Disabled state (disabled)', true)}
    editor={select('Editor component', ['monaco', 'codemirror'], 'codemirror')}
  />
);

Default.storyName = 'default';
