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
}

export const useMarketplacePricing = ({ sessionToken, session, state, storeId, searchValue }: any) => {
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

  const handleOtherCosts = useCallback((sku: string, storeId: number, value: number) => {
    if (value <= 0) {
      setproductsInfo((prevProducts) => {
        const updatedProducts = { ...prevProducts }

        updatedProducts[sku].marketplaces[storeId].otherCosts = 0

        return updatedProducts
      })
      return
    } else {
      setproductsInfo((prevProducts) => {
        const updatedProducts = { ...prevProducts }

        updatedProducts[sku].marketplaces[storeId].otherCosts = value

        return updatedProducts
      })
    }
  }, [])

  const handleProposedPrice = useCallback((sku: string, storeId: number, value: number) => {
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
  }, [])

  const handleSetSingleMargin = useCallback((sku: string, storeId: number, value: number) => {
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

        const up = product.sellerCost + product.inboundShippingCost + marketplace.shippingToMarketpalce + product.otherCosts + marketplace.otherCosts + marketplace.fbaHandlingFee
        const newMargin = value / 100
        const down1 = 1 - newMargin
        const down2 = marketplace.comissionFee / 100
        const proposedPrice = up / (down1 - down2)

        updatedProducts[sku].marketplaces[storeId].proposedPrice = parseFloat(proposedPrice.toFixed(2))
        updatedProducts[sku].marketplaces[storeId].proposedMargin = value

        return updatedProducts
      })
    }
  }, [])

  const handleSetProductMargin = useCallback((sku: string, value: number) => {
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

          const up = product.sellerCost + product.inboundShippingCost + marketplace.shippingToMarketpalce + product.otherCosts + marketplace.otherCosts + marketplace.fbaHandlingFee
          const newMargin = value / 100
          const down1 = 1 - newMargin
          const down2 = marketplace.comissionFee / 100
          const proposedPrice = up / (down1 - down2)

          updatedProducts[sku].marketplaces[storeId].proposedPrice = parseFloat(proposedPrice.toFixed(2))
          updatedProducts[sku].marketplaces[storeId].proposedMargin = value
        }

        return updatedProducts
      })
    }
  }, [])

  const filteredProducts = useMemo(() => {
    if (!productsInfo) return []

    if (storeId !== 9999) {
      if (searchValue) {
        return Object.values(productsInfo)
          .map((product: MKP_Product) => {
            return { ...product, marketplaces: { [storeId]: product.marketplaces[storeId as keyof typeof product.marketplaces] } }
          })
          .filter(
            (product: MKP_Product) =>
              true &&
              (product?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
                searchValue.split(' ').every((word: string) => product?.title?.toLowerCase().includes(word.toLowerCase())) ||
                product?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
                product?.asin?.toLowerCase().includes(searchValue.toLowerCase()))
          )
      }
      return Object.values(productsInfo)
        .filter((product: MKP_Product) => product.marketplaces[storeId as keyof typeof product.marketplaces])
        .map((product: MKP_Product) => {
          return { ...product, marketplaces: { [storeId]: product.marketplaces[storeId as keyof typeof product.marketplaces] } }
        })
    }

    if (searchValue) {
      return Object.values(productsInfo).filter(
        (product: MKP_Product) =>
          true &&
          (product?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word: string) => product?.title?.toLowerCase().includes(word.toLowerCase())) ||
            product?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            product?.asin?.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }
    return Object.values(productsInfo).map((product) => product)
  }, [productsInfo, storeId, searchValue])

  return { products: filteredProducts, isLoadingProducts: isValidating, handleOtherCosts, handleProposedPrice, handleSetSingleMargin, handleSetProductMargin }
}
