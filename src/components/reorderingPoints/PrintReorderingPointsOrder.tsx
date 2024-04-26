import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
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
}

function PrintReorderingPointsOrder({ reorderingPointsOrder, orderDetails, selectedSupplier, username }: Props) {
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
                      font-size: 16px;
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
              <body>
                  <div id="container">
                  <div class="zone">
                      <div id="left1">
                      <h1 class="my-0" style="font-size: 30px;text-transform: uppercase;">Purchase Order</h1>
                      <p class="my-1 text-capitalize" style="font-size: 16px;font-weight: 900;">Business: <span class="text-uppercase">${username}</span></p>
                      <p class="my-0 text-capitalize" style="font-size: 16px;font-weight: 600;">Supplier: ${selectedSupplier}</p>`

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
                  
                  <table class='table table-bordered align-middle'>
                  <thead class="table-light">
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th class='text-center'>Volume</th>
                      <th class='text-center'>Order Qty</th>
                      <th class='text-center'>Cost</th>
                    </tr>
                  </thead>
                  <tbody class="table-group-divider">`

    for await (const product of Object.values(reorderingPointsOrder.products)) {
      invoice += `<tr key=${product.sku}>
                    <td>${product.sku}</td>
                    <td>${product.title}</td>
                    <td class='text-center'>${FormatIntNumber(
                      state.currentRegion,
                      product.useOrderAdjusted ? product.orderAdjusted * product.itemVolume : product.order * product.itemVolume
                    )} ${state.currentRegion === 'us' ? 'in' : 'cm'}</td>
                    <td class='text-center'>${FormatIntNumber(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted : product.order)}</td>
                    <td class='text-center'>
                      ${FormatCurrency(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted * product.sellerCost : product.order * product.sellerCost)}
                    </td>
                  </tr>`
    }

    invoice += `</tbody>
                <tfoot>
                <tr class='fw-semibold'>
                    <td></td>
                    <td class='text-end'>TOTAL</td>
                    <td class='text-center'>${FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalVolume)} ${state.currentRegion === 'us' ? 'in' : 'cm'}</td>
                    <td class='text-center'>${FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</td>
                    <td class='text-center'>${FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</td>
                </tr>
                </tfoot>
                </table>
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
      Print PDF
    </DropdownItem>
  )
}

export default PrintReorderingPointsOrder
