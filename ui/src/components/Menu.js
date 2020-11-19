import React from 'react';
import styled from 'styled-components';
import { Menu as AntdMenu } from 'antd';
import { textStyles, LeftSider } from '@allenai/varnish/components';
import { Link } from '@allenai/varnish-react-router';

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
                    defaultOpenKeys={this.props.items.map((g) => g.label)}
                    mode="inline">
                    {this.props.items.map((g) => (
                        <SubMenu
                            key={g.label}
                            title={
                                <IconMenuItemColumns>
                                    {g.iconSrc && <ImgIcon src={g.iconSrc} />}
                                    <textStyles.Small>{g.label}</textStyles.Small>
                                </IconMenuItemColumns>
                            }>
                            {g.demos.map((m) => {
                                // TODO: Remove this, as it's an artifact of the incremental
                                // transition. All demos are currently marked as hidden as
                                // a mechanism for using the old code. Once we've fully
                                // transition we won't need to do this anymore.
                                const path = m.config.path.replace(/^\/hidden/, '');
                                return (
                                    <Item key={m.config.title}>
                                        <Link to={`${path}`}>
                                            <textStyles.Small>{m.config.title}</textStyles.Small>
                                        </Link>
                                    </Item>
                                );
                            })}
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
