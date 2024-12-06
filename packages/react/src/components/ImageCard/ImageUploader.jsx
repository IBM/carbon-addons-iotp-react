import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FileUploaderDropContainer, TextInput, InlineNotification } from '@carbon/react';
import { Image } from '@carbon/react/icons';
import classnames from 'classnames';

import { settings } from '../../constants/Settings';
import Button from '../Button';
import { fetchDataURL } from '../../utils/cardUtilityFunctions';

const { iotPrefix } = settings;

const i18nDefaults = {
  dropContainerLabelText: 'Drag file here or click to upload file',
  dropContainerDescText:
    'Max file size is 1MB. Supported file types are: APNG, AVIF, GIF, JPEG, PNG, WebP',
  uploadByURLCancel: 'Cancel',
  uploadByURLButton: 'OK',
  browseImages: 'Add from gallery',
  insertUrl: 'Insert from URL',
  urlInput: 'Type or insert URL',
  errorTitle: 'Upload error: ',
  fileTooLarge: 'Image file is too large',
  wrongFileType: (accept) =>
    `This file is not one of the accepted file types, ${accept.join(', ')}`,
};

const propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  onBrowseClick: PropTypes.func,
  onUpload: PropTypes.func,
  /** the maximum file size in bytes */
  maxFileSizeInBytes: PropTypes.number,
  hasInsertFromUrl: PropTypes.bool,
  /** a callback invoked with the image information, if you want to fail validation return a string with the error */
  validateUploadedImage: PropTypes.func,
  i18n: PropTypes.shape({
    dropContainerLabelText: PropTypes.string,
    dropContainerDescText: PropTypes.string,
    uploadByURLCancel: PropTypes.string,
    uploadByURLButton: PropTypes.string,
    browseImages: PropTypes.string,
    insertUrl: PropTypes.string,
    urlInput: PropTypes.string,
    fileTooLarge: PropTypes.string,
    wrongFileType: PropTypes.func,
    errorTitle: PropTypes.string,
  }),
  testId: PropTypes.string,
};

const defaultProps = {
  accept: ['APNG', 'AVIF', 'GIF', 'JPEG', 'JPG', 'PNG', 'WebP'],
  maxFileSizeInBytes: 1048576,
  validateUploadedImage: null,
  onBrowseClick: () => {},
  onUpload: () => {},
  hasInsertFromUrl: false,
  i18n: i18nDefaults,
  testId: 'image-uploader',
};

const ImageUploader = ({
  hasInsertFromUrl,
  onBrowseClick,
  i18n,
  onUpload,
  accept,
  validateUploadedImage,
  maxFileSizeInBytes,
  testId,
  ...other
}) => {
  const [fromURL, setFromURL] = useState(false);
  const [error, setError] = useState(null);
  const [buttonSize, setButtonSize] = useState('default');
  const imgRef = useRef(null);
  useEffect(() => {
    if (other.width < 520) {
      setButtonSize('small');
    } else {
      setButtonSize('default');
    }
  }, [other.width]);

  const handleFromURLClick = () => {
    setFromURL(true);
  };

  const handleCancelFromURLClick = () => {
    setFromURL(false);
  };

  const handleUploadByURL = () => {
    const url = imgRef.current.value;
    if (url === '') {
      return;
    }
    fetchDataURL(url, setError)
      .then((imageData) => {
        if (imageData !== undefined) {
          onUpload(imageData);
        }
      })
      .catch((e) => setError(`${e.message}`));
  };

  const handleOnChange = (_event, files) => {
    const acceptedFiles = accept.map((i) => i.toLowerCase());
    if (validateUploadedImage) {
      const validationError = validateUploadedImage(files.addedFiles[0]);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    if (files.addedFiles[0].size > maxFileSizeInBytes) {
      setError(i18n.fileTooLarge);
    } else if (
      acceptedFiles.includes(
        files.addedFiles[0].name.match(/([^/.]*?)(?=\?|#|$)/ || [])[0].toLowerCase()
      )
    ) {
      const fR = new FileReader();
      fR.readAsDataURL(files.addedFiles[0]);
      fR.onloadend = (event) => {
        onUpload({ files, dataURL: event.target.result });
      };
      fR.onerror = (e) => {
        setError(e.message);
      };
    } else {
      setError(i18n.wrongFileType(accept));
    }
  };

  const handleErrorClose = () => {
    setError(false);
  };

  return (
    <div
      data-testid={testId}
      className={classnames(`${iotPrefix}--image-uploader`, {
        [`${iotPrefix}--image-uploader__medium`]: other.width >= 252 && other.width <= 519,
        [`${iotPrefix}--image-uploader__mediumwide`]: other.width >= 520 && other.height !== 576,
        [`${iotPrefix}--image-uploader__large`]:
          other.width >= 520 && other.width <= 1055 && other.height >= 576,
        [`${iotPrefix}--image-uploader__largewide`]: other.width >= 1056 && other.height >= 576,
        [`${iotPrefix}--image-uploader__url`]: fromURL,
      })}
    >
      {error ? (
        <InlineNotification
          onCloseButtonClick={handleErrorClose}
          kind="error"
          title={i18n.errorTitle}
          subtitle={error}
          data-testid={`${testId}-error-notification`}
        />
      ) : fromURL ? (
        <div className={`${iotPrefix}--image-uploader-url-wrapper`}>
          <TextInput
            id={`${iotPrefix}--image-uploader-url-input`}
            ref={imgRef}
            labelText=""
            placeholder={i18n.urlInput}
            data-testid={`${testId}-url-input`}
          />
          <Button
            size={buttonSize}
            onClick={handleUploadByURL}
            // TODO: pass testId in v3 to override defaults
            // testId={`${testId}-url-upload-button`}
          >
            {i18n.uploadByURLButton}
          </Button>
          <Button
            size={buttonSize}
            onClick={handleCancelFromURLClick}
            kind="ghost"
            // TODO: pass testId in v3 to override defaults
            // testId={`${testId}-url-cancel-button`}
          >
            {i18n.uploadByURLCancel}
          </Button>
        </div>
      ) : (
        <>
          <FileUploaderDropContainer
            size="md"
            labelText=""
            onAddFiles={handleOnChange}
            data-testid={`${testId}-file-drop-container`}
          />
          <div className={`${iotPrefix}--image-uploader-icon`}>
            <Image size={32} />
          </div>
          <div className={`${iotPrefix}--image-uploader-content`}>
            <h2 className={`${iotPrefix}--image-uploader-drop-label-text`}>
              {i18n.dropContainerLabelText}
            </h2>
            <p className={`${iotPrefix}--image-uploader-drop-description-text`}>
              {i18n.dropContainerDescText}
            </p>
            <Button
              size={buttonSize}
              onClick={onBrowseClick}
              kind="tertiary"
              // TODO: pass testId in v3 to override defaults
              // testId={`${testId}-browse-button`}
            >
              {i18n.browseImages}
            </Button>
            {hasInsertFromUrl ? (
              <Button
                size={buttonSize}
                onClick={handleFromURLClick}
                kind="tertiary"
                // TODO: pass testId in v3 to override defaults
                // testId={`${testId}-insert-from-url-button`}
              >
                {i18n.insertUrl}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

ImageUploader.propTypes = propTypes;
ImageUploader.defaultProps = defaultProps;
export default ImageUploader;
