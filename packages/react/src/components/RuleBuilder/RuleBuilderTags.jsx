import * as React from 'react';
import { TextInput } from '@carbon/react';
import PropTypes from 'prop-types';

import { settings } from '../../constants/Settings';

import { slugify } from './utils';

const { iotPrefix } = settings;

const baseClass = `${iotPrefix}--rule-builder-wrap`;

const RuleBuilderTags = React.forwardRef(({ children, onChange, i18n, ...props }, ref) => {
  const tagContainerRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const [paddingLeft, setPaddingLeft] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const tagLength = children?.[0]?.length;

  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    if (window?.IntersectionObserver) {
      const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
      observer.observe(tagContainerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [tagLength]);

  React.useLayoutEffect(() => {
    if (tagContainerRef.current && isVisible) {
      const { width } = tagContainerRef.current.getBoundingClientRect();
      setPaddingLeft(width);
    }
  }, [isVisible, tagLength]);

  const handleKeyUp = React.useCallback(
    (e) => {
      if (onChange && (e.key === 'Enter' || e.key === ',')) {
        onChange(slugify(e.target.value), 'TAGS');
        setIsVisible(false);
        inputRef.current.value = '';
      }
    },
    [onChange]
  );

  return (
    <div {...props} ref={ref}>
      <TextInput
        ref={inputRef}
        type="text"
        id="rule-builder-tags-input"
        light
        labelText={i18n.tagsLabel}
        onKeyUp={handleKeyUp}
        style={{ paddingLeft }}
      />
      <div className={`${baseClass}--tag-container`} ref={tagContainerRef}>
        {children}
      </div>
    </div>
  );
});

RuleBuilderTags.propTypes = {
  onChange: PropTypes.func,
  i18n: PropTypes.shape({
    tagsLabel: PropTypes.string,
  }),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

RuleBuilderTags.defaultProps = {
  onChange: null,
  i18n: {
    tagsLabel: 'Tags (optional)',
  },
};

export default RuleBuilderTags;
