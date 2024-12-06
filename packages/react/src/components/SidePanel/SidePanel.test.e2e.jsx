import React from 'react';
import { mount } from '@cypress/react';
import { Edit, Information, SendAlt } from '@carbon/react/icons';

import Button from '../Button';

import SidePanel from './SidePanel';

describe('SidePanel', () => {
  const commonProps = {
    title: 'test title',
    subtitle: 'test content',
  };
  const content =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vitae bibendum urna. Maecenas interdum suscipit purus, et vehicula justo finibus sit amet. Fusce mi dolor, suscipit vel pharetra et, rhoncus et nisi. Nunc a bibendum turpis, aliquam tristique nibh. Vestibulum elit orci, posuere nec ante id, porttitor aliquam est. Proin est purus, rutrum ut sollicitudin in, vulputate a neque. Aliquam vulputate, diam vitae congue rutrum, velit arcu pulvinar neque, vel tristique quam mauris sit amet ipsum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nam quam tortor, sagittis vitae nibh id, imperdiet efficitur urna. Duis fermentum nulla elementum, eleifend massa a, congue erat. Morbi a magna pulvinar, vulputate dui id, dignissim neque. Sed ultricies ligula sapien, posuere hendrerit turpis dapibus vitae. Nullam a nisi semper, efficitur ex ac, mattis nulla. Aliquam nec maximus lacus. Suspendisse venenatis erat suscipit mauris vulputate tincidunt';

  const Content = () => (
    <div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a dapibus nulla. Fusce et enim
        et elit rutrum interdum quis eu nulla. Nulla neque neque, condimentum eget pellentesque sit
        amet, volutpat ac enim. Etiam id magna vel dolor condimentum imperdiet. Vivamus eu
        pellentesque turpis, eget ultricies lectus. Vestibulum sodales massa non lobortis interdum.
        Sed cursus sem in dolor tempus tempus. Pellentesque et nisi vel erat egestas ultricies.
        Etiam id risus nec mi laoreet suscipit. Phasellus porttitor accumsan placerat. Donec auctor
        nunc id erat congue, tincidunt viverra diam feugiat. Donec sit amet quam vel augue auctor
        posuere. Nunc maximus volutpat nulla vel vehicula. Praesent bibendum nulla at erat facilisis
        sodales. Aenean aliquet dui vel iaculis tincidunt. Praesent suscipit ultrices mi eget
        finibus. Mauris vehicula ultricies auctor. Nam vestibulum iaculis lectus, nec sodales metus
        lobortis non. Suspendisse nulla est, consectetur non convallis et, tristique eu risus. Sed
        ut tortor et nulla tempor vulputate et vel ligula. Curabitur egestas lorem ut mi vestibulum
        porttitor. Fusce eleifend vehicula semper. Donec luctus neque quam, et blandit eros accumsan
        at.
      </p>
      <Button data-testid="content-button" kind="ghost" className="myclass">
        Inline Button
      </Button>
    </div>
  );

  const actionItemButtons = [
    {
      buttonLabel: 'Edit',
      buttonIcon: Edit,
    },
    {
      buttonLabel: 'Info',
      buttonIcon: Information,
    },
    {
      buttonLabel: 'Send',
      buttonIcon: SendAlt,
    },
  ];
  it('should go into condensed mode when content is scrolled', () => {
    cy.viewport(1680, 900);
    mount(
      <SidePanel style={{ height: '400px' }} {...commonProps} isOpen>
        {content}
      </SidePanel>
    );
    cy.findByTestId('side-panel').should('not.have.class', 'iot--sidepanel--condensed');
    // scroll content.
    cy.findByTestId('side-panel-content').scrollTo('bottom', { duration: 1000 });
    cy.findByTestId('side-panel').should('have.class', 'iot--sidepanel--condensed');
    // scroll back up
    cy.findByTestId('side-panel-content').scrollTo('top', { duration: 1000 });
    cy.findByTestId('side-panel').should('not.have.class', 'iot--sidepanel--condensed');
  });

  it('should render tooltip if the title text is too long', () => {
    cy.viewport(1680, 900);
    const aLongTitle =
      'A very very long title which will almost certainly overflow and require a tooltip and we must test these things, you know.';
    mount(
      <SidePanel isOpen title={aLongTitle}>
        this is some content
      </SidePanel>
    );

    cy.findByRole('button', { name: aLongTitle }).should('exist');
  });

  it('should not render tooltip if the title text is not too long', () => {
    cy.viewport(1680, 900);
    const aShortTitle = 'A short title';
    mount(
      <SidePanel isOpen title={aShortTitle}>
        this is some content
      </SidePanel>
    );

    cy.findByRole('button', { name: aShortTitle }).should('not.exist');
  });

  it('should have non focusable element when renders slide-over panel', () => {
    cy.viewport(1680, 900);
    mount(
      <SidePanel {...commonProps} actionItems={actionItemButtons} type="over">
        <Content />
      </SidePanel>
    );
    cy.document().then((doc) => {
      const tabindex = doc.querySelector('.myclass').getAttribute('tabindex');
      expect(tabindex).equal('-1');
    });
  });

  it('should have only one focusable element when render inline panel', () => {
    cy.viewport(1680, 900);
    mount(
      <SidePanel {...commonProps} actionItems={actionItemButtons} type="inline">
        <Content />
      </SidePanel>
    );

    cy.document().then((doc) => {
      const tabindex = doc.querySelector('.myclass').getAttribute('tabindex');
      expect(tabindex).equal('-1');
    });
  });

  it('should have tabindex 0 when render content with button ', () => {
    cy.viewport(1680, 900);
    mount(
      <SidePanel
        {...commonProps}
        type="inline"
        actionItems={actionItemButtons}
        isOpen
        directrion="left"
      >
        <Content />
      </SidePanel>
    );

    cy.document().then((doc) => {
      const tabindex = doc.querySelector('.myclass').getAttribute('tabindex');
      expect(tabindex).equal('0');
    });

    cy.findByRole('button', { name: 'Inline Button' }).should('have.attr', 'tabindex', '0');
  });
});
