import { useCallback, useContext, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'

export type FinalBoxConfiguration = {
  items: {
    poId?: string
    sku: string
    quantity: number
    inventoryId: number
    receiving: number
    name: string
    image: string
    boxQty: number
    poNumber?: string
    orderNumber: string
  }[]
}

export type SingleSkuBoxes = {
  [poId: string]: {
    [sku: string]: {
      receiving: number
      name: string
      inventoryId: number
      image: string
      poNumber: string
      boxQty: number
      boxes: { unitsPerBox: number; qtyOfBoxes: number }[]
    }
  }
}

export type MultiSkuBoxes = {
  [sku: string]: {
    receiving: number
    quantity: number
    name: string
    inventoryId: number
    image: string
    boxQty: number
    poNumber: string
    poId: string
  }
}

export interface AddSKUToMultiSKUBoxType {
  boxIndex: number
  sku: string
  quantity: number
  receiving: number
  name: string
  inventoryId: number
  image: string
  poId: string
  boxQty: number
  poNumber: string
}

export const useReceivingsBoxes = (packingConfiguration: string, receivingOrderNumber: string) => {
  const { state } = useContext(AppContext)

  // SINGLE SKU PACKAGES_____________________
  const [singleSkuPackages, setsingleSkuPackages] = useState<SingleSkuBoxes>(() => {
    const packages = {} as SingleSkuBoxes

    for (const [poId, items] of Object.entries(state.receivingFromPo.items)) {
      packages[poId] = {}

      for (const item of Object.values(items)) {
        const { sku, boxQty, receivingQty } = item

        const qtyPerBox = boxQty || 1
        const boxes = Math.floor(receivingQty / qtyPerBox)
        let boxedQty = receivingQty

        packages[poId][sku] = {
          receiving: receivingQty,
          name: item.title,
          inventoryId: item.inventoryId,
          image: item.image,
          poNumber: item.orderNumber,
          boxQty: qtyPerBox,
          boxes: [],
        }

        if (receivingQty <= qtyPerBox) {
          packages[poId][sku].boxes.push({
            unitsPerBox: receivingQty,
            qtyOfBoxes: 1,
          })
        } else {
          packages[poId][sku].boxes.push({
            unitsPerBox: qtyPerBox,
            qtyOfBoxes: boxes,
          })

          boxedQty -= qtyPerBox * boxes
          if (boxedQty > 0) {
            packages[poId][sku].boxes.push({
              unitsPerBox: boxedQty,
              qtyOfBoxes: 1,
            })
          }
        }
      }
    }
    return packages
  })

  // ADD NEW SINGLE SKU BOX CONFIGURATION
  const addNewSingleSkuBoxConfiguration = useCallback((poId: string, sku: string) => {
    setsingleSkuPackages((prev) => {
      prev[poId][sku].boxes.push({
        unitsPerBox: 0,
        qtyOfBoxes: 0,
      })
      return { ...prev }
    })
  }, [])

  // REMOVE SINGLE SKU BOX CONFIGURATION
  const removeSingleSkuBoxConfiguration = useCallback((poId: string, sku: string, index: number) => {
    setsingleSkuPackages((prev) => {
      const updatedBoxes = prev[poId][sku].boxes.filter((_, i) => i !== index)
      if (updatedBoxes.length === 0) {
        delete prev[poId][sku]
      } else {
        prev[poId][sku].boxes = updatedBoxes
      }
      return { ...prev }
    })
  }, [])

  // CHANGE UNITS PER BOX
  const changeUnitsPerBox = useCallback((poId: string, sku: string, index: number, value: number) => {
    setsingleSkuPackages((prev) => {
      prev[poId][sku].boxes[index].unitsPerBox = value
      return { ...prev }
    })
  }, [])

  // CHANGE QTY OF BOXES
  const changeQtyOfBoxes = useCallback((poId: string, sku: string, index: number, value: number) => {
    setsingleSkuPackages((prev) => {
      prev[poId][sku].boxes[index].qtyOfBoxes = value
      return { ...prev }
    })
  }, [])

  // MULTI SKU PACKAGES_____________________
  const [multiSkuPackages, setmultiSkuPackages] = useState<MultiSkuBoxes[]>([])

  // ADD NEW EMPTY BOX CONFIGURATION
  const addNewMultiSkuBoxConfiguration = useCallback(() => {
    setmultiSkuPackages((prev) => [...prev, {}])
  }, [])

  // REMOVE MULTI SKU BOX CONFIGURATION
  const removeMultiSkuBoxConfiguration = useCallback((index: number) => {
    setmultiSkuPackages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // ADD SKU TO MULTI SKU BOX
  const addSkuToMultiSkuBox = useCallback(({ boxIndex, sku, quantity, receiving, name, inventoryId, image, poId, boxQty, poNumber }: AddSKUToMultiSKUBoxType) => {
    setmultiSkuPackages((prev) => {
      const updatedPackages = [...prev]
      if (!updatedPackages[boxIndex]) {
        updatedPackages[boxIndex] = {}
      }
      if (updatedPackages[boxIndex][sku]) {
        updatedPackages[boxIndex][sku].quantity += quantity
      } else {
        updatedPackages[boxIndex][sku] = {
          quantity,
          receiving,
          name,
          inventoryId,
          image,
          poId,
          boxQty: boxQty || 1,
          poNumber,
        }
      }
      return updatedPackages
    })
  }, [])

  // REMOVE SKU FROM MULTI SKU BOX
  const removeSkuFromMultiSkuBox = useCallback((index: number, sku: string) => {
    setmultiSkuPackages((prev) => {
      const updatedPackages = [...prev]
      if (updatedPackages[index] && updatedPackages[index][sku]) {
        delete updatedPackages[index][sku]
      }
      return updatedPackages
    })
  }, [])

  // CLEAR ALL MULTI SKU BOXES USING MASTER BOXES
  const clearMultiSkuBoxes = useCallback(() => {
    setmultiSkuPackages([])
  }, [])

  // SET MIXED SKU BOXES USING MASTER BOXES
  const setMixedSkuBoxesUsingMasterBoxes = useCallback(() => {
    const packages = [] as MultiSkuBoxes[]

    for (const [poId, items] of Object.entries(state.receivingFromPo.items)) {
      for (const item of Object.values(items)) {
        const { sku, boxQty, receivingQty, orderNumber, image, inventoryId, title } = item

        const qtyPerBox = boxQty || 1
        const boxes = Math.ceil(receivingQty / qtyPerBox)
        let boxedQty = receivingQty

        for (let i = 0; i < boxes; i++) {
          packages.push({
            [sku]: {
              receiving: receivingQty,
              quantity: boxedQty >= qtyPerBox ? qtyPerBox : boxedQty,
              name: title,
              inventoryId,
              image,
              poId,
              boxQty: qtyPerBox,
              poNumber: orderNumber,
            },
          })

          boxedQty -= qtyPerBox
        }
      }
    }

    setmultiSkuPackages(packages)
  }, [state.receivingFromPo.items])

  const finalBoxesConfiguration = useMemo(() => {
    const finalBoxes = [] as FinalBoxConfiguration[]
    switch (packingConfiguration) {
      case 'single':
        for (const poId in singleSkuPackages) {
          for (const sku in singleSkuPackages[poId]) {
            const item = singleSkuPackages[poId][sku]
            for (const box of item.boxes) {
              const { qtyOfBoxes, unitsPerBox } = box

              for (let i = 0; i < qtyOfBoxes; i++) {
                finalBoxes.push({
                  items: [
                    {
                      poId,
                      sku,
                      quantity: unitsPerBox,
                      inventoryId: item.inventoryId,
                      receiving: item.receiving,
                      name: item.name,
                      image: item.image,
                      boxQty: item.boxQty || 1,
                      poNumber: item.poNumber,
                      orderNumber: receivingOrderNumber,
                    },
                  ],
                })
              }
            }
          }
        }
        return finalBoxes
      case 'multi':
        for (const box of multiSkuPackages) {
          const boxItems = Object.entries(box).map(([sku, item]) => ({
            sku,
            quantity: item.quantity,
            inventoryId: item.inventoryId,
            receiving: item.receiving,
            name: item.name,
            image: item.image,
            boxQty: item.boxQty || 1,
            poNumber: item.poNumber,
            poId: item.poId,
            orderNumber: receivingOrderNumber,
          }))
          finalBoxes.push({
            items: boxItems,
          })
        }
        return finalBoxes
      case 'box':
        const allItems = []
        for (const [poId, items] of Object.entries(state.receivingFromPo.items)) {
          for (const item of Object.values(items)) {
            const { sku, boxQty, receivingQty, inventoryId, title, image, orderNumber } = item

            allItems.push({
              poId,
              sku,
              quantity: receivingQty,
              inventoryId: inventoryId,
              receiving: receivingQty,
              name: title,
              image: image,
              boxQty: boxQty || 1,
              poNumber: orderNumber,
              orderNumber: receivingOrderNumber,
            })
          }
        }
        finalBoxes.push({
          items: allItems,
        })
        return finalBoxes
      default:
        for (const poId in singleSkuPackages) {
          for (const sku in singleSkuPackages[poId]) {
            const item = singleSkuPackages[poId][sku]
            for (const box of item.boxes) {
              const { qtyOfBoxes, unitsPerBox } = box
              const items = []
              for (let i = 0; i < qtyOfBoxes; i++) {
                items.push({
                  poId,
                  sku,
                  quantity: unitsPerBox,
                  inventoryId: item.inventoryId,
                  receiving: item.receiving,
                  name: item.name,
                  image: item.image,
                  boxQty: item.boxQty || 1,
                  poNumber: item.poNumber,
                  orderNumber: receivingOrderNumber,
                })
              }
              finalBoxes.push({
                items,
              })
            }
          }
        }
        return finalBoxes
    }
  }, [packingConfiguration, receivingOrderNumber, singleSkuPackages, multiSkuPackages, state.receivingFromPo.items])

  const hasBoxedErrors = useMemo((): { error: boolean; message?: string } => {
    switch (packingConfiguration) {
      case 'single':
        for (const [poId, items] of Object.entries(state.receivingFromPo.items)) {
          for (const item of Object.values(items)) {
            const { sku, receivingQty, orderNumber } = item
            const singleSku = singleSkuPackages[poId][sku]
            const totalUnitsBoxed = singleSku.boxes.reduce((acc, box) => acc + box.qtyOfBoxes * box.unitsPerBox, 0)
            if (totalUnitsBoxed !== receivingQty) {
              return { error: true, message: `Total units boxed for SKU ${sku} in PO ${orderNumber} does not match receiving quantity.` }
            }
            for (const box of singleSku.boxes) {
              if (box.unitsPerBox <= 0 || box.qtyOfBoxes <= 0) {
                return { error: true, message: `Invalid box configuration for SKU ${sku} in PO ${orderNumber}.` }
              }
            }
          }
        }
        return { error: false }
      case 'multi':
        const boxesWithNoProduct = multiSkuPackages.some((box) => !Object.values(box).some((item) => item.quantity > 0))
        if (boxesWithNoProduct) {
          return { error: true, message: 'At least one multi SKU box has no products.' }
        }
        for (const box of multiSkuPackages) {
          for (const sku in box) {
            const item = box[sku]
            if (item.quantity <= 0) {
              return { error: true, message: `Invalid quantity for SKU ${sku} in multi SKU box.` }
            }
          }
        }
        // Check if total units boxed match receiving quantity for each SKU
        if (multiSkuPackages.length === 0) {
          return { error: true, message: 'No multi SKU boxes configured.' }
        }

        for (const [poId, items] of Object.entries(state.receivingFromPo.items)) {
          for (const item of Object.values(items)) {
            const { sku, receivingQty, orderNumber } = item
            const multiSkuBoxes = multiSkuPackages.filter((box) => box[sku] && box[sku].poId === poId)
            const totalUnitsBoxed = multiSkuBoxes.reduce((acc, box) => acc + box[sku].quantity, 0)
            if (totalUnitsBoxed !== receivingQty) {
              return { error: true, message: `Total units boxed for SKU ${sku} in PO ${orderNumber} does not match receiving quantity.` }
            }
            for (const box of multiSkuBoxes) {
              if (box[sku].quantity <= 0) {
                return { error: true, message: `Invalid box configuration for SKU ${sku} in PO ${orderNumber}.` }
              }
            }
          }
        }
        return { error: false }
      case 'box':
        return { error: false }
      default:
        return { error: false }
    }
  }, [packingConfiguration, singleSkuPackages, multiSkuPackages, state.receivingFromPo.items])

  return {
    singleSkuPackages,
    setsingleSkuPackages,
    addNewSingleSkuBoxConfiguration,
    removeSingleSkuBoxConfiguration,
    changeUnitsPerBox,
    changeQtyOfBoxes,
    multiSkuPackages,
    setmultiSkuPackages,
    addNewMultiSkuBoxConfiguration,
    removeMultiSkuBoxConfiguration,
    addSkuToMultiSkuBox,
    removeSkuFromMultiSkuBox,
    setMixedSkuBoxesUsingMasterBoxes,
    finalBoxesConfiguration,
    hasBoxedErrors,
    clearMultiSkuBoxes,
  }
}
