import React from 'react';
import { mount } from '@cypress/react';
import { BreadcrumbItem } from '@carbon/react';

import Breadcrumb from './Breadcrumb';

describe('Breadcrumbs', () => {
  beforeEach(() => {
    cy.viewport(600, 600);
  });

  it('disable truncation of the first item', () => {
    mount(
      <Breadcrumb onClick={cy.stub()} disableTruncation="first" testId="breadcrumb-test">
        <BreadcrumbItem href="#">Breadcrumb 1</BreadcrumbItem>
        <BreadcrumbItem href="#">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi finibus tortor vel nisl
          suscipit, ac commodo lorem lobortis.
        </BreadcrumbItem>
      </Breadcrumb>
    );

    cy.findByText('Breadcrumb 1')
      .parent()
      .then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        expect(rect.width).to.be.greaterThan(100);
      });
  });

  it('disable truncation of the last item', () => {
    mount(
      <Breadcrumb onClick={cy.stub()} disableTruncation="last" testId="breadcrumb-test">
        <BreadcrumbItem href="#">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi finibus tortor vel nisl
          suscipit, ac commodo lorem lobortis.
        </BreadcrumbItem>
        <BreadcrumbItem href="#">Breadcrumb 2</BreadcrumbItem>
      </Breadcrumb>
    );

    cy.findByText('Breadcrumb 2')
      .parent()
      .then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        expect(rect.width).to.be.greaterThan(100);
      });
  });
});
