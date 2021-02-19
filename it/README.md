# AllenNLP Demo Integration Tests

This directory contains code for integration tests that make sure the demo is working properly.
The tests are executed using [Cypress](https://www.cypress.io/), and require a working front-end
and API.

## Getting Started

Before running the tests make sure you install the dependencies like so:

```
cd it/
yarn
```

At that point you can run the tests like so:

```
yarn test
```

## Running the Tests

To run the tests you'll need to run the application locally:

```
./demo start
```

Once the application is up and running, you can open the Cypress application like so:

```
yarn dev
```

You'll see a GUI window open, which you can use to interactively run the tests and debug any
failures.

If you'd like to run the tests in a headless fashion, just run:

```
yarn test
```

...and if you'd like to run the tests against the live site, run:

```
yarn test:prod
```

## Adding a New Test

You can add a new test by creating a file with the `_spec.ts` suffix in the `cypress/integration`
directory.

Newly added tests should show up automatically in the interactive test runner.

