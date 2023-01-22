import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Space, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
// import Highlighter from "react-highlight-words";
// import axios from "../../../../middleware/axios";

export default function getColumnSearchProps (type, setUrl, bUrl, name, dataIndex, setFilters) {
    const [selectText, setSelectText] = useState("");
    const searchInput = useRef(null);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setFilters(selectedKeys);
        if (type != 1)
            setUrl(`/?${dataIndex}=${selectText}`);
    };

    return {
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Найти по ${name}`}
                    value={selectedKeys[dataIndex]}
                    onChange={(e) => {
                        setSelectedKeys(e.target.value ? [e.target.value] : []);
                        setSelectText(e.target.value);
                    }}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex, setSelectedKeys)}
                    style={{
                        marginBottom: 8,
                        display: "block",
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Найти
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedKeys([]);
                            clearFilters();
                            confirm({
                                closeDropdown: false,
                            });
                            if (type != 1)
                                setUrl(bUrl);
                        }}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Сбросить
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <Tooltip title="Поиск">
                <SearchOutlined
                    style={{
                        color: filtered ? "#1890ff" : undefined,
                    }}
                />
            </Tooltip>
        ),
        onFilter: (type == 1) ?
            (value, record) => {
                if (typeof record[dataIndex] == "object") {
                    if ("title" in record[dataIndex])
                        return record[dataIndex]["title"].toString().toLowerCase().indexOf(value.toLowerCase()) > -1;
                } else
                    return record[dataIndex].toString().toLowerCase().indexOf(value.toLowerCase()) > -1;
            } : false,
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    };
}