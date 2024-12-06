/**
 * IBM Confidential
 * OCO Source Materials
 * 5900-A0N
 * © Copyright IBM Corp. 2018
 * The source code for this program is not published or otherwise divested of its
 * trade secrets, irrespective of what has been deposited with the U.S. Copyright
 * Office.
 */
import React, { useRef, useState, useMemo } from 'react';
import { isNil, isEmpty } from 'lodash-es';
import { Edit } from '@carbon/react/icons';
import { TextInput } from '@carbon/react';

import {
  formatNumberWithPrecision,
  findMatchingThresholds,
} from '../../utils/cardUtilityFunctions';
import { settings } from '../../constants/Settings';
import { HotspotContentPropTypes } from '../../constants/SharedPropTypes';

import CardIcon from './CardIcon';

const { iotPrefix } = settings;

const propTypes = HotspotContentPropTypes;

const defaultProps = {
  title: null,
  i18n: {
    titlePlaceholderText: 'Enter label',
    titleEditableHintText: 'Click to edit label',
  },
  description: null,
  values: {},
  attributes: [],
  hotspotThreshold: null,
  renderIconByName: null,
  locale: 'en',
  isTitleEditable: false,
  id: 'hotspot-content',
  onChange: () => {},
};

/**
 * This component renders a form for editing Text Hotspot contents
 */
const HotspotContent = ({
  title,
  i18n,
  description,
  attributes,
  values,
  hotspotThreshold,
  locale,
  renderIconByName,
  isTitleEditable,
  id,
  onChange,
}) => {
  const [showTitleInput, setShowTitleInput] = useState(isTitleEditable && !title);
  const titleInputFocusRef = useRef(null);
  const [titleValue, setTitleValue] = useState(title);

  if (showTitleInput && titleInputFocusRef.current) {
    titleInputFocusRef.current.focus();
  }

  const mergedI18n = useMemo(() => ({ ...defaultProps.i18n, ...i18n }), [i18n]);
  const { titlePlaceholderText, titleEditableHintText } = mergedI18n;
  const renderTitle = () => {
    const titleEditableTextVersion = (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <h4 onClick={() => setShowTitleInput(isTitleEditable)} title={titleEditableHintText}>
        {titleValue !== null && titleValue !== '' ? titleValue : <Edit size={20} />}
      </h4>
    );

    const titleFixedTextVersion = (
      <h4 title={title} className={`${iotPrefix}--hotspot-content-fixed-title`}>
        {title}
      </h4>
    );

    const titleInputVersion = (
      <>
        <div className={`${iotPrefix}--hotspot-content-title-wrapper--editable`}>
          <TextInput
            className={`${iotPrefix}--hotspot-content-title-input`}
            defaultValue={typeof title === 'string' ? title : ''}
            id={`${id}-title`}
            data-testid={`${id}-title-test`}
            ref={titleInputFocusRef}
            onChange={(evt) => {
              setTitleValue(evt.currentTarget.value);
            }}
            onBlur={(evt) => {
              const latestValue = evt.currentTarget.value;
              setShowTitleInput(false);
              if (title !== latestValue) {
                onChange({ title: latestValue });
              }
            }}
            labelText=""
            placeholder={titlePlaceholderText}
          />
        </div>
        {
          // We still render the non editable title but as visually hidden so that the width will be
          // correctly modified as we type in the TextInput.
          <h4 className={`${iotPrefix}--hotspot-content-title__visually-hidden`}>{titleValue}</h4>
        }
      </>
    );

    return typeof title === 'string' && showTitleInput
      ? titleInputVersion
      : typeof title === 'string' && isTitleEditable
      ? titleEditableTextVersion
      : typeof title === 'string'
      ? titleFixedTextVersion
      : React.isValidElement(title)
      ? title
      : null;
  };

  return (
    <div className={`${iotPrefix}--hotspot-content`}>
      {renderTitle()}
      {description && <p className={`${iotPrefix}--hotspot-content-description`}>{description}</p>}
      {attributes.map(({ thresholds, dataSourceId, label, unit, precision }) => {
        // look for attribute specific thresholds first
        let attributeThresholdMatch = null;
        if (!isEmpty(thresholds)) {
          const matchingAttributeThresholds = findMatchingThresholds(
            thresholds.map((threshold) => ({ ...threshold, dataSourceId })),
            values,
            dataSourceId
          );
          if (matchingAttributeThresholds && !isEmpty(matchingAttributeThresholds)) {
            [attributeThresholdMatch] = matchingAttributeThresholds;
          }
        }
        const thresholdMatch =
          attributeThresholdMatch ||
          (hotspotThreshold && hotspotThreshold.dataSourceId === dataSourceId // then see if the parent threshold might match this attribute
            ? hotspotThreshold
            : null);
        const value = isNil(values?.[dataSourceId]) ? '--' : values[dataSourceId];
        const thresholdIcon =
          thresholdMatch && thresholdMatch.dataSourceId === dataSourceId && thresholdMatch.icon ? (
            <CardIcon
              icon={thresholdMatch.icon}
              color={thresholdMatch.color}
              title={`${thresholdMatch.dataSourceId} ${thresholdMatch.comparison} ${
                typeof thresholdMatch.value === 'number'
                  ? formatNumberWithPrecision(thresholdMatch.value, null, locale)
                  : thresholdMatch.value
              }`}
              width={16}
              height={16}
              renderIconByName={renderIconByName}
            />
          ) : null;
        return (
          <div
            key={`attribute-${dataSourceId}`}
            className={`${iotPrefix}--hotspot-content-attribute`}
          >
            <div className={`${iotPrefix}--hotspot-content-label-section`}>
              <span className={`${iotPrefix}--hotspot-content-label`}>{label}:</span>
            </div>
            <div className={`${iotPrefix}--hotspot-content-threshold-section`}>
              {thresholdIcon}
              <span
                style={{
                  '--threshold-color':
                    !thresholdIcon && thresholdMatch ? thresholdMatch.color : 'inherit ',
                  '--threshold-padding': thresholdIcon ? '0.25rem' : '0rem',
                }}
                className={`${iotPrefix}--hotspot-content-threshold`}
              >
                {typeof value === 'number'
                  ? formatNumberWithPrecision(
                      value,
                      !isNil(precision)
                        ? precision
                        : Math.abs(value) < 1
                        ? value === 0
                          ? 0
                          : 3 // for small decimals give 3 spots
                        : 1, // otherwise 1 spot if precision isn't set
                      locale
                    )
                  : value}
                {unit && value !== '--' && (
                  <span className={`${iotPrefix}--hotspot-content-unit`}>{unit}</span>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

HotspotContent.propTypes = propTypes;
HotspotContent.defaultProps = defaultProps;
export default HotspotContent;
