describe('Reading Comprehension', () => {
    it('is the default demo', () => {
        const baseUrl = Cypress.config().baseUrl;
        cy.visit('/')

        cy.url().then((val) => console.log(`'${val}' should equal -> '${baseUrl}'`)); // TODO: remove
        cy.url().should('equal', `${baseUrl}/reading-comprehension/bidaf-elmo`);
    });

    it('loads without an error', () => {
        cy.get('h3').then((val) => {
            const exp = 'Reading Comprehension';
            console.log(`'${val[0].innerText}' should contain -> '${exp}'`); // TODO: remove
            cy.contains(exp);
        });

        cy.get('p').then((val) => {
            const exp = 'Reading comprehension is the task of answering questions about a passage of';
            console.log(`'${val[0].innerText}' should contain -> '${exp}'`); // TODO: remove
            cy.contains(exp);
        });

        cy.get('form').within(() => {
            cy.get('b').then((val) => {
                const exp = 'ELMo-BiDAF';
                console.log(`'${val[0].innerText}' should contain -> '${exp}'`); // TODO: remove
                cy.contains(exp);
            });

            cy.get('p').then((val) => {
                const exp = 'This is an implementation of the BiDAF model with ELMo embeddings. The';
                console.log(`'${val[1].innerText}' should contain -> '${exp}'`); // TODO: remove
                cy.contains(exp);
            })
        });

        cy.get('.ant-tabs').within(() => {
            cy.get('.ant-select-selection-placeholder').then((val) => {
                const exp = 'Select a Question';
                console.log(`'${val[0].innerText}' should contain -> '${exp}'`); // TODO: remove
                cy.contains(exp);
            });
            cy.get('label').then((val) => {
                const exp = 'Passage';
                console.log(`'${val[1].innerText}' should contain -> '${exp}'`); // TODO: remove
                cy.contains(exp);
            });

            cy.get('label').then((val) => {
                const exp = 'Question';
                console.log(`'${val[2].innerText}' should contain -> '${exp}'`); // TODO: remove
                cy.contains(exp);
            });
        });
    });
});
