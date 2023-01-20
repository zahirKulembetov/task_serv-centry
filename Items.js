import React, { useState } from "react";
import Table from "@/cabinet/ui/VirtualTable/Table";
import getImageUrl from "@/cabinet/helper/getImageUrl";
import {
    sortableContainer,
    sortableElement,
    sortableHandle
} from "react-sortable-hoc";

function formatting (response) {
    return response.data.data.map((item) => ({
        ...item,
        name: {
            id: item.id,
            name: item.item_name,
            src: getImageUrl(item.id),
        },
        // availability: Object.keys(item).reduce((sum, current) => sum + current, 0),
    }));
}

const columns = [
    {
        title: "Название",
        key: "name",
        search: true,
        type: "title",
        fixed: "left",
    },
    {
        title: "Артикул",
        key: "id",
        search: true,
        isCount: true,
        width: 100,
    },
    {
        title: "Цена",
        suffix: "руб",
        key: "price",
        type: "price",
        sorter: true,
        isCount: true,
        width: 100,
    },
    {
        title: "Продажи",
        suffix: "шт",
        key: "orders_count_period",
        sorter: true,
        isCount: true,
        width: 130,
    },
    {
        title: "Выручка за период",
        suffix: "руб",
        key: "revenue_period",
        sorter: true,
        isCount: true,
        width: 200,
    },
    {
        title: "Выручка",
        suffix: "руб",
        key: "revenue",
        sorter: true,
        isCount: true,
        width: 130,
    },
    {
        title: "Тренд выручки",
        key: "revenue_trand",
        type: "trend",
        sorter: true,
        align: "right",
        width: 140,
    },
    {
        title: "Упущенная выручка",
        key: "lost revenue",
        sorter: true,
        isCount: true,
        width: 170,
    },
    {
        title: "Продавец",
        dataIndex: "seller",
        key: "seller",
        type: "link",
        link: "sellers",
        search: true,
        width: 200,
    },
    {
        title: "Бренд",
        key: "brand",
        type: "link",
        link: "brands",
        search: true,
        width: 180,
    },
    {
        title: "Продажи за все время",
        suffix: "шт",
        key: "orders_count",
        isCount: true,
        sorter: true,
        width: 210,
    },
    {
        title: "Наличие",
        suffix: "шт",
        key: "stocks",
        isCount: true,
        sorter: true,
        width: 130,
    },
    {
        title: "Рейтинг",
        key: "rating",
        type: "rating",
        sorter: true,
        width: 100,
    },
    {
        title: "Отзывов",
        suffix: "шт",
        key: "feedbacks",
        isCount: true,
        sorter: true,
        width: 120,
    },
    {
        title: "Дата обнаружения товара",
        key: "add_date",
        render: (text) => new Date(text).toLocaleString("ru-RU", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        }),
        sorter: true,
        width: 120,
    },
];

function Items (props) {
    return (<>
        <Table columns={columns}
               formatting={formatting}
               type="items"
               {...props}
        />
    </>);
}

export default Items;