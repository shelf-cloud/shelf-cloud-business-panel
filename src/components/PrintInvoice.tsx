import { InvoiceFullDetails } from '@typings'
import React from 'react'
import { Button } from 'reactstrap'

type Props = {
  invoiceDetails: InvoiceFullDetails
}

function PrintInvoice({ invoiceDetails }: Props) {
  const printInvoice = () => {
    let invoice = `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet">
                  <style>
      
                  body {
                      margin: 0px;
                      padding: 0px;
                  }
                  #container{
                      min-height: 95vh;
                      max-height: 95vh;
                      width: 90%;
                      padding: 30px 40px;
                      margin: 30px auto;
                      border: 4px solid #686868;
                      border-radius: 7px;
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
                      font-size: 18px;
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
                      <img src="https://electrostoregroup.com/warehouseManager/assets/shelfcloud-logo-v.jpg" />
                      <p>Shelf Cloud - Onix Venture Group</p>
                      <p>9631 Premier Parkway</p>
                      <p>Miramar, FL 33025</p>
                      <a href="mailto:info@onixventuregroup.com?Subject=Purchase%20Orders">info@onixventuregroup.com</a>
                      <a href="https://www.onixventuregroup.com/" target="_blank">www.onixventuregroup.com</a>
                      
                      
                      <p style="font-size: 24px;font-weight: 900;text-transform: uppercase;margin: 13px 0px 0px 0px;">Business: ${invoiceDetails.invoice.businessName}</p>
                      </div><!--End Left-->
                      <div id="right1">
                      <h1 style="font-size: 62px;text-transform: uppercase;">Invoice</h1>
                      <h3 style="font-size: 50px;font-weight: 900;color: #458BC9;">
                          ${invoiceDetails.invoice.invoiceNumber}
                      </h3>
                      <h5 style="font-weight: 700;">
                          Invoice Date: ${invoiceDetails.invoice.createdDate}
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
                          <td>${order.closedDate}</td>
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
                              $ ${order.totalCharge.toFixed(2)}
                            </span>
                          </td>
                        </tr>`)
    )

    invoice += `</tbody>
                      <tfoot class="table-light">
                      <tr style="font-weight: 700;">
                          <td colspan="3" style="text-align:right;">TOTAL</td>
                          <td id="totalTotal" style="display: block;text-align: left;overflow: auto;"><span style="width: 60%;float: left;text-align: right;">$ ${invoiceDetails.invoice.totalCharge.toFixed(
                            2
                          )}</span></td>
                      </tr>
                      </tfoot>
                      
                      </table>
                  </div><!--End Container-->
                  
              </body>
              <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
              </html>`

    var wnd = window.open('about:printInvoice', '', '_blank')
    wnd?.document.write(invoice)
  }

  return (
    <div>
      <a href="#" onClick={() => printInvoice()}>
        <Button className="btn btn-soft-primary">
          Print Invoice
        </Button>
      </a>
    </div>
  )
}

export default PrintInvoice
