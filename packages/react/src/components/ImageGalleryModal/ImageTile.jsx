import { SelectableTile } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { settings } from '../../constants/Settings';
import Button from '../Button';

const { iotPrefix } = settings;

const propTypes = {
  alt: PropTypes.string,
  id: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  isWide: PropTypes.bool,
  toggleImageSelection: PropTypes.func.isRequired,
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  i18n: PropTypes.shape({
    deleteButtonLabel: PropTypes.string,
  }),
  /** function called with the image id if they click the delete button */
  onDelete: PropTypes.func,
  testId: PropTypes.string,
};

const defaultProps = {
  alt: undefined,
  isSelected: false,
  isWide: false,
  title: undefined,
  i18n: {
    deleteButtonLabel: 'Delete',
  },
  onDelete: null,
  testId: 'image-tile',
};

const matchFilename = /([^\\/]+)\.(\w+)$/;
const extractFileName = (path) => {
  const fileNameGroupIndex = 1;
  const result = matchFilename.exec(path);
  return result && result[fileNameGroupIndex];
};

const ImageTile = ({
  alt,
  id,
  isSelected,
  isWide,
  toggleImageSelection,
  src,
  onDelete,
  i18n: { deleteButtonLabel },
  title,
  testId,
}) => {
  return (
    <SelectableTile
      className={classNames(`${iotPrefix}--image-tile`, {
        [`${iotPrefix}--image-tile--wide`]: isWide,
      })}
      id={id}
      selected={isSelected}
      onChange={toggleImageSelection}
      data-testid={testId}
    >
      <div data-testid={`${testId}-title`} className={`${iotPrefix}--image-tile__title`}>
        <span>{title ?? extractFileName(src) ?? src}</span>
      </div>
      <div className={`${iotPrefix}--image-tile__image-container`}>
        <img src={src} alt={alt} data-testid={`${testId}-image`} />
        {onDelete ? (
          <Button
            className={`${iotPrefix}--image-tile__title__delete`}
            renderIcon={TrashCan}
            hasIconOnly
            iconDescription={deleteButtonLabel}
            kind="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(id);
            }}
            testId={`${testId}-delete-button`}
          />
        ) : null}
      </div>
    </SelectableTile>
  );
};

ImageTile.propTypes = propTypes;
ImageTile.defaultProps = defaultProps;

export default ImageTile;
