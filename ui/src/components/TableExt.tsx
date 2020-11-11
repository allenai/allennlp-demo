// TODO: this file should likely be moved over to Varnish as it is used in multiple projects

import * as React from 'react';
import styled from 'styled-components';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Button, Input } from 'antd';

interface BasicDropdownProps {
    setSelectedKeys: (val: string[]) => void;
    // selected keys is an array of values that can be used to do multi value filtering
    // in our case below, we just use the first value, selectedKeys: ["car"]
    // but you could imagine allowing filtering on > or < and a number: selectedKeys: [">", "5"]
    selectedKeys: string[];
    confirm: () => void;
    clearFilters: () => void;
}

export const BasicFilterDropdown = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
}: BasicDropdownProps) => (
    <DropWrap>
        <DropDown>
            <InputArea
                placeholder="Search"
                value={selectedKeys[0]}
                onChange={(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={confirm}
            />
            <Button type="primary" onClick={confirm} icon={<SearchOutlined />}>
                Search
            </Button>
            <Button onClick={clearFilters}>Reset</Button>
        </DropDown>
    </DropWrap>
);

const SearchIcon = styled(SearchOutlined)<{ filtered: boolean }>`
    &&& {
        color: ${({ theme, filtered }) => (filtered ? theme.palette.primary.main : null)};
    }
`;

const DropWrap = styled.div`
    width: 224px;
`;

const DropDown = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: ${({ theme }) => theme.spacing.sm};
    gap: ${({ theme }) => theme.spacing.sm};
`;

const InputArea = styled(Input)`
    grid-column: 1 / span 2;
`;

export const FilterIcon = (filtered: boolean) => <SearchIcon filtered={filtered} />;
