/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { Split } from '@typesTs/purchaseOrders'
//constants
import { CreateReceivingItems } from '@typesTs/purchaseOrders/createReceiving'
import axios from 'axios'
import useSWR from 'swr'

import {
  layoutModeTypes,
  layoutPositionTypes,
  layoutTypes,
  layoutWidthTypes,
  leftSidebarImageTypes,
  leftSidebarTypes,
  leftSidebarViewTypes,
  leftsidbarSizeTypes,
  topbarThemeTypes,
} from '../components/constants/layout'

export interface UserType {
  businessId: string
  name: string
  role: string
  prefix3PL: string
  hasShelfCloudUsa: boolean
  hasShelfCloudEu: boolean
  defaultRegion: string
  orderNumber: OrderNumber
  us: RegionInfoTypeUS
}

export interface OrderNumber {
  us: number
  eu: number
}

export interface RegionInfoTypeUS {
  name: string
  email: string
  contactName: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  country: string
  zipcode: string
  showCreateOrder: boolean
  showWholeSale: boolean
  showKits: boolean
  showPurchaseOrders: boolean
  showAmazonTab: boolean
  amazonConnected: boolean
  showAmazonAdsTab: boolean
  amazonAdsConnected: boolean
  amazonNeedsUpdate: boolean
  minQtyForIndividualUnitsOrder: number
  showReorderingPoints: boolean
  showCommerceHub: boolean
  showPPWithNoSCFees: boolean
  showMarketpalcePricing: boolean
  rpShowFBA: boolean
  rpShowAWD: boolean
  rpCanSplit: boolean
  rphighAlertMax: number
  rpmediumAlertMax: number
  rplowAlertMax: number
  marketplaces: string[]
  marketplacesIds: MarketplacesId[]
}

export interface MarketplacesId {
  value: number
  label: string
}

export type CurrentRegionType = 'us' | 'eu'

export const initialState = {
  layoutType: layoutTypes.VERTICAL,
  leftSidebarType: leftSidebarTypes.DARK,
  layoutModeType: layoutModeTypes.LIGHTMODE,
  layoutWidthType: layoutWidthTypes.FLUID,
  layoutPositionType: layoutPositionTypes.FIXED,
  topbarThemeType: topbarThemeTypes.LIGHT,
  leftsidbarSizeType: leftsidbarSizeTypes.DEFAULT,
  leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
  leftSidebarImageType: leftSidebarImageTypes.NONE,
  currentRegion: '' as CurrentRegionType,
  user: {} as UserType,
  showInventoryBinsModal: false,
  // MODAL - PRODUCT DETAILS
  modalProductInfo: {
    inventoryId: 0,
    sku: '',
  },
  showEditProductModal: false,
  modalProductDetails: {},
  // MODAL - KIT DETAILS
  showEditKitModal: false,
  modalKitDetails: {
    kitId: 0,
    sku: '',
  },
  // MODAL - WHOLESALE ORDERS
  wholesaleOrderProducts: [] as any[],
  showWholeSaleOrderModal: false,
  showSingleBoxesOrderModal: false,
  showIndividualUnitsPlan: false,
  showUploadIndividualUnitsLabelsModal: false,
  // MDOAL - RETURN SHIPMENT
  modalCreateReturnInfo: {},
  showCreateReturnModal: false,
  // MODAL - UPLOAD PRODUCTS
  showUploadProductsModal: false,
  // MODAL - ORDER DETAILS FROM INVOICE
  shipmentDetailModal: {
    show: false,
    orderId: 0,
    orderNumber: '',
    orderType: '',
    status: '',
    orderDate: '',
    showActions: false,
  },
  // MODAL - ORDER DETAILS FROM INVOICE
  storageFeesDetailModal: {
    show: false,
    orderNumber: '',
    totalCharge: 0,
    orderType: '',
    startDate: '',
    endDate: '',
  },
  // MODAL - PAYMENTS
  receivingFromPo: {
    warehouse: {
      id: 0,
      name: '',
    },
    items: {} as CreateReceivingItems,
  },
  showCreateReceivingFromPo: false,
  modalAddPaymentToPoDetails: {},
  showAddPaymentToPo: false,
  modalAddSkuToPurchaseOrder: {
    show: false,
    poId: 0,
    orderNumber: '',
    suppliersName: '',
    hasSplitting: false,
    split: undefined as Split | undefined,
  },
  showCreatePoFromFile: false,
  showCreatePoManually: false,
}

const fetcher = async (endPoint: string) => await axios(endPoint).then((res) => res.data)

const useInitialState = () => {
  const [state, setState] = useState(initialState)
  const router = useRouter()
  const { data } = useSWR('/api/getuser', fetcher)

  useEffect(() => {
    if (data) {
      if (data.error) {
        setState(initialState)
        router.push('/SignIn')
      } else {
        setState({
          ...state,
          user: data,
          currentRegion: data.defaultRegion,
        })
      }
    }
  }, [data])

  useEffect(() => {
    document.documentElement.setAttribute('lang', 'en')
    document.documentElement.setAttribute('data-layout-style', 'default')
    document.documentElement.setAttribute('data-sidebar-size', 'lg')
    document.documentElement.setAttribute('data-sidebar', 'dark')
    document.documentElement.setAttribute('data-layout-mode', 'light')
    document.documentElement.setAttribute('data-layout-width', 'fluid')
    document.documentElement.setAttribute('data-layout-position', 'fixed')
    document.documentElement.setAttribute('data-topbar', 'light')
    document.documentElement.setAttribute('data-layout', 'vertical')
    document.documentElement.setAttribute('data-sidebar-image', 'none')
  }, [])

  const setRegion = (payload: CurrentRegionType) => {
    setState({
      ...state,
      currentRegion: payload,
    })
  }

  const setshowInventoryBinsModal = (payload: boolean) => {
    setState({
      ...state,
      showInventoryBinsModal: payload,
    })
  }

  const setShowEditProductModal = (payload: boolean) => {
    setState({
      ...state,
      showEditProductModal: payload,
    })
  }

  const setModalProductInfo = (inventoryId: number, sku: string) => {
    setState({
      ...state,
      modalProductInfo: {
        inventoryId,
        sku,
      },
      showEditProductModal: false,
      showInventoryBinsModal: true,
    })
  }

  const setShowEditKitModal = (payload: boolean) => {
    setState({
      ...state,
      showEditKitModal: payload,
    })
  }

  const setModalKitDetails = (kitId: number, sku: string) => {
    setState({
      ...state,
      modalKitDetails: {
        kitId,
        sku,
      },
      showEditKitModal: true,
    })
  }

  const setModalProductDetails = (inventoryId: number, businessId: number, sku: string) => {
    setState({
      ...state,
      modalProductDetails: {
        inventoryId,
        businessId,
        sku,
      },
      showInventoryBinsModal: false,
      showEditProductModal: true,
    })
  }

  const addWholesaleProduct = (product: any) => {
    setState({
      ...state,
      wholesaleOrderProducts: [...state.wholesaleOrderProducts, product],
    })
  }

  const removeWholesaleProduct = (sku: string) => {
    setState({
      ...state,
      wholesaleOrderProducts: state.wholesaleOrderProducts.filter((product) => product.sku !== sku),
    })
  }

  const setWholeSaleOrderModal = (payload: boolean) => {
    setState({
      ...state,
      showWholeSaleOrderModal: payload,
    })
  }

  const setSingleBoxesOrderModal = (payload: boolean) => {
    setState({
      ...state,
      showSingleBoxesOrderModal: payload,
    })
  }

  const setModalCreateReturnInfo = (businessId: number, orderId: number) => {
    setState({
      ...state,
      modalCreateReturnInfo: {
        businessId,
        orderId,
      },
      showCreateReturnModal: true,
    })
  }

  const setShowCreateReturnModal = (payload: boolean) => {
    setState({
      ...state,
      showCreateReturnModal: payload,
    })
  }

  const setUploadProductsModal = (payload: boolean) => {
    setState({
      ...state,
      showUploadProductsModal: payload,
    })
  }

  const setShipmentDetailsModal = (show: boolean, orderId: number, orderNumber: string, orderType: string, status: string, orderDate: string, showActions: boolean) => {
    setState({
      ...state,
      shipmentDetailModal: {
        show,
        orderId,
        orderNumber,
        orderType,
        status,
        orderDate,
        showActions,
      },
    })
  }

  const setStorageFeesDetailsModal = (show: boolean, orderNumber: string, totalCharge: number, orderType: string, startDate: string, endDate: string) => {
    setState({
      ...state,
      storageFeesDetailModal: {
        show,
        orderNumber,
        totalCharge,
        orderType,
        startDate,
        endDate,
      },
    })
  }

  const setIndividualUnitsPlan = (payload: boolean) => {
    setState({
      ...state,
      showIndividualUnitsPlan: payload,
    })
  }

  const setUploadIndividualUnitsLabelsModal = (payload: boolean) => {
    setState({
      ...state,
      showUploadIndividualUnitsLabelsModal: payload,
    })
  }

  const setReceivingFromPo = (payload: any) => {
    setState({
      ...state,
      receivingFromPo: payload,
    })
  }

  const setShowCreateReceivingFromPo = (payload: boolean) => {
    setState({
      ...state,
      showCreateReceivingFromPo: payload,
    })
  }

  const setShowAddPaymentToPo = (payload: boolean) => {
    setState({
      ...state,
      showAddPaymentToPo: payload,
    })
  }

  const setModalAddPaymentToPoDetails = (poId: number, orderNumber: string) => {
    setState({
      ...state,
      modalAddPaymentToPoDetails: {
        poId,
        orderNumber,
      },
      showAddPaymentToPo: true,
    })
  }

  const setModalAddSkuToPurchaseOrder = (show: boolean, poId: number, orderNumber: string, suppliersName: string, hasSplitting: boolean, split: any) => {
    setState({
      ...state,
      modalAddSkuToPurchaseOrder: {
        show,
        poId,
        orderNumber,
        suppliersName,
        hasSplitting,
        split,
      },
    })
  }

  const setShowCreatePoFromFile = (payload: boolean) => {
    setState({
      ...state,
      showCreatePoFromFile: payload,
    })
  }
  const setShowCreatePoManually = (payload: boolean) => {
    setState({
      ...state,
      showCreatePoManually: payload,
    })
  }

  return {
    state,
    setRegion,
    setshowInventoryBinsModal,
    setModalProductInfo,
    setShowEditProductModal,
    setShowEditKitModal,
    setModalKitDetails,
    setModalProductDetails,
    addWholesaleProduct,
    removeWholesaleProduct,
    setWholeSaleOrderModal,
    setSingleBoxesOrderModal,
    setModalCreateReturnInfo,
    setShowCreateReturnModal,
    setUploadProductsModal,
    setShipmentDetailsModal,
    setStorageFeesDetailsModal,
    setIndividualUnitsPlan,
    setUploadIndividualUnitsLabelsModal,
    setReceivingFromPo,
    setShowCreateReceivingFromPo,
    setShowAddPaymentToPo,
    setModalAddPaymentToPoDetails,
    setModalAddSkuToPurchaseOrder,
    setShowCreatePoFromFile,
    setShowCreatePoManually,
  }
}

export default useInitialState
