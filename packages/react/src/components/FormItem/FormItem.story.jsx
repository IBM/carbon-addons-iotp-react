/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { FormItem, NumberInput } from '@carbon/react';

export default {
  title: '3 - Carbon/FormItem',

  parameters: {
    component: FormItem,
  },
};

export const Default = () => (
  <FormItem>
    <NumberInput id="number-input-1" hideLabel />
  </FormItem>
);

Default.parameters = {
  info: {
    text: 'Form item.',
  },
};
