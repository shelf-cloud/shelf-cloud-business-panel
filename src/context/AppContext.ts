import useInitialState, { initialState } from '@hooks/useInitialState'
import React from 'react'

export type AppState = typeof initialState
export type AppContextType = ReturnType<typeof useInitialState>

const defaultValue: AppContextType = {
  state: initialState,
  setRegion: () => {},
  setshowInventoryBinsModal: () => {},
  setModalProductInfo: () => {},
  setShowEditProductModal: () => {},
  setShowEditKitModal: () => {},
  setModalKitDetails: () => {},
  setModalProductDetails: () => {},
  addWholesaleProduct: () => {},
  removeWholesaleProduct: () => {},
  setWholeSaleOrderModal: () => {},
  setSingleBoxesOrderModal: () => {},
  setModalCreateReturnInfo: () => {},
  setShowCreateReturnModal: () => {},
  setUploadProductsModal: () => {},
  setShipmentDetailsModal: () => {},
  setStorageFeesDetailsModal: () => {},
  setIndividualUnitsPlan: () => {},
  setUploadIndividualUnitsLabelsModal: () => {},
  setReceivingFromPo: () => {},
  setShowCreateReceivingFromPo: () => {},
  setShowAddPaymentToPo: () => {},
  setModalAddPaymentToPoDetails: () => {},
  setModalAddSkuToPurchaseOrder: () => {},
  setShowCreatePoFromFile: () => {},
  setShowCreatePoManually: () => {},
}

const AppContext = React.createContext<AppContextType>(defaultValue)

export default AppContext
