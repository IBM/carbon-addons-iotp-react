import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BreadcrumbItem } from '@carbon/react';

import ComposedModal from '../../../ComposedModal/ComposedModal';
import BreadCrumb from '../../../Breadcrumb/Breadcrumb';
import { settings } from '../../../../constants/Settings';

import RadioButtonGroup from './HierarchyReorderModalRadioGroup';

const { iotPrefix } = settings;

const propTypes = {
  /** ListItems to be displayed */
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** Internationalization text */
  i18n: PropTypes.shape({
    itemTitle: PropTypes.string,
    /** String e.g. 'Move %d items underneath' that gets %d replaced by items count or
     * function receiving the selectedCount as param:
     * (itemsCount) => `Move ${itemsCount} items underneath` */
    itemsTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    allRows: PropTypes.string,
    modalDescription: PropTypes.string,
  }),
  /**   Close the dialog */
  onClose: PropTypes.func.isRequired,
  /** Callback to submit the dialog/form */
  onSubmit: PropTypes.func,
  /**  Is data currently being sent to the backend */
  sendingData: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  /** Should the dialog be open or not */
  open: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
};

/* istanbul ignore next */
const noop = () => {};

const defaultProps = {
  i18n: {
    itemTitle: 'Move 1 item underneath',
    itemsTitle: (itemsCount) => `Move ${itemsCount} items underneath`,
    allRows: 'All rows',
  },
  sendingData: null,
  onSubmit: noop,
  open: false,
};

export const handleSubmit = (onSubmitCB, resetSelectionCB, item) => {
  onSubmitCB(item);
  resetSelectionCB();
};

export const handleClose = (resetSelectionCB, onCloseCB) => {
  resetSelectionCB();
  onCloseCB();
};

const getBreadCrumbData = (breadcrumbs, selectedItems, path, pathIndex) => {
  if (pathIndex < path.length) {
    const breadCrumbItem = selectedItems.find((item) => item.id === path[pathIndex]);

    return getBreadCrumbData(
      [...breadcrumbs, breadCrumbItem],
      breadCrumbItem.children,
      path,
      pathIndex + 1
    );
  }

  return breadcrumbs;
};

const HierarchyListReorderModal = ({
  i18n,
  items,
  sendingData,
  selectedIds,
  open,
  onClose,
  onSubmit,
}) => {
  const [selectedParentPath, setSelectedParentPath] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [breadCrumbData, setBreadCrumbData] = useState(
    getBreadCrumbData([], items, selectedParentPath, 0)
  );

  useEffect(
    () => {
      setBreadCrumbData(getBreadCrumbData([], items, selectedParentPath, 0));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, selectedParentPath]
  );

  const resetSelection = () => {
    setSelectedParentPath([]);
    setSelectedItem(null);
  };

  const handleLineItemClicked = (item) => {
    if (item.children && item.children.length > 0) {
      setSelectedParentPath([...selectedParentPath, item.id]);
      setSelectedItem(null);
    } else {
      setSelectedItem(item.id);
    }
  };

  const handleBreadcrumbClick = (item, isCurrent) => {
    if (isCurrent) {
      return;
    }

    const index = selectedParentPath.findIndex((pathItem) => pathItem === item?.id);

    if (item !== null && index >= 0) {
      setSelectedParentPath(selectedParentPath.slice(0, index + 1));
    } else {
      setSelectedParentPath([]);
    }
  };

  const group =
    breadCrumbData.length > 0 ? breadCrumbData[breadCrumbData.length - 1].children : items;

  const firstCrumb = [
    <BreadcrumbItem
      className={`${iotPrefix}--hierarchy-list-bulk-modal--breadcrumb`}
      title={i18n.allRows}
      key={`breadcrumb-all-${i18n.allRows}`}
      isCurrentPage={selectedParentPath.length === 0}
    >
      <button
        type="button"
        className={`${iotPrefix}--hierarchy-list-bulk-modal--breadcrumb-button`}
        kind="ghost"
        onClick={() => handleBreadcrumbClick(null, selectedParentPath.length === 0)}
      >
        {i18n.allRows}
      </button>
    </BreadcrumbItem>,
  ];

  const renderedCrumbs = [
    ...firstCrumb,
    ...breadCrumbData.map((crumb, index) => (
      <BreadcrumbItem
        className={`${iotPrefix}--hierarchy-list-bulk-modal--breadcrumb`}
        title={crumb?.content?.value}
        key={`breadcrumb-${crumb?.id}-${crumb?.content?.value}`}
        isCurrentPage={index === breadCrumbData.length - 1}
      >
        <button
          type="button"
          className={`${iotPrefix}--hierarchy-list-bulk-modal--breadcrumb-button`}
          kind="ghost"
          onClick={() => handleBreadcrumbClick(crumb, index === breadCrumbData.length - 1)}
        >
          {crumb?.content?.value}
        </button>
      </BreadcrumbItem>
    )),
  ];

  return (
    <ComposedModal
      selectorPrimaryFocus=".cds--modal-header"
      className={`${iotPrefix}--hierarchy-list-bulk-modal`}
      open={open}
      header={{
        title:
          selectedIds.length > 1
            ? typeof i18n.itemsTitle === 'function'
              ? i18n.itemsTitle(selectedIds.length)
              : // Kept for backward compatability with existing i18n strings
                `${i18n.itemsTitle.replace('%d', selectedIds.length)}`
            : `${i18n.itemTitle}`,
      }}
      onClose={() => handleClose(resetSelection, onClose)}
      onSubmit={() => handleSubmit(onSubmit, resetSelection, selectedItem)}
      sendingData={sendingData}
    >
      <div className={`${iotPrefix}--hierarchy-list-bulk-modal--title`}>
        {i18n.modalDescription}
      </div>
      <BreadCrumb data-testid="modal-breadcrumb" hasOverflow noTrailingSlash>
        {renderedCrumbs}
      </BreadCrumb>
      <RadioButtonGroup
        selectedItems={group}
        setSelectedItem={setSelectedItem}
        selectedItem={selectedItem}
        selectedIds={selectedIds}
        handleLineItemClicked={handleLineItemClicked}
      />
    </ComposedModal>
  );
};

HierarchyListReorderModal.propTypes = propTypes;
HierarchyListReorderModal.defaultProps = defaultProps;

export default HierarchyListReorderModal;
