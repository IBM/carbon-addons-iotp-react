import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionItem } from '@carbon/react';

const propTypes = {
  /** Component children's to be rendered */
  children: PropTypes.node.isRequired,
  /** Section title */
  title: PropTypes.string,
  /** Section is open or not */
  isOpen: PropTypes.bool,
  /** Callback for accordion item click */
  onClick: PropTypes.func,
  testId: PropTypes.string,
};

const defaultProps = {
  isOpen: true,
  onClick: () => {},
  title: null,
  testId: 'tile-gallery-section',
};

const TileGallerySection = ({ children, title, isOpen, onClick, testId }) => {
  const [open, setOpen] = useState(isOpen);

  const galleryItems = (
    <div data-testid={`${testId}-items`} className="tile-gallery--section--items">
      {children}
    </div>
  );

  return (
    <div data-testid={testId} className="tile-gallery--section">
      {title ? (
        <Accordion data-testid={`${testId}-accordion`}>
          <AccordionItem
            title={title}
            onHeadingClick={(evt) => {
              setOpen(!open);
              onClick(evt);
            }}
            open={open}
            data-testid={`${testId}-accordion-item`}
          >
            {galleryItems}
          </AccordionItem>
        </Accordion>
      ) : (
        galleryItems
      )}
    </div>
  );
};

TileGallerySection.propTypes = propTypes;
TileGallerySection.defaultProps = defaultProps;

export default TileGallerySection;
