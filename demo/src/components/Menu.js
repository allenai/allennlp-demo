import React from 'react';
import { 
  BodySmall, 
  IconMenuItemColumns, 
  ImgIcon, 
  InternalLink, 
  LeftMenu, 
  LeftMenuItem,
  LeftSider,
  Wrapping, 
} from '@allenai/varnish/components';

import { modelGroups } from '../models'

/*******************************************************************************
  <Menu /> Component
*******************************************************************************/

export default class Menu extends React.Component {
  siderWidthExpanded = '300px';
  /**
   * TODO: Figure out why this must be 80px, and no other value, antd
   * sets this explicitly in CSS, so I'm not sure why the collapsedWidth
   * property is provided.
   */
  siderWidthCollapsed = '80px';
  constructor(props) {
      super(props);

      this.state = {
          menuCollapsed: false
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
          <LeftMenu
            defaultSelectedKeys={[this.props.redirectedModel]}
            defaultOpenKeys={modelGroups.filter(g => g.defaultOpen).map(g => g.label)}
          >
            {modelGroups.map(g => (
              <LeftMenu.SubMenu
                key={g.label}
                title={
                  <IconMenuItemColumns>
                    {g.iconSrc && (
                      <ImgIcon src={g.iconSrc} />
                    )}
                    <Wrapping>
                      <BodySmall>{g.label}</BodySmall>
                    </Wrapping>
                  </IconMenuItemColumns>
                }
              >
                {g.models.map(m => (
                  <LeftMenuItem key={m.model}>
                    <InternalLink to={"/" + m.model} onClick={() => {}}>
                      <span>{m.name}</span>
                    </InternalLink>
                  </LeftMenuItem>
                ))}
              </LeftMenu.SubMenu>
            ))}
          </LeftMenu>
      </LeftSider>
    )
  }
}
