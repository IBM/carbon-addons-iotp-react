import { createTheme } from '@uiw/codemirror-themes';

export const disabled = createTheme({
  theme: 'light',
  settings: {
    background: '#c6c6c6',
    backgroundImage: '',
    foreground: '#8d8d8d',
    caret: '#5d00ff',
    selection: '#036dd626',
    selectionMatch: '#036dd626',
    lineHighlight: '#c6c6c6',
    gutterBackground: '#c6c6c6',
    gutterForeground: '#000',
  },
});
