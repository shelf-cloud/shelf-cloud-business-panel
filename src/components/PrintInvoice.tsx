import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { InvoiceFullDetails } from '@typings'
import moment from 'moment'
import { Button } from 'reactstrap'

type Props = {
  invoiceDetails: InvoiceFullDetails
}

function PrintInvoice({ invoiceDetails }: Props) {
  const { state }: any = useContext(AppContext)
  const printInvoice = () => {
    let invoice = `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <title>Invoice: ${invoiceDetails.invoice.businessName}-${invoiceDetails.invoice.invoiceNumber}</title>
                  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet">
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
                      <img src="https://electrostoregroup.com/warehouseManager/assets/shelfcloud-logo-v.jpg" />`

    state.currentRegion == 'us'
      ? (invoice += `<p>9629 Premier Parkway</p>
                      <p>Miramar, FL 33025</p>`)
      : (invoice += `<strong>ELECTROSTORE SL</strong>
                      <strong>B86710639</strong>
                      <p>Calle 21, Nave 49</p>
                      <p>Catarroja, Valencia 46470</p>`)

    state.currentRegion == 'us'
      ? (invoice += `<a href="mailto:info@shelf-cloud.com?Subject=Purchase%20Orders">info@shelf-cloud.com</a>
                      <a href="https://www.shelf-cloud.com" target="_blank">https://www.shelf-cloud.com</a>`)
      : (invoice += `<a href="mailto:shelf-cloud@electrostoresl.com?Subject=Purchase%20Orders">shelf-cloud@electrostoresl.com</a>
                      <a href="https://www.shelf-cloud.com" target="_blank">https://www.shelf-cloud.com</a>`)

    state.currentRegion == 'us'
      ? (invoice += `<p style="font-size: 16px;font-weight: 900;text-transform: uppercase;margin: 13px 0px 0px 0px;">Business: ${invoiceDetails.invoice.businessName}</p>`)
      : (invoice += `<p style="font-size: 16px;font-weight: 900;text-transform: uppercase;margin: 13px 0px 0px 0px;">Business: ${invoiceDetails.invoice.businessName}</p><p style="font-size: 16px;">NIF: ${invoiceDetails.invoice.businessNif} Dirección: ${invoiceDetails.invoice.businessAddress}</p>`)

    invoice += `</div><!--End Left-->
                      <div id="right1">
                      <h1 style="font-size: 56px;text-transform: uppercase;">Invoice</h1>
                      <h3 style="font-size: 42px;font-weight: 900;color: #458BC9;">
                          ${invoiceDetails.invoice.invoiceNumber}
                      </h3>
                      <h5 style="font-size: 16px;font-weight: 500;">
                          Invoice Date: ${moment(invoiceDetails.invoice.createdDate).format('LL')}
                      </h5>
                      <h5 style="font-size: 16px;font-weight: 300;">
                          Expire Date: ${moment(invoiceDetails.invoice.expireDate).format('LL')}
                      </h5>
                      </div><!--End Right-->
                  </div><!--End Zone-->
                  
                  <table class="table table-bordered align-middle text-center">
                      <thead class="table-light">
                          <th>ORDER #</th>
                          <th>TYPE</th>
                          <th>DATE CLOSED</th>
                          <th>ORDER TOTAL CHARGE</th>
                      </thead>
                      <tbody class="table-group-divider">`

    invoiceDetails.orders.forEach(
      (order, index) =>
        (invoice += `<tr key=${index}>
                          <td>${order.orderNumber}</td>
                          <td>${order.orderType}</td>
                          <td>${moment(order.closedDate).format('DD-MM-YYYY')}</td>
                          <td
                            style={{
                              display: 'block',
                              textAlign: 'left',
                              overflow: 'auto',
                            }}
                          >
                            <span
                              style={{
                                width: '60%',
                                float: 'left',
                                textAlign: 'right',
                              }}
                            >
                              ${FormatCurrency(state.currentRegion, order.totalCharge)}
                            </span>
                          </td>
                        </tr>`)
    )

    state.currentRegion == 'us'
      ? (invoice += `<tr style="font-weight: 700;">
                            <td colspan="3" style="text-align:right;">Total</td>
                            <td id="totalTotal" style="display: block;text-align: left;overflow: auto;"><span style="width: 60%;float: left;text-align: right;">${FormatCurrency(
                              state.currentRegion,
                              invoiceDetails.invoice.totalCharge
                            )}</span></td>
                        </tr>
                        </tbody>
                        
                        </table>
                    </div><!--End Container-->
                    
                </body>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
                </html>`)
      : (invoice += `<tr style="font-weight: 700;">
                            <td colspan="3" style="text-align:right;">Subtotal</td>
                            <td id="totalTotal" style="display: block;text-align: left;overflow: auto;"><span style="width: 60%;float: left;text-align: right;">${FormatCurrency(
                              state.currentRegion,
                              invoiceDetails.invoice.totalCharge / 1.21
                            )}</span></td>
                        </tr>
                        <tr style="font-weight: 700;">
                            <td colspan="3" style="text-align:right;">IVA 21%</td>
                            <td id="totalTotal" style="display: block;text-align: left;overflow: auto;"><span style="width: 60%;float: left;text-align: right;">${FormatCurrency(
                              state.currentRegion,
                              (invoiceDetails.invoice.totalCharge / 1.21) * 0.21
                            )}</span></td>
                        </tr>
                        <tr style="font-weight: 700;">
                            <td colspan="3" style="text-align:right;">Total</td>
                            <td id="totalTotal" style="display: block;text-align: left;overflow: auto;"><span style="width: 60%;float: left;text-align: right;">${FormatCurrency(
                              state.currentRegion,
                              invoiceDetails.invoice.totalCharge
                            )}</span></td>
                        </tr>
                        </tbody>
                        
                        </table>
                    </div><!--End Container-->
                    
                </body>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
                </html>`)

    var wnd = window.open('about:Invoice', 'Invoice Details', '_blank')
    wnd?.document.write(invoice)
  }

  return (
    <div>
      <a href='#' onClick={() => printInvoice()}>
        <Button className='btn btn-soft-primary'>Print Invoice</Button>
      </a>
    </div>
  )
}

export default PrintInvoice
