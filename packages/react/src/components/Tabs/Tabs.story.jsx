/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabsSkeleton,
  TextInput,
  Checkbox,
  Button,
  Grid,
  Column,
} from '@carbon/react';
import { Dashboard, Activity, CloudMonitoring, Settings, Search } from '@carbon/icons-react';

import { Dismissable, DismissableWithIcons } from './DismissableTabs';

export default {
  title: '3 - Carbon/Tabs',
  decorators: [withKnobs],

  parameters: {
    component: Tabs,
  },
};

export const Default = () => (
  <Tabs>
    <TabList aria-label="List of tabs">
      <Tab>Dashboard</Tab>
      <Tab>Monitoring</Tab>
      <Tab>Activity</Tab>
      <Tab disabled>Settings</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>Tab Panel 1</TabPanel>
      <TabPanel>
        <form
          style={{
            margin: '2em',
          }}
        >
          <legend className="cds--label">Validation example</legend>
          <Checkbox id="cb" labelText="Accept privacy policy" />
          <Button
            style={{
              marginTop: '1rem',
              marginBottom: '1rem',
            }}
            type="submit"
          >
            Submit
          </Button>
          <TextInput
            type="text"
            labelText="Text input label"
            helperText="Optional help text"
            id="text-input-1"
          />
        </form>
      </TabPanel>
      <TabPanel>Tab Panel 3</TabPanel>
      <TabPanel>Tab Panel 4</TabPanel>
    </TabPanels>
  </Tabs>
);

export const Contained = () => (
  <Tabs>
    <TabList aria-label="List of tabs" contained>
      <Tab>Dashboard</Tab>
      <Tab>Monitoring</Tab>
      <Tab>Activity</Tab>
      <Tab>Analyze</Tab>
      <Tab disabled>Settings</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>Tab Panel 1</TabPanel>
      <TabPanel>
        <form
          style={{
            margin: '2em',
          }}
        >
          <legend className="cds--label">Validation example</legend>
          <Checkbox id="cb" labelText="Accept privacy policy" />
          <Button
            style={{
              marginTop: '1rem',
              marginBottom: '1rem',
            }}
            type="submit"
          >
            Submit
          </Button>
          <TextInput type="text" labelText="Text input label" helperText="Optional help text" />
        </form>
      </TabPanel>
      <TabPanel>Tab Panel 3</TabPanel>
      <TabPanel>Tab Panel 4</TabPanel>
      <TabPanel>Tab Panel 5</TabPanel>
    </TabPanels>
  </Tabs>
);

export const Manual = () => (
  <Tabs>
    <TabList activation="manual" aria-label="List of tabs">
      <Tab>Dashboard</Tab>
      <Tab>Monitoring</Tab>
      <Tab title="Tab label 4">Activity</Tab>
      <Tab>Analyze</Tab>
      <Tab disabled>Settings</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>Tab Panel 1</TabPanel>
      <TabPanel>
        <form
          style={{
            margin: '2em',
          }}
        >
          <legend className="cds--label">Validation example</legend>
          <Checkbox id="cb" labelText="Accept privacy policy" />
          <Button
            style={{
              marginTop: '1rem',
              marginBottom: '1rem',
            }}
            type="submit"
          >
            Submit
          </Button>
          <TextInput
            type="text"
            labelText="Text input label"
            helperText="Optional help text"
            id="text-input-1"
          />
        </form>
      </TabPanel>
      <TabPanel>Tab Panel 3</TabPanel>
      <TabPanel>Tab Panel 4</TabPanel>
      <TabPanel>Tab Panel 5</TabPanel>
    </TabPanels>
  </Tabs>
);

export const ContainedFullWidth = () => (
  <Grid condensed>
    <Column lg={16} md={8} sm={4}>
      <Tabs>
        <TabList aria-label="List of tabs" contained fullWidth>
          <Tab>TLS</Tab>
          <Tab>Origin</Tab>
          <Tab disabled>Rate limiting</Tab>
          <Tab>WAF</Tab>
          <Tab>IP Firewall</Tab>
          <Tab>Firewall rules</Tab>
          <Tab>Range</Tab>
          <Tab>Mutual TLS</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>
            <form>
              <legend className="cds--label">Validation example</legend>
              <Checkbox id="cb" labelText="Accept privacy policy" />
              <Button
                style={{
                  marginTop: '1rem',
                  marginBottom: '1rem',
                }}
                type="submit"
              >
                Submit
              </Button>
              <TextInput type="text" labelText="Text input label" helperText="Optional help text" />
            </form>
          </TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
          <TabPanel>Tab Panel 4</TabPanel>
          <TabPanel>Tab Panel 5</TabPanel>
          <TabPanel>Tab Panel 6</TabPanel>
          <TabPanel>Tab Panel 7</TabPanel>
          <TabPanel>Tab Panel 8</TabPanel>
        </TabPanels>
      </Tabs>
    </Column>
  </Grid>
);

export const DismissableTabsStory = () => <Dismissable />;

DismissableTabsStory.storyName = 'Dismissable';

export const DismissableTabsIconStory = () => <DismissableWithIcons />;

DismissableTabsIconStory.storyName = 'DismissableWithIcon';

export const WithIcons = () => (
  <Tabs>
    <TabList activation="manual" aria-label="List of tabs">
      <Tab renderIcon={Dashboard}>Dashboard</Tab>
      <Tab renderIcon={CloudMonitoring}>Monitoring</Tab>
      <Tab renderIcon={Activity}>Activity</Tab>
      <Tab renderIcon={Search}>Analyze</Tab>
      <Tab disabled renderIcon={Settings}>
        Settings
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel>Tab Panel 1</TabPanel>
      <TabPanel>
        <form
          style={{
            margin: '2em',
          }}
        >
          <legend className="cds--label">Validation example</legend>
          <Checkbox id="cb" labelText="Accept privacy policy" />
          <Button
            style={{
              marginTop: '1rem',
              marginBottom: '1rem',
            }}
            type="submit"
          >
            Submit
          </Button>
          <TextInput
            type="text"
            labelText="Text input label"
            helperText="Optional help text"
            id="text-input-1"
          />
        </form>
      </TabPanel>
      <TabPanel>Tab Panel 3</TabPanel>
      <TabPanel>Tab Panel 4</TabPanel>
      <TabPanel>Tab Panel 5</TabPanel>
    </TabPanels>
  </Tabs>
);

export const Skeleton = () => {
  return (
    <div
      style={{
        maxWidth: '100%',
      }}
    >
      <TabsSkeleton />
    </div>
  );
};

Skeleton.storyName = 'skeleton';
