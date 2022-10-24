/* eslint-disable react-hooks/exhaustive-deps */
import { ProductRowType } from '@typings'
import Image from 'next/image'
import React, { useContext, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import AppContext from '@context/AppContext'
import { Button, FormFeedback, Input } from 'reactstrap'

type Props = {
  product: ProductRowType
}

const WholeSaleTable = ({ product }: Props) => {
  const {state, setModalProductInfo, addWholesaleProduct, removeWholesaleProduct }: any =
    useContext(AppContext)
  const [totalShip, settotalShip] = useState(0)
  const [error, setError] = useState(false)
  const inputQtyRef = useRef<HTMLInputElement>(null)
  const maxOrderQty = product.qtyBox == 0 ? 0 : Math.floor(product.Quantity.quantity / product.qtyBox)

  const handleOrderQty = () => {
    if (Number(inputQtyRef.current?.value) > maxOrderQty) {
      setError(true)
      return
    }
    setError(false)
    if(Number(inputQtyRef.current?.value) == 0 || inputQtyRef.current?.value == ''){
      removeWholesaleProduct(product.SKU)
      settotalShip(0)
      return
    }
    const totalQtyShip = Number(inputQtyRef.current?.value) * product.qtyBox
    settotalShip(totalQtyShip)
    addWholesaleProduct({
      businessId: state?.user?.businessId,
      sku: product.SKU,
      name: product.Title,
      quantity: totalQtyShip,
      boxQty: product.qtyBox,
      totalBoxes: Number(inputQtyRef.current?.value),
    })
  }

  return (
    <tr
      className={`fs-5 ${maxOrderQty <= 0 ? 'bg-warning bg-opacity-25' : ''} ${
        totalShip > 0 && 'bg-success bg-opacity-25'
      }`}
    >
      <td>
        <div
          style={{
            width: '80px',
            height: '100px',
            padding: '2px 0px',
            position: 'relative',
          }}
        >
          <Image
            src={
              product.Image
                ? product.Image
                : 'https://electrostoregroup.com/Onix/img/no-image.png'
            }
            alt="product Image"
            layout="fill"
            objectFit="contain"
            objectPosition="center"
          />
        </div>
      </td>
      <td className="text-start">
        <div>
          <p style={{ margin: '0px', fontWeight: '800' }}>{product.Title}</p>
          <p style={{ margin: '0px' }}>{product.SKU}</p>
        </div>
      </td>
      <td>
        <Button
          color="info"
          outline
          className="btn btn-ghost-info"
          onClick={() => {
            setModalProductInfo(
              product.Quantity.inventoryId,
              product.Quantity.businessId,
              product.Quantity.sku
            )
          }}
        >
          {product.Quantity.quantity}
        </Button>
      </td>
      <td>{product.qtyBox}</td>
      <td>
        <Input
          type="number"
          disabled={maxOrderQty <= 0 ? true : false}
          className="form-control"
          placeholder={maxOrderQty <= 0 ? 'Not Enough Qty' : "Order Qty..."}
          onChange={handleOrderQty}
          innerRef={inputQtyRef}
          max={`${maxOrderQty}`}
          invalid={error}
        />
        {error ? (
          <FormFeedback className="text-start" type="invalid">
            Not enough Master Boxes!
          </FormFeedback>
        ) : null}
      </td>
      <td>{totalShip}</td>
    </tr>
  )
}

export default WholeSaleTable
