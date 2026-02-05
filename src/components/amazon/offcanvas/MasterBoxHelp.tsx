import React from 'react'

import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap'

type Props = {
  isOpen: boolean
  setHelpOffCanvasIsOpen: (isOpen: boolean) => void
}

const MasterBoxHelp = ({ isOpen, setHelpOffCanvasIsOpen }: Props) => {
  return (
    <Offcanvas isOpen={isOpen} direction='end' toggle={() => setHelpOffCanvasIsOpen(false)}>
      <OffcanvasHeader toggle={() => setHelpOffCanvasIsOpen(false)}>Send To Amazon Guide</OffcanvasHeader>
      <OffcanvasBody>
        <div className='d-flex flex-column'>
          <p className='fs-5 fw-bold'>Master Boxes</p>
          <div className='fs-7'>
            <p className='fs-6 fw-semibold'>Step 1 - Choose Inventory to Send</p>
            <ul>
              <li>{`Add how many Master Boxes per SKU you want to send in the "Order Qty" column.`}</li>
              <li>Click the Create Inbound Plan Button to review order, add missing details and confirm fulfillment quantities.</li>
              <li>Confirm Plan</li>
            </ul>
            <p className=''>A fulfillment is created in shelfcloud and a file template is generated to be uploaded in your Amazon Seller.</p>

            <p className='fs-6 fw-semibold'>Step 2 - Upload Template File and Assign Fulfillment</p>
            <ul>
              <li>Upload the download template file corresponding to the created fulfillment into a new workflow in your Amazon Seller - Sent To Amazon page.</li>
              <li>
                After uploading the template file, in the Send To Amazon page choose the recent created fulfillment and in the actions button click assign workflow. A list of the
                recent created workflows in Amazon Seller will be shown. Click in the Assign button of the corresponding active workflow that matches date, marketplace, SKUs and
                units of the fulfillment.
              </li>
            </ul>

            <p>{`After assigning the workflow to ShelfCloud's Fulfillment, the fulfillment details page will open and you can continue the Amazon workflow in shelfCloud.`}</p>

            <p className='fs-6 fw-semibold'>Step 3 - Fulfillment Workflow</p>
            <ul>
              <li>Check and Confirm the Inventory to Send to continue to the Shipping Step.</li>
              <li>This step may take a few minutes, please be patient while Amazon returns the placements (splits) and Transportation Options.</li>
              <li>
                After loading, you would see the different placement Options Amazon gives you to ship the products. Choose an estimated Ship Date (avoid weekends or holidays), one
                placement option, and shipping mode for your fulfillment. Then you would be able to accept Charges and Confirm Shipping.
              </li>
              <li>
                This step may take a few minutes while Amazon confirms the selected placement and transportation options. If an Error is shown, try with a different placement
                options or check if some SKUs in the order may have some problems when sending to Amazon in your Amazon Seller - Sent To Amazon page.
              </li>
              <li>
                After Charges and Shipping are confirmed
                <ul>
                  <li>Small Parcel</li>
                  <li>
                    If all selected shippings are Small Parcel, the labels are created and the fullfillment workflow is finished. ShelfCloud will received the shipment orders
                    (splits) and will began preparing the SKUs for shipping.
                  </li>
                  <li>LTL/FTL</li>
                  <li>If some or all selected shippings are LTL/FTL, you will need to complete an extra step Carrier and Pallet Info.</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  )
}

export default MasterBoxHelp
