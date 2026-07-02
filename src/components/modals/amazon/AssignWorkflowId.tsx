 
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { AMAZON_MARKETPLACES } from '@lib/AmzConstants'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ActiveWorkFlow } from '@typesTs/amazon/fulfillments/activeWorkflows'
import { ListInboundPlan } from '@typesTs/amazon/fulfillments/listInboundPlans'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'
import useSWR, { useSWRConfig } from 'swr'

type Props = {
  allData: ListInboundPlan[]
  assignWorkflowIdModal: {
    show: boolean
    id: number
    inboundPlanName: string
    marketplace: string
    dateCreated: string
    skus: number
    units: number
  }
  setassignWorkflowIdModal: (prev: any) => void
  sessionToken: string
}

const AssignWorkflowId = ({ assignWorkflowIdModal, setassignWorkflowIdModal, sessionToken, allData }: Props) => {
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

    if (workflow.marketplaceIds[0] !== assignWorkflowIdModal.marketplace) {
      setloadingAssignment(false)
      toast.error('Chosen Workflow Marketplace does not match the ShelfCloud Fulfillment Marketplace')
      return
    }
    if (workflow.items.length !== assignWorkflowIdModal.skus) {
      setloadingAssignment(false)
      toast.error('Chosen Workflow SKUs does not match the ShelfCloud Fulfillment SKUs')
      return
    }
    if (workflow.items.reduce((total, item) => total + item.quantity, 0) !== assignWorkflowIdModal.units) {
      setloadingAssignment(false)
      toast.error('Chosen Workflow Units does not match the ShelfCloud Fulfillment Units')
      return
    }
    const assigningWorkflowToFulfillment = toast.loading('Assigning Workflow to ShelfCloud Fulfillment...')
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/assignWorkflowToFulfillment/${state.currentRegion}/${state.user.businessId}`,
      {
        workflowInfo: {
          inboundPlanId: workflow.inboundPlanId,
          id: assignWorkflowIdModal.id,
          inboundPlanName: assignWorkflowIdModal.inboundPlanName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    )

    if (!response.data.error) {
      setassignWorkflowIdModal({
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
      router.push(`/amazon-sellers/fulfillment/masterBoxes/${workflow.inboundPlanId}`)
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
      id='confirmDelete'
      isOpen={assignWorkflowIdModal.show}
      toggle={() => {
        setassignWorkflowIdModal({
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
          setassignWorkflowIdModal({
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
        Assign Amazon Workflow ID to ShelfCloud
      </ModalHeader>
      <ModalBody>
        <Row>
          <div className='tw:mb-4'>
            <p className='tw:text-[16.25px] tw:m-0 tw:font-semibold tw:text-primary'>ShelfCloud Fulfillment</p>
            <p className='tw:text-[13px] tw:m-0 tw:text-[var(--bs-secondary-color)]'>
              Fulfillment Name: <span className='tw:font-semibold tw:text-black'>{assignWorkflowIdModal.inboundPlanName}</span>
            </p>
            <p className='tw:text-[13px] tw:m-0 tw:text-[var(--bs-secondary-color)]'>
              Marketpalce: <span className='tw:font-semibold tw:text-black'>{AMAZON_MARKETPLACES[assignWorkflowIdModal.marketplace].domain}</span>
            </p>
            <p className='tw:text-[13px] tw:m-0 tw:text-[var(--bs-secondary-color)]'>
              Date Created: <span className='tw:font-semibold tw:text-black'>{moment(assignWorkflowIdModal.dateCreated).local().format('LL hh:mm A')}</span>
            </p>
            <p className='tw:text-[13px] tw:m-0 tw:text-[var(--bs-secondary-color)]'>
              SKUs: <span className='tw:font-semibold tw:text-black'>{assignWorkflowIdModal.skus}</span> Units:{' '}
              <span className='tw:font-semibold tw:text-black'>{assignWorkflowIdModal.units}</span>
            </p>
          </div>
          <p className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>
            * After Uploading the template file to a new workflow in Amazon Seller Central, Assign it to a ShelfCloud Fulfillment. ShelfCloud would then handle the whole
            fulfillment process.
          </p>
          {!loadingWorflows ? (
            <Col xs={12}>
              <p className='tw:text-[16.25px] tw:font-semibold'>Amazon Active Workflows List</p>
              <div className='tw:overflow-x-auto'>
              <table className='tw:w-full tw:align-middle tw:mb-0 tw:border tw:border-[color:var(--border)] tw:[&_td]:border-t tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                <thead className='tw:bg-[color:var(--vz-light)]'>
                  <tr className='tw:text-center'>
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
                          <tr key={workflow.inboundPlanId} className='tw:text-center'>
                            <td>{moment.utc(workflow.createdAt).local().format('LL hh:mm A')}</td>
                            <td>{AMAZON_MARKETPLACES[workflow.marketplaceIds[0]].domain}</td>
                            <td>{FormatIntNumber(state.currentRegion, workflow.items.length)}</td>
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
              </div>
              <Row md={12} className=''>
                <div className='tw:text-right tw:mt-2 tw:flex tw:flex-row tw:gap-6 tw:justify-end'>
                  <div className='tw:flex tw:flex-row tw:gap-4'>
                    <Button
                      disabled={loadingWorflows || loadingAssignment}
                      type='button'
                      color='light'
                      onClick={() => {
                        setassignWorkflowIdModal({
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

export default AssignWorkflowId
