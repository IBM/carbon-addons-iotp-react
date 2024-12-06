import React, { useState, useEffect } from 'react';
import { AccordionItem } from '@carbon/react';
import PropTypes from 'prop-types';

const AccordionItemDefer = ({ children, testId, ...props }) => {
  const { open } = props;
  const [openState, setOpenState] = useState(open);
  const [hasEverBeenOpened, setHasEverBeenOpened] = useState(open);
  useEffect(() => {
    setOpenState(open);
  }, [open]);
  const handleToggle = (event) => {
    if (props.onHeadingClick) {
      props.onHeadingClick(event);
    }
    setOpenState(!openState);
    setHasEverBeenOpened(true);
  };
  return (
    <AccordionItem data-testid={testId} {...props} onHeadingClick={handleToggle}>
      {(openState && children) || (hasEverBeenOpened && children)}
    </AccordionItem>
  );
};

AccordionItemDefer.propTypes = {
  ...AccordionItem.propTypes,
  testId: PropTypes.string,
};

AccordionItemDefer.defaultProps = {
  ...AccordionItem.defaultProps,
  testId: 'accordion-item-deferred',
};

export default AccordionItemDefer;
