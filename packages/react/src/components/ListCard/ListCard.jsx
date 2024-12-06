import React from 'react';
import {
  InlineLoading,
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
  Link,
} from '@carbon/react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { isEmpty } from 'lodash-es';

import { CARD_SIZES, CARD_CONTENT_PADDING } from '../../constants/LayoutConstants';
import { CardPropTypes } from '../../constants/CardPropTypes';
import Card from '../Card/Card';
import { getResizeHandles } from '../../utils/cardUtilityFunctions';
import deprecate from '../../internal/deprecate';

const ListCard = ({
  id,
  title,
  size,
  data,
  isLoading,
  isResizable,
  loadData,
  hasMoreData,
  layout,
  className,
  children,
  testID,
  testId,
  ...others
}) => {
  const handleScroll = (e) => {
    const element = e.target;
    //  height of the elements content - height element’s content is scrolled vertically === height of the scrollable part of the element
    if (
      element.scrollHeight - element.scrollTop === element.clientHeight &&
      hasMoreData &&
      !isLoading
    ) {
      loadData();
    }
  };

  const resizeHandles = isResizable ? getResizeHandles(children) : [];

  return (
    <Card
      id={id}
      title={title}
      size={size}
      onScroll={handleScroll}
      isEmpty={isEmpty(data)}
      resizeHandles={resizeHandles}
      // TODO: remove deprecated 'testID' in v3.
      testId={testID || testId}
      {...others}
    >
      <div
        className={classnames('list-card', className)}
        style={{
          paddingTop: 0,
          paddingRight: CARD_CONTENT_PADDING,
          paddingBottom: 0,
          paddingLeft: CARD_CONTENT_PADDING,
        }}
      >
        <StructuredListWrapper>
          <StructuredListBody
            // TODO: remove deprecated 'testID' in v3.
            data-testid={`${testID || testId}-list-body`}
          >
            {data
              ? data.map((item) => {
                  return (
                    <StructuredListRow key={item.id}>
                      <StructuredListCell className="list-card--item" key={`${item.id}-cell`}>
                        <div className="list-card--item--value">
                          {item.link ? (
                            <Link style={{ display: 'inherit' }} target="_blank" href={item.link}>
                              {item.value}
                            </Link>
                          ) : (
                            item.value
                          )}
                        </div>
                        {item.extraContent ? (
                          <div className="list-card--item--extra-content">{item.extraContent}</div>
                        ) : null}
                      </StructuredListCell>
                    </StructuredListRow>
                  );
                })
              : null}

            {isLoading ? (
              <InlineLoading
                // TODO: remove deprecated 'testID' in v3.
                data-testid={`${testID || testId}-loading`}
                description="Loading data..."
                status="active"
              />
            ) : null}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    </Card>
  );
};

ListCard.propTypes = {
  ...CardPropTypes,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      link: PropTypes.string,
      extraContent: PropTypes.element,
    })
  ),
  isLoading: PropTypes.bool,
  hasMoreData: PropTypes.bool,
  loadData: PropTypes.func.isRequired,
  layout: PropTypes.string,
  size: (props, propName, componentName) => {
    let error;
    if (!Object.keys(CARD_SIZES).includes(props[propName])) {
      error = new Error(
        `\`${componentName}\` prop \`${propName}\` must be one of ${Object.keys(CARD_SIZES).join(
          ','
        )}.`
      );
    }
    // If the size
    if (
      props[propName] === CARD_SIZES.SMALL ||
      props[propName] === CARD_SIZES.SMALLWIDE ||
      props[propName] === CARD_SIZES.SMALLFULL
    ) {
      error = new Error(
        `Deprecation notice: \`${componentName}\` prop \`${propName}\` cannot be \`${props[propName]}\` as the lists will not render correctly. Minimum size is \`MEDIUM\``
      );
    }
    return error;
  },
  // TODO: remove deprecated 'testID' in v3
  // eslint-disable-next-line react/require-default-props
  testID: deprecate(
    PropTypes.string,
    `The 'testID' prop has been deprecated. Please use 'testId' instead.`
  ),
  testId: PropTypes.string,
};

ListCard.defaultProps = {
  isLoading: false,
  hasMoreData: false,
  layout: '',
  data: [],
  size: CARD_SIZES.MEDIUM,
  // TODO: replace with 'list-card' in v3. to set better defaults instead of inheriting from Card
  testId: 'Card',
};

ListCard.displayName = 'ListCard';

export default ListCard;
