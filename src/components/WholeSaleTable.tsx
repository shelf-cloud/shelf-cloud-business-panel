/* eslint-disable react-hooks/exhaustive-deps */
import { wholesaleProductRow } from '@typings'
import Image from 'next/image'
import React, { useContext, useRef, useState } from 'react'
import AppContext from '@context/AppContext'
import { Button, FormFeedback, Input } from 'reactstrap'

type Props = {
  product: wholesaleProductRow,
  index: number,
  allData: wholesaleProductRow[],
  setAllData:(allData:wholesaleProductRow[]) => void
}

const WholeSaleTable = ({ product, allData, setAllData }: Props) => {
  const {setModalProductInfo }: any =
    useContext(AppContext)
  const [error, setError] = useState(false)
  const inputQtyRef = useRef<HTMLInputElement>(null)
  const maxOrderQty = product.qtyBox == 0 ? 0 : Math.floor(product.quantity.quantity / product.qtyBox)

  const handleOrderQty = () => {
    if (Number(inputQtyRef.current?.value) > maxOrderQty) {
      setError(true)
      return
    }
    setError(false)
    if(Number(inputQtyRef.current?.value) == 0 || inputQtyRef.current?.value == ''){
      const newData:any = allData.map(item => {
        if(item.sku === product.sku){
          item.orderQty = '',
          item.totalToShip = 0
          return item
        } else {
          return item
        }
      })

      setAllData(newData)
      return
    }
    const totalQtyShip = Number(inputQtyRef.current?.value) * product.qtyBox
    const newData:any = allData.map(item => {
      if(item.sku === product.sku){
        item.orderQty = inputQtyRef.current?.value || '',
        item.totalToShip = totalQtyShip
        return item
      } else {
        return item
      }
    })
    setAllData(newData)
  }

  return (
    <tr
      className={`fs-5 ${maxOrderQty <= 0 ? 'bg-warning bg-opacity-25' : ''} ${
        product.totalToShip > 0 && 'bg-success bg-opacity-25'
      }`}
    >
      <td>
        <div
          style={{
            width: '70px',
            height: '50px',
            margin: '2px 0px',
            position: 'relative',
          }}
        >
          <Image
            src={
              product.image
                ? product.image
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
          <p style={{ margin: '0px', fontWeight: '800' }}>{product.title}</p>
          <p style={{ margin: '0px' }}>{product.sku}</p>
        </div>
      </td>
      <td>
        <Button
          color="info"
          outline
          className="btn btn-ghost-info"
          onClick={() => {
            setModalProductInfo(
              product.quantity.inventoryId,
              product.quantity.businessId,
              product.quantity.sku
            )
          }}
        >
          {product.quantity.quantity}
        </Button>
      </td>
      <td>{product.qtyBox}</td>
      <td>
        <Input
          type="number"
          disabled={maxOrderQty <= 0 ? true : false}
          className="form-control"
          placeholder={maxOrderQty <= 0 ? 'Not Enough Qty' : "Order Qty..."}
          value={product.orderQty}
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
      <td>{product.totalToShip}</td>
    </tr>
  )
}

export default WholeSaleTable
