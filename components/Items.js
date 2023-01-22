import React, { useState } from "react";
import Table from "../components/Table";
// import getImageUrl from "@/cabinet/helper/getImageUrl";

function formatting (response) {

    return response.data.map((item) => ({
        ...item,
        title: {
            id: item.id,
            title: item.title,
            src: item.images[0],
        },
        // availability: Object.keys(item).reduce((sum, current) => sum + current, 0),
    }));
}

const columns = [
    {
        title: "Название",
        key: "title",
        search: true,
        type: "title",
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
        title: "Описание",
        suffix: "шт",
        key: "description",
        sorter: true,
        isCount: true,
        width: 130,
    },
];

function Items (props) {
    return (<>
        <Table 
            columns={columns}
            formatting={formatting}
            type="items"
            {...props}
        />
    </>);
}

export default Items;