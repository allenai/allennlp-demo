import React, { useState } from 'react';
import styled from 'styled-components';
import AntdMenu from 'antd/es/menu';
import { textStyles, LeftSider } from '@allenai/varnish/components';
import { Link } from '@allenai/varnish-react-router';
import { DemoGroup, Demo } from '@allenai/tugboat/lib';

import { ImgIcon } from './ImgIcon';

const { Item, SubMenu } = AntdMenu;

interface MenuGroup extends DemoGroup {
    demos: Demo[];
}

interface Props {
    items: MenuGroup[];
}

export const Menu = ({ items }: Props) => {
    const siderWidthExpanded = '300px';
    const siderWidthCollapsed = '80px';
    const [menuCollapsed, setMenuCollapsed] = useState(false);

    const handleMenuCollapse = () => {
        setMenuCollapsed(!menuCollapsed);
    };

    return (
        <LeftSider
            width={siderWidthExpanded}
            collapsedWidth={siderWidthCollapsed}
            collapsible
            collapsed={menuCollapsed}
            onCollapse={handleMenuCollapse}>
            <AntdMenu defaultOpenKeys={items.map((g) => g.label)} mode="inline">
                {items.map((g) => (
                    <TransparentSubMenu
                        key={g.label}
                        title={
                            <IconMenuItemColumns>
                                {g.iconSrc && <ImgIcon src={g.iconSrc} />}
                                <textStyles.Small>{g.label}</textStyles.Small>
                            </IconMenuItemColumns>
                        }>
                        {g.demos.map((m) => {
                            return (
                                <Item key={m.config.title}>
                                    <Link to={`${m.config.path}`}>
                                        <textStyles.Small>{m.config.title}</textStyles.Small>
                                    </Link>
                                </Item>
                            );
                        })}
                    </TransparentSubMenu>
                ))}
            </AntdMenu>
        </LeftSider>
    );
};

const IconMenuItemColumns = styled.div`
    display: grid;
    grid-template-columns: min-content 1fr;
    align-items: center;
    height: 100%;
`;

const TransparentSubMenu = styled(SubMenu)`
    && {
        ul {
            background: transparent;
        }
    }
`;
