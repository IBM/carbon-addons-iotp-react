import React, { useEffect, useRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Cloud,
  Cloudy,
  Fog,
  Hail,
  PartlyCloudy,
  Rain,
  Sun,
  ChevronRight,
} from '@carbon/react/icons';

import { settings } from '../../constants/Settings';
import { CARD_ACTIONS } from '../../constants/LayoutConstants';

import MapCard from './MapCard';

const { iotPrefix } = settings;

describe('MapCards', () => {
  const settingsContentMock = jest.fn().mockReturnValue(<div>I am settings</div>);

  const MapImplementationMock = () => {
    const mapContainerRef = useRef(null);
    useEffect(() => {
      const hostElement = mapContainerRef.current;
      hostElement.appendChild(document.createTextNode('I am map'));
    });
    return (
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={mapContainerRef}
        stops={[]}
        onZoomIn={jest.fn()}
        onZoomOut={jest.fn()}
        settingsContent={settingsContentMock}
      />
    );
  };

  it('should be selectable by testID or testId', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <MapCard
        id="map-card"
        testID="MAP_CARD"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={jest.fn()}
        onZoomOut={jest.fn()}
        settingsContent={settingsContentMock}
        mapControls={[
          {
            hasScroll: true,
            visibleItemsCount: 4,
            group: [
              {
                icon: Hail,
                iconDescription: 'Map scroll hail',
                onClick: jest.fn(),
              },
              {
                icon: Rain,
                iconDescription: 'Map scroll rain',
                onClick: jest.fn(),
              },
              {
                icon: Sun,
                iconDescription: 'Map scroll sun',
                onClick: jest.fn(),
              },
            ],
          },
        ]}
      />
    );
    expect(console.error).toHaveBeenCalledWith(
      `Warning: The 'testID' prop has been deprecated. Please use 'testId' instead.`
    );
    console.error.mockReset();
    expect(screen.getByTestId('MAP_CARD')).toBeDefined();
    expect(screen.getByTestId('MAP_CARD-map-controls')).toBeDefined();
    expect(screen.getByTestId('MAP_CARD-zoom-control')).toBeDefined();
    expect(screen.getByTestId('MAP_CARD-legend')).toBeDefined();
    expect(screen.getByTestId('MAP_CARD-settings')).toBeDefined();

    rerender(
      <MapCard
        id="map-card"
        testId="map_card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={jest.fn()}
        onZoomOut={jest.fn()}
        settingsContent={settingsContentMock}
        mapControls={[
          {
            hasScroll: true,
            visibleItemsCount: 4,
            group: [
              {
                icon: Hail,
                iconDescription: 'Map scroll hail',
                onClick: jest.fn(),
              },
              {
                icon: Rain,
                iconDescription: 'Map scroll rain',
                onClick: jest.fn(),
              },
              {
                icon: Sun,
                iconDescription: 'Map scroll sun',
                onClick: jest.fn(),
              },
            ],
          },
        ]}
      />
    );

    expect(screen.getByTestId('map_card')).toBeDefined();
    expect(screen.getByTestId('map_card-map-controls')).toBeDefined();
    expect(screen.getByTestId('map_card-zoom-control')).toBeDefined();
    expect(screen.getByTestId('map_card-legend')).toBeDefined();
    expect(screen.getByTestId('map_card-settings')).toBeDefined();
  });

  it('renders a map inside the card', () => {
    render(<MapImplementationMock />);
    const cardContent = screen.getByTestId('map-card-content');
    expect(within(cardContent).getByText('I am map')).toBeVisible();
  });

  it('adds zoom controls with callbacks', () => {
    const zoomInCallback = jest.fn();
    const zoomOutCallback = jest.fn();

    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={zoomInCallback}
        onZoomOut={zoomOutCallback}
        settingsContent={settingsContentMock}
      />
    );

    const zoomInBtn = screen.getByRole('button', {
      name: MapCard.defaultProps.i18n.zoomIn,
    });
    expect(zoomInCallback).not.toHaveBeenCalled();
    userEvent.click(zoomInBtn);
    expect(zoomInCallback).toHaveBeenCalled();

    const zoomOutBtn = screen.getByRole('button', {
      name: MapCard.defaultProps.i18n.zoomOut,
    });
    expect(zoomOutCallback).not.toHaveBeenCalled();
    userEvent.click(zoomOutBtn);
    expect(zoomOutCallback).toHaveBeenCalled();
  });

  it('shows normal legend without title', () => {
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[
          ['Thing A', 'red'],
          ['Thing B', 'green'],
        ]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
      />
    );

    const thingA = screen.getByText('Thing A');
    expect(thingA).toBeVisible();
    expect(thingA.closest('div').children[0]).toHaveStyle({
      backgroundColor: 'red',
    });

    const thingB = screen.getByText('Thing B');
    expect(thingB).toBeVisible();
    expect(thingB.closest('div').children[0]).toHaveStyle({
      backgroundColor: 'green',
    });

    expect(screen.getByTestId('map-card-legend')).not.toHaveClass(
      `${iotPrefix}--map-legend--fullwidth`
    );
    expect(screen.queryByTitle(MapCard.defaultProps.i18n.legendTitle)).not.toBeInTheDocument();
  });

  it('shows full width legend with title ', () => {
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[
          ['Thing A', 'red'],
          ['Thing B', 'green'],
        ]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        isLegendFullWidth
      />
    );

    const thingA = screen.getByText('Thing A');
    expect(thingA).toBeVisible();
    expect(thingA.closest('div').children[0]).toHaveStyle({
      backgroundColor: 'red',
    });

    expect(screen.getByTitle(MapCard.defaultProps.i18n.legendTitle)).toBeVisible();
    expect(screen.getByTestId('map-card-legend')).toHaveClass(
      `${iotPrefix}--map-legend--fullwidth`
    );
  });

  it('shows full width legend toggle arrow correct in RTL', () => {
    document.documentElement.setAttribute('dir', 'rtl');

    const { container, rerender } = render(<ChevronRight size={32} />);
    const chevronRightIconContent = container.querySelector('svg path').getAttribute('d');

    rerender(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[
          ['Thing A', 'red'],
          ['Thing B', 'green'],
        ]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        isLegendFullWidth
      />
    );

    const toggleButton = screen.getByLabelText(MapCard.defaultProps.i18n.hideLegend);
    expect(toggleButton.firstChild).toHaveAttribute('d', chevronRightIconContent);
  });

  it('allows user to toggle full width legend', () => {
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[
          ['Thing A', 'red'],
          ['Thing B', 'green'],
        ]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        isLegendFullWidth
      />
    );

    expect(screen.getByTestId('map-card-legend')).not.toHaveClass(
      `${iotPrefix}--map-legend--fullwidth-collapsed`
    );
    const hideLegendButton = screen.getByRole('button', {
      name: MapCard.defaultProps.i18n.hideLegend,
    });
    expect(hideLegendButton).toBeVisible();

    // Toggle legend to collapse
    userEvent.click(hideLegendButton);
    expect(screen.getByTestId('map-card-legend')).toHaveClass(
      `${iotPrefix}--map-legend--fullwidth-collapsed`
    );
    const showLegendButton = screen.getByRole('button', {
      name: MapCard.defaultProps.i18n.showLegend,
    });
    expect(showLegendButton).toBeVisible();

    // Toggle show
    userEvent.click(showLegendButton);
    expect(screen.getByTestId('map-card-legend')).not.toHaveClass(
      `${iotPrefix}--map-legend--fullwidth-collapsed`
    );
  });

  it('can only show settings panel when card is expanded', () => {
    const cardActionCallback = jest.fn();
    const { rerender, container } = render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={() => <div>My settings</div>}
        availableActions={{ settings: true }}
        onCardAction={cardActionCallback}
        isSettingPanelOpen={false}
        isExpanded={false}
      />
    );

    expect(
      screen.queryByRole('button', {
        name: 'Settings',
      })
    ).not.toBeInTheDocument();

    rerender(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={() => <div>My settings</div>}
        availableActions={{ settings: true }}
        onCardAction={cardActionCallback}
        isSettingPanelOpen={false}
        isExpanded
      />
    );

    const showSettingsBtn = screen.getByRole('button', {
      name: 'Settings',
    });

    expect(showSettingsBtn).toBeVisible();
    // Using the class modifier "--open" to determine if the settings panel is open since
    // the actual settings panel is never really hidden, just pushed outside the container
    // which the testing library can't detect.
    expect(container.querySelectorAll(`.${iotPrefix}--map-settings--open`).length).toBeFalsy();

    userEvent.click(showSettingsBtn);
    expect(cardActionCallback).toHaveBeenCalledWith('map-card', 'ON_SETTINGS_CLICK');
  });

  it('shows custom settings panel when card is expanded and isSettingPanelOpen:true', () => {
    const { container } = render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={() => <div>My settings</div>}
        availableActions={{ settings: true }}
        onCardAction={() => {}}
        isSettingPanelOpen
        isExpanded
      />
    );

    const showSettingsBtn = screen.getByRole('button', {
      name: 'Settings',
    });

    expect(showSettingsBtn).toBeVisible();

    // Using the class modifier "--open" to determine if the settings panel is open since
    // the actual settings panel is never really hidden, just pushed outside the container
    // which the testing library doesn't detect.
    expect(container.querySelectorAll(`.${iotPrefix}--map-settings--open`).length).toBeTruthy();
  });

  it('fires card action callback when user clicks map configuration close button', () => {
    const onCardActionCallback = jest.fn();
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={() => <div>My settings</div>}
        availableActions={{ settings: true }}
        onCardAction={onCardActionCallback}
        isSettingPanelOpen
        isExpanded
      />
    );

    const settingsHeader = screen
      .getByText(MapCard.defaultProps.i18n.configurationTitle)
      .closest('div');
    const closeButton = within(settingsHeader).getByRole('button', {
      name: 'Close',
    });

    expect(closeButton).toBeVisible();
    userEvent.click(closeButton);

    expect(onCardActionCallback).toHaveBeenCalledWith('map-card', CARD_ACTIONS.ON_SETTINGS_CLICK);
  });

  it('can add layered map controls with callbacks', () => {
    const rainyClickCallback = jest.fn();
    const sunnyClickCallback = jest.fn();

    const layeredMapControls = [
      {
        id: 'test-id1',
        icon: Rain,
        iconDescription: 'Rainy',
        onClick: rainyClickCallback,
      },
      {
        id: 'test-id2',
        icon: Sun,
        iconDescription: 'Sunny',
        onClick: sunnyClickCallback,
      },
    ];
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        layeredControls={layeredMapControls}
      />
    );

    const triggerButton = screen.getByRole('button', {
      name: 'Layered controls',
    });
    expect(triggerButton.closest(`.${iotPrefix}--map-controls-layers--open`)).toBe(null);

    userEvent.click(triggerButton);
    expect(triggerButton.closest(`.${iotPrefix}--map-controls-layers--open`)).not.toBe(null);

    const rainyButton = screen.getByRole('button', {
      name: 'Rainy',
    });
    userEvent.click(rainyButton);
    expect(rainyClickCallback).toHaveBeenCalled();
  });

  it('only adds layered control trigger button if there are layered controls to show', () => {
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        layeredControls={[]}
      />
    );

    expect(
      screen.queryByRole('button', {
        name: 'Layered controls',
      })
    ).not.toBeInTheDocument();
  });

  it('can add "selactable" layered map controls', () => {
    const layeredMapControls = [
      {
        id: 'test-id1',
        icon: Rain,
        iconDescription: 'Rainy',
        onClick: () => {},
        kind: 'icon-selection',
        selected: false,
      },
      {
        id: 'test-id2',
        icon: Sun,
        iconDescription: 'Sunny',
        onClick: () => {},
        kind: 'icon-selection',
        selected: true,
      },
    ];
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        layeredControls={layeredMapControls}
      />
    );

    userEvent.click(
      screen.getByRole('button', {
        name: 'Layered controls',
      })
    );

    const sunnyButton = screen.getByRole('button', {
      name: 'Sunny',
    });
    expect(sunnyButton).toHaveClass(`${iotPrefix}--btn-icon-selection`);
    expect(sunnyButton).toHaveClass(`${iotPrefix}--btn-icon-selection--selected`);

    const rainyButton = screen.getByRole('button', {
      name: 'Rainy',
    });
    expect(rainyButton).toHaveClass(`${iotPrefix}--btn-icon-selection`);
  });

  it('can add map controls with callbacks', () => {
    const rainyClickCallback = jest.fn();
    const sunnyClickCallback = jest.fn();
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        mapControls={[
          {
            id: 'test-id1',
            icon: Rain,
            iconDescription: 'Rainy',
            onClick: rainyClickCallback,
          },
          {
            id: 'test-id2',
            icon: Sun,
            iconDescription: 'Sunny',
            onClick: sunnyClickCallback,
          },
        ]}
      />
    );

    userEvent.click(
      screen.getByRole('button', {
        name: 'Rainy',
      })
    );
    expect(rainyClickCallback).toHaveBeenCalled();

    userEvent.click(
      screen.getByRole('button', {
        name: 'Sunny',
      })
    );
    expect(sunnyClickCallback).toHaveBeenCalled();
  });

  it('can add "selectable" map controls', () => {
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        mapControls={[
          {
            id: 'test-id1',
            icon: Rain,
            iconDescription: 'Rainy',
            onClick: () => {},
            kind: 'icon-selection',
            selected: false,
          },
          {
            id: 'test-id2',
            icon: Sun,
            iconDescription: 'Sunny',
            onClick: () => {},
            kind: 'icon-selection',
            selected: true,
          },
        ]}
      />
    );

    const sunnyButton = screen.getByRole('button', {
      name: 'Sunny',
    });
    expect(sunnyButton).toHaveClass(`${iotPrefix}--btn-icon-selection`);
    expect(sunnyButton).toHaveClass(`${iotPrefix}--btn-icon-selection--selected`);

    const rainyButton = screen.getByRole('button', {
      name: 'Rainy',
    });
    expect(rainyButton).toHaveClass(`${iotPrefix}--btn-icon-selection`);
  });

  it('can add "grouped" map controls with callbacks', () => {
    const rainyClickCallback = jest.fn();
    const sunnyClickCallback = jest.fn();
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        mapControls={[
          {
            group: [
              {
                id: 'test-id1',
                icon: Rain,
                iconDescription: 'Rainy',
                onClick: rainyClickCallback,
              },
              {
                id: 'test-id2',
                icon: Sun,
                iconDescription: 'Sunny',
                onClick: sunnyClickCallback,
              },
            ],
          },
        ]}
      />
    );

    expect(
      screen
        .getByRole('button', {
          name: 'Sunny',
        })
        .closest('div')
    ).toHaveClass(`${iotPrefix}--map-controls-btn-group`);

    userEvent.click(
      screen.getByRole('button', {
        name: 'Rainy',
      })
    );
    expect(rainyClickCallback).toHaveBeenCalled();

    userEvent.click(
      screen.getByRole('button', {
        name: 'Sunny',
      })
    );
    expect(sunnyClickCallback).toHaveBeenCalled();
  });

  it('can add "grouped" and "selectable" map controls with callbacks', () => {
    const rainyClickCallback = jest.fn();
    const sunnyClickCallback = jest.fn();
    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        mapControls={[
          {
            group: [
              {
                id: 'test-id1',
                icon: Rain,
                iconDescription: 'Rainy',
                onClick: rainyClickCallback,
                kind: 'icon-selection',
                selected: false,
              },
              {
                id: 'test-id2',
                icon: Sun,
                iconDescription: 'Sunny',
                onClick: sunnyClickCallback,
                kind: 'icon-selection',
                selected: true,
              },
            ],
          },
        ]}
      />
    );

    expect(
      screen
        .getByRole('button', {
          name: 'Sunny',
        })
        .closest('div')
    ).toHaveClass(`${iotPrefix}--map-controls-btn-group`);

    const sunnyButton = screen.getByRole('button', {
      name: 'Sunny',
    });
    const rainyButton = screen.getByRole('button', {
      name: 'Rainy',
    });

    expect(sunnyButton).toHaveClass(`${iotPrefix}--btn-icon-selection`);
    expect(sunnyButton).toHaveClass(`${iotPrefix}--btn-icon-selection--selected`);
    expect(rainyButton).toHaveClass(`${iotPrefix}--btn-icon-selection`);

    userEvent.click(rainyButton);
    expect(rainyClickCallback).toHaveBeenCalled();

    userEvent.click(sunnyButton);
    expect(sunnyClickCallback).toHaveBeenCalled();
  });

  it('can add scrollable "grouped" map controls with callbacks', () => {
    const visibleItemsCount = 4;
    const buttonHeight = 40;
    const onClickCallback = jest.fn();

    const originalScrollBy = HTMLElement.prototype.scrollBy;
    const mockScrollBy = jest.fn();
    HTMLElement.prototype.scrollBy = mockScrollBy;

    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        isExpanded
        mapControls={[
          {
            hasScroll: true,
            visibleItemsCount,
            group: [
              {
                icon: Hail,
                iconDescription: 'Map scroll hail',
                onClick: onClickCallback,
              },
              {
                icon: Rain,
                iconDescription: 'Map scroll rain',
                onClick: onClickCallback,
              },
              {
                icon: Fog,
                iconDescription: 'Map scroll fog',
                onClick: onClickCallback,
              },
              {
                icon: Cloudy,
                iconDescription: 'Map scroll cloudy',
                onClick: onClickCallback,
              },
              {
                icon: Cloud,
                iconDescription: 'Map scroll cloud',
                onClick: onClickCallback,
              },
              {
                icon: PartlyCloudy,
                iconDescription: 'Map scroll partly cloudy',
                onClick: onClickCallback,
              },

              {
                icon: Sun,
                iconDescription: 'Map scroll sun',
                onClick: onClickCallback,
              },
            ],
          },
        ]}
      />
    );

    const scrollUpButton = screen.getByRole('button', { name: MapCard.defaultProps.i18n.scrollUp });
    const scrollDownButton = screen.getByRole('button', {
      name: MapCard.defaultProps.i18n.scrollDown,
    });

    // The height of the container is adjusted to show the
    // number of buttons defined in visibleItemsCount
    expect(screen.getByTestId('map-card-map-controls-scroll-controls-scroll-area')).toHaveStyle({
      '--scroll-area-height': `${visibleItemsCount * buttonHeight}px`,
    });

    expect(scrollUpButton).toBeVisible();
    expect(scrollUpButton).toHaveAttribute('disabled');
    expect(scrollDownButton).toBeVisible();
    expect(scrollDownButton).not.toHaveAttribute('disabled');

    userEvent.click(screen.getByRole('button', { name: 'Map scroll hail' }));
    userEvent.click(screen.getByRole('button', { name: 'Map scroll rain' }));
    userEvent.click(screen.getByRole('button', { name: 'Map scroll fog' }));
    userEvent.click(screen.getByRole('button', { name: 'Map scroll cloudy' }));

    expect(onClickCallback).toHaveBeenCalledTimes(4);

    userEvent.click(scrollDownButton);
    const scrollDistance = (visibleItemsCount - 1) * buttonHeight;
    expect(mockScrollBy).toHaveBeenCalledWith({
      left: 0,
      top: scrollDistance,
      behavior: 'smooth',
    });

    userEvent.click(screen.getByRole('button', { name: 'Map scroll cloud' }));
    userEvent.click(screen.getByRole('button', { name: 'Map scroll partly cloudy' }));
    userEvent.click(screen.getByRole('button', { name: 'Map scroll sun' }));

    userEvent.click(scrollUpButton);
    const scrollDistance2 = (visibleItemsCount - 1) * buttonHeight * -1;
    expect(mockScrollBy).toHaveBeenCalledWith({
      left: 0,
      top: scrollDistance2,
      behavior: 'smooth',
    });

    HTMLElement.prototype.scrollBy = originalScrollBy;
  });

  it('can handle scrollable "grouped" width visibleItemsCount:1 ', () => {
    const visibleItemsCount = 1;
    const buttonHeight = 40;
    const onClickCallback = jest.fn();

    const originalScrollBy = HTMLElement.prototype.scrollBy;
    const mockScrollBy = jest.fn();
    HTMLElement.prototype.scrollBy = mockScrollBy;

    render(
      <MapCard
        id="map-card"
        testID="map-card"
        mapContainerRef={React.createRef()}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        isExpanded
        mapControls={[
          {
            hasScroll: true,
            visibleItemsCount,
            group: [
              {
                icon: Hail,
                iconDescription: 'Map scroll hail',
                onClick: onClickCallback,
              },
              {
                icon: Rain,
                iconDescription: 'Map scroll rain',
                onClick: onClickCallback,
              },
            ],
          },
        ]}
      />
    );

    const scrollUpButton = screen.getByRole('button', { name: MapCard.defaultProps.i18n.scrollUp });
    const scrollDownButton = screen.getByRole('button', {
      name: MapCard.defaultProps.i18n.scrollDown,
    });

    // The height of the container is adjusted to show the
    // number of buttons defined in visibleItemsCount
    expect(screen.getByTestId('map-card-map-controls-scroll-controls-scroll-area')).toHaveStyle({
      '--scroll-area-height': `${visibleItemsCount * buttonHeight}px`,
    });

    expect(scrollUpButton).toBeVisible();
    expect(scrollDownButton).toBeVisible();

    userEvent.click(scrollDownButton);
    expect(mockScrollBy).toHaveBeenCalledWith({
      left: 0,
      top: 40,
      behavior: 'smooth',
    });

    userEvent.click(scrollUpButton);

    expect(mockScrollBy).toHaveBeenCalledWith({
      left: 0,
      top: -40,
      behavior: 'smooth',
    });

    HTMLElement.prototype.scrollBy = originalScrollBy;
  });

  it('can handle multiple references', () => {
    const mapRef = React.createRef();
    const dropRef = React.createRef();
    render(
      <MapCard
        id="map-card"
        testId="map-card"
        mapContainerRef={mapRef}
        dropRef={dropRef}
        stops={[]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
        isExpanded
      />
    );

    expect(mapRef.current).toHaveClass(`${iotPrefix}--map__container`);
    expect(dropRef.current).toHaveClass(`${iotPrefix}--map__container`);
  });

  it('disabled scroll down button when at the bottom', () => {
    const visibleItemsCount = 3;
    const originalScrollBy = HTMLElement.prototype.scrollBy;
    const mockScrollBy = jest.fn();
    HTMLElement.prototype.scrollBy = mockScrollBy;

    render(
      <MapCard
        id="map-card"
        testID="map-card"
        isExpanded
        mapContainerRef={React.createRef()}
        mapControls={[
          {
            hasScroll: true,
            visibleItemsCount,
            group: [
              {
                icon: Hail,
                iconDescription: 'Map scroll hail',
              },
              {
                icon: Rain,
                iconDescription: 'Map scroll rain',
              },
              {
                icon: Fog,
                iconDescription: 'Map scroll fog',
              },
              {
                icon: Cloudy,
                iconDescription: 'Map scroll cloudy',
              },
              {
                icon: Cloud,
                iconDescription: 'Map scroll cloud',
              },
              {
                icon: PartlyCloudy,
                iconDescription: 'Map scroll partly cloudy',
              },

              {
                icon: Sun,
                iconDescription: 'Map scroll sun',
              },
            ],
          },
        ]}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        settingsContent={settingsContentMock}
      />
    );

    const scrollDownButton = screen.getByRole('button', {
      name: MapCard.defaultProps.i18n.scrollDown,
    });
    expect(scrollDownButton).not.toBeDisabled();

    // Mock scrolling so that we reach the end of scroll after one
    // click on "scroll down".
    const scrollArea = screen.getByTestId('map-card-map-controls-scroll-controls-scroll-area');
    Object.defineProperty(scrollArea, 'scrollHeight', {
      writable: true,
      value: 200,
    });
    Object.defineProperty(scrollArea, 'scrollTop', {
      writable: true,
      value: 20,
    });
    Object.defineProperty(scrollArea, 'clientHeight', {
      writable: true,
      value: 100,
    });

    userEvent.click(scrollDownButton);

    // We have reached the end of scroll down
    expect(scrollDownButton).toBeDisabled();

    HTMLElement.prototype.scrollBy = originalScrollBy;
  });
});
