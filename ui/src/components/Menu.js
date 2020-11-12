import React from 'react';
import styled from 'styled-components';
import { Menu as AntdMenu } from 'antd';
import { textStyles, LeftSider } from '@allenai/varnish/components';
import { Link } from '@allenai/varnish-react-router';

import { modelGroups } from '../models';
import { ImgIcon } from './ImgIcon';

const { Item, SubMenu } = AntdMenu;

/*******************************************************************************
  <Menu /> Component
*******************************************************************************/

export default class Menu extends React.Component {
    siderWidthExpanded = '300px';
    siderWidthCollapsed = '80px';
    constructor(props) {
        super(props);

        this.state = {
            menuCollapsed: false,
        };
    }

    handleMenuCollapse = () => {
        this.setState({ menuCollapsed: !this.state.menuCollapsed });
    };

    render() {
        return (
            <LeftSider
                width={this.siderWidthExpanded}
                collapsedWidth={this.siderWidthCollapsed}
                collapsible
                collapsed={this.state.menuCollapsed}
                onCollapse={this.handleMenuCollapse}>
                <AntdMenu
                    defaultSelectedKeys={[this.props.redirectedModel]}
                    defaultOpenKeys={modelGroups.filter((g) => g.defaultOpen).map((g) => g.label)}
                    mode="inline">
                    {modelGroups.map((g) => (
                        <SubMenu
                            key={g.label}
                            title={
                                <IconMenuItemColumns>
                                    {g.iconSrc && <ImgIcon src={g.iconSrc} />}
                                    <textStyles.Small>{g.label}</textStyles.Small>
                                </IconMenuItemColumns>
                            }>
                            {g.models.map((m) => (
                                <Item key={m.model}>
                                    <Link to={'/' + m.model} onClick={() => {}}>
                                        <span>{m.name}</span>
                                    </Link>
                                </Item>
                            ))}
                        </SubMenu>
                    ))}
                </AntdMenu>
            </LeftSider>
        );
    }
}

const IconMenuItemColumns = styled.div`
    display: grid;
    grid-template-columns: min-content 1fr;
    align-items: center;
    height: 100%;
`;
