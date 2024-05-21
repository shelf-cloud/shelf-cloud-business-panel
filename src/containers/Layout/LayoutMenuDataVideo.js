import React, { useEffect, useState, useContext } from 'react'
import AppContext from '@context/AppContext'
import moment from 'moment'

const Navdata = () => {
  const { state } = useContext(AppContext)
  //state data
  const [isDashboard, setIsDashboard] = useState(false)
  const [isWarehouse, setIsWarehouse] = useState(false)
  const [isShipments, setIsShipments] = useState(false)
  const [isMarketplaceses, setIsMarketplaceses] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  const [isBilling, setIsBilling] = useState(false)
  const [isReports, setIsReports] = useState(false)
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
    if (iscurrentState !== 'Marketplaces') {
      setIsMarketplaceses(false)
    }
    if (iscurrentState !== 'Receiving') {
      setIsReceiving(false)
    }
    if (iscurrentState !== 'Reports') {
      setIsReports(false)
    }
    if (iscurrentState !== 'Billing') {
      setIsBilling(false)
    }
  }, [iscurrentState, isDashboard, isWarehouse, isShipments, isReceiving, isBilling, isAmazon, isMarketplaceses, isReports])

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
          link: '/Products?brand=All&supplier=All&category=All&condition=All',
          parentId: 'warehouse',
        },
        {
          id: 'inactive',
          label: 'Inactive Products',
          link: '/InactiveProducts?brand=All&supplier=All&category=All&condition=All',
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
        {
          id: 'returns',
          label: 'Return Log',
          link: '/Returns',
          parentId: 'shipments',
        },
      ],
    },
    {
      id: 'marketplaces',
      label: 'Marketplaces',
      icon: 'ri-store-2-line',
      link: '/#',
      stateVariables: isMarketplaceses,
      click: function (e) {
        e.preventDefault()
        setIsMarketplaceses(!isMarketplaceses)
        setIscurrentState('Marketplaces')
        updateIconSidebar(e)
      },
      subItems: [
        // {
        //   id: 'marketplaceDashboard',
        //   label: 'Dashboard',
        //   link: '/marketplaceDashboard',
        //   parentId: 'marketplaces',
        // },
        {
          id: 'productPerformance',
          label: 'Product Performance',
          link: '/marketplaces/productPerformance',
          parentId: 'marketplaces',
        },
        // {
        //   id: 'shopify',
        //   label: 'Shopify',
        //   link: '/marketplaceShopify',
        //   parentId: 'marketplaces',
        // },
        // {
        //   id: 'wayfair',
        //   label: 'Wayfair',
        //   link: '/marketplaceWayfair',
        //   parentId: 'marketplaces',
        // },
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
      id: 'reports',
      label: 'Reports',
      icon: 'ri-numbers-fill',
      link: '#',
      stateVariables: isReports,
      click: function (e) {
        e.preventDefault()
        setIsReports(!isReports)
        setIscurrentState('Reports')
        updateIconSidebar(e)
      },
      subItems: [
        {
          id: 'reports',
          label: 'Reports List',
          link: '/reports/list',
          parentId: 'reports',
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

  // if (state.user[state.currentRegion]?.showWholeSale) {
  //   menuItems[2].subItems.unshift({
  //     id: 'returns',
  //     label: 'Returns',
  //     link: '/returns',
  //     parentId: 'shipments',
  //   })
  // }

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

  if (state.user[state.currentRegion]?.showReorderingPoints) {
    menuItems[4].subItems.unshift({
      id: 'reorderingPoints',
      label: 'Reordering Points',
      link: '/reorderingPoints?filters=true&urgency=[2,3]',
      parentId: 'receiving',
    })
  }

  if (state.user[state.currentRegion]?.showPurchaseOrders) {
    menuItems[4].subItems.unshift({
      id: 'purchaseorders',
      label: 'Purchase Orders',
      link: '/purchaseOrders?status=pending&organizeBy=suppliers',
      parentId: 'receiving',
    })
  }

  if (state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected) {
    menuItems[3].subItems?.push({
      id: 'amazon',
      label: 'Amazon',
      // icon: 'ri-amazon-fill',
      link: '/#',
      parentId: 'marketplaces',
      isChildItem: true,
      click: function (e) {
        e.preventDefault()
        setIsAmazon(!isAmazon)
      },
      stateVariables: isAmazon,
      childItems: [
        {
          id: 'listings',
          label: 'Listings',
          link: '/amazon-sellers/listings?showHidden=0&condition=All&mapped=All',
          parentId: 'marketplaces',
        },
        {
          id: 'orders',
          label: 'FBA Orders',
          link: '/amazon-sellers/orders',
          parentId: 'marketplaces',
        },
        // {
        //   id: 'repricer',
        //   label: 'Repricer',
        //   link: '/repricer',
        //   parentId: 'marketplaces',
        // },
        // {
        //   id: 'sendtofba',
        //   label: 'Send to FBA',
        //   link: '/sendtofba',
        //   parentId: 'marketplaces',
        // },
      ],
    })
  }

  return <React.Fragment>{menuItems}</React.Fragment>
}
export default Navdata
