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

import { Alert, Button, Col, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink, Row, Spinner, TabContent, TabPane } from '@/components/migration-ui'

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
  const { warehouseName, orderNumber, orderItems, isShipjoyCreated, id3PL, boxes, isReceivingFromPo } = order
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
    const newOrderItems = orderItems.filter((item) => (isReceivingFromPo ? item.poId! !== poId || item.sku !== sku : item.inventoryId !== inventoryId))
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
      orderid3PL: order.id3PL,
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

      if (order.id3PL) {
        downloadPDF(
          <PrintReceivingLabel
            companyName={state.user.name}
            prefix3PL={state.user.prefix3PL}
            warehouse={warehouses?.find((w) => w.warehouseId === order.warehouseId)!}
            boxes={packingConfiguration !== 'current' ? finalBoxesConfiguration : boxes || []}
            orderBarcode={order.id3PL}
            isManualReceiving={!isReceivingFromPo}
          />,
          order.orderNumber
        )
      } else {
        downloadPDF(
          <PrintReceivingLabel
            companyName={state.user.name}
            prefix3PL={state.user.prefix3PL}
            warehouse={warehouses?.find((w) => w.warehouseId === order.warehouseId)!}
            boxes={packingConfiguration !== 'current' ? finalBoxesConfiguration : boxes || []}
            orderBarcode={order.orderNumber}
            isManualReceiving={!isReceivingFromPo}
          />,
          order.orderNumber
        )
      }
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

  const { downloadPDF } = useGenerateLabels()

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
          <p className='tw:m-0 tw:text-[16.25px] tw:font-semibold'>
            Receiving: <span className='tw:text-primary'>{orderNumber}</span>
          </p>
        </Row>
        <Row className='tw:mb-4'>
          <p className='tw:m-0 tw:text-[13px] tw:font-semibold'>
            Destination: <span className='tw:text-primary'>{warehouseName}</span>
          </p>
        </Row>

        <Nav className='nav-tabs tw:border-b' role='tablist'>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={activeTab == 'summary' ? 'tw:text-primary tw:font-semibold tw:text-[13px] tw:border tw:border-primary' : 'tw:text-[var(--bs-secondary-color)] tw:text-[13px]'}
              onClick={() => {
                setactiveTab('summary')
              }}
              type='button'>
              Summary
            </NavLink>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={activeTab == 'packages' ? 'tw:text-primary tw:font-semibold tw:text-[13px] tw:border tw:border-primary' : 'tw:text-[var(--bs-secondary-color)] tw:text-[13px]'}
              onClick={() => {
                setactiveTab('packages')
              }}
              type='button'>
              Boxes
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab} className='tw:pt-2 tw:mb-4'>
          <TabPane tabId='summary'>
            {activeTab == 'summary' && <Edit_Receiving_Summary_Tab orderItems={orderItems} handleDeleteItem={handleDeleteItem} isReceivingFromPo={isReceivingFromPo!} />}
          </TabPane>
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
                isReceivingFromPo={isReceivingFromPo!}
              />
            )}
          </TabPane>
        </TabContent>
        <Row className='tw:mb-2'>
          {needsNewBoxConfiguration && (
            <Col xs={12} className='tw:m-0'>
              <Alert color='warning' className='tw:text-[11.2px] tw:py-1 tw:mb-2' fade={false}>
                <i className='ri-error-warning-line tw:me-4 tw:align-middle tw:text-[16.25px]' />
                You need to create a new box configuration for this receiving.
              </Alert>
            </Col>
          )}
          {!needsNewBoxConfiguration && packingConfiguration !== 'current' && (
            <Col xs={12} className='tw:m-0'>
              <Alert color='warning' className='tw:text-[11.2px] tw:py-1 tw:mb-2' fade={false}>
                <i className='ri-error-warning-line tw:me-4 tw:align-middle tw:text-[16.25px]' />
                You are editing the current box configuration. Please make sure to update the current box configuration if needed.
              </Alert>
            </Col>
          )}
          {hasBoxedErrors.error && (
            <Col xs={12} className='tw:m-0'>
              <Alert color='danger' className='tw:text-[11.2px] tw:py-1 tw:mb-2' fade={false}>
                <i className='ri-error-warning-line tw:me-4 tw:align-middle tw:text-[16.25px]' />
                {hasBoxedErrors.message}
              </Alert>
            </Col>
          )}
        </Row>
        <Row md={12}>
          <div className='tw:flex tw:justify-end tw:items-center tw:gap-4'>
            <Button
              type='button'
              color='light'
              className='tw:text-[11.2px]'
              onClick={() =>
                seteditReceiving({
                  show: false,
                  order: {} as OrderRowType,
                })
              }>
              Cancel
            </Button>
            {activeTab == 'summary' && (
              <Button disabled={false} type='button' className='tw:text-[11.2px] btn-soft-primary' onClick={() => setactiveTab('packages')}>
                Next Step
              </Button>
            )}
            {activeTab == 'packages' && (
              <Button disabled={loading || hasBoxedErrors.error} type='button' color='success' className='tw:text-[11.2px]' onClick={() => handleUpdateReceiving()}>
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
