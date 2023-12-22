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
  const [isAmazon, setIsAmazon] = useState(false)

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
    if (iscurrentState !== 'Amazon') {
      setIsAmazon(false)
    }
  }, [iscurrentState, isDashboard, isWarehouse, isShipments, isReceiving, isBilling, isAmazon])

  useEffect(() => {}, [state.user])

  const menuItems = [
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
        // {
        //   id: 'addproduct',
        //   label: 'Add Product',
        //   link: '/AddProduct',
        //   parentId: 'warehouse',
        // },
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
          parentId: 'shipments',
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
          parentId: 'receiving',
        },
        {
          id: 'receiving',
          label: 'Receiving Log',
          link: '/Receivings',
          parentId: 'receiving',
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

  if (state.user[state.currentRegion]?.showWholeSale) {
    menuItems[2].subItems.unshift({
      id: 'createwholesale',
      label: 'Create Wholesale Order',
      link: '/CreateWholeSaleOrder',
      parentId: 'shipments',
    })
  }

  if (state.user[state.currentRegion]?.showCreateOrder) {
    menuItems[2].subItems.unshift({
      id: 'createorder',
      label: 'Create Order',
      link: '/CreateOrder',
      parentId: 'shipments',
    })
  }

  if (state.user[state.currentRegion]?.showKits) {
    menuItems[1].subItems.unshift({
      id: 'kits',
      label: 'Kits',
      link: '/Kits',
      parentId: 'warehouse',
    })
  }

  if (state.user[state.currentRegion]?.showPurchaseOrders) {
    menuItems[3].subItems.unshift({
      id: 'purchaseorders',
      label: 'Purchase Orders',
      link: '/purchaseOrders?status=pending&organizeBy=suppliers',
      parentId: 'receiving',
    })
  }

  if (state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected) {
    menuItems.splice(3, 0, {
      id: 'amazon',
      label: 'Amazon',
      icon: 'ri-amazon-fill',
      link: '#',
      stateVariables: isAmazon,
      click: function (e) {
        e.preventDefault()
        setIsAmazon(!isAmazon)
        setIscurrentState('Amazon')
        updateIconSidebar(e)
      },
      subItems: [
        {
          id: 'listings',
          label: 'Amazon Listings',
          link: '/amazon-sellers/listings',
          parentId: 'amazon',
        },
      ],
    })
  }

  return <React.Fragment>{menuItems}</React.Fragment>
}
export default Navdata
