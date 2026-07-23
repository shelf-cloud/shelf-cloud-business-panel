import { useRouter } from 'next/router'
import { useContext, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'
import { AMAZON_MARKETPLACES } from '@lib/AmzConstants'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ActiveWorkFlow } from '@typesTs/amazon/fulfillments/activeWorkflows'
import { FinishedWorkflowSyncItem, FinishedWorkflowSyncPreview } from '@typesTs/amazon/fulfillments/finishedWorkflowSync'
import { ListInboundPlan } from '@typesTs/amazon/fulfillments/listInboundPlans'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import useSWR, { useSWRConfig } from 'swr'

import Select_Product_Mapped from './Select_Product_Mapped'

type Props = {
  allData: ListInboundPlan[]
  assignFinishedWorkflowIdModal: {
    show: boolean
    id: number
    inboundPlanName: string
    marketplace: string
    dateCreated: string
    skus: number
    units: number
  }
  setassignFinishedWorkflowIdModal: (prev: any) => void
  sessionToken: string
}

type Product = {
  inventoryId: string
  businessId: number
  image: string
  title: string
  sku: string
  isKit: boolean
}

type MappingSelection = {
  shelfCloudSku: string
  shelfCloudSkuId: number
  shelfCloudSkuIsKit: boolean
}

const emptyModal = {
  show: false,
  id: 0,
  inboundPlanName: '',
  marketplace: '',
  dateCreated: '',
  skus: 0,
  units: 0,
}

const changeLabel: Record<FinishedWorkflowSyncItem['change'], string> = {
  unchanged: 'Unchanged',
  removed: 'Remove from ShelfCloud',
  quantity_changed: 'Update quantity',
  added: 'Add from Amazon',
}

const changeClass: Record<FinishedWorkflowSyncItem['change'], string> = {
  unchanged: 'text-success',
  removed: 'text-danger',
  quantity_changed: 'text-warning',
  added: 'text-primary',
}

const AssignFinishedWorkflowId = ({ assignFinishedWorkflowIdModal, setassignFinishedWorkflowIdModal, sessionToken, allData }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const router = useRouter()
  const [loadingWorflows, setloadingWorflows] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingAssignment, setloadingAssignment] = useState(false)
  const [loadingMappingSku, setLoadingMappingSku] = useState<string | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<ActiveWorkFlow | null>(null)
  const [syncPreview, setSyncPreview] = useState<FinishedWorkflowSyncPreview | null>(null)
  const [mappingSelections, setMappingSelections] = useState<Record<string, MappingSelection>>({})

  const fetcher = async (endPoint: string) => {
    setloadingWorflows(true)
    try {
      const response = await axios.get(endPoint, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })

      if (!response.data.error) return response.data.activeWorkFlows as { [key: string]: ActiveWorkFlow }

      toast.error(response.data.message)
      return {} as { [key: string]: ActiveWorkFlow }
    } catch (error) {
      console.error(error)
      toast.error('Error getting active workflows')
      return {} as { [key: string]: ActiveWorkFlow }
    } finally {
      setloadingWorflows(false)
    }
  }

  const { data: activeWorkFlows } = useSWR(
    sessionToken && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getActiveWorkFlows/${state.currentRegion}/${state.user.businessId}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const productFetcher = async (endPoint: string) => (await axios.get(endPoint)).data
  const { data: products = [] } = useSWR<Product[]>(
    state.user.businessId ? `/api/products/getProductsSku?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    productFetcher,
    { revalidateOnFocus: false }
  )

  const addedItems = useMemo(() => syncPreview?.items.filter((item) => item.change === 'added') ?? [], [syncPreview])
  const unresolvedMappings = addedItems.filter((item) => item.mappingRequired)

  const closeModal = () => {
    setSelectedWorkflow(null)
    setSyncPreview(null)
    setMappingSelections({})
    setassignFinishedWorkflowIdModal(emptyModal)
  }

  const loadPreview = async (workflow: ActiveWorkFlow) => {
    setLoadingPreview(true)
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/previewFinishedWorkflowAssignment/${state.currentRegion}/${state.user.businessId}`,
        {
          workflowInfo: {
            inboundPlanId: workflow.inboundPlanId,
            id: assignFinishedWorkflowIdModal.id,
            inboundPlanName: assignFinishedWorkflowIdModal.inboundPlanName,
          },
        },
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      )

      if (response.data.error) {
        toast.error(response.data.message)
        return false
      }

      setSyncPreview(response.data as FinishedWorkflowSyncPreview)
      return true
    } catch (error) {
      console.error(error)
      toast.error('Error comparing workflow items')
      return false
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleReviewWorkflow = async (workflow: ActiveWorkFlow) => {
    if (workflow.marketplaceIds[0] !== assignFinishedWorkflowIdModal.marketplace) {
      toast.error('Chosen Workflow Marketplace does not match the ShelfCloud Fulfillment Marketplace')
      return
    }

    setSelectedWorkflow(workflow)
    setMappingSelections({})
    const previewLoaded = await loadPreview(workflow)
    if (!previewLoaded) setSelectedWorkflow(null)
  }

  const handleSaveMapping = async (item: FinishedWorkflowSyncItem) => {
    const selection = mappingSelections[item.msku]
    if (!selection?.shelfCloudSku || !selection.shelfCloudSkuId || !item.listingId) {
      toast.error('Select ShelfCloud Product before saving mapping')
      return
    }

    setLoadingMappingSku(item.msku)
    try {
      const response = await axios.post(`/api/amazon/mapListingToSku?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        listingId: item.listingId,
        listingSku: item.msku,
        shelfCloudSku: selection.shelfCloudSku,
        shelfCloudSkuId: selection.shelfCloudSkuId,
        shelfCloudSkuIsKit: selection.shelfCloudSkuIsKit,
        fnSku: item.listingFnsku,
      })

      if (response.data.error) {
        toast.error(response.data.message)
        return
      }

      toast.success(response.data.message)
      setMappingSelections((current) => {
        const next = { ...current }
        delete next[item.msku]
        return next
      })
      if (selectedWorkflow) await loadPreview(selectedWorkflow)
    } catch (error) {
      console.error(error)
      toast.error('Error saving ShelfCloud product mapping')
    } finally {
      setLoadingMappingSku(null)
    }
  }

  const handleAssignWorkflowId = async () => {
    if (!selectedWorkflow || !syncPreview) return
    if (unresolvedMappings.length > 0) {
      toast.error('Map every Amazon-only SKU before assigning')
      return
    }

    setloadingAssignment(true)
    const assigningWorkflowToFulfillment = toast.loading('Syncing workflow and assigning it to ShelfCloud Fulfillment...')
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/assignFinishedWorkflowToFulfillment/${state.currentRegion}/${state.user.businessId}`,
        {
          workflowInfo: {
            inboundPlanId: selectedWorkflow.inboundPlanId,
            id: assignFinishedWorkflowIdModal.id,
            inboundPlanName: assignFinishedWorkflowIdModal.inboundPlanName,
            syncToken: syncPreview.syncToken,
          },
        },
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      )

      if (response.data.error) {
        toast.update(assigningWorkflowToFulfillment, { render: response.data.message, type: 'error', isLoading: false, autoClose: 5000 })
        if (response.data.code === 'WORKFLOW_CHANGED') await loadPreview(selectedWorkflow)
        return
      }

      closeModal()
      toast.update(assigningWorkflowToFulfillment, { render: response.data.message, type: 'success', isLoading: false, autoClose: 3000 })
      mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerInboundPlans/${state.currentRegion}/${state.user.businessId}`)
      router.push(`/amazon-sellers/fulfillment/sellerPortal/${selectedWorkflow.inboundPlanId}`)
    } catch (error) {
      console.error(error)
      toast.update(assigningWorkflowToFulfillment, { render: 'Error assigning workflow', type: 'error', isLoading: false, autoClose: 5000 })
    } finally {
      setloadingAssignment(false)
    }
  }

  return (
    <Modal fade={false} size='xl' id='assignFinishedWorkflowIdModal' isOpen={assignFinishedWorkflowIdModal.show} toggle={closeModal}>
      <ModalHeader toggle={closeModal} className='modal-title' id='myModalLabel'>
        {selectedWorkflow ? 'Review Amazon Workflow Sync' : 'Assign Finished Amazon Workflow to ShelfCloud'}
      </ModalHeader>
      <ModalBody>
        <Row>
          <div className='mb-3'>
            <p className='fs-5 m-0 fw-semibold text-primary'>ShelfCloud Fulfillment</p>
            <p className='fs-6 m-0 text-muted'>
              Fulfillment Name: <span className='fw-semibold text-black'>{assignFinishedWorkflowIdModal.inboundPlanName}</span>
            </p>
            <p className='fs-6 m-0 text-muted'>
              Marketplace: <span className='fw-semibold text-black'>{AMAZON_MARKETPLACES[assignFinishedWorkflowIdModal.marketplace]?.domain}</span>
            </p>
            <p className='fs-6 m-0 text-muted'>
              Date Created: <span className='fw-semibold text-black'>{moment(assignFinishedWorkflowIdModal.dateCreated).local().format('LL hh:mm A')}</span>
            </p>
          </div>

          {!selectedWorkflow ? (
            <Col xs={12}>
              <p className='m-0 fs-7 text-danger'>ONLY ASSIGN FINISHED WORKFLOWS</p>
              <p className='fs-7'>Choose finished Seller Central workflow. Next screen shows every item change before ShelfCloud data changes.</p>
              {loadingWorflows ? (
                <Spinner />
              ) : (
                <table className='table table-bordered table-responsive'>
                  <thead className='table-light'>
                    <tr className='text-center'>
                      <th>Date Created</th>
                      <th>Marketplace</th>
                      <th>SKUs</th>
                      <th>Units</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {activeWorkFlows &&
                      Object.values(activeWorkFlows).map(
                        (workflow) =>
                          allData.find((fulfillment) => fulfillment.inboundPlanId === workflow.inboundPlanId) === undefined && (
                            <tr key={workflow.inboundPlanId} className='text-center'>
                              <td>
                                <p className='m-0'>{moment.utc(workflow.createdAt).local().format('LL hh:mm A')}</p>
                                <p className='m-0 text-muted fs-7'>{workflow.inboundPlanId}</p>
                              </td>
                              <td>{AMAZON_MARKETPLACES[workflow.marketplaceIds[0]]?.domain}</td>
                              <td>{FormatIntNumber(state.currentRegion, new Set(workflow.items.map((item) => item.msku)).size)}</td>
                              <td>
                                {FormatIntNumber(
                                  state.currentRegion,
                                  workflow.items.reduce((total, item) => total + item.quantity, 0)
                                )}
                              </td>
                              <td>
                                <Button disabled={loadingPreview} size='sm' color='success' onClick={() => handleReviewWorkflow(workflow)}>
                                  {loadingPreview ? <Spinner color='light' size='sm' /> : 'Review'}
                                </Button>
                              </td>
                            </tr>
                          )
                      )}
                  </tbody>
                </table>
              )}
            </Col>
          ) : (
            <Col xs={12}>
              <p className='fs-6'>
                Amazon workflow <span className='fw-semibold'>{selectedWorkflow.inboundPlanId}</span> is source of truth. Confirm only after reviewing changes.
              </p>
              {loadingPreview || !syncPreview ? (
                <Spinner />
              ) : (
                <table className='table table-bordered align-middle'>
                  <thead className='table-light'>
                    <tr>
                      <th>Amazon SKU</th>
                      <th>Change</th>
                      <th className='text-center'>ShelfCloud Qty</th>
                      <th className='text-center'>Amazon Qty</th>
                      <th>Mapping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncPreview.items.map((item) => (
                      <tr key={item.msku}>
                        <td>
                          <p className='m-0 fw-semibold'>{item.msku}</p>
                          {item.asin && <p className='m-0 fs-7 text-muted'>{item.asin}</p>}
                        </td>
                        <td className={changeClass[item.change]}>{changeLabel[item.change]}</td>
                        <td className='text-center'>{item.shelfCloudQuantity ?? '—'}</td>
                        <td className='text-center'>{item.amazonQuantity ?? '—'}</td>
                        <td>
                          {item.change !== 'added' ? (
                            item.shelfCloudSku || 'Existing plan mapping'
                          ) : item.mappingRequired ? (
                            item.listingId ? (
                              <div className='d-flex gap-2 align-items-start'>
                                <div className='flex-grow-1'>
                                  <Select_Product_Mapped
                                    data={products}
                                    showMappedListingModal={{
                                      show: true,
                                      listingSku: item.msku,
                                      listingId: item.listingId,
                                      shelfCloudSku: mappingSelections[item.msku]?.shelfCloudSku || '',
                                      shelfCloudSkuId: mappingSelections[item.msku]?.shelfCloudSkuId || 0,
                                      shelfCloudSkuIsKit: mappingSelections[item.msku]?.shelfCloudSkuIsKit || false,
                                      currentSkuMapped: '',
                                      currentSkuIdMapped: 0,
                                      currentSkuIsKitMapped: false,
                                    }}
                                    setshowMappedListingModal={(updater) =>
                                      setMappingSelections((current) => {
                                        const draft = {
                                          show: true,
                                          listingSku: item.msku,
                                          listingId: item.listingId!,
                                          shelfCloudSku: current[item.msku]?.shelfCloudSku || '',
                                          shelfCloudSkuId: current[item.msku]?.shelfCloudSkuId || 0,
                                          shelfCloudSkuIsKit: current[item.msku]?.shelfCloudSkuIsKit || false,
                                          currentSkuMapped: '',
                                          currentSkuIdMapped: 0,
                                          currentSkuIsKitMapped: false,
                                        }
                                        const next = typeof updater === 'function' ? updater(draft) : updater
                                        return {
                                          ...current,
                                          [item.msku]: {
                                            shelfCloudSku: next.shelfCloudSku,
                                            shelfCloudSkuId: Number(next.shelfCloudSkuId),
                                            shelfCloudSkuIsKit: next.shelfCloudSkuIsKit,
                                          },
                                        }
                                      })
                                    }
                                  />
                                </div>
                                <Button
                                  size='sm'
                                  color='primary'
                                  disabled={loadingMappingSku === item.msku || !mappingSelections[item.msku]?.shelfCloudSku}
                                  onClick={() => handleSaveMapping(item)}>
                                  {loadingMappingSku === item.msku ? <Spinner color='light' size='sm' /> : 'Save map'}
                                </Button>
                              </div>
                            ) : (
                              <span className='text-danger'>Amazon listing unavailable. Sync listings, then retry.</span>
                            )
                          ) : (
                            item.shelfCloudSku || 'Mapped'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className='d-flex justify-content-between mt-3'>
                <Button
                  color='light'
                  disabled={loadingAssignment}
                  onClick={() => {
                    setSelectedWorkflow(null)
                    setSyncPreview(null)
                    setMappingSelections({})
                  }}>
                  Back
                </Button>
                <Button color='success' disabled={loadingPreview || loadingAssignment || !syncPreview || unresolvedMappings.length > 0} onClick={handleAssignWorkflowId}>
                  {loadingAssignment ? <Spinner color='light' size='sm' /> : 'Confirm sync & assign'}
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default AssignFinishedWorkflowId
