import { useContext, useState } from 'react'

import PrintReceivingLabel from '@components/receiving/labels/PrintReceivingLabel'
import AppContext from '@context/AppContext'
import { useGenerateLabels } from '@hooks/pdfRender/useGenerateLabels'
import { useEditReceivingsBoxes } from '@hooks/receivings/useEditReceivingsBoxes'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { EditReceivingType } from '@pages/receivings'
import { OrderRowType } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Alert, Button, Col, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, Row, Spinner, TabContent, TabPane } from 'reactstrap'

import Edit_Receiving_Packages_Tab from './Edit_Receiving_Packages_Tab'
import Edit_Receiving_Summary_Tab from './Edit_Receiving_Summary_Tab'

type DeleteSKUFromReceivingModalType = {
  sku: string
  inventoryId: number
  poId: number
  quantity: number
  splitId?: number | undefined
}

type Props = {
  editReceiving: EditReceivingType
  seteditReceiving: (prev: EditReceivingType) => void
  mutateReceivings: () => void
}

const EditReceivingModal = ({ editReceiving, seteditReceiving, mutateReceivings }: Props) => {
  const { show, order } = editReceiving
  const { warehouseName, orderNumber, orderItems, isShipjoyCreated, id3PL, boxes } = order
  const { state } = useContext(AppContext)
  const { warehouses } = useWarehouses()
  const [loading, setloading] = useState(false)
  const [activeTab, setactiveTab] = useState('summary')
  const [packingConfiguration, setpackingConfiguration] = useState('current')
  const [needsNewBoxConfiguration, setneedsNewBoxConfiguration] = useState(false)
  const [deletedSku, setdeletedSku] = useState<DeleteSKUFromReceivingModalType[]>([])

  const {
    singleSkuPackages,
    addNewSingleSkuBoxConfiguration,
    removeSingleSkuBoxConfiguration,
    changeUnitsPerBox,
    changeQtyOfBoxes,
    multiSkuPackages,
    addNewMultiSkuBoxConfiguration,
    removeMultiSkuBoxConfiguration,
    addSkuToMultiSkuBox,
    removeSkuFromMultiSkuBox,
    setMixedSkuBoxesUsingMasterBoxes,
    clearMultiSkuBoxes,
    finalBoxesConfiguration,
    hasBoxedErrors,
  } = useEditReceivingsBoxes(orderItems, packingConfiguration, isShipjoyCreated ? id3PL : orderNumber)

  const handleDeleteItem = (poId: number, sku: string, quantity: number, inventoryId: number, splitId: number | undefined) => {
    setdeletedSku((prev) => [...prev, { poId, sku, inventoryId, splitId, quantity }])
    const newOrderItems = orderItems.filter((item) => item.poId! !== poId || item.sku !== sku)
    seteditReceiving({
      ...editReceiving,
      order: {
        ...order,
        orderItems: newOrderItems,
      },
    })
    setneedsNewBoxConfiguration(true)
    setpackingConfiguration('single')
  }
  const handleUpdateReceiving = async () => {
    setloading(true)
    const updateReceiving = toast.loading('Updating Receiving...')

    const { data } = await axios.post(`/api/receivings/editReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderItems,
      boxes: packingConfiguration !== 'current' ? finalBoxesConfiguration : boxes,
      deletedSku,
      isReceivingFromPo: order.isReceivingFromPo,
      warehouseId: order.warehouseId,
      $orderid3PL: order.id3PL,
    })

    if (!data.error) {
      seteditReceiving({
        show: false,
        order: {} as OrderRowType,
      })
      toast.update(updateReceiving, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })

      handleDownloadLabel()
      mutateReceivings && mutateReceivings()
    } else {
      toast.update(updateReceiving, {
        render: data.message ?? 'Error updating Receiving',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }

    setloading(false)
  }

  const { handleDownloadLabel } = useGenerateLabels({
    pdfDocument: (
      <PrintReceivingLabel
        companyName={state.user.name}
        prefix3PL={state.user.prefix3PL}
        warehouse={warehouses?.find((w) => w.warehouseId === order.warehouseId)!}
        boxes={packingConfiguration !== 'current' ? finalBoxesConfiguration : boxes || []}
        orderBarcode={order.orderNumber}
      />
    ),
    fileName: order.orderNumber,
  })

  return (
    <Modal
      fade={false}
      size='xl'
      id='editReceivingModal'
      isOpen={show}
      toggle={() => {
        seteditReceiving({
          show: false,
          order: {} as OrderRowType,
        })
      }}>
      <ModalHeader
        toggle={() => {
          seteditReceiving({
            show: false,
            order: {} as OrderRowType,
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Edit Receiving
      </ModalHeader>
      <ModalBody>
        <Row>
          <p className='m-0 fs-5 fw-semibold'>
            Receiving: <span className='text-primary'>{orderNumber}</span>
          </p>
        </Row>
        <Row className='mb-3'>
          <p className='m-0 fs-6 fw-semibold'>
            Destination: <span className='text-primary'>{warehouseName}</span>
          </p>
        </Row>

        <Nav className='nav-tabs border-bottom' role='tablist'>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={activeTab == 'summary' ? 'text-primary fw-semibold fs-6 border border-primary' : 'text-muted fs-6'}
              onClick={() => {
                setactiveTab('summary')
              }}
              type='button'>
              Summary
            </NavLink>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={activeTab == 'packages' ? 'text-primary fw-semibold fs-6 border border-primary' : 'text-muted fs-6'}
              onClick={() => {
                setactiveTab('packages')
              }}
              type='button'>
              Boxes
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab} className='pt-2 mb-3'>
          <TabPane tabId='summary'>{activeTab == 'summary' && <Edit_Receiving_Summary_Tab orderItems={orderItems} handleDeleteItem={handleDeleteItem} />}</TabPane>
          <TabPane tabId='packages'>
            {activeTab == 'packages' && (
              <Edit_Receiving_Packages_Tab
                orderItems={orderItems}
                packingConfiguration={packingConfiguration}
                boxes={boxes || []}
                needsNewBoxConfiguration={needsNewBoxConfiguration}
                setPackingConfiguration={(_field: string, value: string) => setpackingConfiguration(value)}
                singleSkuPackages={singleSkuPackages}
                addNewSingleSkuBoxConfiguration={addNewSingleSkuBoxConfiguration}
                removeSingleSkuBoxConfiguration={removeSingleSkuBoxConfiguration}
                changeUnitsPerBox={changeUnitsPerBox}
                changeQtyOfBoxes={changeQtyOfBoxes}
                multiSkuPackages={multiSkuPackages}
                addNewMultiSkuBoxConfiguration={addNewMultiSkuBoxConfiguration}
                removeMultiSkuBoxConfiguration={removeMultiSkuBoxConfiguration}
                addSkuToMultiSkuBox={addSkuToMultiSkuBox}
                removeSkuFromMultiSkuBox={removeSkuFromMultiSkuBox}
                setMixedSkuBoxesUsingMasterBoxes={setMixedSkuBoxesUsingMasterBoxes}
                clearMultiSkuBoxes={clearMultiSkuBoxes}
              />
            )}
          </TabPane>
        </TabContent>
        <Row className='mb-2'>
          {needsNewBoxConfiguration && (
            <Col xs={12} className='m-0'>
              <Alert color='warning' className='fs-7 py-1 mb-2' fade={false}>
                <i className='ri-error-warning-line me-3 align-middle fs-5' />
                You need to create a new box configuration for this receiving.
              </Alert>
            </Col>
          )}
          {!needsNewBoxConfiguration && packingConfiguration !== 'current' && (
            <Col xs={12} className='m-0'>
              <Alert color='warning' className='fs-7 py-1 mb-2' fade={false}>
                <i className='ri-error-warning-line me-3 align-middle fs-5' />
                You are editing the current box configuration. Please make sure to update the current box configuration if needed.
              </Alert>
            </Col>
          )}
          {hasBoxedErrors.error && (
            <Col xs={12} className='m-0'>
              <Alert color='danger' className='fs-7 py-1 mb-2' fade={false}>
                <i className='ri-error-warning-line me-3 align-middle fs-5' />
                {hasBoxedErrors.message}
              </Alert>
            </Col>
          )}
        </Row>
        <Row md={12}>
          <div className='d-flex justify-content-end align-items-center gap-3'>
            <Button
              type='button'
              color='light'
              className='fs-7'
              onClick={() =>
                seteditReceiving({
                  show: false,
                  order: {} as OrderRowType,
                })
              }>
              Cancel
            </Button>
            {activeTab == 'summary' && (
              <Button disabled={false} type='button' className='fs-7 btn-soft-primary' onClick={() => setactiveTab('packages')}>
                Next Step
              </Button>
            )}
            {activeTab == 'packages' && (
              <Button disabled={loading || hasBoxedErrors.error} type='button' color='success' className='fs-7' onClick={() => handleUpdateReceiving()}>
                {loading ? (
                  <span>
                    <Spinner color='light' size={'sm'} /> Updating...
                  </span>
                ) : (
                  'Update Receiving'
                )}
              </Button>
            )}
          </div>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default EditReceivingModal
