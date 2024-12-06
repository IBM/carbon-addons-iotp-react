// import initStoryshots, { multiSnapshotWithOptions } from '@storybook/addon-storyshots';
import ReactDOM from 'react-dom';
import MockDate from 'mockdate';

// import { settings } from '../constants/Settings';

// const { iotPrefix, prefix } = settings;
const realFindDOMNode = ReactDOM.findDOMNode;

const realScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
const realScrollTo = window.HTMLElement.prototype.scrollTo;
const realGetContext = window.HTMLCanvasElement.prototype.getContext;

jest.mock('mapbox-gl');

describe(`Storybook Snapshot tests and console checks`, () => {
  const spy = {};
  beforeAll((done) => {
    ReactDOM.findDOMNode = jest.fn(); // needed for this issue: https://github.com/facebook/react/issues/7371

    ReactDOM.createPortal = (node) => node; // needed for tooltips in this issue https://github.com/facebook/react/issues/11565
    // TODO: remove once carbon PR is merged
    spy.consoleError = jest.spyOn(console, 'error').mockImplementation((e) => {
      const message = e.toString();
      if (
        // deprecation warning for our WizardInline component. Can remove once it is removed from package
        !message.includes(
          'Warning: \nThe prop `blurb` for WizardInline has been deprecated in favor of `description`'
        ) &&
        // TODO: remove deprecated testID in v3.
        !message.includes(`The 'testID' prop has been deprecated. Please use 'testId' instead.`) &&
        !message.includes('Warning: Function components cannot be given refs.') &&
        !message.includes('Failed to initialize WebGL.')
      ) {
        done.fail(e);
      }
    });

    spy.consoleWarn = jest.spyOn(console, 'warn').mockImplementation((w) => {
      const message = w.toString();
      if (
        !message.includes('This page appears to be missing CSS declarations for Mapbox GL JS') &&
        !message.includes(
          'The prop `wrapperClassName` for Checkbox will be deprecated in V11 in favor of `className`. `className` will then be placed on the outer wrapper.'
        )
      ) {
        done.fail(w);
      }
    });

    done();
  });

  beforeEach(() => {
    MockDate.set('2018-10-28T12:34:56Z');
    jest.setTimeout(15000);
    // Mock the scroll function as its not implemented in jsdom
    // https://stackoverflow.com/questions/53271193/typeerror-scrollintoview-is-not-a-function
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollTo = jest.fn();
    window.getComputedStyle = () => ({
      getPropertyValue: () => '25',
    });
    window.document = new Document();
    window.HTMLCanvasElement.prototype.getContext = jest.fn();
    jest.spyOn(global, 'ResizeObserver').mockImplementation((callback) => {
      callback([{ contentRect: { width: 500, height: 500 } }]);

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });
  });
  // initStoryshots({
  //   storyKindRegex: /Watson\sIoT.*$|.*Getting\sStarted/g,
  //   test: multiSnapshotWithOptions((story) => ({
  //     createNodeMock: (element) => {
  //       // https://github.com/storybookjs/storybook/tree/next/addons/storyshots/storyshots-core#using-createnodemock-to-mock-refs
  //       // fallback is to mock something, otherwise our refs are invalid

  //       // these stories require an input be nested within the ref, for compatibility with Carbon's TableToolbarSearch component
  //       const storiesNeedingNestedInputRefs = [
  //         '1 - Watson IoT/Table.minitable',
  //         '1 - Watson IoT/Table.with simple search',
  //         '1 - Watson IoT/Table.Stateful Example with row nesting',
  //         '1 - Watson IoT/Table.Stateful Example with expansion',
  //         '1 - Watson IoT/TileCatalog.with search',
  //         '1 - Watson IoT/TableCard',
  //         '1 - Watson IoT/ComboChartCard',
  //       ];
  //       if (
  //         storiesNeedingNestedInputRefs.includes(story.kind) ||
  //         storiesNeedingNestedInputRefs.includes(`${story.kind}.${story.name}`)
  //       ) {
  //         const div = document.createElement('div');
  //         div.className = 'from-initStoryshots-createNodeMock'; // to assist in debugging
  //         div.innerHTML = "<input type='text'></input>";
  //         return div;
  //       }

  //       // Needed for DatePicker refererence in carbon-components-react
  //       if (story.kind === 'Watson IoT/Dashboard Header') {
  //         const fragment = document.createDocumentFragment();
  //         const div = document.createElement('div');
  //         div.className = 'from-initStoryshots-createNodeMock'; // to assist in debugging
  //         fragment.appendChild(div);
  //         return fragment.childNodes;
  //       }

  //       if (element.type === 'input') {
  //         return document.createElement('input');
  //       }

  //       // needed for HierarchyList ref
  //       if (
  //         element.props?.className?.includes(
  //           `${iotPrefix}--list-item--content ${iotPrefix}--list-item--content__selected`
  //         )
  //       ) {
  //         return {
  //           ...element,
  //           parentNode: document.createElement('div'),
  //         };
  //       }

  //       // needed for menubutton using carbon menu
  //       if (
  //         element.props?.className?.includes(`${prefix}--menu-option`) ||
  //         element.props?.className?.includes(`${prefix}--menu-divider`)
  //       ) {
  //         const parentNode = document.createElement('div');
  //         parentNode.classList.add(`${prefix}--menu`);
  //         return {
  //           ...element,
  //           parentNode,
  //         };
  //       }

  //       return document.createElement('div');
  //     },
  //   })),
  // });

  afterAll(() => {
    spy.consoleError.mockRestore();
    spy.consoleWarn.mockRestore();
    ReactDOM.findDOMNode = realFindDOMNode;
  });
  afterEach(() => {
    MockDate.reset();
    window.HTMLElement.prototype.scrollIntoView = realScrollIntoView;
    window.HTMLElement.prototype.scrollTo = realScrollTo;
    window.HTMLCanvasElement.prototype.getContext = realGetContext;
    jest.resetAllMocks();
  });
});
