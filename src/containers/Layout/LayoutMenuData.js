import React, { useEffect, useState, useContext } from 'react'
import AppContext from '@context/AppContext'
const Navdata = () => {
  const { state } = useContext(AppContext)
  //state data
  const [isDashboard, setIsDashboard] = useState(false)
  const [isWarehouse, setIsWarehouse] = useState(false)
  const [isShipments, setIsShipments] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  const [isBilling, setIsBilling] = useState(false)

  const [iscurrentState, setIscurrentState] = useState('Dashboard')

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute('subitems')) {
      const ul = document.getElementById('two-column-menu')
      const iconItems = ul.querySelectorAll('.nav-icon.active')
      let activeIconItems = [...iconItems]
      activeIconItems.forEach((item) => {
        item.classList.remove('active')
        var id = item.getAttribute('subitems')
        if (document.getElementById(id)) {
          document.getElementById(id).classList.remove('show')
        }
      })
    }
  }

  useEffect(() => {
    document.body.classList.remove('twocolumn-panel')
    if (iscurrentState !== 'Dashboard') {
      setIsDashboard(false)
    }
    if (iscurrentState !== 'Warehouse') {
      setIsWarehouse(false)
    }
    if (iscurrentState !== 'Shipments') {
      setIsShipments(false)
    }
    if (iscurrentState !== 'Receiving') {
      setIsReceiving(false)
    }
    if (iscurrentState !== 'Billing') {
      setIsBilling(false)
    }
  }, [
    iscurrentState,
    isDashboard,
    isWarehouse,
    isShipments,
    isReceiving,
    isBilling,
  ])

  useEffect(() => {}, [state.user])

  const menuItems = [
    // {
    //   label: 'Menu',
    //   isHeader: true,
    // },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'ri-function-fill',
      link: '/',
      stateVariables: isDashboard,
      click: function (e) {
        e.preventDefault()
        setIsDashboard(!isDashboard)
        setIscurrentState('Dashboard')
        updateIconSidebar(e)
      },
      // subItems: [
      //   // {
      //   //   id: 'Summary',
      //   //   label: 'Summary',
      //   //   link: '/',
      //   //   parentId: 'dashboard',
      //   // },
      // ],
    },
    {
      id: 'warehouse',
      label: 'Inventory',
      icon: 'ri-file-list-2-line',
      link: '#',
      stateVariables: isWarehouse,
      click: function (e) {
        e.preventDefault()
        setIsWarehouse(!isWarehouse)
        setIscurrentState('Warehouse')
        updateIconSidebar(e)
      },
      subItems: [
        {
          id: 'products',
          label: 'Products',
          link: '/Products',
          parentId: 'warehouse',
        },
        {
          id: 'addproduct',
          label: 'Add Product',
          link: '/AddProduct',
          parentId: 'warehouse',
        },
        {
          id: 'inactive',
          label: 'Inactive Products',
          link: '/InactiveProducts',
          parentId: 'warehouse',
        },
        {
          id: 'inventorylog',
          label: 'Audit Log',
          link: '/InventoryLogs',
          parentId: 'warehouse',
        },
      ],
    },
    {
      id: 'shipments',
      label: 'Orders',
      icon: ' ri-shopping-cart-2-fill',
      link: '#',
      stateVariables: isShipments,
      click: function (e) {
        e.preventDefault()
        setIsShipments(!isShipments)
        setIscurrentState('Shipments')
        updateIconSidebar(e)
      },
      subItems: [
        {
          id: 'shipments',
          label: 'Shipment Log',
          link: '/Shipments',
          parentId: 'orders',
        },
      ],
    },
    {
      id: 'receiving',
      label: 'Inbound',
      icon: 'ri-truck-line',
      link: '#',
      stateVariables: isReceiving,
      click: function (e) {
        e.preventDefault()
        setIsReceiving(!isReceiving)
        setIscurrentState('Receiving')
        updateIconSidebar(e)
      },
      subItems: [
        {
          id: 'createreceiving',
          label: 'Create Receiving',
          link: '/CreateReceiving',
          parentId: 'orders',
        },
        {
          id: 'receiving',
          label: 'Receiving Log',
          link: '/Receivings',
          parentId: 'orders',
        },
      ],
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: ' ri-file-list-3-fill',
      link: '#',
      stateVariables: isBilling,
      click: function (e) {
        e.preventDefault()
        setIsBilling(!isBilling)
        setIscurrentState('Billing')
        updateIconSidebar(e)
      },
      subItems: [
        {
          id: 'storage',
          label: 'Current Storage Charges',
          link: '/Storage',
          parentId: 'billing',
        },
        {
          id: 'invoices',
          label: 'Invoices',
          link: '/Invoices',
          parentId: 'billing',
        },
      ],
    },
  ]

  if (state.user?.showWholeSale) {
    menuItems[3].subItems.unshift({
      id: 'createwholesale',
      label: 'Create Wholesale Order',
      link: '/CreateWholeSaleOrder',
      parentId: 'orders',
    })
  }
  
  if (state.user?.showCreateOrder) {
    menuItems[3].subItems.unshift({
      id: 'createorder',
      label: 'Create Order',
      link: '/CreateOrder',
      parentId: 'orders',
    })
  }

  return <React.Fragment>{menuItems}</React.Fragment>
}
export default Navdata
