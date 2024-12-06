import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Close } from '@carbon/react/icons';

import Button from '../../../Button';
import { settings } from '../../../../constants/Settings';

const { iotPrefix } = settings;

const TableDetailWizardHeader = ({ title, onClose, className }) => (
  <div className={classnames(className, `${iotPrefix}--table-detail-wizard-header--wrapper`)}>
    <h2 className={`${iotPrefix}--table-detail-wizard-header--heading`}>{title}</h2>
    <div className={`${iotPrefix}--table-detail-wizard-header--button`}>
      <Button
        kind="ghost"
        renderIcon={() => <Close size={20} />}
        iconDescription={title}
        onClick={() => onClose()}
      />
    </div>
  </div>
);

TableDetailWizardHeader.propTypes = {
  /** Title in the header  */
  title: PropTypes.string.isRequired,
  /** Close button callback  */
  onClose: PropTypes.func.isRequired,
};

export default TableDetailWizardHeader;
