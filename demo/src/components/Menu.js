import React from 'react';
import styled from 'styled-components';
import { Menu as AntMenu } from 'antd';
import { InternalLink, ImgIcon } from '@allenai/varnish/components';

import allenNlpLogo from './allennlp_logo.svg';
import { modelGroups } from '../models'

/*******************************************************************************
  <Menu /> Component
*******************************************************************************/

export class MenuBase extends React.Component {
  render() {
    const { selectedModel, clearData } = this.props;

    const ModelGroup = ({modelGroup, expanded, ...other}) => (
      <NarrowSubMenu
        {...other}
        title={
          <span>
            <ImgIcon src={modelGroup.iconSrc} />
            <span>{modelGroup.label}</span>
          </span>
        }>
          {modelGroup.models.map(m => <ModelLink key={m.model} model={m.model} name={m.name} />)}
      </NarrowSubMenu>
    );

    const ModelLink = ({model, name, ...other}) => (
      <NarrowMenuItem {...other}>
          <WrappingLink to={"/" + model} onClick={clearData}>
            <span>{name}</span>
          </WrappingLink>
      </NarrowMenuItem>
    );

    return (
      <OuterGrid>
        <Logo>
          <a href="http://www.allennlp.org/" target="_blank" rel="noopener">
            <img
              src={allenNlpLogo}
              width={"124px"}
              height={"22px"}
              alt="AllenNLP" />
          </a>
        </Logo>
        <MenuContent
          onClick={clearData}
          defaultOpenKeys={modelGroups.filter((mg) => mg.defaultOpen).map((mg) => mg.label)}
          defaultSelectedKeys={selectedModel ? [selectedModel] : undefined}
          mode="inline">
          {modelGroups.map((mg) =>
            <ModelGroup key={mg.label} modelGroup={mg}/>
          )}
        </MenuContent>
      </OuterGrid>
    );
  }
}

export const Menu = styled(MenuBase)`
  height: 100%;
  position: fixed;
  z-index: 2;
`;

const OuterGrid = styled.div`
  display: grid;
  grid-template-rows: min-content 1fr;
  height: 100%;
`;

const Logo = styled.div`
  z-index: 3;
  padding: ${({theme}) => `1.3125rem ${theme.spacing.xl}`} 1.3125rem 1.5rem; /* match position of initial placement of model title in right pane */
  box-shadow: ${({theme}) => `0 ${theme.spacing.md} ${theme.spacing.md} -${theme.spacing.sm} ${theme.palette.border.main}`};
  border-right: ${({theme}) => `1px solid ${theme.palette.border.main}`};
`;

const MenuContent = styled(AntMenu)`
  &&& {
    min-width: 15em;
    max-width: 20em;
    overflow-x: hidden;
    overflow-y: auto;
    padding: ${({theme}) => `${theme.spacing.md} 0`};
  }
`;

const NarrowMenuItem = styled(AntMenu.Item)`
  &&& {
    line-height: 1.4em;
    height: initial;
    padding-bottom: 0.375em;
    padding-top: 0.375em;
    margin-bottom: -0.125em;
    margin-top: -0.125em;
  }
`;

const NarrowSubMenu = styled(AntMenu.SubMenu)`
  &&& {
    margin-bottom: ${({theme}) => theme.spacing.md};

    div { /* .ant-menu-submenu-title */
      line-height: 1.4em;
      height: initial;
      font-weight: bold;

      img {
        vertical-align: initial;
      }
    }
  }
`;

const WrappingLink = styled(InternalLink)`
    white-space: pre-wrap;
    word-wrap: break-word;
`;
