describe('Reading Comprehension', () => {
    it('is the default demo', () => {
        cy.visit('/')

        const baseUrl = Cypress.config().baseUrl
        cy.url().should('equal', `${baseUrl}/reading-comprehension/bidaf-elmo`);
    });

    it('loads without an error', () => {
        // TODO: remove this logging once we find the issue with the ui tests.
        // see: https://github.com/allenai/allennlp-demo/issues/903
        cy.document().get('body').then((val) => {
            console.log(val[0].innerHTML);
            cy.log(val[0].innerHTML);
        });

        cy.contains('Reading Comprehension');
        cy.contains('Reading comprehension is the task of answering questions about a passage of');
        cy.contains('ELMo-BiDAF');
        cy.contains('This is an implementation of the BiDAF model with ELMo embeddings. The');
        cy.contains('Select a Question');
        cy.contains('Passage');
        cy.contains('Question');
    });
});
