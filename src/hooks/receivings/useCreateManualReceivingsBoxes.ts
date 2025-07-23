import { useCallback, useEffect, useMemo, useState } from 'react'

import { ReceivingInventory } from './useReceivingInventory'
import { FinalBoxConfiguration } from './useReceivingsBoxes'

export type ManualSingleSkuBoxes = {
  [sku: string]: {
    receiving: number
    name: string
    inventoryId: number
    image: string
    boxQty: number
    boxes: { unitsPerBox: number; qtyOfBoxes: number }[]
  }
}

export type ManualMultiSkuBoxes = {
  [sku: string]: {
    receiving: number
    quantity: number
    name: string
    inventoryId: number
    image: string
    boxQty: number
  }
}

export interface ManualAddSKUToMultiSKUBoxType {
  boxIndex: number
  sku: string
  quantity: number
  receiving: number
  name: string
  inventoryId: number
  image: string
  boxQty: number
}

export const useCreateManualReceivingsBoxes = (receivingItems: ReceivingInventory[], packingConfiguration: string, receivingOrderNumber: string) => {
  // SINGLE SKU PACKAGES_____________________
  const [singleSkuPackages, setsingleSkuPackages] = useState<ManualSingleSkuBoxes>(() => {
    const packages = {} as ManualSingleSkuBoxes

    for (const item of receivingItems) {
      const { sku, boxQty, quantity, name, inventoryId, image } = item

      const boxes = Math.floor(quantity / boxQty!)
      let boxedQty = quantity

      packages[sku] = {
        receiving: quantity,
        name: name,
        inventoryId: inventoryId!,
        image: image!,
        boxQty: boxQty!,
        boxes: [],
      }

      if (quantity <= boxQty!) {
        packages[sku].boxes.push({
          unitsPerBox: quantity,
          qtyOfBoxes: 1,
        })
      } else {
        packages[sku].boxes.push({
          unitsPerBox: boxQty!,
          qtyOfBoxes: boxes,
        })

        boxedQty -= boxQty! * boxes

        if (boxedQty > 0) {
          packages[sku].boxes.push({
            unitsPerBox: boxedQty,
            qtyOfBoxes: 1,
          })
        }
      }
    }

    return packages
  })

  useEffect(() => {
    const packages = {} as ManualSingleSkuBoxes
    for (const item of receivingItems) {
      const { sku, boxQty, quantity, name, inventoryId, image } = item

      const boxes = Math.floor(quantity / boxQty!)
      let boxedQty = quantity

      packages[sku] = {
        receiving: quantity,
        name: name,
        inventoryId: inventoryId!,
        image: image!,
        boxQty: boxQty!,
        boxes: [],
      }

      if (quantity <= boxQty!) {
        packages[sku].boxes.push({
          unitsPerBox: quantity,
          qtyOfBoxes: 1,
        })
      } else {
        packages[sku].boxes.push({
          unitsPerBox: boxQty!,
          qtyOfBoxes: boxes,
        })

        boxedQty -= boxQty! * boxes

        if (boxedQty > 0) {
          packages[sku].boxes.push({
            unitsPerBox: boxedQty,
            qtyOfBoxes: 1,
          })
        }
      }
    }
    setsingleSkuPackages(packages)
  }, [receivingItems])

  // ADD NEW SINGLE SKU BOX CONFIGURATION
  const addNewSingleSkuBoxConfiguration = useCallback((sku: string) => {
    setsingleSkuPackages((prev) => {
      prev[sku].boxes.push({
        unitsPerBox: 0,
        qtyOfBoxes: 0,
      })
      return { ...prev }
    })
  }, [])

  // REMOVE SINGLE SKU BOX CONFIGURATION
  const removeSingleSkuBoxConfiguration = useCallback((sku: string, index: number) => {
    setsingleSkuPackages((prev) => {
      const updatedBoxes = prev[sku].boxes.filter((_, i) => i !== index)
      if (updatedBoxes.length === 0) {
        delete prev[sku]
      } else {
        prev[sku].boxes = updatedBoxes
      }
      return { ...prev }
    })
  }, [])

  // CHANGE UNITS PER BOX
  const changeUnitsPerBox = useCallback((sku: string, index: number, value: number) => {
    setsingleSkuPackages((prev) => {
      prev[sku].boxes[index].unitsPerBox = value
      return { ...prev }
    })
  }, [])

  // CHANGE QTY OF BOXES
  const changeQtyOfBoxes = useCallback((sku: string, index: number, value: number) => {
    setsingleSkuPackages((prev) => {
      prev[sku].boxes[index].qtyOfBoxes = value
      return { ...prev }
    })
  }, [])

  // MULTI SKU PACKAGES_____________________
  const [multiSkuPackages, setmultiSkuPackages] = useState<ManualMultiSkuBoxes[]>([])

  // ADD NEW EMPTY BOX CONFIGURATION
  const addNewMultiSkuBoxConfiguration = useCallback(() => {
    setmultiSkuPackages((prev) => [...prev, {}])
  }, [])

  // REMOVE MULTI SKU BOX CONFIGURATION
  const removeMultiSkuBoxConfiguration = useCallback((index: number) => {
    setmultiSkuPackages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // ADD SKU TO MULTI SKU BOX
  const addSkuToMultiSkuBox = useCallback(({ boxIndex, sku, quantity, receiving, name, inventoryId, image, boxQty }: ManualAddSKUToMultiSKUBoxType) => {
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
          boxQty,
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
    const packages = [] as ManualMultiSkuBoxes[]

    for (const item of receivingItems) {
      const { sku, boxQty, quantity, image, inventoryId, name } = item
      const boxes = Math.ceil(quantity / boxQty!)
      let boxedQty = quantity

      for (let i = 0; i < boxes; i++) {
        packages.push({
          [sku]: {
            receiving: quantity,
            quantity: boxedQty >= boxQty! ? boxQty! : boxedQty,
            name: name,
            inventoryId: inventoryId!,
            image: image!,
            boxQty: boxQty!,
          },
        })

        boxedQty -= boxQty!
      }
    }

    setmultiSkuPackages(packages)
  }, [receivingItems])

  const finalBoxesConfiguration = useMemo(() => {
    const finalBoxes = [] as FinalBoxConfiguration[]
    switch (packingConfiguration) {
      case 'single':
        for (const sku in singleSkuPackages) {
          const item = singleSkuPackages[sku]
          for (const box of item.boxes) {
            const { qtyOfBoxes, unitsPerBox } = box

            for (let i = 0; i < qtyOfBoxes; i++) {
              finalBoxes.push({
                items: [
                  {
                    sku,
                    quantity: unitsPerBox,
                    inventoryId: item.inventoryId,
                    receiving: item.receiving,
                    name: item.name,
                    image: item.image,
                    boxQty: item.boxQty,
                    orderNumber: receivingOrderNumber,
                  },
                ],
              })
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
            boxQty: item.boxQty,
            orderNumber: receivingOrderNumber,
          }))
          finalBoxes.push({
            items: boxItems,
          })
        }
        return finalBoxes
      case 'box':
        const allItems = []

        for (const item of receivingItems) {
          const { sku, boxQty, quantity, image, inventoryId, name } = item

          allItems.push({
            sku,
            quantity: quantity,
            inventoryId: inventoryId!,
            receiving: quantity,
            name: name,
            image: image!,
            boxQty: boxQty!,
            orderNumber: receivingOrderNumber,
          })
        }

        finalBoxes.push({
          items: allItems,
        })
        return finalBoxes
      default:
        for (const sku in singleSkuPackages) {
          const item = singleSkuPackages[sku]
          for (const box of item.boxes) {
            const { qtyOfBoxes, unitsPerBox } = box
            const items = []
            for (let i = 0; i < qtyOfBoxes; i++) {
              items.push({
                sku,
                quantity: unitsPerBox,
                inventoryId: item.inventoryId,
                receiving: item.receiving,
                name: item.name,
                image: item.image,
                boxQty: item.boxQty,
                orderNumber: receivingOrderNumber,
              })
            }
            finalBoxes.push({
              items,
            })
          }
        }

        return finalBoxes
    }
  }, [packingConfiguration, receivingOrderNumber, singleSkuPackages, multiSkuPackages, receivingItems])

  const hasBoxedErrors = useMemo((): { error: boolean; message?: string } => {
    switch (packingConfiguration) {
      case 'single':
        for (const item of receivingItems) {
          const { sku, quantity } = item
          const singleSku = singleSkuPackages[sku]
          const totalUnitsBoxed = singleSku?.boxes.reduce((acc, box) => acc + box.qtyOfBoxes * box.unitsPerBox, 0) || 0
          if (totalUnitsBoxed !== quantity) {
            return { error: true, message: `Total units boxed for SKU ${sku} does not match receiving quantity.` }
          }
          for (const box of singleSku.boxes) {
            if (box.unitsPerBox <= 0 || box.qtyOfBoxes <= 0) {
              return { error: true, message: `Invalid box configuration for SKU ${sku}.` }
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

        for (const item of receivingItems) {
          const { sku, quantity } = item
          const ManualMultiSkuBoxes = multiSkuPackages.filter((box) => box[sku])
          const totalUnitsBoxed = ManualMultiSkuBoxes.reduce((acc, box) => acc + box[sku].quantity, 0)
          if (totalUnitsBoxed !== quantity) {
            return { error: true, message: `Total units boxed for SKU ${sku} does not match receiving quantity.` }
          }
          for (const box of ManualMultiSkuBoxes) {
            if (box[sku].quantity <= 0) {
              return { error: true, message: `Invalid box configuration for SKU ${sku}.` }
            }
          }
        }

        return { error: false }
      case 'box':
        return { error: false }
      default:
        return { error: false }
    }
  }, [packingConfiguration, singleSkuPackages, multiSkuPackages, receivingItems])

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
