import styled from 'styled-components';
import Collapse from 'antd/es/collapse';

/**
 * The latest version of antd has a bug with setting the height of a dynamic collapse panel.
 * This is a hammer to fix that.
 * TODO: we should remove this when we can.
 */
export const CollapsePanel = styled(Collapse.Panel)`
    .ant-collapse-content-active {
        height: 100% !important;
    }
`;
