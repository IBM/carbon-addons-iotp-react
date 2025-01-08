import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Grid, List } from '@carbon/react/icons';
import { omit, isEqual } from 'lodash-es';
import { Modal, Search, ContentSwitcher } from '@carbon/react';

import { settings } from '../../constants/Settings';
import ComposedModal from '../ComposedModal';
import IconSwitch from '../IconSwitch/IconSwitch';
import { ComposedModalPropTypes } from '../ComposedModal/ComposedModal';
import { usePrevious } from '../../hooks/usePrevious';

import ImageTile from './ImageTile';

const GRID = 'grid';
const LIST = 'list';

const { iotPrefix, prefix } = settings;

export const ImagePropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    /** The alt attribute of the image element */
    alt: PropTypes.string,
    /** Title to be shown above image. Defaults to file name from src. */
    title: PropTypes.string,
  })
);

const propTypes = {
  ...ComposedModalPropTypes, // eslint-disable-line react/forbid-foreign-prop-types
  /** Classname to be added to the root node */
  className: PropTypes.string,
  /** Array of the images that should be shown */
  content: ImagePropTypes,
  /** The name of the view to be selected by default */
  defaultView: PropTypes.oneOf([GRID, LIST]),
  /** The footer prop of the ComposedModalPropTypes */
  footer: ComposedModalPropTypes.footer,
  /** Callback called with selected image props when modal submit button is pressed. */
  onSubmit: PropTypes.func.isRequired,
  /** Callback called when modal close icon or cancel button is pressed */
  onClose: PropTypes.func.isRequired,
  /** The image property to be included in the search */
  searchProperty: PropTypes.string,

  /** optional method to allow deletion of the images in the gallery */
  onDelete: PropTypes.func,

  /** The text of the grid button in the grid list toggle */
  gridButtonText: PropTypes.string,
  /** The text with instructions showing above the search */
  instructionText: PropTypes.string,
  /** The text of the list button in the grid list toggle */
  listButtonText: PropTypes.string,
  modalCloseIconDescriptionText: PropTypes.string,
  /** The small label text of the modal */
  modalLabelText: PropTypes.string,
  /** The large title text of the modal */
  modalTitleText: PropTypes.string,
  /** The primary button (select) text of the modal */
  modalPrimaryButtonLabelText: PropTypes.string,
  deleteLabelText: PropTypes.string,
  deleteModalLabelText: PropTypes.string,
  /** callback function that passes the image name and returns the title text for the delete */
  deleteModalTitleText: PropTypes.func,
  /** The secondary button (cancel) text of the modal */
  modalSecondaryButtonLabelText: PropTypes.string,
  /** The text for the search input placeHolder */
  searchPlaceHolderText: PropTypes.string,

  testId: PropTypes.string,
};

const defaultProps = {
  className: '',
  content: [],
  defaultView: GRID,
  footer: {},
  searchProperty: 'id',
  onDelete: null,

  gridButtonText: 'Grid',
  instructionText: 'Select the image that you want to display on this card.',
  listButtonText: 'List',
  modalLabelText: 'New image card',
  modalTitleText: 'Image gallery',
  modalPrimaryButtonLabelText: 'Select',
  deleteLabelText: 'Delete',
  deleteModalLabelText: 'Delete image',
  deleteModalTitleText: (image) => `Are you sure you want to delete the image: ${image}?`,
  modalSecondaryButtonLabelText: 'Cancel',
  modalCloseIconDescriptionText: 'Close',
  searchPlaceHolderText: 'Search image by file name',
  testId: 'image-gallery-modal',
};

const ImageGalleryModal = ({
  className,
  content,
  defaultView,
  gridButtonText,
  instructionText,
  listButtonText,
  modalCloseIconDescriptionText,
  modalLabelText,
  modalTitleText,
  deleteLabelText,
  deleteModalLabelText,
  deleteModalTitleText,
  modalPrimaryButtonLabelText,
  modalSecondaryButtonLabelText,
  onSubmit,
  onClose,
  searchPlaceHolderText,
  searchProperty,
  onDelete,
  footer,
  testId,
  ...composedModalProps
}) => {
  const [activeView, setActiveView] = useState(defaultView);
  const [selectedImage, setSelectedImage] = useState();
  const [isDeleteWarningModalOpen, setIsDeleteWarningModalOpen] = useState(false);
  const [filteredContent, setFilteredContent] = useState(content);
  const previousContent = usePrevious(content);
  // Need to support lazy loaded content
  useEffect(() => {
    if (!isEqual(content, previousContent)) {
      setFilteredContent(content);
    }
  }, [content, previousContent]);

  const toggleImageSelection = (imageProps) => {
    setSelectedImage((currentSelected) => {
      return currentSelected?.id === imageProps.id ? undefined : imageProps;
    });
  };

  const filterContent = (evt) => {
    const searchTerm = evt.currentTarget.value.toLowerCase();
    const filtered = content.filter((imageProps) => {
      const text = (imageProps[searchProperty] ?? '').toLowerCase();
      return text.includes(searchTerm);
    });
    setFilteredContent(filtered);
    setSelectedImage(undefined);
  };

  const handleDelete = () => {
    onDelete(selectedImage.id);
    setIsDeleteWarningModalOpen(false);
  };

  const baseClass = `${iotPrefix}--image-gallery-modal`;
  return (
    <>
      {isDeleteWarningModalOpen ? ( // warning modal to show first
        <Modal
          className={`${baseClass}--warning-modal`}
          open={isDeleteWarningModalOpen}
          danger
          primaryButtonText={deleteLabelText}
          secondaryButtonText={modalSecondaryButtonLabelText}
          modalHeading={deleteModalTitleText(selectedImage?.id)}
          size="xs"
          closeButtonLabel={modalCloseIconDescriptionText}
          onRequestClose={() => setIsDeleteWarningModalOpen(false)}
          onRequestSubmit={handleDelete}
          data-testid={`${testId}-warning-modal`}
        />
      ) : null}
      <ComposedModal
        selectorPrimaryFocus={`.${prefix}--modal-header`}
        type="normal"
        className={classnames(className, baseClass)}
        footer={{
          isPrimaryButtonDisabled: !selectedImage,
          primaryButtonLabel: modalPrimaryButtonLabelText,
          secondaryButtonLabel: modalSecondaryButtonLabelText,
          ...footer,
        }}
        header={{
          label: modalLabelText,
          title: modalTitleText,
        }}
        isLarge
        iconDescription={modalCloseIconDescriptionText}
        onClose={onClose}
        onSubmit={() => {
          // title only makes sense in the modal selector, not in the image card
          onSubmit(omit(selectedImage, 'title'));
        }}
        testId={testId}
        {...composedModalProps}
      >
        <div className={`${baseClass}__top-section`}>
          <p className={`${baseClass}__instruction-text`} alt={instructionText}>
            {instructionText}
          </p>
          <div className={`${baseClass}__search-list-view-container`}>
            <Search
              id={`${baseClass}--search`}
              onChange={filterContent}
              labelText=""
              light
              placeholder={searchPlaceHolderText}
              data-testid={`${testId}-search-input`}
            />
            <ContentSwitcher
              className={`${baseClass}__content-switcher`}
              onChange={(selected) => {
                setActiveView(selected.name);
              }}
              selectedIndex={activeView === GRID ? 0 : 1}
              data-testid={`${testId}-content-switcher`}
            >
              <IconSwitch
                name={GRID}
                size="large"
                text={gridButtonText}
                renderIcon={(props) => <Grid size={20} {...props} />}
                index={0}
                data-testid={`${testId}-grid-switch`}
              />
              <IconSwitch
                name={LIST}
                size="large"
                text={listButtonText}
                renderIcon={(props) => <List size={20} {...props} />}
                index={1}
                data-testid={`${testId}-list-switch`}
              />
            </ContentSwitcher>
          </div>
        </div>
        <div className={`${baseClass}__flex-wrapper`}>
          <div
            className={classnames(`${baseClass}__scroll-panel`, {
              [`${baseClass}__scroll-panel--grid`]: activeView === GRID,
              [`${baseClass}__scroll-panel--list`]: activeView === LIST,
            })}
          >
            {filteredContent.map((imageProps) => (
              <ImageTile
                isWide={activeView === LIST}
                key={imageProps.id}
                onDelete={(id) => {
                  // set the current selected image and popup the warning modal
                  if (selectedImage?.id !== id) {
                    setSelectedImage(imageProps);
                  }
                  setIsDeleteWarningModalOpen(true);
                }}
                {...imageProps}
                toggleImageSelection={() => toggleImageSelection(imageProps)}
                isSelected={selectedImage?.id === imageProps.id}
                testId={`${testId}-${imageProps.id}`}
              />
            ))}
          </div>
        </div>
      </ComposedModal>
    </>
  );
};

ImageGalleryModal.propTypes = propTypes;
ImageGalleryModal.defaultProps = defaultProps;

export default ImageGalleryModal;
