import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import moment from 'moment'
import React, { useContext } from 'react'
import { DropdownItem } from 'reactstrap'

type Props = {
  reorderingPointsOrder: {
    totalQty: number
    totalCost: number
    totalVolume: number
    products: { [key: string]: ReorderingPointsProduct }
  }
  orderDetails: {
    orderNumber: string
    destinationSC: string
  }
  selectedSupplier: string
  username: string
  orderComment: string
  printColumns: {
    comments: boolean
    qtyPerBox: boolean
    volume: boolean
    cost: boolean
  }
}

function PrintReorderingPointsOrder({ reorderingPointsOrder, orderDetails, selectedSupplier, username, orderComment, printColumns }: Props) {
  const { state }: any = useContext(AppContext)
  const printInvoice = async () => {
    let invoice = `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <title>Purchase Order: ${username.substring(0, 3).toUpperCase()}-${orderDetails.orderNumber}</title>
                  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                  <style>
      
                  body {
                      margin: 0px;
                      padding: 0px;
                      font-size: 12px;
                  }
                  #container{
                      min-height: 95vh;
                      max-height: 95vh;
                      width: 90%;
                      padding: 0px;
                      margin: 0px auto;
                      // border: 4px solid #686868;
                      // border-radius: 7px;
                  }
                  .zone{
                      width: 100%;
                      display: flex;
                      flex-direction: row;
                      flex-wrap: nowrap;
                      align-content: center;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 30px;
                  }
                  #left1{
                      display: flex;
                      flex-direction: column;
                      flex-wrap: nowrap;
                      align-content: center;
                      align-items: flex-start;
                  }
                  #left1 p {
                      margin: 0px;
                  }#left1 img {
                      width: 280px;
                      object-fit: contain;
                  }
                  #right1{
                      display: flex;
                      flex-direction: column;
                      flex-wrap: nowrap;
                      align-items: flex-end;
                  }
                  @media print{    
                      .no-print, .no-print *{
                      display: none !important;
                      }
                  }
                  </style>
              </head>
              <body contentEditable="true">
                  <div id="container">
                  <div class="zone">
                      <div id="left1">
                      <h1 class="my-0 text-uppercase fw-bold fs-3">Purchase Order</h1>

                      <p class="text-capitalize mb-0 pb-0 fw-semibold">${state.user[state.currentRegion].name}</p>
                      <p class="mb-0 pb-0">${state.user[state.currentRegion].address}</p>
                      <p class="mb-0 pb-0">${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
      state.user[state.currentRegion].country
    }</p>
                      <a href="mailto:${state.user[state.currentRegion].email}" class="mb-0 pb-0">${state.user[state.currentRegion].email}</a>
                      <a class="mb-0 pb-0">${state.user[state.currentRegion].website}</a>
                      <p class="my-0 text-capitalize fw-semibold">Supplier: ${selectedSupplier}</p>`

    invoice += `</div><!--End Left-->
                      <div id="right1">
                      <h3 style="font-size: 40px;font-weight: 900;color: #458BC9;">
                          ${username.substring(0, 3).toUpperCase()}-${orderDetails.orderNumber}
                      </h3>
                      <h5 style="font-size: 16px;font-weight: 500;">
                          PO Date: ${moment().startOf('day').format('LL')}
                      </h5>
                      </div><!--End Right-->
                  </div><!--End Zone-->
                  
                  <div class="d-flex flex-row justify-content-between align-items-center gap-4 mb-3">
                    <div class="w-100">
                      <p class="fw-bold fs-4">Bill Info:</p>
                      <div class="border border-2 border-black px-3 py-2">
                      <p class="mb-0 pb-0">${state.user[state.currentRegion].name}</p>
                      <p class="mb-0 pb-0">${state.user[state.currentRegion].contactName}</p>
                      <p class="mb-0 pb-0">${state.user[state.currentRegion].address}</p>
                      <p class="mb-0 pb-0">${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
      state.user[state.currentRegion].country
    }</p>
                      <p class="mb-0 pb-0">Phone: ${state.user[state.currentRegion].phone}</p>
                      </div>
                    </div>
                    <div class="w-100">
                      <p class="fw-bold fs-4">Ship To:</p>
                      <div class="border border-2 border-black px-3 py-2">
                        <p class="mb-0 pb-0">${state.user[state.currentRegion].name}</p>
                        <p class="mb-0 pb-0">${state.user[state.currentRegion].contactName}</p>
                        <p class="mb-0 pb-0">${state.user[state.currentRegion].address}</p>
                        <p class="mb-0 pb-0">${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
      state.user[state.currentRegion].country
    }</p>
                        <p class="mb-0 pb-0">Phone: ${state.user[state.currentRegion].phone}</p>
                        </div>
                    </div>
                  </div>

                  <table class='table table-bordered align-middle'>
                  <thead class="table-light">
                    <tr>
                      <th>SKU</th>
                      <th class='text-center'>Image</th>
                      <th>Product Name</th>
                      <th class='text-center'>UPC</th>`

    {
      printColumns.comments ? (invoice += `<th>Product Comment</th>`) : ''
    }

    {
      printColumns.qtyPerBox ? (invoice += `<th class='text-center'>Qty Per Box</th>`) : ''
    }

    invoice += `<th class='text-center'>Order Qty</th>`

    {
      printColumns.volume ? (invoice += `<th class='text-center'>Volume</th>`) : ''
    }

    {
      printColumns.cost ? (invoice += `<th class='text-center'>Cost</th>`) : ''
    }

    invoice += `</tr>
                </thead>
                <tbody class="table-group-divider">`
    for await (const product of Object.values(reorderingPointsOrder.products)) {
      invoice += `<tr key=${product.sku}>
                    <td class="text-nowrap">${product.sku}</td>
                    <td class="text-center">
                      <div style="width: 60px;min-width: 30px;height: 50px;margin: 0px;position: relative;">
                      <img loading='lazy'
                          style="object-fit: contain;object-position: center;width: 100%;height: 100%;"
                          src=${product.image ? product.image : NoImageAdress}
                          alt='product Image'
                        />
                      </div>
                    </td>
                    <td>${product.title}</td>
                    <td class='text-center'>${product.barcode}</td>
                    ${printColumns.comments ? `<td>${product.note ?? ''}</td>` : ''}
                    ${printColumns.qtyPerBox ? `<td class='text-center'>${product.boxQty}</td>` : ''}
                    <td class='text-center text-nowrap'>${FormatIntNumber(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted : product.order)}</td>
                    ${
                      printColumns.volume
                        ? `<td class='text-center text-nowrap'>${FormatIntPercentage(
                            state.currentRegion,
                            state.currentRegion === 'us'
                              ? product.useOrderAdjusted
                                ? product.orderAdjusted * product.itemVolume
                                : (product.order * product.itemVolume) / 1728
                              : product.useOrderAdjusted
                              ? product.orderAdjusted * product.itemVolume
                              : (product.order * product.itemVolume) / 1000000
                          )} ${state.currentRegion === 'us' ? 'ft³' : 'm³'}</td>`
                        : ''
                    }
                    ${
                      printColumns.cost
                        ? `<td class='text-center text-nowrap'>${FormatCurrency(
                            state.currentRegion,
                            product.useOrderAdjusted ? product.orderAdjusted * product.sellerCost : product.order * product.sellerCost
                          )}</td>`
                        : ''
                    }
                  </tr>`
    }

    invoice += `</tbody>
                <tfoot>
                <tr class='fw-semibold'>
                    <td></td>
                    <td></td>
                    <td></td>
                    ${printColumns.comments ? `<td></td>` : ''}
                    ${printColumns.qtyPerBox ? `<td></td>` : ''}
                    <td class='text-end'>TOTAL</td>
                    <td class='text-center text-nowrap'>${FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</td>
                    ${
                      printColumns.volume
                        ? `<td class='text-center text-nowrap'>${FormatIntPercentage(
                            state.currentRegion,
                            state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 1728 : reorderingPointsOrder.totalVolume / 1000000
                          )} ${state.currentRegion === 'us' ? 'ft³' : 'm³'}</td>`
                        : ''
                    }
                    ${printColumns.cost ? `<td class='text-center text-nowrap'>${FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</td>` : ''}
                </tr>
                </tfoot>
                </table>
                ${orderComment !== '' ? `<div><p class="fw-bold my-0 py-0">Order Comment:</p><p class="my-0 py-0">${orderComment}</p></div>` : ''}
                </div><!--End Container-->
                </body>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                </html>`

    var wnd = window.open('about:PO', 'PO Details', '_blank')
    wnd?.document.write(invoice)
  }

  return (
    <DropdownItem className='text-nowrap text-primary fs-6 py-0' onClick={() => printInvoice()}>
      <i className='mdi mdi-file-pdf-box label-icon align-middle fs-4 me-2' />
      Generate PDF
    </DropdownItem>
  )
}

export default PrintReorderingPointsOrder
