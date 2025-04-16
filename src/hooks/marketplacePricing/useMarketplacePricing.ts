import { MKP_Product, MKP_Response } from '@typesTs/marketplacePricing/marketplacePricing'
import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

export type MKP_ExpandedRowProps = {
  handleOtherCosts: (sku: string, storeId: number, value: number) => void
  handleProposedPrice: (sku: string, storeId: number, value: number) => void
  handleSetSingleMargin: (sku: string, storeId: number, value: number) => void
  handleSetProductMargin: (sku: string, value: number) => void
  handleNotes: (sku: string, storeId: number, value: string) => void
  handleSetMarketplaceMargin: (storeId: string, value: number) => void
}

type Props = {
  sessionToken: string
  session: any
  state: any
  storeId: string
  searchValue: string
  setchangesMade: (value: boolean) => void
  units1monthmin: string | undefined
  units1monthmax: string | undefined
  units1yearmin: string | undefined
  units1yearmax: string | undefined
  margin: string | undefined
  marginoperator: string | undefined
  showOnlyOnWatch: string | undefined
  supplier: string | undefined
  brand: string | undefined
  category: string | undefined
}

const calculateNewProposedPrice = ({ totalCosts, commissionDecimal, marginDecimal }: { totalCosts: number; commissionDecimal: number; marginDecimal: number }): number => {
  const price = totalCosts / (1 - marginDecimal - commissionDecimal)
  return Math.round(price * 100) / 100
}

export const useMarketplacePricing = ({ sessionToken, session, state, storeId, searchValue, setchangesMade, units1monthmin, units1monthmax, units1yearmin, units1yearmax, supplier, brand, category }: Props) => {
  const [productsInfo, setproductsInfo] = useState<MKP_Response>({})
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    controllerRef.current = new AbortController()
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [])

  const { isValidating } = useSWR(
    session && state.user.businessId ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/marketplaces/pricing/getMarketplacePricing?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    async (endPoint: string) => {
      try {
        const response = await axios.get<MKP_Response>(endPoint, {
          signal: controllerRef.current?.signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        return response.data
      } catch (error) {
        if (!axios.isCancel(error)) {
          toast.error((error as any)?.data?.message || 'Error fetching product performance data')
        }
        throw error
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
      onSuccess: (data) => {
        setproductsInfo(data)
      },
    }
  )

  const handleOtherCosts = useCallback(
    (sku: string, storeId: number, value: number) => {
      setchangesMade(true)
      if (value <= 0) {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }

          updatedProducts[sku].marketplaces[storeId].storeOtherCosts = 0

          return updatedProducts
        })
        return
      } else {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }

          updatedProducts[sku].marketplaces[storeId].storeOtherCosts = value

          return updatedProducts
        })
      }
    },
    [setchangesMade]
  )
  const handleNotes = useCallback(
    (sku: string, storeId: number, value: string) => {
      setchangesMade(true)
      setproductsInfo((prevProducts) => {
        const updatedProducts = { ...prevProducts }

        updatedProducts[sku].marketplaces[storeId].notes = value

        return updatedProducts
      })
    },
    [setchangesMade]
  )

  const handleProposedPrice = useCallback(
    (sku: string, storeId: number, value: number) => {
      setchangesMade(true)
      if (value <= 0) {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }

          updatedProducts[sku].marketplaces[storeId].proposedPrice = 0

          return updatedProducts
        })
        return
      } else {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }

          updatedProducts[sku].marketplaces[storeId].proposedPrice = value

          return updatedProducts
        })
      }
    },
    [setchangesMade]
  )

  const handleSetSingleMargin = useCallback(
    (sku: string, storeId: number, value: number) => {
      setchangesMade(true)
      if (value <= 0) {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }

          updatedProducts[sku].marketplaces[storeId].proposedPrice = 0
          updatedProducts[sku].marketplaces[storeId].proposedMargin = 0

          return updatedProducts
        })
      } else {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }
          const product = updatedProducts[sku]
          const marketplace = product.marketplaces[storeId]

          const totalCosts = product.sellerCost + product.inboundShippingCost + marketplace.shippingToMarketpalce + product.otherCosts + marketplace.storeOtherCosts + marketplace.fbaHandlingFee + marketplace.fixedFee
          const marginDecimal = value / 100
          const commissionDecimal = marketplace.comissionFee / 100

          const newProposedPrice = calculateNewProposedPrice({
            totalCosts,
            commissionDecimal,
            marginDecimal,
          })

          updatedProducts[sku].marketplaces[storeId].proposedPrice = newProposedPrice
          updatedProducts[sku].marketplaces[storeId].proposedMargin = value

          return updatedProducts
        })
      }
    },
    [setchangesMade]
  )

  const handleSetProductMargin = useCallback(
    (sku: string, value: number) => {
      setchangesMade(true)
      if (value <= 0) {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }

          for (const storeId in updatedProducts[sku].marketplaces) {
            updatedProducts[sku].marketplaces[storeId].proposedPrice = 0
            updatedProducts[sku].marketplaces[storeId].proposedMargin = 0
          }

          return updatedProducts
        })
      } else {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }
          const product = updatedProducts[sku]
          for (const storeId in updatedProducts[sku].marketplaces) {
            const marketplace = product.marketplaces[storeId]

            const totalCosts = product.sellerCost + product.inboundShippingCost + marketplace.shippingToMarketpalce + product.otherCosts + marketplace.storeOtherCosts + marketplace.fbaHandlingFee + marketplace.fixedFee
            const marginDecimal = value / 100
            const commissionDecimal = marketplace.comissionFee / 100

            const newProposedPrice = calculateNewProposedPrice({
              totalCosts,
              commissionDecimal,
              marginDecimal,
            })

            updatedProducts[sku].marketplaces[storeId].proposedPrice = newProposedPrice
            updatedProducts[sku].marketplaces[storeId].proposedMargin = value
          }

          return updatedProducts
        })
      }
    },
    [setchangesMade]
  )

  const handleSetMarketplaceMargin = useCallback(
    (storeId: string, value: number, skus: string[]) => {
      setchangesMade(true)
      if (value <= 0) {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }

          for (const sku in updatedProducts) {
            if (!skus.includes(sku)) continue
            if (updatedProducts[sku].marketplaces[storeId]) {
              updatedProducts[sku].marketplaces[storeId].proposedPrice = 0
              updatedProducts[sku].marketplaces[storeId].proposedMargin = 0
            }
          }

          return updatedProducts
        })
      } else {
        setproductsInfo((prevProducts) => {
          const updatedProducts = { ...prevProducts }

          for (const sku in updatedProducts) {
            if (!skus.includes(sku)) continue
            if (updatedProducts[sku].marketplaces[storeId]) {
              const product = updatedProducts[sku]
              const marketplace = product.marketplaces[storeId]

              const totalCosts = product.sellerCost + product.inboundShippingCost + marketplace.shippingToMarketpalce + product.otherCosts + marketplace.storeOtherCosts + marketplace.fbaHandlingFee + marketplace.fixedFee
              const marginDecimal = value / 100
              const commissionDecimal = marketplace.comissionFee / 100

              const newProposedPrice = calculateNewProposedPrice({
                totalCosts,
                commissionDecimal,
                marginDecimal,
              })

              updatedProducts[sku].marketplaces[storeId].proposedPrice = newProposedPrice
              updatedProducts[sku].marketplaces[storeId].proposedMargin = value
            }
          }

          return updatedProducts
        })
      }
    },
    [setchangesMade]
  )

  const handleSaveProductsInfo = useCallback(async () => {
    try {
      const saveProductInfoToast = toast.loading('Saving products info...')
      const chunkSize = 20 // Adjust the chunk size as needed
      const productsArray = Object.values(productsInfo)
      const totalChunks = Math.ceil(productsArray.length / chunkSize)

      for (let i = 0; i < totalChunks; i++) {
        const chunk = productsArray.slice(i * chunkSize, (i + 1) * chunkSize).map((product) => {
          const { marketplaces, sku } = product
          return {
            sku,
            marketplaces: Object.values(marketplaces).map((marketplace) => {
              const { proposedPrice, storeId, storeOtherCosts, notes } = marketplace
              return {
                proposedPrice,
                storeId,
                storeOtherCosts,
                notes,
              }
            }),
          }
        })

        const { data } = await axios.post(`/api/marketplaces/pricing/updateMarketplacePricing`, {
          region: state.currentRegion,
          businessId: state.user.businessId,
          productsInfo: chunk,
        })

        if (data.error) {
          toast.update(saveProductInfoToast, {
            render: data.message,
            type: 'error',
            isLoading: false,
            autoClose: 3000,
          })
          return
        }

        const progress = Math.round(((i + 1) / totalChunks) * 100)
        toast.update(saveProductInfoToast, {
          render: `Saving products info... ${progress}%`,
          type: 'info',
          isLoading: true,
        })
      }

      toast.update(saveProductInfoToast, {
        render: 'Products info updated successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      setchangesMade(false)
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error((error as any)?.data?.message || 'Error updating products info')
      }
    }
  }, [productsInfo, setchangesMade, state.currentRegion, state.user.businessId])

  const filteredProducts = useMemo(() => {
    if (!productsInfo) return []

    if (storeId !== '9999') {
      if (searchValue) {
        return Object.values(productsInfo)
          .filter((product: MKP_Product) => {
            const unitsSold1M = product.marketplaces[storeId as keyof typeof product.marketplaces]?.unitsSold?.['1M'] || 0
            const unitsSold1Y = product.marketplaces[storeId as keyof typeof product.marketplaces]?.unitsSold?.['1Y'] || 0

            return (
              product.marketplaces[storeId as keyof typeof product.marketplaces] &&
              (units1monthmin !== undefined && units1monthmin !== '' ? unitsSold1M >= Number(units1monthmin!) : true) &&
              (units1monthmax !== undefined && units1monthmax !== '' ? unitsSold1M <= Number(units1monthmax!) : true) &&
              (units1yearmin !== undefined && units1yearmin !== '' ? unitsSold1Y >= Number(units1yearmin!) : true) &&
              (units1yearmax !== undefined && units1yearmax !== '' ? unitsSold1Y <= Number(units1yearmax!) : true) &&
              (supplier !== undefined && supplier !== '' ? product.supplier.toLowerCase() === supplier.toLowerCase() : true) &&
              (brand !== undefined && brand !== '' ? product.brand.toLowerCase() === brand.toLowerCase() : true) &&
              (category !== undefined && category !== '' ? product.category.toLowerCase() === category.toLowerCase() : true) &&
              (product?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
                searchValue.split(' ').every((word: string) => product?.title?.toLowerCase().includes(word.toLowerCase())) ||
                product?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
                product?.asin?.toLowerCase().includes(searchValue.toLowerCase()))
            )
          })
          .map((product: MKP_Product) => {
            return { ...product, marketplaces: { [storeId]: product.marketplaces[storeId as keyof typeof product.marketplaces] } }
          })
      }

      return Object.values(productsInfo)
        .filter((product: MKP_Product) => {
          const unitsSold1M = product.marketplaces[storeId as keyof typeof product.marketplaces]?.unitsSold?.['1M'] || 0
          const unitsSold1Y = product.marketplaces[storeId as keyof typeof product.marketplaces]?.unitsSold?.['1Y'] || 0

          return (
            product.marketplaces[storeId as keyof typeof product.marketplaces] &&
            (units1monthmin !== undefined && units1monthmin !== '' ? unitsSold1M >= Number(units1monthmin!) : true) &&
            (units1monthmax !== undefined && units1monthmax !== '' ? unitsSold1M <= Number(units1monthmax!) : true) &&
            (units1yearmin !== undefined && units1yearmin !== '' ? unitsSold1Y >= Number(units1yearmin!) : true) &&
            (units1yearmax !== undefined && units1yearmax !== '' ? unitsSold1Y <= Number(units1yearmax!) : true) &&
            (supplier !== undefined && supplier !== '' ? product.supplier.toLowerCase() === supplier.toLowerCase() : true) &&
            (brand !== undefined && brand !== '' ? product.brand.toLowerCase() === brand.toLowerCase() : true) &&
            (category !== undefined && category !== '' ? product.category.toLowerCase() === category.toLowerCase() : true) &&
            (product?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
              searchValue.split(' ').every((word: string) => product?.title?.toLowerCase().includes(word.toLowerCase())) ||
              product?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
              product?.asin?.toLowerCase().includes(searchValue.toLowerCase()))
          )
        })
        .map((product: MKP_Product) => {
          return { ...product, marketplaces: { [storeId]: product.marketplaces[storeId as keyof typeof product.marketplaces] } }
        })
    }

    if (searchValue) {
      return Object.values(productsInfo).filter((product: MKP_Product) => {
        const unitsSold1M = Object.values(product.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1M'] || 0, 0)
        const unitsSold1Y = Object.values(product.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1Y'] || 0, 0)

        return (
          (units1monthmin !== undefined && units1monthmin !== '' ? unitsSold1M >= Number(units1monthmin!) : true) &&
          (units1monthmax !== undefined && units1monthmax !== '' ? unitsSold1M <= Number(units1monthmax!) : true) &&
          (units1yearmin !== undefined && units1yearmin !== '' ? unitsSold1Y >= Number(units1yearmin!) : true) &&
          (units1yearmax !== undefined && units1yearmax !== '' ? unitsSold1Y <= Number(units1yearmax!) : true) &&
          (supplier !== undefined && supplier !== '' ? product.supplier.toLowerCase() === supplier.toLowerCase() : true) &&
          (brand !== undefined && brand !== '' ? product.brand.toLowerCase() === brand.toLowerCase() : true) &&
          (category !== undefined && category !== '' ? product.category.toLowerCase() === category.toLowerCase() : true) &&
          (product?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word: string) => product?.title?.toLowerCase().includes(word.toLowerCase())) ||
            product?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            product?.asin?.toLowerCase().includes(searchValue.toLowerCase()))
        )
      })
    }

    return Object.values(productsInfo).filter((product) => {
      const unitsSold1M = Object.values(product.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1M'] || 0, 0)
      const unitsSold1Y = Object.values(product.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1Y'] || 0, 0)

      return (
        (units1monthmin !== undefined && units1monthmin !== '' ? unitsSold1M >= Number(units1monthmin!) : true) &&
        (units1monthmax !== undefined && units1monthmax !== '' ? unitsSold1M <= Number(units1monthmax!) : true) &&
        (units1yearmin !== undefined && units1yearmin !== '' ? unitsSold1Y >= Number(units1yearmin!) : true) &&
        (units1yearmax !== undefined && units1yearmax !== '' ? unitsSold1Y <= Number(units1yearmax!) : true) &&
        (supplier !== undefined && supplier !== '' ? product.supplier.toLowerCase() === supplier.toLowerCase() : true) &&
        (brand !== undefined && brand !== '' ? product.brand.toLowerCase() === brand.toLowerCase() : true) &&
        (category !== undefined && category !== '' ? product.category.toLowerCase() === category.toLowerCase() : true) &&
        (product?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
          searchValue.split(' ').every((word: string) => product?.title?.toLowerCase().includes(word.toLowerCase())) ||
          product?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
          product?.asin?.toLowerCase().includes(searchValue.toLowerCase()))
      )
    })
  }, [productsInfo, storeId, searchValue, units1monthmin, units1monthmax, units1yearmin, units1yearmax, supplier, brand, category])

  return {
    products: filteredProducts,
    isLoadingProducts: isValidating,
    handleOtherCosts,
    handleProposedPrice,
    handleSetSingleMargin,
    handleSetProductMargin,
    handleSaveProductsInfo,
    handleNotes,
    handleSetMarketplaceMargin,
  }
}
