describe('Password Setup Flow (Missing Token)', () => {
  it('shows missing token UI and allows requesting link', () => {
    cy.visit('/auth/password/setup');
    cy.contains('Missing token parameter.').should('be.visible');
    cy.get('input[type="email"]').type('test+pwsetup@example.com');
    cy.contains('Email Me a Password Setup Link').click();
    cy.contains(/Password setup link emailed/i).should('be.visible');
  });
});
