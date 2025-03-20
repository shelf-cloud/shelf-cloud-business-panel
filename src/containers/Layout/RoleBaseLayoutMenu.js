import React, { useEffect, useState, useContext } from 'react'
import AppContext from '@context/AppContext'
import { useSession } from '@auth/client'

const Navdata = () => {
  const { data: session } = useSession()
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
  const [isCommerceHub, setIsCommerceHub] = useState(false)
  const [iscurrentState, setIscurrentState] = useState('Dashboard')

  const modules = {
    Dashboard: {
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
    Inventory: {
      section: {
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
      },
      subItems: {
        Kits: {
          id: 'kits',
          label: 'Kits',
          link: '/Kits',
          parentId: 'warehouse',
        },
        Products: {
          id: 'products',
          label: 'Products',
          link: '/Products?brand=All&supplier=All&category=All&condition=All',
          parentId: 'warehouse',
        },
        'Inactive Products': {
          id: 'inactive',
          label: 'Inactive Products',
          link: '/InactiveProducts?brand=All&supplier=All&category=All&condition=All',
          parentId: 'warehouse',
        },
        'Audit Log': {
          id: 'inventorylog',
          label: 'Audit Log',
          link: '/InventoryLogs',
          parentId: 'warehouse',
        },
      },
    },
    Orders: {
      section: {
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
      },
      subItems: {
        'Create Order': {
          id: 'createorder',
          label: 'Create Order',
          link: '/CreateOrder',
          parentId: 'shipments',
        },
        'Create WholeSale Order': {
          id: 'createwholesale',
          label: 'Create Wholesale Order',
          link: '/CreateWholeSaleOrder',
          parentId: 'shipments',
        },
        'Shipment Log': {
          id: 'shipments',
          label: 'Shipment Log',
          link: '/Shipments',
          parentId: 'shipments',
        },
        'Return Log': {
          id: 'returns',
          label: 'Return Log',
          link: '/Returns',
          parentId: 'shipments',
        },
      },
    },
    Marketplaces: {
      section: {
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
      },
      subItems: {
        'Products Performance': {
          id: 'productPerformance',
          label: 'Product Performance',
          link: '/marketplaces/productPerformance',
          parentId: 'marketplaces',
        },
        Amazon: {
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
              parentId: 'amazon',
            },
            {
              id: 'orders',
              label: 'FBA Orders',
              link: '/amazon-sellers/orders',
              parentId: 'amazon',
            },
            {
              id: 'fulfillments',
              label: 'Fulfillments',
              link: '/amazon-sellers/fulfillments',
              parentId: 'amazon',
            },
            {
              id: 'shipments',
              label: 'FBA Shipments',
              link: '/amazon-sellers/shipments',
              parentId: 'amazon',
            },
            {
              id: 'fulfillments',
              label: 'Send To Amazon',
              link: '/amazon-sellers/fulfillment/sendToAmazon',
              parentId: 'amazon',
            },
          ],
        },
        CommerceHub: {
          id: 'commercehub',
          label: 'Commerce Hub',
          // icon: 'ri-amazon-fill',
          link: '/#',
          parentId: 'marketplaces',
          isChildItem: true,
          click: function (e) {
            e.preventDefault()
            setIsCommerceHub(!isCommerceHub)
          },
          stateVariables: isCommerceHub,
          childItems: [
            {
              id: 'dashboard',
              label: 'Dashboard',
              link: '/commercehub/',
              parentId: 'commercehub',
            },
            {
              id: 'invoices',
              label: 'Check Summary',
              link: '/commercehub/checkSummary',
              parentId: 'commercehub',
            },
            {
              id: 'invoices',
              label: 'Invoices',
              link: '/commercehub/Invoices',
              parentId: 'commercehub',
            },
            {
              id: 'invoices',
              label: 'Deductions',
              link: '/commercehub/deductions',
              parentId: 'commercehub',
            },
          ],
        },
        PPWithNoSCFees: {
          id: 'productPerformanceNoFees',
          label: 'Product Performance No SC Fees',
          link: '/marketplaces/productPerformanceNoFees',
          parentId: 'marketplaces',
        },
        'Marketplace Pricing': {
          id: 'marketplacePricing',
          label: 'Marketplace Pricing',
          link: '/marketplaces/marketplacePricing',
          parentId: 'marketplaces',
        },
      },
    },
    Inbound: {
      section: {
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
      },
      subItems: {
        'Purchase Orders': {
          id: 'purchaseorders',
          label: 'Purchase Orders',
          link: '/purchaseOrders?status=pending&organizeBy=suppliers',
          parentId: 'receiving',
        },
        'Reordering Points': {
          id: 'reorderingPoints',
          label: 'Reordering Points',
          link: '/reorderingPoints?filters=true&urgency=[2,3]',
          parentId: 'receiving',
        },
        'Create Receiving': {
          id: 'createreceiving',
          label: 'Create Receiving',
          link: '/CreateReceiving',
          parentId: 'receiving',
        },
        'Receiving Log': {
          id: 'receiving',
          label: 'Receiving Log',
          link: '/Receivings',
          parentId: 'receiving',
        },
      },
    },
    Reports: {
      section: {
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
      },
      subItems: {
        'Report List': {
          id: 'reports',
          label: 'Reports List',
          link: '/reports/list',
          parentId: 'reports',
        },
      },
    },
    Billing: {
      section: {
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
      },
      subItems: {
        'Current Storage Charges': {
          id: 'storage',
          label: 'Current Storage Charges',
          link: '/Storage',
          parentId: 'billing',
        },
        Invoices: {
          id: 'invoices',
          label: 'Invoices',
          link: '/Invoices',
          parentId: 'billing',
        },
      },
    },
  }

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
  }, [iscurrentState, isDashboard, isWarehouse, isShipments, isReceiving, isBilling, isMarketplaceses, isReports])

  useEffect(() => {}, [state.user, session])

  var menuItems = []

  if (session?.user?.role === 'admin') {
    menuItems = [
      modules.Dashboard,
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
          {
            id: 'productPerformance',
            label: 'Product Performance',
            link: '/marketplaces/productPerformance',
            parentId: 'marketplaces',
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

    if (state.user[state.currentRegion]?.showWholeSale) {
      menuItems[2].subItems.unshift(modules.Orders.subItems['Create WholeSale Order'])
    }

    if (state.user[state.currentRegion]?.showCreateOrder) {
      menuItems[2].subItems.unshift(modules.Orders.subItems['Create Order'])
    }

    if (state.user[state.currentRegion]?.showKits) {
      menuItems[1].subItems.unshift(modules.Inventory.subItems.Kits)
    }

    if (state.user[state.currentRegion]?.showReorderingPoints) {
      menuItems[4].subItems.unshift(modules.Inbound.subItems['Reordering Points'])
    }

    if (state.user[state.currentRegion]?.showPurchaseOrders) {
      menuItems[4].subItems.unshift(modules.Inbound.subItems['Purchase Orders'])
    }

    if (state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected) {
      menuItems[3].subItems?.push(modules.Marketplaces.subItems.Amazon)
    }

    if (state.user[state.currentRegion]?.showCommerceHub) {
      menuItems[3].subItems?.push(modules.Marketplaces.subItems.CommerceHub)
    }

    if (state.user[state.currentRegion]?.showPPWithNoSCFees) {
      menuItems[3].subItems?.unshift(modules.Marketplaces.subItems.PPWithNoSCFees)
    }

    if (state.user[state.currentRegion]?.showMarketpalcePricing) {
      menuItems[3].subItems?.unshift(modules.Marketplaces.subItems['Marketplace Pricing'])
    }
  } else {
    menuItems = [modules.Dashboard]
    if (state.user?.permissions) {
      Object.entries(state?.user?.permissions).map(([module, moduleInfo]) => {
        menuItems.push(modules[module].section)
        moduleInfo.modules.map((submodule) => {
          if (menuItems[menuItems.length - 1].subItems === undefined) menuItems[menuItems.length - 1].subItems = []
          menuItems[menuItems.length - 1].subItems.push(modules[module].subItems[submodule])
        })
      })
    }
  }

  return <React.Fragment>{menuItems}</React.Fragment>
}

export default Navdata
