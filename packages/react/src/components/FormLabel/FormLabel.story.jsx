/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { FormLabel, Tooltip } from '@carbon/react';
import { Information } from '@carbon/icons-react';

export default {
  title: '3 - Carbon/FormLabel',

  parameters: {
    component: FormLabel,
  },
};

export const Default = () => <FormLabel>Form label</FormLabel>;

export const WithTooltip = () => (
  <div>
    <FormLabel>Form label</FormLabel>
    <Tooltip align="right" label="This can be used to provide more information about a field.">
      <Information />
    </Tooltip>
  </div>
);

WithTooltip.storyName = 'Form Label with Tooltip';
