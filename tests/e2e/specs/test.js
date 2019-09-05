// https://docs.cypress.io/api/introduction/api.html

describe('Sign up page', () => {
  it('Renders the Sign up heading', () => {
    cy.visit('/sign-up');
    cy.contains('h1', 'Sign up');
  });

  it('Renders the sign up description', () => {
    cy.visit('/sign-up');
    cy.contains('p', 'You are the single step away from registration.');
  });

  it('Renders form submit button', () => {
    cy.visit('/sign-up');
    cy.contains('#atom__submit-button', 'Submit');
  });

  it('Renders correct validation for empty sign up form', () => {
    cy.visit('/sign-up');
    cy.get('form').submit();
    cy.contains('li', 'Email required.');
    cy.contains('li', 'Password required.');
    cy.contains('li', 'Nickname required.');
    cy.contains('li', 'Driving since required.');
    cy.contains('li', 'Gender required.');
    cy.contains('li', 'Born in year required.');
    cy.contains('li', 'Vehicle required.');
    cy.contains('li', 'Gender required.');
    cy.contains('li', 'Region required.');
    cy.contains('li', 'Education required.');
    cy.contains('li', 'Share profile required.');
  });
});
