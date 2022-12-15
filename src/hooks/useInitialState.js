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
  user: {},
  wholesaleOrderProducts: [],
  showInventoryBinsModal: false,
  modalProductInfo: {},
  showEditProductModal: false,
  modalProductDetails: {},
  showWholeSaleOrderModal: false,
  modalCreateReturnInfo:{},
  showCreateReturnModal: false
}

const useInitialState = () => {
  const [state, setState] = useState(initialState)

  const fetcher = (endPoint) => axios(endPoint).then((res) => res.data)
  const { data, error } = useSWR(
    '/api/getuser',
    fetcher
  )

  useEffect(() => {
    if (data) {
      setState({
        ...state,
        user: data,
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
      wholesaleOrderProducts: [...state.wholesaleOrderProducts, product]
    })
  }

  const removeWholesaleProduct = (sku) => {
    setState({
      ...state,
      wholesaleOrderProducts: state.wholesaleOrderProducts.filter((product) => product.sku !== sku)
    })
  }

  const setWholeSaleOrderModal = (payload) => {
    setState({
      ...state,
      showWholeSaleOrderModal: payload
    })
  }

  const setModalCreateReturnInfo = (businessId, orderId) => {
    setState({
      ...state,
      modalCreateReturnInfo: {
        businessId,
        orderId
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

  return {
    state,
    setProducts,
    setshowInventoryBinsModal,
    setModalProductInfo,
    setShowEditProductModal,
    setModalProductDetails,
    addWholesaleProduct,
    removeWholesaleProduct,
    setWholeSaleOrderModal,
    setModalCreateReturnInfo,
    setShowCreateReturnModal
  }
}

export default useInitialState
