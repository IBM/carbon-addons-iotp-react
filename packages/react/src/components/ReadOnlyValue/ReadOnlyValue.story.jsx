import React from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { useEffect, useState } from '@storybook/addons';
import { Link, UnorderedList, ListItem } from '@carbon/react';

import ReadOnlyValueREADME from './ReadOnlyValue.mdx';
import ReadOnlyValue from './ReadOnlyValue';

export default {
  title: '1 - Watson IoT/ReadOnlyValue',
  parameters: {
    component: ReadOnlyValue,
    docs: {
      page: ReadOnlyValueREADME,
    },
  },
};

const loadingKnobsValue = () => ({
  heading: boolean('If content is heading', false, 'Loading (value)'),
  paragraph: boolean('If content is paragraph', true, 'Loading (value)'),
  lineCount: text('Line count', 1, 'Loading (value)'),
  width: text('Width of the loader', '100%', 'Loading (value)'),
});

export const Basic = () => (
  <div style={{ width: '100%', heigh: 'calc(100vh - 100px)' }}>
    <ReadOnlyValue
      label="Label"
      value="input value"
      isLoading={boolean('Loading state (isLoading)', false)}
      skeletonLoadingValue={loadingKnobsValue()}
    />
  </div>
);

Basic.storyName = 'basic stacked';

export const MultipleValuesStacked = () => {
  const isLoading = boolean('Loading state (isLoading)', false);
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
      <ReadOnlyValue
        label={text('label text', 'Label 01')}
        value={text('label text', 'input value 01')}
        isLoading={isLoading}
        type="stacked"
        skeletonLoadingValue={loadingKnobsValue()}
      />
      <ReadOnlyValue
        label={text('label text', 'Label 02')}
        value={text('label text', 'input value 02')}
        isLoading={isLoading}
        type="stacked"
        skeletonLoadingValue={loadingKnobsValue()}
      />
      <ReadOnlyValue
        label={text('label text', 'Label 03')}
        value={text('label text', 'input value 03')}
        isLoading={isLoading}
        type="stacked"
        skeletonLoadingValue={loadingKnobsValue()}
      />
      <ReadOnlyValue
        label={text('label text', 'Label 04')}
        value={text('label text', 'input value 04')}
        isLoading={isLoading}
        type="stacked"
        skeletonLoadingValue={loadingKnobsValue()}
      />
    </div>
  );
};

MultipleValuesStacked.storyName = 'multiple values - stacked';

export const BasicStackedWithCustomValue = () => (
  <div style={{ width: '100%', heigh: 'calc(100vh - 100px)' }}>
    <ReadOnlyValue label="Label" value={<div>custom div component</div>} type="stacked" />
    <ReadOnlyValue
      label="Label"
      value={
        <div>
          custom div component <Link href="www.ibm.com">Link</Link>
        </div>
      }
      type="stacked"
    />
    <ReadOnlyValue
      label="Label"
      value={
        <div>
          custom div component
          <UnorderedList>
            <ListItem>Unordered List level 1</ListItem>
            <ListItem>Unordered List level 1</ListItem>
            <ListItem>Unordered List level 1</ListItem>
          </UnorderedList>
        </div>
      }
      type="stacked"
    />
  </div>
);

BasicStackedWithCustomValue.storyName = 'basic stacked with custom value';
export const BasicInline = () => (
  <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
    <ReadOnlyValue
      label="Label"
      value="input value"
      type="inline"
      isLoading={boolean('Loading state (isLoading)', false)}
      skeletonLoadingValue={loadingKnobsValue()}
    />
  </div>
);

BasicInline.storyName = 'basic inline';

export const MultipleValuesInline = () => {
  const isLoading = boolean('Loading state (isLoading)', false);
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
      <ReadOnlyValue
        label="Label 01"
        value="input value 01"
        type="inline"
        isLoading={isLoading}
        skeletonLoadingValue={loadingKnobsValue()}
      />
      <ReadOnlyValue
        label="Label 02"
        value="input value 02"
        type="inline"
        isLoading={isLoading}
        skeletonLoadingValue={loadingKnobsValue()}
      />
      <ReadOnlyValue
        label="Label 03"
        value="input value 03"
        type="inline"
        isLoading={isLoading}
        skeletonLoadingValue={loadingKnobsValue()}
      />
      <ReadOnlyValue
        label="Label 04"
        value="input value 04"
        type="inline"
        isLoading={isLoading}
        skeletonLoadingValue={loadingKnobsValue()}
      />
    </div>
  );
};

MultipleValuesInline.storyName = 'multiple values - inline';

export const MultipleValuesLongLabelInline = () => (
  <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
    <ReadOnlyValue
      label={text('label text', 'Label bigger label')}
      value={text('value text', 'value 01')}
      type="inline"
    />
    <ReadOnlyValue
      label={text('label text', 'Label 02')}
      value={text('value text', 'value 02')}
      type="inline"
    />
    <ReadOnlyValue
      label={text('label text', 'Label 03')}
      value={text('value text', 'value 03')}
      type="inline"
    />
    <ReadOnlyValue
      label={text('label text', 'Label 04')}
      value={text('value text', 'value 04')}
      type="inline"
    />
  </div>
);

MultipleValuesLongLabelInline.storyName = 'multiple values - inline with long label';

export const MultipleValuesSmallInline = () => (
  <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
    <ReadOnlyValue label="Label 01" value="input value 01" type="inline_small" />
    <ReadOnlyValue label="Label 02" value="input value 02" type="inline_small" />
    <ReadOnlyValue label="Label 03" value="input value 03" type="inline_small" />
    <ReadOnlyValue label="Label 04" value="input value 04" type="inline_small" />
  </div>
);

MultipleValuesSmallInline.storyName = 'multiple values - inline small';

export const WithAsyncDataLoad = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [values, setValues] = useState([
    {
      label: 'Label 01',
      value: null,
    },
    {
      label: 'Label 02',
      value: null,
    },
  ]);

  useEffect(() => {
    let currentTimeout = null;
    const displayMoreItems = () => {
      setValues(() => [
        {
          label: 'Label 01',
          value: 'Input value 01',
        },
        {
          label: 'Label 02',
          value: 'Input value 02',
        },
      ]);
      setIsLoading(false);
    };
    currentTimeout = setTimeout(() => {
      displayMoreItems();
    }, 2000);
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
      <ReadOnlyValue
        label={values[0].label}
        value={values[0].value}
        isLoading={isLoading}
        type="stacked"
      />
      <ReadOnlyValue
        label={values[1].label}
        value={values[1].value}
        isLoading={isLoading}
        type="stacked"
      />
    </div>
  );
};

WithAsyncDataLoad.storyName = 'with async data load';
