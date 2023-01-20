import {
    Button,
    Col, Descriptions,
    Dropdown,
    Grid,
    Image,
    Menu,
    message,
    Pagination, Popover,
    Row,
    Space,
    Table,
    Tooltip,
    Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "middleware/axios";
import { DownloadOutlined, EyeOutlined, HeartOutlined, HeartTwoTone } from "@ant-design/icons";
import getColumnSearchProps from "@/cabinet/helper/table/columnSearcInput";
import ModalDownload from "@/cabinet/ui/VirtualTable/ModalDownload";
import axiosAPI from "middleware/axiosAPI";

const { Text, Link } = Typography;
const { useBreakpoint } = Grid;

export default function MyTable (props) {
    const screens = useBreakpoint();
    const isScreen_lg = (screens.lg);
    let {
        columns,
        pageSize = 30,
        formatting,
        altUrl,
        type,
        filters = false,
        setFilters = () => {},
        tab,
        dates,
        isFavorites = false,
    } = props;
    const [data, setData] = useState([]);
    const bUrl = altUrl ? altUrl : `/${type}/all`;
    const [url, setUrl] = useState(bUrl);
    const onChangeData = (resp) => setData(formatting(resp).map((it) => ({
        ...it,
        key: it.id ? it.id : 0,
    })));
    const [loading, setLoading] = useState(null);

    const [download, openDownload] = useState(false);

    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    function tableColumns () {
        let data = [];
        if (typeof columns == "object")
            for (let column of columns) {
                data.push({
                    ...column,
                    title: column.title + (column.hasOwnProperty("suffix") ? ", " + column.suffix : ""),
                    dataIndex: column.key,
                    ellipsis: column.hasOwnProperty("ellipsis") ? column.ellipsis : true,
                    width: column.hasOwnProperty("width") ? column.width : 250,
                    align: column.isCount ? "right" : "left",
                    ...(column.fixed && { fixed: isScreen_lg ? column.fixed : false }),

                    defaultSortOrder: "descend",
                    sorter: column.hasOwnProperty("sorter") ? ((a, b) => a[column.key] - b[column.key]) : false,
                    sortOrder: !column.hasOwnProperty("sorter") ? null : (sortedInfo.columnKey === column.key
                        ? sortedInfo.order
                        : null),
                    sortDirections: ["descend", "ascend"],
                });
                if (column.search)
                    data[data.length - 1] = {
                        ...data[data.length - 1],
                        filteredValue: filteredInfo.name || null,
                        ...getColumnSearchProps((tab ? 1 : type), setUrl, bUrl, column.title,
                            column.key,
                            (e) => setFilters([e, filters[1]])),
                    };

                let render = column.hasOwnProperty("render") ? column.render : (text) => (String(text) ? text : "");
                if (column.isCount && column.key != "id")
                    render = (text) => (!Number.isInteger(text) ? text : text.toLocaleString());
                if (column.type == "trend")
                    render = (text) => {
                        if (text > 0) {
                            return <Text type="success">+{text}%</Text>;
                        } else if (text < 0)
                            return <Text type="danger">-{text}%</Text>;
                        else
                            return <Text>{text ? text + " %" : ""}</Text>;
                    };
                else if (column.type == "link" && column.link)
                    render = (text) => (
                        <Link href={(text) ? `/wb/${column.link}/` + text.id : ""}>
                            {(typeof text == "object" && text.hasOwnProperty("name")) ? text.name : ""}
                        </Link>
                    );
                else if (column.type == "rating")
                    render = (text) => Number.isInteger(text) ? text.toFixed(1) : "";

                data[data.length - 1] = { ...data[data.length - 1], render: render };
            }
        for (let i = 0; i < columns.length; i++)
            if (columns[i].type == "title")
                data[i].render = (text, record, index) => {
                    const popoverContent = text.src && (
                        <Space>
                            <Image src={text.src("big")} preview={false} height="50vh"/>
                            <Descriptions size="small" column={1} style={{ maxWidth: 400, marginLeft: 16 }}>
                                {record && data
                                    .map((item, index) => {
                                        if (index != 0)
                                            return item &&
                                                (<Descriptions.Item label={item && columns[index].title}>
                                                        {item.render(record[item.dataIndex])}{item.suffix ? (" "
                                                        + item.suffix) : ""}
                                                    </Descriptions.Item>
                                                );
                                    })
                                }
                            </Descriptions>
                        </Space>);
                    return (
                        <div style={{ marginTop: -8 }}>
                            {text.src && <Popover content={popoverContent}
                                                  placement="right" title={text.name}>
                                <Image src={text.src("tm")}
                                       preview={{ src: text.src("big"), mask: <EyeOutlined/> }} height={40}/>
                            </Popover>}
                            <Tooltip title={text.name}>
                                <Link href={(text) ? `/wb/${tab? tab : type}/` + text.id : ""} style={{ marginLeft: 10 }}>
                                    {text.name}
                                </Link>
                            </Tooltip>
                        </div>);
                };
        return data;
    }

    function onSelectRows (newSelectedRowKeys) {
        setSelectedRowKeys(newSelectedRowKeys);
    }

    function addFavorites () {
        axiosAPI.post(`/api/fav/${!isFavorites ? "append" : "delete"}`, { type: type, id: selectedRowKeys })
            .then(response => {
                if (!isFavorites)
                    message.success("Добавлено в избранное!");
                else {
                    message.success("Удалено из избранного!");
                    selectedRowKeys.forEach(item => {
                        const i = data.findIndex(it => it.key == item);
                        console.log(i);
                        if (i) {
                            data.splice(i, i);
                            setData(data);
                        }
                    });
                }
                onSelectRows([]);
            });
    }

    function axiosGet (url) {
        if (bUrl.indexOf("/api") == -1) {
            const axiosUrl = new URL(axios.defaults.baseURL + url);
            if (dates) {
                const days = dates[1].diff(dates[0], "days") + 1;
                if (days != 30)
                    axiosUrl.searchParams.set("days", days);
            }
            console.log(axiosUrl);
            console.log(axios.defaults.baseURL);
            const pagg = (new URL(axiosUrl)).searchParams.get("limit");
            if (!pagg) setLoading(true);
            axios.get(axiosUrl).then(response => {
                if (pagg)
                    setData(data.concat(formatting(response)));
                else
                    onChangeData(response);
            }).finally(() => {
                if (!pagg) setLoading(false);
            });
        } else {
            axiosAPI.get(bUrl).then(response => {
                onChangeData(response);
            }).catch(err => console.log(err))
                .finally(() => {
                    setLoading(false);
                });
        }
    }

    useEffect(() => {
        axiosGet(url);
    }, [url, dates]);

    useEffect(() => {
        if (filters === false) {
            setFilteredInfo({});
            setSortedInfo({});
            setUrl(bUrl);
        } else if (Array.isArray(filters) && filters.hasOwnProperty(2)) {
            if (!filters[0].hasOwnProperty("false"))
                setFilteredInfo(filters[0]);
            setSortedInfo(filters[1]);
            onChange(null, filters[0], filters[1]);
        }
    }, [filters]);

    const onChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
        let filt = false;
        for (let filter in filters)
            if (filters[filter])
                filt = { filter: filters[filter] };

        if (filt === false) {
            if (sorter.columnKey && sorter.order) {
                setUrl(
                    `/${type}/sort?field=` + sorter.columnKey + "&asc=" + (sorter.order == "ascend" ? "1" : "0"));
                setFilters([filters, sorter]);
            } else
                setFilters(false);
        } else
            setFilters([filters, sorter]);
    };

    const [current, setCurrent] = useState(1);
    const [pageSizePag, setPageSizePag] = useState(pageSize);
    const onPagination = (pagination) => {
        const paginationMax = Math.floor(data.length / pageSizePag) + 1;
        if (pagination <= paginationMax && paginationMax - pagination <= 1) {
            const urlPag = new URL(axios.defaults.baseURL + url);
            urlPag.searchParams.set("limit", 10 * pageSizePag / 2);
            urlPag.searchParams.set("offset", paginationMax * pageSizePag);
            setUrl(urlPag.pathname + urlPag.search);
        }
        setCurrent(pagination);
    };

    const columnsData = tableColumns();

    return (<>
            <style jsx>{`
                    .ant-table.ant-table-bordered > .ant-table-footer {
                        position: sticky;
                        z-index: 2;
                        left: 0px;
                        bottom: 0px;
                        height: 80px;
                        row-gap: 16px;
                    }
                `}</style>
            <Table {...props}
                   dataSource={data.slice((current - 1) * pageSize, current * pageSize)}
                   columns={columnsData}
                   loading={loading}
                   style={{ ...props.style, marginRight: 20, marginLeft: 20 }}
                   bordered
                   scroll={{
                       x: "98vw",
                   }}
                   size="small"
                   sticky={{
                       offsetScroll: 70,
                   }}
                   onChange={onChange}
                   rowSelection={{
                       type: "checkbox",
                       selectedRowKeys,
                       onChange: onSelectRows,
                       renderCell: (checked, record, index, node) => {
                           if (isFavorites)
                               return !checked
                                   ? <HeartTwoTone twoToneColor="#eb2f96" onClick={node.props.onChange}/>
                                   : <HeartOutlined onClick={node.props.onChange}/>;
                           else return checked
                               ? <HeartTwoTone twoToneColor="#eb2f96" onClick={node.props.onChange}/>
                               : <HeartOutlined onClick={node.props.onChange}/>;
                       },
                   }}
                   pagination={false}

                   footer={() =>
                       <Row gutter={[16, 16]} justify="space-between" align="middle"
                            style={{
                                width: "95%",
                                position: "absolute",
                                left: 0,
                                bottom: 0,
                                height: 80,
                                marginLeft: 16,
                            }}
                       >
                           <Col>
                               <Space>
                                   <Button type="primary" onClick={addFavorites}>
                                       <Space>
                                           {!isFavorites ?
                                               `Выделенное в избранное ${selectedRowKeys.length > 0 ?
                                                   `(${selectedRowKeys.length})` : ""}`
                                               : `Удалить из избранного ${selectedRowKeys.length > 0 ?
                                                   `(${selectedRowKeys.length})` : ""}`
                                           }
                                           <HeartOutlined/>
                                       </Space>
                                   </Button>
                                   <Button type="primary" onClick={() => openDownload(true)}>
                                       <Space>
                                           Скачать
                                           <DownloadOutlined/>
                                       </Space>
                                   </Button>
                                   <ModalDownload visible={download} onClose={() => openDownload(false)}
                                                  url={url}
                                                  dates={dates}
                                                  type={type}
                                                  columns={
                                                      columns.reduce((prevVal, item) => {
                                                          prevVal[item.key] = item.title;
                                                          return prevVal;
                                                      }, {})
                                                  }
                                   />
                               </Space>
                           </Col>
                           <Col>
                               <Pagination
                                   onChange={onPagination}
                                   total={data.length}
                                   current={current}
                                   showSizeChanger={false}
                                   pageSize={pageSizePag}
                                   responsive={true}
                                   // onShowSizeChange={(current, size) => setPageSizePag(size)}
                                   style={{ zIndex: 10 }}
                               />
                           </Col>
                       </Row>}
            />
        </>
    );
}