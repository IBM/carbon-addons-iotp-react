import React from 'react';
import { mount } from '@cypress/react';
import { Checkbox, Help, User } from '@carbon/react/icons';

import { settings } from '../../constants/Settings';

import Header from './Header';

const { prefix } = settings;

const commonProps = {
  user: 'JohnDoe@ibm.com',
  tenant: 'TenantId: Acme',
  url: 'http://localhost:8989',
  className: 'custom-class-name',
  appName: 'Watson IoT Platform ',
  skipto: 'skip',
  shortAppName: 'Watson',
  subtitle: 'Manage',
  actionItems: [
    {
      label: 'Announcements',
      btnContent: <Checkbox fill="white" description="Announcements" />,
    },
    {
      label: 'Custom icon 1',
      btnContent: <Checkbox fill="white" description="icon" />,
    },
    {
      label: 'Custom icon 2',
      btnContent: <Checkbox fill="white" description="icon" />,
    },
    {
      label: 'Custom icon 3',
      btnContent: <Checkbox fill="white" description="icon" />,
    },
    {
      label: 'help',
      hasHeaderPanel: true,
      btnContent: (
        <Help
          size={20}
          fill="white"
          description="Help icon"
          className={`${prefix}--header__menu-item ${prefix}--header__menu-title`}
        />
      ),
      childContent: [
        {
          content: <p>This is a link</p>,
        },
        {
          content: (
            <React.Fragment>
              <span>
                JohnDoe@ibm.com
                <User size={20} fill="white" description="Icon" />
              </span>
            </React.Fragment>
          ),
        },
      ],
    },
    {
      label: 'user',
      btnContent: <User size={20} fill="white" description="Icon" />,
      menuLinkName: 'a menu link name',
      childContent: [
        {
          metaData: {
            href: 'http://google.com',
            title: 'this is a title',
            target: '_blank',
            rel: 'noopener noreferrer',
            element: 'a',
          },
          content: 'this is my message to you',
        },
        {
          metaData: {
            className: 'this',
            element: 'button',
          },
          content: (
            <span>
              JohnDoe@ibm.com
              <User size={20} fill="white" description="Icon" />
            </span>
          ),
        },
      ],
    },
    {
      label: 'open custom panel',
      btnContent: <User size={20} fill="white" description="Icon" />,
      menuLinkName: 'a menu link name',
      hasHeaderPanel: true,
    },
  ],
};

describe(
  'Header',
  {
    retries: {
      runMode: 5,
      openMode: 5,
    },
  },
  () => {
    const viewportWidth = 1670;
    const viewportHeight = 900;
    afterEach(() => {
      // reset viewport to defaults after each test
      cy.viewport(viewportWidth, viewportHeight);
    });
    context('header icons and overflow menu tests', () => {
      it('should show header action icons at a large enough viewport', () => {
        cy.viewport(607, viewportHeight);
        mount(<Header {...commonProps} />);

        cy.findByLabelText('Announcements').should('be.visible');
        cy.findByRole('button', { name: 'help' })
          .should('be.visible')
          .click()
          .find('svg')
          .invoke('attr', 'description')
          .should('eq', 'Help icon');
        cy.findByTestId('action-btn__panel')
          .should('be.visible')
          .findByText('JohnDoe@ibm.com')
          .should('be.visible');
        cy.findByRole('button', { name: 'help' })
          .click()
          .findByTestId('action-btn__panel')
          .should('not.exist');
      });

      it('should show header action icons at a large enough viewport in RTL', () => {
        cy.viewport(607, viewportHeight);
        cy.window().then((win) => {
          win.document.querySelectorAll('html')[0].setAttribute('dir', 'rtl');
        });
        mount(<Header {...commonProps} />);

        cy.findByLabelText('Announcements').should('be.visible');
        cy.findByRole('button', { name: 'help' })
          .should('be.visible')
          .click()
          .find('svg')
          .invoke('attr', 'description')
          .should('eq', 'Help icon');
        cy.findByTestId('action-btn__panel')
          .should('be.visible')
          .findByText('JohnDoe@ibm.com')
          .should('be.visible');
        cy.findByRole('button', { name: 'help' })
          .click()
          .findByTestId('action-btn__panel')
          .should('not.exist');

        cy.window().then((win) => {
          win.document.querySelectorAll('html')[0].setAttribute('dir', 'ltr');
        });
      });

      it('should only hide header action actions in a small viewport when visible buttons intersect', () => {
        cy.viewport(607, viewportHeight);
        mount(
          <>
            <style>{`.isReallyHidden { display: none !important; }`}</style>
            <Header
              {...commonProps}
              actionItems={[
                {
                  label: 'HiddenButton',
                  btnContent: <Checkbox fill="white" description="HiddenButton" />,
                  className: 'isReallyHidden',
                },
                ...commonProps.actionItems,
              ]}
            />
          </>
        );

        cy.findByLabelText('HiddenButton').should('not.be.visible');
        cy.findByLabelText('Announcements').should('be.visible');
        cy.findByRole('button', { name: 'help' }).should('be.visible');
        cy.findByRole('button', { name: 'Open and close list of options' }).should('not.exist');
        cy.findByRole('button', { name: 'user', label: 'user' }).should('be.visible');
      });

      it('should hide header action actions in a small viewport', () => {
        cy.viewport(500, viewportHeight);
        const onClick = cy.stub();
        mount(
          <Header
            {...commonProps}
            actionItems={commonProps.actionItems.map((item, index) => {
              if (index === 0) {
                return {
                  ...item,
                  onClick,
                };
              }

              return item;
            })}
          />
        );

        cy.findByLabelText('Announcements').should('not.exist');
        cy.findByRole('button', { name: 'help' }).should('not.exist');
        cy.findByRole('button', { name: 'Open and close list of options' }).click();
        cy.findByRole('menuitem', { name: 'Announcements' })
          .should('be.visible')
          .click()
          .should(() => {
            expect(onClick).to.have.been.called;
          });
        cy.findByRole('button', { name: 'Open and close list of options' })
          .find('svg')
          .invoke('attr', 'description')
          .should('eq', 'Open menu');
        cy.findByRole('button', { name: 'Open and close list of options' }).click();
        cy.findByRole('menuitem', { name: 'help' }).should('be.visible').click();
        cy.findByRole('button', { name: 'help' })
          .find('svg')
          .invoke('attr', 'description')
          .should('eq', 'Close menu');
        cy.findByTestId('action-btn__panel')
          .should('be.visible')
          .findByText('JohnDoe@ibm.com')
          .should('be.visible');
        cy.findByRole('button', { name: 'help' })
          .click()
          .findByTestId('action-btn__panel')
          .should('not.exist');

        cy.findByRole('button', { name: 'Open and close list of options' }).click();
        cy.findByRole('menuitem', { name: 'user' }).click();
        cy.findByText('JohnDoe@ibm.com').should('be.visible');
        cy.findByTestId('menuitem', { name: 'user' })
          .find('svg')
          .invoke('attr', 'description')
          .should('eq', 'Close menu');
        cy.findByTestId('menuitem', { name: 'user' }).click();
        cy.findByRole('button', { name: 'Open and close list of options' }).should('be.visible');

        // click the left side specifically to _not_ click the svg element right in the center
        // to ensure overflow also opens when clicking the button element.
        cy.findByRole('button', { name: 'Open and close list of options' }).click(5, 5, {
          force: true,
        });
        cy.findByRole('menuitem', { name: 'Announcements' }).should('be.visible');
      });

      it('should hide header action actions in a small viewport in RTL', () => {
        cy.viewport(500, viewportHeight);
        const onClick = cy.stub();
        cy.window().then((win) => {
          win.document.querySelectorAll('html')[0].setAttribute('dir', 'rtl');
        });
        mount(
          <Header
            {...commonProps}
            actionItems={commonProps.actionItems.map((item, index) => {
              if (index === 0) {
                return {
                  ...item,
                  onClick,
                };
              }

              return item;
            })}
          />
        );

        cy.findByLabelText('Announcements').should('not.exist');
        cy.findByRole('button', { name: 'help' }).should('not.exist');
        cy.findByRole('button', { name: 'Open and close list of options' }).click();
        cy.findByRole('menuitem', { name: 'Announcements' })
          .should('be.visible')
          .click()
          .should(() => {
            expect(onClick).to.have.been.called;
          });

        cy.window().then((win) => {
          win.document.querySelectorAll('html')[0].setAttribute('dir', 'ltr');
        });
      });

      it('should not show action items in overflow menu when isActionItemVisible returned false', () => {
        cy.viewport(500, viewportHeight);
        const isActionItemVisible = cy.stub().callsFake((item) => {
          if (item.label === 'Custom icon 1') {
            return false;
          }

          return true;
        });

        mount(<Header {...commonProps} isActionItemVisible={isActionItemVisible} />);

        cy.findByRole('button', { name: 'Open and close list of options' }).click();
        cy.findByRole('menuitem', { name: 'Announcements' }).should('be.visible');
        cy.findByRole('button', { name: 'Custom icon 1', label: 'Custom icon 1' }).should(
          'not.exist'
        );
      });

      it('should get width from documentElement when innerWidth fails', () => {
        cy.viewport(500, viewportHeight);
        let originalWidth;
        cy.window().then((win) => {
          originalWidth = win.innerWidth;
          Object.defineProperty(win, 'innerWidth', {
            writable: true,
            configurable: true,
            value: undefined,
          });
        });

        mount(<Header {...commonProps} />);

        cy.findByRole('button', { name: 'Open and close list of options' }).click();
        cy.findByRole('menuitem', { name: 'Announcements' }).should('be.visible');
        // I don't know if this is actually necessary in cypress, but just to be safe.
        cy.window().then((win) => {
          Object.defineProperty(win, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalWidth,
          });
        });
      });
    });
  }
);
