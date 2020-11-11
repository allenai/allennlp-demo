/**
 * TODO:
 * This component was added primarily to validate that the unique mix of JavaScript
 * and TypeScript was working on this project. It can probably be removed once there's
 * other TypeScript in the project.
 *
 * I would like this to go all the way to production as to verify that things are working
 * end to end.
 */
import React from 'react';
import styled from 'styled-components';

import { Footer, Header, Layout } from '@allenai/varnish/components';

// TODO: When the menu is implemented in TypeScript we can stop ts-ignoring it.
// @ts-ignore
import Menu from './Menu';

import allenNLPLogo from './allennlp_logo.svg';

const Info = () => {
    const [info, setInfo] = React.useState<{}>();

    React.useEffect(() => {
        fetch('/api/info')
            .then((r) => r.json())
            .then((r) => setInfo(r));
    }, [false]);

    return (
        <Layout bgcolor="white">
            <Header>
                <HeaderColumnsWithSpace columns="auto auto 1fr">
                    <Header.Logo href="http://www.allennlp.org/">
                        <Logo width="147px" height="26px" alt="AllenNLP" />
                    </Header.Logo>
                </HeaderColumnsWithSpace>
            </Header>
            <Layout>
                <Menu />
                <Layout>
                    <Layout.Content>
                        <h1>API Info</h1>
                        {info ? (
                            <code>
                                <pre>{JSON.stringify(info, null, 2)}</pre>
                            </code>
                        ) : (
                            'Loading...'
                        )}
                    </Layout.Content>
                    <Footer />
                </Layout>
            </Layout>
        </Layout>
    );
};

const Logo = styled.img.attrs({
    src: allenNLPLogo,
})``;

const HeaderColumnsWithSpace = styled(Header.Columns)`
    padding: ${({ theme }) => theme.spacing.md} 0;
`;

export default Info;
