import React, { Fragment, useState, createElement } from 'react';
import { action } from '@storybook/addon-actions';
import { boolean, select, text } from '@storybook/addon-knobs';
import { AccordionItem, Accordion } from '@carbon/react';

import { TextArea } from '../../TextArea';

// import TableSaveViewModalREADME from './TableSaveViewModal.mdx'; //carbon 11
import TableSaveViewModal from './TableSaveViewModal';

export default {
  title: '1 - Watson IoT/Table/User view management/TableSaveViewModal',

  parameters: {
    component: TableSaveViewModal,
    // docs: {
    //   page: TableSaveViewModalREADME,
    // }, //carbon 11
  },
};

/**
 * This TableSaveViewModal story demonstrates the most common usage,
 * including actions and validation via the knobs.
 */
export const Playground = () => {
  return (
    <TableSaveViewModal
      actions={{
        onSave: action('onSave'),
        onClose: action('onClose'),
        onClearError: action('onClearError'),
        onChange: action('onChange'),
      }}
      sendingData={boolean('sendingData', false)}
      error={select('error', [undefined, 'My error msg'], undefined)}
      open={boolean('open', true)}
      titleInputInvalid={boolean('titleInputInvalid', false)}
      titleInputInvalidText={text('titleInputInvalidText', undefined)}
      viewDescription={text('viewDescription', 'Entities: 2 filters, Alerts: 3 filters')}
    />
  );
};

Playground.storyName = 'Playground';
Playground.decorators = [createElement];

/**
 * This TableSaveViewModal story demonstrates a few simple states
 * and transitions.
 */
export const WithDemoStates = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [sendingData, setSendingData] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [titleInputInvalidText, setTitleInputInvalidText] = useState('');
  const [titleInputInvalid, setTitleInputInvalid] = useState(false);

  const activeViewExample = {
    description: 'Filters: 0, Search: pinoc',
    id: 'view1',
    isPublic: true,
    isDeleteable: true,
    isEditable: true,
    title: 'Search view',
    props: {
      view: {
        filters: [],
        table: {
          ordering: [],
          sort: {},
        },
        toolbar: {
          activeBar: 'column',
          search: { defaultValue: 'pinoc', defaultExpanded: true },
        },
      },
    },
  };

  return (
    <TableSaveViewModal
      actions={{
        onSave: (viewMetadata) => {
          // Application should save new or update existing view in your data layer.
          // Inform the TableViewDropdown this view is now the selected view and
          // that it is pristine (not edited).
          const viewToSave = { ...activeViewExample, ...viewMetadata };
          action('onSave')(viewToSave);
          setSendingData(true);
        },
        onClose: () => setIsOpen(false),
        onClearError: () => setSaveError(undefined),
        onChange: ({ title }) => {
          // Optional callback for when the input and checkboxes are changed.
          // Could be used to warn for duplicate view titles etc.
          if (title.length > 3) {
            setTitleInputInvalidText('This title already exists');
            setTitleInputInvalid(true);
          } else {
            setTitleInputInvalidText('0');
            setTitleInputInvalid(false);
          }
        },
      }}
      sendingData={sendingData}
      error={saveError}
      open={isOpen}
      titleInputInvalid={titleInputInvalid}
      titleInputInvalidText={titleInputInvalidText}
      viewDescription={activeViewExample.description}
    />
  );
};

WithDemoStates.storyName = 'With demo states';
WithDemoStates.decorators = [createElement];

/**
 * This story demonstrates how to set the initial default values of the form by using
 * the initialFormValues.By default the modal contains the following values
 * {title: '', isDefault: false, isPublic: false }`
 */
export const WithPrefilledValues = () => {
  return (
    <TableSaveViewModal
      actions={{
        onSave: action('onSave'),
        onClose: action('onClose'),
        onClearError: action('onClearError'),
        onChange: action('onChange'),
      }}
      open
      initialFormValues={{
        title: 'My view 1',
        isDefault: true,
      }}
    />
  );
};

WithPrefilledValues.storyName = 'With prefilled values';

/**
 * This story demonstrates how to customise parts of the TableSaveViewModal internals,
 * i.e. the description and the publicCheckbox.
 *
 * We use the overrides pattern to go two levels deep in our customization.
 */
export const WithCustomDescriptionAndPublicCheckboxUsingOverrides = () => {
  const descriptionContent = (
    <Fragment>
      <AccordionItem title="4 active filters">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
        </p>
      </AccordionItem>
      <AccordionItem title="1 hidden column">
        <p>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat.
        </p>
      </AccordionItem>
    </Fragment>
  );

  return (
    <TableSaveViewModal
      open
      actions={{
        onSave: action('onSave'),
        onClose: action('onClose'),
        onClearError: action('onClearError'),
        onChange: action('onChange'),
      }}
      overrides={{
        // We use the overrides property tableSaveViewForm to get access to that internal component
        tableSaveViewForm: {
          props: {
            // In the tableSaveViewForm we use props and overrides again to get access to its internals
            overrides: {
              // The internal component called viewDescriptionContainer is changed from a <p> to
              // an Accordion component and the children prop is overridden and served AccordionItems
              // instead of a normal string.
              viewDescriptionContainer: {
                component: Accordion,
                props: { children: descriptionContent },
              },
              // The public checkbox is overridden with the prop 'disabled' that forces
              // it to always stay disabled, no matter the status of the form or modal.
              publicCheckbox: { props: { disabled: true } },
            },
          },
        },
      }}
    />
  );
};

WithCustomDescriptionAndPublicCheckboxUsingOverrides.storyName =
  'With custom description and public checkbox using overrides';

export const WithCustomOverridenForm = () => {
  /**
   *  This story demonstrates how to change the complete form of the modal using the overrides pattern.
   */
  const myPrimaryInputId = 'myTextArea';

  return (
    <TableSaveViewModal
      open
      actions={{
        onSave: action('onSave'),
        onClose: action('onClose'),
        onClearError: action('onClearError'),
        onChange: action('onChange'),
      }}
      initialFormValues={{
        myTextArea: 'I can also have an initial value',
      }}
      i18n={{
        ...TableSaveViewModal.defaultProps.i18n,
        modalBodyText: 'You can save whatever you want',
      }}
      overrides={{
        // We use the overrides property composedModal to get access to that internal component
        composedModal: {
          props: {
            // We override the selectorPrimaryFocus prop to use the ID of our new primary input
            selectorPrimaryFocus: `#${myPrimaryInputId}`,
            // We also override the footer to remove the isPrimaryButtonDisabled that was dependent
            // on the old title not being empty. For simplicity here we always keep it enabled.
            footer: { isPrimaryButtonDisabled: false },
          },
        },
        tableSaveViewForm: {
          // Here we completely override the TableSaveViewForm component with a custom one.
          // The two most important props that we need to wire up is the onChange and disabled.
          component: ({ onChange, disabled }) => {
            return (
              <form>
                <TextArea
                  disabled={disabled}
                  labelText="My custom form element"
                  // ID is needed to make this element focused by default
                  id={myPrimaryInputId}
                  onChange={(evt) => {
                    // We need to emit the name and the value of our changed form element so that
                    // the parent (TableSaveViewModal) can manage the state for us.
                    onChange({ myTextArea: evt.target.value });
                  }}
                />
              </form>
            );
          },
        },
      }}
    />
  );
};

WithCustomOverridenForm.storyName = 'With custom overriden form';
