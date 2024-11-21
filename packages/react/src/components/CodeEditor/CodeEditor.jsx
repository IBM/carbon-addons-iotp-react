import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';
import { CodeSnippetSkeleton, CopyButton, Button } from '@carbon/react';
import PropTypes from 'prop-types';
import { Upload } from '@carbon/react/icons';
import classnames from 'classnames';

import { settings } from '../../constants/Settings';

const { prefix: carbonPrefix, iotPrefix } = settings;

loader.config({ monaco });

export const updateEditorAttribute = (disabled, editorValue) => {
  const textarea = document.getElementsByClassName('inputarea monaco-mouse-cursor-text')[0];

  if (disabled && !!editorValue.current) {
    textarea.setAttribute('disabled', '');
  } else if (textarea?.hasAttribute('disabled')) {
    textarea.removeAttribute('disabled');
  }
};

const propTypes = {
  /** Initial value for the editor */
  initialValue: PropTypes.string,
  /** the language being written in the editor */
  language: PropTypes.string,
  /** Callback called when editor copy icon is pressed */
  onCopy: PropTypes.func,
  /** List of types that the upload input accept */
  accept: PropTypes.arrayOf(PropTypes.string),
  /** Light theme */
  light: PropTypes.bool,
  /** Boolean to define if upload button should be render or not */
  hasUpload: PropTypes.bool,
  /** Callback on code editor change */
  onCodeEditorChange: PropTypes.func,
  /** Boolean to disabled code editor */
  disabled: PropTypes.bool,
  /** All the labels that need translation */
  i18n: PropTypes.shape({
    copyBtnDescription: PropTypes.string,
    copyBtnFeedBack: PropTypes.string,
    uploadBtnDescription: PropTypes.string,
  }),
  testId: PropTypes.string,
};

const defaultProps = {
  initialValue: null,
  language: 'css',
  onCopy: null,
  accept: ['.css'],
  light: false,
  hasUpload: false,
  onCodeEditorChange: null,
  disabled: false,
  i18n: {
    copyBtnDescription: 'Copy content',
    copyBtnFeedBack: 'Copied',
    uploadBtnDescription: 'Upload your file',
  },
  testId: 'code-editor',
};
const CodeEditor = ({
  initialValue,
  language,
  onCopy,
  accept,
  hasUpload,
  onCodeEditorChange,
  light,
  disabled,
  i18n,
  testId,
}) => {
  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);

  const editorValue = useRef();
  const inputNode = useRef(null);

  const [codeEditorValue, setCodeEditorValue] = useState(initialValue);

  useEffect(() => {
    updateEditorAttribute(disabled, editorValue);
  }, [disabled]);

  /**
   *
   * @param {object} editor - instance of the editor
   * @param {object} _monaco - instance of monaco
   */
  // eslint-disable-next-line no-unused-vars
  const handleEditorDidMount = (editor, _monaco) => {
    editorValue.current = editor;
    updateEditorAttribute(disabled, editorValue);
  };

  /**
   * Function used in editor onChange
   * @param {*} editorVal editor value
   */
  const handleEditorChange = (editorVal) => {
    setCodeEditorValue(editorVal);
    if (onCodeEditorChange) {
      onCodeEditorChange(editorVal);
    }
  };

  /**
   * Handle copy button click
   * @returns current editor value
   */
  const handleOnCopy = () => onCopy && onCopy(codeEditorValue);

  /**
   * takes a array of File javascript objects https://developer.mozilla.org/en-US/docs/Web/API/File
   * and creates a FileReader and  actually calls the readAsText method to trigger the loading of the file.
   */
  const readFileContent = (files) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      setCodeEditorValue(event.target.result);
      if (onCodeEditorChange) {
        onCodeEditorChange(event.target.result);
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleOnChange = (event) => {
    event.stopPropagation();
    readFileContent(event.target.files);
  };

  return (
    <div data-testid={testId} className={`${iotPrefix}--code-editor-wrapper`}>
      {hasUpload ? (
        <div className={`${iotPrefix}--code-editor-upload-wrapper`}>
          <Button
            className={classnames(`${iotPrefix}--code-editor-upload`, {
              [`${iotPrefix}--code-editor-upload--light`]: light,
              [`${iotPrefix}--code-editor-upload--disabled`]: disabled,
            })}
            hasIconOnly
            iconDescription={mergedI18n.uploadBtnDescription}
            onClick={() => {
              if (inputNode.current) {
                inputNode.current.value = '';
                inputNode.current.click();
              }
            }}
            renderIcon={Upload}
            kind="ghost"
            size="md"
            data-testid={`${testId}-upload-button`}
            disabled={disabled}
          />
          <input
            className={`${carbonPrefix}--visually-hidden`}
            ref={inputNode}
            id="upload"
            type="file"
            tabIndex={-1}
            multiple={false}
            accept={accept}
            name="upload"
            onChange={handleOnChange}
            disabled={disabled}
          />
        </div>
      ) : null}
      {onCopy && (
        <div className={`${iotPrefix}--code-editor-copy-wrapper`}>
          <CopyButton
            className={classnames(`${iotPrefix}--code-editor-copy`, {
              [`${iotPrefix}--code-editor-copy--light`]: light,
              [`${iotPrefix}--code-editor-copy--disabled-container`]: disabled,
            })}
            onClick={handleOnCopy}
            iconDescription={mergedI18n.copyBtnDescription}
            feedback={mergedI18n.copyBtnFeedBack}
            data-testid={`${testId}-copy-button`}
          />
        </div>
      )}
      <Editor
        className={classnames(`${iotPrefix}--code-editor-container`, {
          [`${iotPrefix}--code-editor-container--light`]: light,
          [`${iotPrefix}--code-editor-container--disabled`]: disabled,
        })}
        wrapperClassName={`${iotPrefix}--code-editor-wrapper`}
        loading={<CodeSnippetSkeleton />}
        value={codeEditorValue}
        line={2}
        language={language}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          minimap: {
            enabled: false,
          },
          autoIndent: true,
          wordWrap: 'off',
        }}
      />
    </div>
  );
};
CodeEditor.propTypes = propTypes;
CodeEditor.defaultProps = defaultProps;
export default CodeEditor;
