import { useCallback, useEffect, useMemo, useState } from 'react'

import { ShipmentOrderItem } from '@typings'

export type FinalBoxConfiguration = {
  items: {
    poId: string
    sku: string
    quantity: number
    inventoryId: number
    receiving: number
    name: string
    image: string
    boxQty: number
    poNumber: string
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

export const useEditReceivingsBoxes = (receivingItems: ShipmentOrderItem[], packingConfiguration: string, receivingOrderNumber: string) => {
  // SINGLE SKU PACKAGES_____________________
  const [singleSkuPackages, setsingleSkuPackages] = useState<SingleSkuBoxes>(() => {
    const packages = {} as SingleSkuBoxes

    for (const item of receivingItems) {
      const { sku, boxQty, quantity, poId, name, inventoryId, poNumber, image } = item

      if (!packages[poId!]) {
        packages[poId!] = {}
      }

      const qtyPerBox = boxQty || 1
      const boxes = Math.floor(quantity / qtyPerBox)
      let boxedQty = quantity

      packages[poId!][sku] = {
        receiving: quantity,
        name: name,
        inventoryId: inventoryId!,
        image: image!,
        poNumber: poNumber!,
        boxQty: qtyPerBox,
        boxes: [],
      }

      if (quantity <= qtyPerBox) {
        packages[poId!][sku].boxes.push({
          unitsPerBox: quantity,
          qtyOfBoxes: 1,
        })
      } else {
        packages[poId!][sku].boxes.push({
          unitsPerBox: qtyPerBox,
          qtyOfBoxes: boxes,
        })

        boxedQty -= qtyPerBox * boxes
        if (boxedQty > 0) {
          packages[poId!][sku].boxes.push({
            unitsPerBox: boxedQty,
            qtyOfBoxes: 1,
          })
        }
      }
    }

    return packages
  })

  useEffect(() => {
    const packages = {} as SingleSkuBoxes
    for (const item of receivingItems) {
      const { sku, boxQty, quantity, poId, name, inventoryId, image, poNumber } = item

      if (!packages[poId!]) {
        packages[poId!] = {}
      }

      const qtyPerBox = boxQty || 1
      const boxes = Math.floor(quantity / qtyPerBox)
      let boxedQty = quantity

      packages[poId!][sku] = {
        receiving: quantity,
        name: name,
        inventoryId: inventoryId!,
        image: image!,
        poNumber: poNumber!,
        boxQty: qtyPerBox,
        boxes: [],
      }

      if (quantity <= qtyPerBox) {
        packages[poId!][sku].boxes.push({
          unitsPerBox: quantity,
          qtyOfBoxes: 1,
        })
      } else {
        packages[poId!][sku].boxes.push({
          unitsPerBox: qtyPerBox,
          qtyOfBoxes: boxes,
        })

        boxedQty -= qtyPerBox * boxes
        if (boxedQty > 0) {
          packages[poId!][sku].boxes.push({
            unitsPerBox: boxedQty,
            qtyOfBoxes: 1,
          })
        }
      }
    }
    setsingleSkuPackages(packages)
  }, [receivingItems])

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

    for (const item of receivingItems) {
      const { sku, boxQty, quantity, poNumber, image, inventoryId, name, poId } = item

      const qtyPerBox = boxQty || 1
      const boxes = Math.ceil(quantity / qtyPerBox)
      let boxedQty = quantity

      for (let i = 0; i < boxes; i++) {
        packages.push({
          [sku]: {
            receiving: quantity,
            quantity: boxedQty >= qtyPerBox ? qtyPerBox : boxedQty,
            name: name,
            inventoryId: inventoryId!,
            image: image!,
            poId: poId!.toString(),
            boxQty: qtyPerBox,
            poNumber: poNumber!,
          },
        })

        boxedQty -= qtyPerBox
      }
    }

    setmultiSkuPackages(packages)
  }, [receivingItems])

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

        for (const item of receivingItems) {
          const { sku, boxQty, quantity, poNumber, image, inventoryId, name, poId } = item

          allItems.push({
            poId: poId!.toString(),
            sku,
            quantity: quantity,
            inventoryId: inventoryId!,
            receiving: quantity,
            name: name,
            image: image!,
            boxQty: boxQty || 1,
            poNumber: poNumber!,
            orderNumber: receivingOrderNumber,
          })
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
    }
  }, [packingConfiguration, receivingOrderNumber, singleSkuPackages, multiSkuPackages, receivingItems])

  const hasBoxedErrors = useMemo((): { error: boolean; message?: string } => {
    switch (packingConfiguration) {
      case 'single':
        for (const item of receivingItems) {
          const { sku, quantity, orderNumber, poId } = item
          const singleSku = singleSkuPackages[poId!]?.[sku]
          const totalUnitsBoxed = singleSku?.boxes.reduce((acc, box) => acc + box.qtyOfBoxes * box.unitsPerBox, 0) || 0
          if (totalUnitsBoxed !== quantity) {
            return { error: true, message: `Total units boxed for SKU ${sku} in PO ${orderNumber} does not match receiving quantity.` }
          }
          for (const box of singleSku.boxes) {
            if (box.unitsPerBox <= 0 || box.qtyOfBoxes <= 0) {
              return { error: true, message: `Invalid box configuration for SKU ${sku} in PO ${orderNumber}.` }
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
          const { sku, quantity, orderNumber, poId } = item
          const multiSkuBoxes = multiSkuPackages.filter((box) => box[sku] && box[sku].poId === poId!.toString())
          const totalUnitsBoxed = multiSkuBoxes.reduce((acc, box) => acc + box[sku].quantity, 0)
          if (totalUnitsBoxed !== quantity) {
            return { error: true, message: `Total units boxed for SKU ${sku} in PO ${orderNumber} does not match receiving quantity.` }
          }
          for (const box of multiSkuBoxes) {
            if (box[sku].quantity <= 0) {
              return { error: true, message: `Invalid box configuration for SKU ${sku} in PO ${orderNumber}.` }
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
