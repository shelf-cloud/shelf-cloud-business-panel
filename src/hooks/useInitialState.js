/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import axios from 'axios'
import useSWR from 'swr'

//constants
import {
  layoutTypes,
  leftSidebarTypes,
  layoutModeTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
} from '../components/constants/layout'

const initialState = {
  layoutType: layoutTypes.VERTICAL,
  leftSidebarType: leftSidebarTypes.DARK,
  layoutModeType: layoutModeTypes.LIGHTMODE,
  layoutWidthType: layoutWidthTypes.FLUID,
  layoutPositionType: layoutPositionTypes.FIXED,
  topbarThemeType: topbarThemeTypes.LIGHT,
  leftsidbarSizeType: leftsidbarSizeTypes.DEFAULT,
  leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
  leftSidebarImageType: leftSidebarImageTypes.NONE,
  currentRegion: '',
  user: {},
  showInventoryBinsModal: false,
  // MODAL - PRODUCT DETAILS
  modalProductInfo: {},
  showEditProductModal: false,
  modalProductDetails: {},
  // MODAL - KIT DETAILS
  showEditKitModal: false,
  modalKitDetails: {},
  // MODAL - WHOLESALE ORDERS
  wholesaleOrderProducts: [],
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
  orderNumberfromInvoices: null,
  showOrderDetailsOfInvoiceModal: false,
  // MODAL - PAYMENTS
  receivingFromPo: {},
  showCreateReceivingFromPo: false,
  modalAddPaymentToPoDetails: {},
  showAddPaymentToPo: false,
  modalAddSkuToPurchaseOrder: {},
  showAddSkuToPurchaseOrder: false,
  showCreatePoFromFile: false,
  showCreatePoManually: false,
}

const useInitialState = () => {
  const [state, setState] = useState(initialState)

  const fetcher = (endPoint) => axios(endPoint).then((res) => res.data)
  const { data, error } = useSWR('/api/getuser', fetcher)

  useEffect(() => {
    if (data) {
      setState({
        ...state,
        user: data,
        currentRegion: data.defaultRegion,
      })
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

    // axios('/api/getuser').then(({ data }) =>
    //   setState({
    //     ...state,
    //     user: data,
    //   })
    // )
  }, [])

  const setRegion = (payload) => {
    setState({
      ...state,
      currentRegion: payload,
    })
  }

  const setProducts = (payload) => {
    setState({
      ...state,
      products: payload,
    })
  }

  const setshowInventoryBinsModal = (payload) => {
    setState({
      ...state,
      showInventoryBinsModal: payload,
    })
  }

  const setShowEditProductModal = (payload) => {
    setState({
      ...state,
      showEditProductModal: payload,
    })
  }

  const setModalProductInfo = (inventoryId, businessId, sku) => {
    setState({
      ...state,
      modalProductInfo: {
        inventoryId,
        businessId,
        sku,
      },
      showEditProductModal: false,
      showInventoryBinsModal: true,
    })
  }

  const setShowEditKitModal = (payload) => {
    setState({
      ...state,
      showEditKitModal: payload,
    })
  }

  const setModalKitDetails = (kitId, businessId, sku) => {
    setState({
      ...state,
      modalKitDetails: {
        kitId,
        businessId,
        sku,
      },
      showEditKitModal: true,
    })
  }

  const setModalProductDetails = (inventoryId, businessId, sku) => {
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

  const addWholesaleProduct = (product) => {
    setState({
      ...state,
      wholesaleOrderProducts: [...state.wholesaleOrderProducts, product],
    })
  }

  const removeWholesaleProduct = (sku) => {
    setState({
      ...state,
      wholesaleOrderProducts: state.wholesaleOrderProducts.filter((product) => product.sku !== sku),
    })
  }

  const setWholeSaleOrderModal = (payload) => {
    setState({
      ...state,
      showWholeSaleOrderModal: payload,
    })
  }

  const setSingleBoxesOrderModal = (payload) => {
    setState({
      ...state,
      showSingleBoxesOrderModal: payload,
    })
  }

  const setModalCreateReturnInfo = (businessId, orderId) => {
    setState({
      ...state,
      modalCreateReturnInfo: {
        businessId,
        orderId,
      },
      showCreateReturnModal: true,
    })
  }

  const setShowCreateReturnModal = (payload) => {
    setState({
      ...state,
      showCreateReturnModal: payload,
    })
  }

  const setUploadProductsModal = (payload) => {
    setState({
      ...state,
      showUploadProductsModal: payload,
    })
  }

  const setShowOrderDetailsOfInvoiceModal = (payload, orderNumber) => {
    setState({
      ...state,
      orderNumberfromInvoices: orderNumber,
      showOrderDetailsOfInvoiceModal: payload,
    })
  }

  const setIndividualUnitsPlan = (payload) => {
    setState({
      ...state,
      showIndividualUnitsPlan: payload,
    })
  }

  const setUploadIndividualUnitsLabelsModal = (payload) => {
    setState({
      ...state,
      showUploadIndividualUnitsLabelsModal: payload,
    })
  }

  const setReceivingFromPo = (payload) => {
    setState({
      ...state,
      receivingFromPo: payload,
    })
  }

  const setShowCreateReceivingFromPo = (payload) => {
    setState({
      ...state,
      showCreateReceivingFromPo: payload,
    })
  }

  const setShowAddPaymentToPo = (payload) => {
    setState({
      ...state,
      showAddPaymentToPo: payload,
    })
  }

  const setModalAddPaymentToPoDetails = (poId, orderNumber) => {
    setState({
      ...state,
      modalAddPaymentToPoDetails: {
        poId,
        orderNumber,
      },
      showAddPaymentToPo: true,
    })
  }

  const setModalAddSkuToPurchaseOrder = (poId, orderNumber, suppliersName) => {
    setState({
      ...state,
      modalAddSkuToPurchaseOrder: {
        poId,
        orderNumber,
        suppliersName,
      },
      showAddSkuToPurchaseOrder: true,
    })
  }

  const setShowAddSkuToPurchaseOrder = (payload) => {
    setState({
      ...state,
      showAddSkuToPurchaseOrder: payload,
    })
  }

  const setShowCreatePoFromFile = (payload) => {
    setState({
      ...state,
      showCreatePoFromFile: payload,
    })
  }
  const setShowCreatePoManually = (payload) => {
    setState({
      ...state,
      showCreatePoManually: payload,
    })
  }

  return {
    state,
    setRegion,
    setProducts,
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
    setShowOrderDetailsOfInvoiceModal,
    setIndividualUnitsPlan,
    setUploadIndividualUnitsLabelsModal,
    setReceivingFromPo,
    setShowCreateReceivingFromPo,
    setShowAddPaymentToPo,
    setModalAddPaymentToPoDetails,
    setModalAddSkuToPurchaseOrder,
    setShowAddSkuToPurchaseOrder,
    setShowCreatePoFromFile,
    setShowCreatePoManually,
  }
}

export default useInitialState
