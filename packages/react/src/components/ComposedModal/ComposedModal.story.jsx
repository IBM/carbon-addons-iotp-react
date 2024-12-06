import React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, object, select, text } from '@storybook/addon-knobs';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';

import ComposedModalREADME from './ComposedModal.mdx';
import ComposedModal from './ComposedModal';

export default {
  title: '1 - Watson IoT/Modal/ComposedModal',

  parameters: {
    component: ComposedModal,
    docs: {
      page: ComposedModalREADME,
    },

    info: `Renders a carbon modal dialog.  This dialog adds these additional features on top of the base carbon dialog:
    - adds header.helpText prop to explain dialog
    - adds type prop for warning and error type dialogs
    - adds isLarge prop for large and small class styling dialogs
    - adds isFetchingData props for loading state
    - adds error and dataError prop to display notification about error at bottom of dialog
    - if submitFailed prop, it will find and scroll the failing carbon element into view
    - shows spinner on primary dialog button if sendingData prop is true

We also prevent the dialog from closing if you click outside it.
This dialog can be decorated by reduxDialog HoC and/or reduxForm HoC to automatically populate the fields below marked as
REDUXFORM or REDUXDIALOG`,
  },
};

export const WarningDialog = () => (
  <ComposedModal
    isLarge={boolean('isLarge', false)}
    type={select('type', ['warn', 'normal'], 'warn')}
    header={{
      label: text('header.label', 'Scary Operation'),
      title: text('header.title', 'Delete Stuff'),
      helpText: text('header.helpText', 'Deleting stuff can be hazardous to your health..'),
    }}
    onSubmit={action('submit')}
    onClose={action('close')}
    passiveModal={boolean('passiveModal', false)}
    isFullScreen={boolean('isFullScreen', false)}
  />
);

WarningDialog.storyName = 'as warning dialog';

export const States = () => {
  const error = text('error', 'an error has occurred');
  const isFetchingData = boolean('isFetchingData', true);
  const sendingData = boolean('sendingData', false);
  return (
    <ComposedModal
      sendingData={sendingData}
      isFetchingData={isFetchingData}
      error={!isFetchingData && !sendingData ? error : undefined}
      header={{
        label:
          !isFetchingData && !sendingData
            ? 'DataError'
            : isFetchingData
            ? 'Fetching Data'
            : 'Sending Data',
        title:
          !isFetchingData && !sendingData
            ? 'Cannot communicate with server'
            : isFetchingData
            ? 'We are retreiving data from the server.'
            : 'We are submitting data to the backend',
      }}
      onSubmit={action('submit')}
      onClose={action('close')}
      onClearError={action('onClearError')}
      isLarge={boolean('isLarge', false)}
      type={select('type', ['warn', 'normal'], 'normal')}
      passiveModal={boolean('passiveModal', false)}
      isFullScreen={boolean('isFullScreen', false)}
    >
      {text('body content', '')}
    </ComposedModal>
  );
};

States.storyName = 'with error, isFetchingData, and sendingData states';

export const WithCustomFooter = () => (
  <ComposedModal
    sendingData
    header={{
      label: 'Custom footer',
      title: 'Custom footer element',
    }}
    footer={
      <div
        style={{
          padding: '2rem',
        }}
      >
        custom footer element
      </div>
    }
    onClose={action('close')}
    isLarge={boolean('isLarge', false)}
    type={select('type', ['warn', 'normal'], 'normal')}
    onSubmit={action('submit')}
    passiveModal={boolean('passiveModal', false)}
    isFullScreen={boolean('isFullScreen', false)}
  />
);

WithCustomFooter.storyName = 'with custom footer';

export const PrimaryButtonIsHidden = () => (
  <ComposedModal
    header={{
      label: 'Custom footer',
      title: 'Custom footer element',
    }}
    footer={object('footer', {
      isPrimaryButtonHidden: true,
      isPrimaryButtonDisabled: false,
    })}
    onClose={action('close')}
    isLarge={boolean('isLarge', false)}
    type={select('type', ['warn', 'normal'], 'normal')}
    onSubmit={action('submit')}
    passiveModal={boolean('passiveModal', false)}
    isFullScreen={boolean('isFullScreen', false)}
  />
);

PrimaryButtonIsHidden.storyName = 'with hidden or disabled buttons';

export const HeaderCustomNodes = () => (
  <ComposedModal
    header={{
      label: <strong>Custom node label</strong>,
      title: <strong>Custom node title</strong>,
    }}
    onClose={action('close')}
    onSubmit={action('submit')}
    isLarge={boolean('isLarge', false)}
    type={select('type', ['warn', 'normal'], 'normal')}
    passiveModal={boolean('passiveModal', false)}
    isFullScreen={boolean('isFullScreen', false)}
  />
);

HeaderCustomNodes.storyName = 'with custom header nodes';

export const ComposedModalWithOverflowAndTooltip = () => (
  <ComposedModal
    header={{
      label: 'Translated bottom buttons',
      title: 'Dialog with bottom buttons and close button flyover translated',
    }}
    iconDescription="My Close Button"
    footer={{
      primaryButtonLabel: 'My Submit',
      secondaryButtonLabel: 'My Cancel',
    }}
    onClose={action('close')}
    onSubmit={action('submit')}
    isLarge={boolean('isLarge', false)}
    type={select('type', ['warn', 'normal'], 'normal')}
    passiveModal={boolean('passiveModal', false)}
    isFullScreen={boolean('isFullScreen', false)}
  >
    <OverflowMenu title="Test Overflow" iconDescription="Expand">
      <OverflowMenuItem key="default" onClick={action('onClick')} itemText="Click me" />
    </OverflowMenu>
  </ComposedModal>
);

ComposedModalWithOverflowAndTooltip.storyName = 'with i18n, overflow menu, and tooltip';
