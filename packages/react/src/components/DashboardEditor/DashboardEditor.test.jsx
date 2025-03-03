import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Link } from '../Link';
import { settings } from '../../constants/Settings';
import { CARD_TYPES } from '../../constants/LayoutConstants';

import DashboardEditor from './DashboardEditor';
import { dashboardEditorActions } from './dashboardEditorMockData';

const { iotPrefix } = settings;
const mockOnImport = jest.fn();
const mockOnExport = jest.fn();
const mockOnCancel = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnCardChange = jest.fn();

const commonProps = {
  title: 'My dashboard',
  headerBreadcrumbs: [
    <Link href="www.ibm.com">Dashboard library</Link>,
    <Link href="www.ibm.com">Favorites</Link>,
  ],
  onImport: mockOnImport,
  onExport: mockOnExport,
  onCancel: mockOnCancel,
  onSubmit: mockOnSubmit,
  onDelete: jest.fn(),
  onCardSelect: jest.fn(),
  supportedCardTypes: [
    'TIMESERIES',
    'SIMPLE_BAR',
    'GROUPED_BAR',
    'STACKED_BAR',
    'VALUE',
    'IMAGE',
    'TABLE',
    'CUSTOM',
  ],
  ...dashboardEditorActions,
};

describe('DashboardEditor', () => {
  const realScrollTo = window.HTMLElement.prototype.scrollTo;
  beforeEach(() => {
    window.HTMLElement.prototype.scrollTo = jest.fn();
    commonProps.onCardSelect.mockClear();
  });
  afterEach(() => {
    window.HTMLElement.prototype.scrollTo = realScrollTo;
  });

  const mockValueCard = {
    id: 'Standard',
    title: 'value card',
    type: 'VALUE',
    size: 'MEDIUM',
    content: {
      attributes: [
        {
          dataSourceId: 'key1',
          unit: '%',
          label: 'Key 1',
          thresholds: [
            {
              comparison: '>=',
              value: 30,
              color: 'red',
              icon: 'User',
            },
          ],
        },
        {
          dataSourceId: 'key2',
          unit: 'lb',
          label: 'Key 2',
        },
      ],
    },
    values: { key1: 35 },
  };

  it('should be selectable by testId', () => {
    render(
      <DashboardEditor
        {...commonProps}
        isTitleEditable
        initialValue={{ cards: [mockValueCard] }}
        testId="DASHBOARD_EDITOR"
        breakpointSwitcher={{
          enabled: true,
        }}
      />
    );
    expect(screen.getByTestId('DASHBOARD_EDITOR')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD_EDITOR-header')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD_EDITOR-header-file-uploader-button')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD_EDITOR-header-breakpoint-switcher')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD_EDITOR-header-fit-to-screen-switch')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD_EDITOR-header-large-switch')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD_EDITOR-header-medium-switch')).toBeDefined();
    expect(screen.getByTestId('DASHBOARD_EDITOR-header-small-switch')).toBeDefined();
    expect(screen.getAllByTestId('Button').length).toBeGreaterThan(1);
    // these can be added back in after v3 passes testId to these components and overrides the defaults
    // expect(screen.getByTestId('DASHBOARD_EDITOR-header-page-title-bar')).toBeDefined();
    // expect(screen.getByTestId('DASHBOARD_EDITOR-header-export-button')).toBeDefined();
    // expect(screen.getByTestId('DASHBOARD_EDITOR-header-cancel-button')).toBeDefined();
    // expect(screen.getByTestId('DASHBOARD_EDITOR-header-delete-button')).toBeDefined();
    // expect(screen.getByTestId('DASHBOARD_EDITOR-header-submit-button')).toBeDefined();
  });

  it('edit title', () => {
    render(
      <DashboardEditor {...commonProps} isTitleEditable initialValue={{ cards: [mockValueCard] }} />
    );
    userEvent.click(screen.getByRole('button', { name: 'Edit title' }));
    userEvent.type(screen.getByRole('textbox', { name: 'Dashboard title' }), '25');
    userEvent.click(screen.getByRole('button', { name: 'Save title' }));
    // updates the title on screen
    expect(screen.getByRole('heading', { name: 'My dashboard25' })).not.toBeNull();
  });
  it('verify icon renders in editor', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // no card should be selected, meaning the gallery should be open
    const galleryTitle = screen.getByText('Gallery');
    expect(galleryTitle).toBeInTheDocument();
    // first find and click the the card
    const cardTitle = screen.getByTitle(mockValueCard.title);
    // Verify that the threshold icon renders
    expect(screen.getByTitle('User')).toBeInTheDocument();
    expect(cardTitle).toBeInTheDocument();
  });
  it('verify custom renderIconByName is called with threshold', () => {
    const mockRenderIconByName = jest.fn(() => <div />);
    render(
      <DashboardEditor
        {...commonProps}
        renderIconByName={mockRenderIconByName}
        initialValue={{ cards: [mockValueCard] }}
      />
    );
    // no card should be selected, meaning the gallery should be open
    expect(mockRenderIconByName).toHaveBeenCalled();
  });
  it('clicking card should select the card and close gallery', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // no card should be selected, meaning the gallery should be open
    const galleryTitle = screen.getByText('Gallery');
    expect(galleryTitle).toBeInTheDocument();
    // first find and click the the card
    const cardTitle = screen.getByTitle(mockValueCard.title);
    expect(cardTitle).toBeInTheDocument();
    fireEvent.mouseDown(cardTitle);
    // gallery title should be gone and the card edit form should be open
    expect(galleryTitle).not.toBeInTheDocument();
    // card select should have been called
    expect(commonProps.onCardSelect).toHaveBeenCalled();

    const addCardBtn = screen.getByText('Add card');
    expect(addCardBtn).toBeInTheDocument();
    const cardSizeFormInput = screen.getByText('Medium (4x2)');
    expect(cardSizeFormInput).toBeInTheDocument();
  });

  it('enter key should select the card and close gallery', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // no card should be selected, meaning the gallery should be open
    const galleryTitle = screen.getByText('Gallery');
    expect(galleryTitle).toBeInTheDocument();
    // first find and click the the card
    const cardTitle = screen.getByTitle(mockValueCard.title);
    expect(cardTitle).toBeInTheDocument();
    fireEvent.keyDown(cardTitle, { key: 'Enter' });
    // gallery title should be gone and the card edit form should be open
    expect(galleryTitle).not.toBeInTheDocument();
    // card select should have been called
    expect(commonProps.onCardSelect).toHaveBeenCalled();

    const addCardBtn = screen.getByText('Add card');
    expect(addCardBtn).toBeInTheDocument();
    const cardSizeFormInput = screen.getByText('Medium (4x2)');
    expect(cardSizeFormInput).toBeInTheDocument();
  });

  it('space key should select the card and close gallery', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // no card should be selected, meaning the gallery should be open
    const galleryTitle = screen.getByText('Gallery');
    expect(galleryTitle).toBeInTheDocument();
    // first find and click the the card
    const cardTitle = screen.getByTitle(mockValueCard.title);
    expect(cardTitle).toBeInTheDocument();
    fireEvent.keyDown(cardTitle, { key: 'Space' });
    // gallery title should be gone and the card edit form should be open
    expect(galleryTitle).not.toBeInTheDocument();
    // card select should have been called
    expect(commonProps.onCardSelect).toHaveBeenCalled();

    const addCardBtn = screen.getByText('Add card');
    expect(addCardBtn).toBeInTheDocument();
    const cardSizeFormInput = screen.getByText('Medium (4x2)');
    expect(cardSizeFormInput).toBeInTheDocument();
  });

  it('selecting clone card should duplicate card', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // there should only be one card with the same title to start
    expect(screen.getAllByText('value card')).toHaveLength(1);
    // first find and click the cards overflow menu
    const cardOverflowMenu = screen.getAllByTitle('Open and close list of options')[0];
    expect(cardOverflowMenu).toBeInTheDocument();
    fireEvent.click(cardOverflowMenu);
    // once open, find and click the edit card option
    const cloneCardBtn = screen.getByText('Clone card');
    expect(cloneCardBtn).toBeInTheDocument();
    fireEvent.click(cloneCardBtn);
    // there should now be two cards with the same title
    expect(screen.getAllByText('value card')).toHaveLength(2);
    // card select should have been called
    expect(commonProps.onCardSelect).toHaveBeenCalledWith(mockValueCard);
  });

  it('selecting remove card should remove card', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // there should only be one card with the same title to start
    expect(screen.getAllByText('value card')).toHaveLength(1);
    // first find and click the cards overflow menu
    const cardOverflowMenu = screen.getAllByTitle('Open and close list of options')[0];
    expect(cardOverflowMenu).toBeInTheDocument();
    fireEvent.click(cardOverflowMenu);
    // once open, find and click the edit card option
    const deleteCardBtn = screen.getByText('Delete card');
    expect(deleteCardBtn).toBeInTheDocument();
    fireEvent.click(deleteCardBtn);
    // there should now be zero cards with the same title
    expect(screen.queryAllByText('value card')).toHaveLength(0);
  });

  it('selecting card type in gallery should add card', () => {
    render(<DashboardEditor {...commonProps} />);
    // first find and click Simple bar
    const simpleBarBtn = screen.getByTitle('Simple bar');
    expect(simpleBarBtn).toBeInTheDocument();
    fireEvent.click(simpleBarBtn);
    // then find the card title that was created
    expect(screen.getAllByTitle('Untitled')).toHaveLength(1);
    // re-open the gallery by clicking open gallery
    let addCardBtn = screen.getByText('Add card');
    expect(addCardBtn).toBeInTheDocument();
    fireEvent.click(addCardBtn);
    // now find and click Time series
    const timeSeriesBtn = screen.getByTitle('Time series line');
    expect(timeSeriesBtn).toBeInTheDocument();
    fireEvent.click(timeSeriesBtn);
    // then find the card title that was created, but these will have the same names so check the length
    expect(screen.getAllByTitle('Untitled')).toHaveLength(2);
    // card select should have been called
    expect(commonProps.onCardSelect).toHaveBeenCalled();
    addCardBtn = screen.getByText('Add card');
    expect(addCardBtn).toBeInTheDocument();
    fireEvent.click(addCardBtn);
    // now find and click Grouped bar
    const groupedBarBtn = screen.getByTitle('Grouped bar');
    expect(groupedBarBtn).toBeInTheDocument();
    fireEvent.click(groupedBarBtn);
    // then find the card title that was created, but these will have the same names so check the length
    expect(screen.getAllByTitle('Untitled')).toHaveLength(3);
    // re-open the gallery by clicking open gallery
    addCardBtn = screen.getByText('Add card');
    expect(addCardBtn).toBeInTheDocument();
    fireEvent.click(addCardBtn);
    // now find and click Stacked bar
    const stackedBarBtn = screen.getByTitle('Stacked bar');
    expect(stackedBarBtn).toBeInTheDocument();
    fireEvent.click(stackedBarBtn);
    // then find the card title that was created, but these will have the same names so check the length
    expect(screen.getAllByTitle('Untitled')).toHaveLength(4);
    // // re-open the gallery by clicking open gallery
    addCardBtn = screen.getByText('Add card');
    expect(addCardBtn).toBeInTheDocument();
    fireEvent.click(addCardBtn);
    // now find and click Image
    const imageBtn = screen.getByTitle('Image');
    expect(imageBtn).toBeInTheDocument();
    fireEvent.click(imageBtn);
    // then find the card title that was created, but these will have the same names so check the length
    expect(screen.getAllByTitle('Untitled')).toHaveLength(5);
  });

  it('selecting table card type in gallery should add card', () => {
    render(<DashboardEditor {...commonProps} />);
    // first find and click table
    const tableBtn = screen.getByTitle('Data table');
    expect(tableBtn).toBeInTheDocument();
    fireEvent.click(tableBtn);
    // then find the card title that was created
    expect(screen.getAllByText('Untitled')).toHaveLength(1);
    // re-open the gallery by clicking open gallery
    const addCardBtn = screen.getByText('Add card');
    expect(addCardBtn).toBeInTheDocument();
    fireEvent.click(addCardBtn);
    // card select should have been called
    expect(commonProps.onCardSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        content: { allowNavigation: true, columns: [], showHeader: true },
        size: 'LARGE',
        title: 'Untitled',
        type: 'TABLE',
      })
    );
  });

  it('selecting submit should fire onSubmit', () => {
    render(<DashboardEditor {...commonProps} />);
    // find and click submit button
    const submitBtn = screen.getByText('Save and close');
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toBeCalledWith(
      {
        cards: [],
        layouts: {
          lg: [],
          md: [],
          sm: [],
        },
      },
      []
    );
  });

  it('selecting cancel should fire onCancel', () => {
    render(<DashboardEditor {...commonProps} />);
    // find and click submit button
    const cancelBtn = screen.getAllByText('Cancel')[0];
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toBeCalled();
  });

  it('selecting export btn should fire onExport', () => {
    render(<DashboardEditor {...commonProps} />);
    // find and click export button
    // Export button is iconOnly meaning we can't find it based off text
    const exportBtn = screen.getAllByRole('button')[2];
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);
    expect(mockOnExport).toBeCalled();
  });

  it('changing title in CardEditForm should change rendered card title', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // add a card
    const valueBtn = screen.getByTitle('Value / KPI');
    expect(valueBtn).toBeInTheDocument();
    fireEvent.click(valueBtn);
    // card edit form should be open
    const cardSizeFormInput = screen.getByDisplayValue('Untitled');
    expect(cardSizeFormInput).toBeInTheDocument();
    fireEvent.change(cardSizeFormInput, {
      target: { value: 'My new card title' },
    });
    expect(screen.getByTitle('My new card title')).toBeInTheDocument();
  });

  it('selecting medium breakpoint should render breakpoint info', async () => {
    render(<DashboardEditor {...commonProps} breakpointSwitcher={{ enabled: true }} />);
    // there should be no breakpoint text on initial render
    expect(screen.queryByText('Edit dashboard at')).not.toBeInTheDocument();
    // find and click small button
    const smallBtn = screen.getByRole('button', { name: 'Small view' });
    expect(smallBtn).toBeInTheDocument();
    fireEvent.click(smallBtn);
    // there should now be breakpoint text

    const breakpointMessage = await screen.findByText(
      'Edit dashboard at small layout (481 - 672px)'
    );
    expect(breakpointMessage).toBeInTheDocument(breakpointMessage);
  });

  it('triggering an error should show error message', () => {
    const originalDev = global.__DEV__;
    const originalError = console.error;
    const originalLog = console.log;
    const error = jest.fn();
    const log = jest.fn();
    console.error = error;
    console.log = log;
    global.__DEV__ = true;
    render(
      <DashboardEditor
        {...commonProps}
        initialValue={{
          cards: [
            {
              title: 'value card',
              type: 'VALUE',
              size: 'WRONG_SIZE',
              content: {
                attributes: [
                  {
                    dataSourceId: 'key1',
                    unit: '%',
                    label: 'Key 1',
                  },
                  {
                    dataSourceId: 'key2',
                    unit: 'lb',
                    label: 'Key 2',
                  },
                ],
              },
            },
          ],
        }}
      />
    );
    expect(log).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(6);
    const errMsg = screen.getAllByText('Something went wrong. Please refresh the page.');

    expect(errMsg).toHaveLength(2);
    console.error = originalError;
    console.log = originalLog;
    global.__DEV__ = originalDev;
  });

  it('uses custom onCardChange callback', () => {
    render(
      <DashboardEditor
        {...commonProps}
        onCardChange={(card) => {
          mockOnCardChange();
          return card;
        }}
      />
    );
    // add a card
    const valueBtn = screen.getByTitle('Value / KPI');
    expect(valueBtn).toBeInTheDocument();
    fireEvent.click(valueBtn);
    // mock on card change should be called first just when the card is added
    expect(mockOnCardChange).toHaveBeenCalled();
    // card edit form should be open
    const cardSizeFormInput = screen.getByDisplayValue('Untitled');
    expect(cardSizeFormInput).toBeInTheDocument();
    fireEvent.change(cardSizeFormInput, {
      target: { value: 'My new card title' },
    });
    // mock on card change should be called again when the card is edited
    expect(mockOnCardChange).toHaveBeenCalledTimes(2);
  });
  it('should set an initial breakpoint when provided', () => {
    render(
      <DashboardEditor
        {...commonProps}
        breakpointSwitcher={{
          enabled: true,
          initialValue: 'SMALL',
        }}
      />
    );

    expect(screen.getByRole('button', { name: 'Small view' })).not.toHaveClass(
      `${iotPrefix}--icon-switch--unselected`
    );
  });

  it('should call getDefaultCard when supplied', () => {
    const getDefaultCard = jest.fn().mockImplementation(() => ({
      id: '4678571d-e6be-43e5-b3e9-b309d3d98273',
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'IMAGE',
      content: {
        hideMinimap: true,
        hideHotspots: false,
        hideZoomControls: false,
        displayOption: 'contain',
      },
    }));
    render(<DashboardEditor {...commonProps} getDefaultCard={getDefaultCard} />);

    userEvent.click(screen.getByRole('button', { name: 'Image' }));
    expect(getDefaultCard).toHaveBeenCalledWith(CARD_TYPES.IMAGE, expect.anything());
  });

  it('default onFetchDynamicDemoHotspots should return correctly', async () => {
    jest.spyOn(DashboardEditor.defaultProps, 'onFetchDynamicDemoHotspots');
    const defaultHotspots = await DashboardEditor.defaultProps.onFetchDynamicDemoHotspots();
    expect(DashboardEditor.defaultProps.onFetchDynamicDemoHotspots).toHaveBeenCalled();
    expect(defaultHotspots).toEqual([{ x: 50, y: 50, type: 'fixed' }]);
  });
});
