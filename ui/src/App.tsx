import React from 'react';
import styled from 'styled-components';
import * as Sentry from '@sentry/react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { Content, Footer, Header, Layout, VarnishApp } from '@allenai/varnish/components';
import { ScrollToTopOnPageChange } from '@allenai/varnish-react-router';
import { Demos } from '@allenai/tugboat/lib';
import { ErrorBoundaryView, Promised } from '@allenai/tugboat/components';

import allenNlpLogo from './components/allennlp_logo.svg';
import { Menu } from './components';
import { groups } from './groups';
import { ModelCards, TaskCards } from './context';
import { fetchTaskCards, fetchModelCards } from './lib';

import '@allenai/varnish/dist/theme.css';

// Sentry is a tool that captures JavaScript errors at runtime and aggregates them.
// If you need access, ask someone on the AllenNLP team.
Sentry.init({
    dsn: 'https://59686a41b9664bf2a8bbc51a602428c2@o226626.ingest.sentry.io/5599301',
    autoSessionTracking: true,
    environment: process.env.SENTRY_ENVIRONMENT || 'dev',
    release: process.env.SENTRY_RELEASE || 'none',
});

/*******************************************************************************
  <App /> Container
*******************************************************************************/

const DEFAULT_PATH = '/reading-comprehension';

const ctx = require.context('./demos', true, /\/index\.ts$/);
const demos = Demos.load(ctx);
const demosByGroup = groups.map((g) => ({
    ...g,
    demos: demos.forGroup(g.label),
}));

/*
The App is just a react-router wrapped around the Demo component.
The design is a bit convoluted so that the same code can run
the overall demo frontend or an individual model demo.
Here's how it accomplishes that:

If you request `/` (corresponding to https://demo.allennlp.org), you will get
redirected to the default model (here, /reading-comprehension).

The overall front-end service serves all routes that look like `/<model_name>`.
When you request `/<model_name>`, you will be served the <Demo> component,
which shows some chrome, a menu, and a <SingleTaskFrame>, which the k8s ingress controller will
direct to the machine serving that specific demo. That machine may be doing *anything*, as long
as it serves its demo front-end at `/task/<model_name>`.
*/
export const App = () => (
    <VarnishApp layout="left-aligned">
        <Router>
            <ScrollToTopOnPageChange />
            <DemoLayout>
                <Sentry.ErrorBoundary fallback={({ error }) => <ErrorBoundaryView error={error} />}>
                    <Promised
                        promise={() => Promise.all([fetchTaskCards(), fetchModelCards()])}
                        deps={[]}>
                        {([tasks, cards]) => (
                            <ModelCards.Provider value={cards}>
                                <TaskCards.Provider value={tasks}>
                                    <Switch>
                                        <Route
                                            exact
                                            path="/"
                                            render={() => <Redirect to={DEFAULT_PATH} />}
                                        />
                                        {demos.all().map(({ config, Component }) => (
                                            <Route key={config.path} path={config.path}>
                                                <Sentry.ErrorBoundary
                                                    fallback={({ error }) => (
                                                        <ErrorBoundaryView error={error} />
                                                    )}>
                                                    <Component />
                                                </Sentry.ErrorBoundary>
                                            </Route>
                                        ))}
                                    </Switch>
                                </TaskCards.Provider>
                            </ModelCards.Provider>
                        )}
                    </Promised>
                </Sentry.ErrorBoundary>
            </DemoLayout>
        </Router>
    </VarnishApp>
);

// This is the top-level demo component.
// It handles the chrome for header and menus,
// and it renders the specific task.
const DemoLayout = (props: { children: React.ReactNode | JSX.Element }) => {
    return (
        <Layout bgcolor="white">
            <Header>
                <HeaderColumnsWithSpace columns="auto 1fr">
                    <Header.Logo href="http://www.allennlp.org/">
                        <Logo width="147px" height="26px" alt="AllenNLP" />
                    </Header.Logo>
                </HeaderColumnsWithSpace>
            </Header>
            <Layout>
                <Menu items={demosByGroup} />
                <Layout>
                    <Content main>{props.children}</Content>
                    <Footer />
                </Layout>
            </Layout>
        </Layout>
    );
};

const Logo = styled.img.attrs({
    src: allenNlpLogo,
})``;

const HeaderColumnsWithSpace = styled(Header.Columns)`
    padding: ${({ theme }) => theme.spacing.md} 0;
`;
