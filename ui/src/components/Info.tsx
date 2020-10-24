import React from 'react';
import styled from 'styled-components';

import { Footer, Header, Layout } from '@allenai/varnish';

// TODO: When the menu is implemented in TypeScript we can stop ts-ignoring it.
// @ts-ignore
import Menu from './Menu';

import allenNLPLogo from './allennlp_logo.svg';

const Info = () => {
  const [ info, setInfo ] = React.useState<{}>();  

  React.useEffect(() => {
    fetch('/api/info').then(r => r.json()).then(r => setInfo(r));
  }, [ false ]);

  return (
    <Layout bgcolor="white">
      <Header>
        <HeaderColumnsWithSpace gridTemplateColumns="auto auto 1fr">
          <a href="http://www.allennlp.org/" target="_blank" rel="noopener noreferrer">
            <Logo width="147px"
              height="26px"
              alt="AllenNLP"
            />
          </a>
        </HeaderColumnsWithSpace>
      </Header>
      <Layout>
        <Menu />
        <Layout>
          <Layout.Content>
            <h1>API Info</h1>
            {info ? <code><pre>{JSON.stringify(info, null, 2)}</pre></code> : 'Loading...'}
          </Layout.Content>
          <Footer />
        </Layout>
      </Layout>
    </Layout>
  );
};

const Logo = styled.img.attrs({
  src: allenNLPLogo
})``;

const HeaderColumnsWithSpace = styled(Header.HeaderColumns)`
    padding: ${({ theme }) => theme.spacing.md} 0;
`;

export default Info;

