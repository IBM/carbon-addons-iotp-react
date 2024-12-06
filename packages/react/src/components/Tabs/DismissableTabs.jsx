import React, { useState } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Button } from '@carbon/react';
import { Dashboard, Activity, CloudMonitoring, Settings } from '@carbon/icons-react';

export const Dismissable = () => {
  const tabs = [
    {
      label: 'Dashboard',
      panel: <TabPanel key={0}>Dashboard</TabPanel>,
    },
    {
      label: 'Monitoring',
      panel: <TabPanel key={1}>Monitoring</TabPanel>,
    },
    {
      label: 'Activity',
      panel: <TabPanel key={2}>Activity</TabPanel>,
    },
    {
      label: 'Settings',
      panel: <TabPanel key={3}>Settings</TabPanel>,
      disabled: true,
    },
  ];
  const [renderedTabs, setRenderedTabs] = useState(tabs);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleTabChange = (evt) => {
    setSelectedIndex(evt.selectedIndex);
  };
  const handleCloseTabRequest = (tabIndex) => {
    if (renderedTabs[tabIndex].disabled) {
      return;
    }
    const selectedTab = renderedTabs[selectedIndex];
    const filteredTabs = renderedTabs.filter((_, index) => index !== tabIndex);
    if (tabIndex === selectedIndex) {
      const defaultTabIndex = filteredTabs.findIndex((tab) => !tab.disabled);
      setSelectedIndex(defaultTabIndex);
    } else {
      setSelectedIndex(filteredTabs.indexOf(selectedTab));
    }
    setRenderedTabs(filteredTabs);
  };
  const resetTabs = () => {
    setRenderedTabs(tabs);
  };
  return (
    <>
      <Button
        style={{
          marginBottom: '3rem',
        }}
        onClick={resetTabs}
      >
        Reset
      </Button>
      <Tabs
        selectedIndex={selectedIndex}
        onChange={handleTabChange}
        dismissable
        onTabCloseRequest={handleCloseTabRequest}
      >
        <TabList aria-label="List of tabs">
          {renderedTabs.map((tab, index) => (
            <Tab key={index} disabled={tab.disabled}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>{renderedTabs.map((tab) => tab.panel)}</TabPanels>
      </Tabs>
    </>
  );
};
export const DismissableWithIcons = () => {
  const tabs = [
    {
      label: 'Dashboard',
      panel: <TabPanel key={0}>Dashboard</TabPanel>,
    },
    {
      label: 'Monitoring',
      panel: <TabPanel key={1}>Monitoring</TabPanel>,
    },
    {
      label: 'Activity',
      panel: <TabPanel key={2}>Activity</TabPanel>,
    },
    {
      label: 'Settings',
      panel: <TabPanel key={3}>Settings</TabPanel>,
      disabled: true,
    },
  ];
  const [renderedTabs, setRenderedTabs] = useState(tabs);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleTabChange = (evt) => {
    setSelectedIndex(evt.selectedIndex);
  };
  const handleCloseTabRequest = (tabIndex) => {
    if (renderedTabs[tabIndex].disabled) {
      return;
    }
    const selectedTab = renderedTabs[selectedIndex];
    const filteredTabs = renderedTabs.filter((_, index) => index !== tabIndex);
    if (tabIndex === selectedIndex) {
      const defaultTabIndex = filteredTabs.findIndex((tab) => !tab.disabled);
      setSelectedIndex(defaultTabIndex);
    } else {
      setSelectedIndex(filteredTabs.indexOf(selectedTab));
    }
    setRenderedTabs(filteredTabs);
  };
  const resetTabs = () => {
    setRenderedTabs(tabs);
  };
  const icons = [Dashboard, CloudMonitoring, Settings, Activity];
  return (
    <>
      <Button
        style={{
          marginBottom: '3rem',
        }}
        onClick={resetTabs}
      >
        Reset
      </Button>
      <Tabs
        selectedIndex={selectedIndex}
        onChange={handleTabChange}
        dismissable
        onTabCloseRequest={handleCloseTabRequest}
      >
        <TabList aria-label="List of tabs">
          {renderedTabs.map((tab, index) => (
            <Tab key={index} disabled={tab.disabled} renderIcon={icons[index]}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>{renderedTabs.map((tab) => tab.panel)}</TabPanels>
      </Tabs>
    </>
  );
};
