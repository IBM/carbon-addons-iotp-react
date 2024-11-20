import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { settings } from '../../constants/Settings';

import CodeEditor, { updateEditorAttribute } from './CodeEditor';

const { iotPrefix } = settings;

jest.mock('@monaco-editor/react', () => {
  const FakeEditor = jest.fn((props) => {
    props.onMount('mock-editor', props.value);
    return (
      <textarea
        className="inputarea monaco-mouse-cursor-text"
        data-auto={props.wrapperClassName}
        onChange={(e) => props.onChange(e.target.value)}
        value={props.value}
      />
    );
  });
  return FakeEditor;
});

jest.mock('@uiw/react-codemirror', () => {
  const FakeEditor = jest.fn((props) => {
    return (
      <textarea
        className="cm-editor"
        data-auto={props.wrapperClassName}
        onChange={(e) => props.onChange(e.target.value)}
        value={props.value}
        contentEditable={props.editable}
        data-language={props?.options?.mode}
      />
    );
  });
  return FakeEditor;
});

describe('CardEditor - monaco', () => {
  it('is selectable by testId', async () => {
    const handleOnCopy = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        testId="code-editor-testId"
      />
    );
    expect(screen.getByTestId('code-editor-testId')).toBeTruthy();

    expect(screen.getByTestId('code-editor-testId-copy-button')).toBeTruthy();
    expect(screen.getByTestId('code-editor-testId-upload-button')).toBeTruthy();
  });
  it('should upload when upload icon is clicked', async () => {
    const file = new File(['.classNew'], 'test.scss', { type: 'css' });
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();
    const { container } = render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        onCodeEditorChange={handleCodeEditorChange}
        i18n={{
          copyBtnDescription: 'Copy content',
          copyBtnFeedBack: 'Copied',
          uploadBtnDescription: 'Upload your file',
        }}
      />
    );

    const upload = screen.getByTestId('code-editor-upload-button');
    userEvent.click(upload);

    const uploadInput = container.querySelector(`input[name="upload"]`);

    // simulate upload event and wait until finish
    await waitFor(() =>
      fireEvent.change(uploadInput, {
        target: { files: [file] },
      })
    );

    // get the same uploader from the dom
    const uploadInputAfter = container.querySelector(`input[name="upload"]`);

    // check if the file is there
    expect(uploadInputAfter.files[0].name).toBe('test.scss');
    expect(uploadInputAfter.files.length).toBe(1);
  });
  it('should upload when upload icon is clicked - not call change editor ', async () => {
    const file = new File(['.classNew'], 'test.scss', { type: 'css' });
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();
    const { container } = render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        i18n={{
          copyBtnDescription: 'Copy content',
          copyBtnFeedBack: 'Copied',
          uploadBtnDescription: 'Upload your file',
        }}
      />
    );

    const upload = screen.getByTestId('code-editor-upload-button');
    userEvent.click(upload);

    const uploadInput = container.querySelector(`input[name="upload"]`);

    // simulate upload event and wait until finish
    await waitFor(() =>
      fireEvent.change(uploadInput, {
        target: { files: [file] },
      })
    );

    // get the same uploader from the dom
    const uploadInputAfter = container.querySelector(`input[name="upload"]`);

    // check if the file is there
    expect(uploadInputAfter.files[0].name).toBe('test.scss');
    expect(uploadInputAfter.files.length).toBe(1);
    expect(handleCodeEditorChange).not.toHaveBeenCalled();
  });
  it('should copy editor value when copy icon is clicked', async () => {
    const handleOnCopy = jest.fn();
    const { container } = render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
      />
    );
    const copy = container.querySelector(`.${iotPrefix}--code-editor-copy`);
    userEvent.click(copy);
    expect(handleOnCopy).toHaveBeenCalledWith('/* write your code here */');
  });
  it('should update code editor content', async () => {
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();

    const { container } = render(
      <CodeEditor
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        onCodeEditorChange={handleCodeEditorChange}
      />
    );

    expect(screen.getByDisplayValue('write your code here')).toBeInTheDocument();

    const editor = container.querySelector(`.inputarea.monaco-mouse-cursor-text`);

    fireEvent.change(editor, {
      target: { value: 'new value' },
    });

    expect(handleCodeEditorChange).toHaveBeenCalledWith('new value');
    expect(handleCodeEditorChange).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue('new value')).toBeInTheDocument();
  });
  it('should update code editor content - not call on change function', async () => {
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();

    const { container } = render(
      <CodeEditor
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
      />
    );

    expect(screen.getByDisplayValue('write your code here')).toBeInTheDocument();

    const editor = container.querySelector(`.inputarea.monaco-mouse-cursor-text`);

    fireEvent.change(editor, {
      target: { value: 'new value' },
    });

    expect(handleCodeEditorChange).not.toHaveBeenCalled();
    expect(handleCodeEditorChange).toHaveBeenCalledTimes(0);
    expect(screen.getByDisplayValue('new value')).toBeInTheDocument();
  });
  it('should render disabled state', async () => {
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();

    const { rerender, container } = render(
      <CodeEditor
        hasUpload
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        onCodeEditorChange={handleCodeEditorChange}
        disabled={false}
      />
    );

    const upload = screen.getByTestId('code-editor-upload-button');
    expect(upload).not.toHaveAttribute('disabled');
    const uploadInput = container.querySelector(`input[name="upload"]`);
    expect(uploadInput).not.toHaveAttribute('disabled');

    const copy = container.querySelector(`.${iotPrefix}--code-editor-copy`);
    expect(copy).not.toHaveAttribute('disabled');

    rerender(
      <CodeEditor
        hasUpload
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        onCodeEditorChange={handleCodeEditorChange}
        disabled
      />
    );

    const uploadDisabled = screen.getByTestId('code-editor-upload-button');
    expect(uploadDisabled).toHaveAttribute('disabled');
    const uploadInputDisabled = container.querySelector(`input[name="upload"]`);
    expect(uploadInputDisabled).toHaveAttribute('disabled');

    const copyDisabled = container.querySelector(`.${iotPrefix}--code-editor-copy`);
    expect(copyDisabled).not.toHaveAttribute('disabled');

    rerender(
      <CodeEditor
        hasUpload
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        onCodeEditorChange={handleCodeEditorChange}
        disabled={false}
      />
    );

    expect(upload).not.toHaveAttribute('disabled');
    expect(uploadInput).not.toHaveAttribute('disabled');
    expect(copy).not.toHaveAttribute('disabled');
  });
  it('updateEditorAttribute should change state', () => {
    let disabled = true;
    const editorValue = { current: {} };
    const textarea = document.createElement('textarea');
    textarea.classList.add('inputarea', 'monaco-mouse-cursor-text');
    document.body.appendChild(textarea);

    updateEditorAttribute(disabled, editorValue);
    expect(textarea.hasAttribute('disabled')).toBe(true);

    disabled = false;
    updateEditorAttribute(disabled, editorValue);

    expect(textarea.hasAttribute('disabled')).toBe(false);
    document.body.removeChild(textarea);
  });
});

describe('CardEditor - codemirror', () => {
  it('is selectable by testId', async () => {
    const handleOnCopy = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        testId="code-editor-testId"
        editor="codemirror"
      />
    );
    expect(screen.getByTestId('code-editor-testId')).toBeTruthy();

    expect(screen.getByTestId('code-editor-testId-copy-button')).toBeTruthy();
    expect(screen.getByTestId('code-editor-testId-upload-button')).toBeTruthy();
  });
  it('should upload when upload icon is clicked', async () => {
    const file = new File(['.classNew'], 'test.scss', { type: 'css' });
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();
    const { container } = render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        onCodeEditorChange={handleCodeEditorChange}
        i18n={{
          copyBtnDescription: 'Copy content',
          copyBtnFeedBack: 'Copied',
          uploadBtnDescription: 'Upload your file',
        }}
        editor="codemirror"
      />
    );

    const upload = screen.getByTestId('code-editor-upload-button');
    userEvent.click(upload);

    const uploadInput = container.querySelector(`input[name="upload"]`);

    // simulate upload event and wait until finish
    await waitFor(() =>
      fireEvent.change(uploadInput, {
        target: { files: [file] },
      })
    );

    // get the same uploader from the dom
    const uploadInputAfter = container.querySelector(`input[name="upload"]`);

    // check if the file is there
    expect(uploadInputAfter.files[0].name).toBe('test.scss');
    expect(uploadInputAfter.files.length).toBe(1);
  });
  it('should upload when upload icon is clicked - not call change editor ', async () => {
    const file = new File(['.classNew'], 'test.scss', { type: 'css' });
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();
    const { container } = render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        i18n={{
          copyBtnDescription: 'Copy content',
          copyBtnFeedBack: 'Copied',
          uploadBtnDescription: 'Upload your file',
        }}
        editor="codemirror"
      />
    );

    const upload = screen.getByTestId('code-editor-upload-button');
    userEvent.click(upload);

    const uploadInput = container.querySelector(`input[name="upload"]`);

    // simulate upload event and wait until finish
    await waitFor(() =>
      fireEvent.change(uploadInput, {
        target: { files: [file] },
      })
    );

    // get the same uploader from the dom
    const uploadInputAfter = container.querySelector(`input[name="upload"]`);

    // check if the file is there
    expect(uploadInputAfter.files[0].name).toBe('test.scss');
    expect(uploadInputAfter.files.length).toBe(1);
    expect(handleCodeEditorChange).not.toHaveBeenCalled();
  });
  it('should copy editor value when copy icon is clicked', async () => {
    const handleOnCopy = jest.fn();
    const { container } = render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        editor="codemirror"
      />
    );
    const copy = container.querySelector(`.${iotPrefix}--code-editor-copy`);
    userEvent.click(copy);
    expect(handleOnCopy).toHaveBeenCalledWith('/* write your code here */');
  });
  it('should update code editor content', async () => {
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();

    const { container } = render(
      <CodeEditor
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        onCodeEditorChange={handleCodeEditorChange}
        editor="codemirror"
      />
    );

    expect(screen.getByDisplayValue('write your code here')).toBeInTheDocument();

    const editor = container.querySelector(`.cm-editor `);

    fireEvent.change(editor, {
      target: { value: 'new value' },
    });

    expect(handleCodeEditorChange).toHaveBeenCalledWith('new value');
    expect(handleCodeEditorChange).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue('new value')).toBeInTheDocument();
  });
  it('should update code editor content - not call on change function', async () => {
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();

    const { container } = render(
      <CodeEditor
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        editor="codemirror"
      />
    );

    expect(screen.getByDisplayValue('write your code here')).toBeInTheDocument();

    const editor = container.querySelector(`.cm-editor`);

    fireEvent.change(editor, {
      target: { value: 'new value' },
    });

    expect(handleCodeEditorChange).not.toHaveBeenCalled();
    expect(handleCodeEditorChange).toHaveBeenCalledTimes(0);
    expect(screen.getByDisplayValue('new value')).toBeInTheDocument();
  });
  it('should render disabled state', async () => {
    const handleOnCopy = jest.fn();
    const handleCodeEditorChange = jest.fn();

    const { rerender, container } = render(
      <CodeEditor
        hasUpload
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        onCodeEditorChange={handleCodeEditorChange}
        disabled={false}
        editor="codemirror"
      />
    );

    const upload = screen.getByTestId('code-editor-upload-button');
    expect(upload).not.toHaveAttribute('disabled');
    const uploadInput = container.querySelector(`input[name="upload"]`);
    expect(uploadInput).not.toHaveAttribute('disabled');

    const copy = container.querySelector(`.${iotPrefix}--code-editor-copy`);
    expect(copy).not.toHaveAttribute('disabled');

    rerender(
      <CodeEditor
        hasUpload
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        onCodeEditorChange={handleCodeEditorChange}
        disabled
        editor="codemirror"
      />
    );

    const uploadDisabled = screen.getByTestId('code-editor-upload-button');
    expect(uploadDisabled).toHaveAttribute('disabled');
    const uploadInputDisabled = container.querySelector(`input[name="upload"]`);
    expect(uploadInputDisabled).toHaveAttribute('disabled');

    const copyDisabled = container.querySelector(`.${iotPrefix}--code-editor-copy`);
    expect(copyDisabled).not.toHaveAttribute('disabled');

    rerender(
      <CodeEditor
        hasUpload
        language="css"
        onCopy={handleOnCopy}
        initialValue="write your code here"
        accept={['.scss', '.css']}
        onCodeEditorChange={handleCodeEditorChange}
        disabled={false}
        editor="codemirror"
      />
    );

    expect(upload).not.toHaveAttribute('disabled');
    expect(uploadInput).not.toHaveAttribute('disabled');
    expect(copy).not.toHaveAttribute('disabled');
  });
  it('should render the data-language based on language set', async () => {
    const handleOnCopy = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender, container } = render(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        testId="code-editor-testId"
        editor="codemirror"
        language="css"
      />
    );
    expect(screen.getByTestId('code-editor-testId')).toBeTruthy();

    expect(container.querySelector(`.cm-editor[data-language="css"]`)).toBeTruthy();

    rerender(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        testId="code-editor-testId"
        editor="codemirror"
        language="json"
      />
    );
    expect(container.querySelector(`.cm-editor[data-language="json"]`)).toBeTruthy();

    rerender(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        testId="code-editor-testId"
        editor="codemirror"
        language="javascript"
      />
    );
    expect(container.querySelector(`.cm-editor[data-language="javascript"]`)).toBeTruthy();

    // default language is css
    rerender(
      <CodeEditor
        onCopy={handleOnCopy}
        initialValue="/* write your code here */"
        onClose={() => {}}
        hasUpload
        testId="code-editor-testId"
        editor="codemirror"
      />
    );
    expect(container.querySelector(`.cm-editor[data-language="css"]`)).toBeTruthy();
  });
});
