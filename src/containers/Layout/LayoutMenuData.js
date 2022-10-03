import React, { useEffect, useState } from "react";

const Navdata = () => {
    //state data
    const [isDashboard, setIsDashboard] = useState(false);
    const [isWarehouse, setIsWarehouse] = useState(false);
    const [isShipments, setIsShipments] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);

    const [iscurrentState, setIscurrentState] = useState('Dashboard');

    function updateIconSidebar(e) {
        if (e && e.target && e.target.getAttribute("subitems")) {
            const ul = document.getElementById("two-column-menu");
            const iconItems = ul.querySelectorAll(".nav-icon.active");
            let activeIconItems = [...iconItems];
            activeIconItems.forEach((item) => {
                item.classList.remove("active");
                var id = item.getAttribute("subitems");
                if (document.getElementById(id))
                    document.getElementById(id).classList.remove("show");
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove('twocolumn-panel');
        if (iscurrentState !== 'Dashboard') {
            setIsDashboard(false);
        }
        if (iscurrentState !== 'Warehouse') {
            setIsWarehouse(false);
        }
        if (iscurrentState !== 'Shipments') {
            setIsShipments(false);
        }
        if (iscurrentState !== 'Receiving') {
            setIsReceiving(false);
        }
    }, [
        iscurrentState,
        isDashboard,
        isWarehouse,
        isShipments,
        isReceiving
    ]);

    const menuItems = [
        {
            label: "Menu",
            isHeader: true,
        },
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "ri-dashboard-2-line",
            link: "/#",
            stateVariables: isDashboard,
            click: function (e) {
                e.preventDefault();
                setIsDashboard(!isDashboard);
                setIscurrentState('Dashboard');
                updateIconSidebar(e);
            },
            subItems: [
                {
                    id: "Summary",
                    label: "Summary",
                    link: "/",
                    parentId: "dashboard",
                }
            ],
        },
        {
            id: "warehouse",
            label: "Warehouse",
            icon: "ri-building-4-line",
            link: "/#",
            stateVariables: isWarehouse,
            click: function (e) {
                e.preventDefault();
                setIsWarehouse(!isWarehouse);
                setIscurrentState('Warehouse');
                updateIconSidebar(e);
            },
            subItems: [
                {
                    id: "products",
                    label: "Products",
                    link: "/products",
                    parentId: "warehouse",
                },
                {
                    id: "inventorylog",
                    label: "Inventory Log",
                    link: "/",
                    parentId: "warehouse",
                },
                {
                    id: "addproduct",
                    label: "Add Product",
                    link: "/",
                    parentId: "warehouse",
                },
                {
                    id: "storage",
                    label: "Storage",
                    link: "/",
                    parentId: "warehouse",
                },
            ],
        },
        {
            id: "shipments",
            label: "Shipments",
            icon: "ri-file-list-3-line",
            link: "/#",
            stateVariables: isShipments,
            click: function (e) {
                e.preventDefault();
                setIsShipments(!isShipments);
                setIscurrentState('Shipments');
                updateIconSidebar(e);
            },
            subItems: [
                {
                    id: "shipments",
                    label: "Shipment Transactions",
                    link: "/",
                    parentId: "orders",
                },
                {
                    id: "createorder",
                    label: "Create Order",
                    link: "/",
                    parentId: "orders",
                },
                {
                    id: "createwholesale",
                    label: "Create wholesale Order",
                    link: "/",
                    parentId: "orders",
                },
            ],
        },
        {
            id: "receiving",
            label: "Receiving",
            icon: "ri-truck-line",
            link: "/#",
            stateVariables: isReceiving,
            click: function (e) {
                e.preventDefault();
                setIsReceiving(!isReceiving);
                setIscurrentState('Receiving');
                updateIconSidebar(e);
            },
            subItems: [
                {
                    id: "receiving",
                    label: "Receiving Transactions",
                    link: "/",
                    parentId: "orders",
                },
                {
                    id: "createreceiving",
                    label: "Create Receiving",
                    link: "/",
                    parentId: "orders",
                }
            ],
        },
    ];
    return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;