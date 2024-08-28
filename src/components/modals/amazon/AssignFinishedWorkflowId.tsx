/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import useSWR, { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'
import { ActiveWorkFlow } from '@typesTs/amazon/fulfillments/activeWorkflows'
import moment from 'moment'
import { useRouter } from 'next/router'
import { AMAZON_MARKETPLACES } from '@lib/AmzConstants'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ListInboundPlan } from '@typesTs/amazon/fulfillments/listInboundPlans'

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

const AssignFinishedWorkflowId = ({ assignFinishedWorkflowIdModal, setassignFinishedWorkflowIdModal, sessionToken, allData }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const router = useRouter()
  const [loadingWorflows, setloadingWorflows] = useState(false)
  const [loadingAssignment, setloadingAssignment] = useState(false)

  const fetcher = async (endPoint: string) => {
    setloadingWorflows(true)
    const cancelInboundPlanToast = toast.loading('Getting active workflows')
    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = await axios.get(endPoint, {
        signal,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })

      if (!response.data.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setloadingWorflows(false)
        return response.data.activeWorkFlows as { [key: string]: ActiveWorkFlow }
      } else {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        setloadingWorflows(false)
        return {} as { [key: string]: ActiveWorkFlow }
      }
    } catch (error) {
      console.error(error)
      setloadingWorflows(false)
      return {} as { [key: string]: ActiveWorkFlow }
    }
  }
  const { data: activeWorkFlows } = useSWR(
    sessionToken && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getActiveWorkFlows/${state.currentRegion}/${state.user.businessId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const handleAssignWorkflowId = async (workflowId: string) => {
    setloadingAssignment(true)
    if (!activeWorkFlows) {
      setloadingAssignment(false)
      return
    }

    const workflow = activeWorkFlows[workflowId]

    if (workflow.marketplaceIds[0] !== assignFinishedWorkflowIdModal.marketplace) {
      setloadingAssignment(false)
      toast.error('Chosen Workflow Marketplace does not match the ShelfCloud Fulfillment Marketplace')
      return
    }
    if (new Set(workflow.items.map((item) => item.msku)).size !== assignFinishedWorkflowIdModal.skus) {
      setloadingAssignment(false)
      toast.error('Chosen Workflow SKUs does not match the ShelfCloud Fulfillment SKUs')
      return
    }
    if (workflow.items.reduce((total, item) => total + item.quantity, 0) !== assignFinishedWorkflowIdModal.units) {
      setloadingAssignment(false)
      toast.error('Chosen Workflow Units does not match the ShelfCloud Fulfillment Units')
      return
    }
    const assigningWorkflowToFulfillment = toast.loading('Assigning Workflow to ShelfCloud Fulfillment...')
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/assignFinishedWorkflowToFulfillment/${state.currentRegion}/${state.user.businessId}`,
      {
        workflowInfo: {
          inboundPlanId: workflow.inboundPlanId,
          id: assignFinishedWorkflowIdModal.id,
          inboundPlanName: assignFinishedWorkflowIdModal.inboundPlanName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    )

    if (!response.data.error) {
      setassignFinishedWorkflowIdModal({
        show: false,
        id: 0,
        inboundPlanName: '',
        marketplace: '',
        dateCreated: '',
        skus: 0,
        units: 0,
      })
      toast.update(assigningWorkflowToFulfillment, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerInboundPlans/${state.currentRegion}/${state.user.businessId}`)
      router.push(`/amazon-sellers/fulfillment/sellerPortal/${workflow.inboundPlanId}`)
    } else {
      toast.update(assigningWorkflowToFulfillment, {
        render: response.data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  return (
    <Modal
      fade={false}
      size='lg'
      id='assignFinishedWorkflowIdModal'
      isOpen={assignFinishedWorkflowIdModal.show}
      toggle={() => {
        setassignFinishedWorkflowIdModal({
          show: false,
          id: 0,
          inboundPlanName: '',
          marketplace: '',
          dateCreated: '',
          skus: 0,
          units: 0,
        })
      }}>
      <ModalHeader
        toggle={() => {
          setassignFinishedWorkflowIdModal({
            show: false,
            id: 0,
            inboundPlanName: '',
            marketplace: '',
            dateCreated: '',
            skus: 0,
            units: 0,
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Assign Finished Amazon Workflow to ShelfCloud
      </ModalHeader>
      <ModalBody>
        <Row>
          <div className='mb-3'>
            <p className='fs-5 m-0 fw-semibold text-primary'>ShelfCloud Fulfillment</p>
            <p className='fs-6 m-0 text-muted'>
              Fulfillment Name: <span className='fw-semibold text-black'>{assignFinishedWorkflowIdModal.inboundPlanName}</span>
            </p>
            <p className='fs-6 m-0 text-muted'>
              Marketpalce: <span className='fw-semibold text-black'>{AMAZON_MARKETPLACES[assignFinishedWorkflowIdModal.marketplace].domain}</span>
            </p>
            <p className='fs-6 m-0 text-muted'>
              Date Created: <span className='fw-semibold text-black'>{moment(assignFinishedWorkflowIdModal.dateCreated).local().format('LL hh:mm A')}</span>
            </p>
            <p className='fs-6 m-0 text-muted'>
              SKUs: <span className='fw-semibold text-black'>{assignFinishedWorkflowIdModal.skus}</span> Units:{' '}
              <span className='fw-semibold text-black'>{assignFinishedWorkflowIdModal.units}</span>
            </p>
          </div>
          <p className='m-0 fs-7 text-danger'>ONLY ASSIGN FINISHED WORKFLOWS</p>
          <p className='fs-7'>
            *This assignment are only for already Finished Workflows in Send to Amazon, Seller Central, workflow must be in the last Step: Veiw Tracking Details. After Assigning
            the workflow to ShelfCloud Fulfillment, you will be redirected to the workflow details page. ShelfCloud will receive the shipments and begin preparing them for
            Shipping.
          </p>
          {!loadingWorflows ? (
            <Col xs={12}>
              <p className='fs-5 fw-semibold'>Amazon Active Workflows List</p>
              <table className='table table-bordered table-responsive'>
                <thead className='table-light'>
                  <tr className='text-center'>
                    <th>Date Created</th>
                    <th>Marketplace</th>
                    <th>SKUs</th>
                    <th>Units</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activeWorkFlows &&
                    Object.values(activeWorkFlows).map(
                      (workflow) =>
                        allData.find((fulfillment) => fulfillment.inboundPlanId === workflow.inboundPlanId) === undefined && (
                          <tr key={workflow.inboundPlanId} className='text-center'>
                            <td>
                              <p className='m-0 '>{moment.utc(workflow.createdAt).local().format('LL hh:mm A')}</p>
                              <p className=' m-0 text-muted fs-7'>{workflow.inboundPlanId}</p>
                            </td>
                            <td>{AMAZON_MARKETPLACES[workflow.marketplaceIds[0]].domain}</td>
                            <td>{FormatIntNumber(state.currentRegion, new Set(workflow.items.map((item) => item.msku)).size)}</td>
                            <td>
                              {FormatIntNumber(
                                state.currentRegion,
                                workflow.items.reduce((total, item) => total + item.quantity, 0)
                              )}
                            </td>
                            <td>
                              <Button
                                disabled={loadingWorflows || loadingAssignment}
                                size='sm'
                                type='button'
                                color='success'
                                onClick={() => handleAssignWorkflowId(workflow.inboundPlanId)}>
                                {loadingWorflows ? <Spinner color='light' size={'sm'} /> : 'Assing'}
                              </Button>
                            </td>
                          </tr>
                        )
                    )}
                </tbody>
              </table>
              <Row md={12} className=''>
                <div className='text-end mt-2 d-flex flex-row gap-4 justify-content-end'>
                  <div className='d-flex flex-row gap-3'>
                    <Button
                      disabled={loadingWorflows || loadingAssignment}
                      type='button'
                      color='light'
                      className='btn'
                      onClick={() => {
                        setassignFinishedWorkflowIdModal({
                          show: false,
                          id: '',
                          inboundPlanName: '',
                          marketplace: '',
                          dateCreated: '',
                          skus: 0,
                          units: 0,
                        })
                      }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Row>
            </Col>
          ) : (
            <Col xs={12}>
              <Spinner color='primary' size={'sm'} /> <span>Retrieving active workflows...</span>
            </Col>
          )}
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default AssignFinishedWorkflowId
