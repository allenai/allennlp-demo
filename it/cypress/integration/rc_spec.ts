describe('Reading Comprehension', () => {
    it('is the default demo', () => {
        cy.visit('/')

        const baseUrl = Cypress.config().baseUrl
        cy.url().should('equal', `${baseUrl}/reading-comprehension`);
    });

    it('loads without an error', () => {
        cy.contains('Reading Comprehension');
        cy.contains('Reading comprehension is the task of answering questions about a passage ' +
                    'of text to show that the system understands the passage.');
        cy.contains('ELMo-BiDAF (trained on SQuAD)');
        cy.contains('This model is like BiDAF but uses ELMo embeddings instead of GloVe');
        cy.contains('Enter text or');
        cy.contains('Passage');
        cy.contains('Question');
    });
});
