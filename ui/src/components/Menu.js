import React from 'react';
import styled from 'styled-components';
import { Menu as AntdMenu } from 'antd';
import { textStyles, LeftSider } from '@allenai/varnish/components';
import { Link } from '@allenai/varnish-react-router';
import slug from 'slug';

import { ImgIcon } from './ImgIcon';
import annotateIcon from '../icons/annotate-14px.svg';
import otherIcon from '../icons/other-14px.svg';
import parseIcon from '../icons/parse-14px.svg';
import passageIcon from '../icons/passage-14px.svg';
import questionIcon from '../icons/question-14px.svg';
import addIcon from '../icons/add-14px.svg';

const { Item, SubMenu } = AntdMenu;

/*******************************************************************************
  <Menu /> Component
*******************************************************************************/

// find all demo pages to show in menu
const demoCtxs = require.context('../demos', true, /.*\.(tsx)$/);
const demos = demoCtxs.keys().map(demoCtxs);

// predefined order of known types
const demoGroups = [
    {
        label: 'Answer a question',
        iconSrc: questionIcon,
    },
    {
        label: 'Annotate a sentence',
        iconSrc: annotateIcon,
    },
    {
        label: 'Annotate a passage',
        iconSrc: passageIcon,
    },
    {
        label: 'Semantic parsing',
        iconSrc: parseIcon,
    },
    {
        label: 'Other',
        iconSrc: otherIcon,
    },
    {
        label: 'Contributing',
        iconSrc: addIcon,
    },
];

export const demoMenuGroups = demoGroups.map((g) => {
    return {
        label: g.label,
        iconSrc: g.iconSrc,
        routes: demos
            .filter(
                (demo) =>
                    !demo.demoConfig.status !== 'disabled' &&
                    ((!g.label && demo.demoConfig.demoGroup === 'Other') ||
                        demo.demoConfig.demoGroup === g.label)
            )
            .sort((a, b) => a.demoConfig.order - b.demoConfig.order)
            .map((demo) => {
                return {
                    path: demo.demoConfig.routePathOverride
                        ? demo.demoConfig.routePathOverride
                        : `${slug(demo.demoConfig.title, '-')}`,
                    title: demo.demoConfig.title,
                    component: demo.default,
                    status: demo.demoConfig.status,
                };
            }),
    };
});

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
                    defaultOpenKeys={demoMenuGroups.map((g) => g.label)}
                    mode="inline">
                    {demoMenuGroups.map((g) => (
                        <SubMenu
                            key={g.label}
                            title={
                                <IconMenuItemColumns>
                                    {g.iconSrc && <ImgIcon src={g.iconSrc} />}
                                    <textStyles.Small>{g.label}</textStyles.Small>
                                </IconMenuItemColumns>
                            }>
                            {g.routes.map((m) => (
                                <Item key={m.title}>
                                    <Link to={`/${m.path}`} onClick={() => {}}>
                                        <textStyles.Small>{m.title}</textStyles.Small>
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
