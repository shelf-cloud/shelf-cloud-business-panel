/* eslint-disable react-hooks/exhaustive-deps */
// import { GetServerSideProps } from 'next'
// import { getSession } from '@auth/client'
import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import AppContext from '@context/AppContext'
import { Card, CardBody, CardHeader } from 'reactstrap'
import Head from 'next/head'
import { ProductsDetails } from '@typesTs/products/products'
import ProductsBulkEditTable from '@components/products/ProductsBulkEditTable'

type Props = {}

// const columns = [
//   { field: 'id', headerName: 'Id', hideable: true },
//   { field: 'title', headerName: 'Title', hideable: true, editable: true, width: 500 },
//   { field: 'description', headerName: 'Description', hideable: true, editable: true, width: 500 },
//   { field: 'sku', headerName: 'Sku', hideable: false },
//   { field: 'asin', headerName: 'Asin', hideable: true },
//   { field: 'fnsku', headerName: 'Fnsku', hideable: true },
//   { field: 'barcode', headerName: 'Barcode', hideable: true },
//   { field: 'supplier', headerName: 'Supplier', hideable: true },
//   { field: 'brand', headerName: 'Brand', hideable: true },
//   { field: 'category', headerName: 'Category', hideable: true },
//   { field: 'weight', headerName: 'Weight', hideable: true },
//   { field: 'length', headerName: 'Length', hideable: true },
//   { field: 'width', headerName: 'Width', hideable: true },
//   { field: 'height', headerName: 'Height', hideable: true },
//   { field: 'boxQty', headerName: 'Boxqty', hideable: true },
//   { field: 'boxWeight', headerName: 'Boxweight', hideable: true },
//   { field: 'boxLength', headerName: 'Boxlength', hideable: true },
//   { field: 'boxWidth', headerName: 'Boxwidth', hideable: true },
//   { field: 'boxHeight', headerName: 'Boxheight', hideable: true },
//   { field: 'activeState', headerName: 'Activestate', hideable: true },
//   { field: 'note', headerName: 'Note', hideable: true },
//   { field: 'htsCode', headerName: 'HTS Code', hideable: true },
//   { field: 'defaultPrice', headerName: 'Defaultprice', hideable: true },
//   { field: 'msrp', headerName: 'Msrp', hideable: true },
//   { field: 'map', headerName: 'Map', hideable: true },
//   { field: 'floor', headerName: 'Floor', hideable: true },
//   { field: 'ceilling', headerName: 'Ceilling', hideable: true },
//   { field: 'sellerCost', headerName: 'Sellercost', hideable: true },
//   { field: 'inboundShippingCost', headerName: 'Inboundshippingcost', hideable: true },
//   { field: 'otherCosts', headerName: 'Othercosts', hideable: true },
//   { field: 'productionTime(Days)', headerName: 'Productiontime', hideable: true },
//   { field: 'transitTime(Days)', headerName: 'Transittime', hideable: true },
//   { field: 'shippingToFBACost', headerName: 'Shippingtofbacost', hideable: true },
//   { field: 'buffer', headerName: 'Buffer', hideable: true },
//   { field: 'itemCondition', headerName: 'Itemcondition', hideable: true },
//   { field: 'image', headerName: 'Image', hideable: true },
// ]

const ProductsBulkEdit = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const [pending, setPending] = useState<boolean>(true)
  const [productsDetailsData, setProductsDetails] = useState<ProductsDetails[]>([])

  const handleGetProductsDetailsTemplate = async () => {
    await axios
      .get(`/api/productDetails/getProductsDetailsTemplate?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      .then(({ data }: { data: ProductsDetails[] }) => {
        const productsTemplate: any[] = []
        data?.forEach((item) => {
          productsTemplate.push({
            id: item?.id,
            title: item?.title,
            description: item?.description && item?.description !== '0' ? item?.description : '',
            sku: item?.sku,
            asin: item?.asin,
            fnsku: item?.fnsku,
            barcode: item?.barcode,
            supplier: item?.supplier,
            brand: item?.brand,
            category: item?.category,
            weight: item?.weight,
            length: item?.length,
            width: item?.width,
            height: item?.height,
            boxQty: item?.boxQty,
            boxWeight: item?.boxWeight,
            boxLength: item?.boxLength,
            boxWidth: item?.boxWidth,
            boxHeight: item?.boxHeight,
            activeState: item?.activeState,
            note: item?.note ? item?.note : '',
            htsCode: item?.htsCode,
            defaultPrice: item?.defaultPrice,
            msrp: item?.msrp,
            map: item?.map,
            floor: item?.floor,
            ceilling: item?.ceilling,
            sellerCost: item?.sellerCost,
            inboundShippingCost: item?.inboundShippingCost,
            otherCosts: item?.otherCosts,
            productionTime: item?.productionTime,
            transitTime: item?.transitTime,
            shippingToFBA: item?.shippingToFBA,
            buffer: item?.buffer,
            itemCondition: item?.itemCondition,
            image: item?.image,
          })
        })

        setProductsDetails(productsTemplate)
        setPending(false)
      })
  }

  useEffect(() => {
    productsDetailsData.length === 0 && state.currentRegion && state.user.businessId && handleGetProductsDetailsTemplate()
  }, [productsDetailsData.length, state.currentRegion, state.user.businessId])

  return (
    <div className='w-100'>
      <Head>
        <title>Bulk Edit Products Details</title>
      </Head>
      <React.Fragment>
        <Card>
          <CardHeader>
            <h4 className='card-title'>Products Bulk Edit</h4>
          </CardHeader>
          <CardBody>{productsDetailsData.length > 0 ? <ProductsBulkEditTable tableData={productsDetailsData || []} pending={pending} /> : <span>Loading...</span>}</CardBody>
        </Card>
      </React.Fragment>
    </div>
  )
}

export default ProductsBulkEdit
