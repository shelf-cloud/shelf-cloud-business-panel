 
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
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
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
    <Dialog
      open={!!assignWorkflowIdModal.show}
      onOpenChange={(open) => {
        if (!open)
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
      <DialogContent id='confirmDelete' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl'>
        <DialogHeader className='pr-6'>
          <DialogTitle className='modal-title' id='myModalLabel'>
            Assign Amazon Workflow ID to ShelfCloud
          </DialogTitle>
        </DialogHeader>
        <div>
        <div className='flex flex-wrap -mx-3'>
          <div className='mb-4'>
            <p className='text-[16.25px] m-0 font-semibold text-primary'>ShelfCloud Fulfillment</p>
            <p className='text-[13px] m-0 text-[var(--bs-secondary-color)]'>
              Fulfillment Name: <span className='font-semibold text-black'>{assignWorkflowIdModal.inboundPlanName}</span>
            </p>
            <p className='text-[13px] m-0 text-[var(--bs-secondary-color)]'>
              Marketpalce: <span className='font-semibold text-black'>{AMAZON_MARKETPLACES[assignWorkflowIdModal.marketplace].domain}</span>
            </p>
            <p className='text-[13px] m-0 text-[var(--bs-secondary-color)]'>
              Date Created: <span className='font-semibold text-black'>{moment(assignWorkflowIdModal.dateCreated).local().format('LL hh:mm A')}</span>
            </p>
            <p className='text-[13px] m-0 text-[var(--bs-secondary-color)]'>
              SKUs: <span className='font-semibold text-black'>{assignWorkflowIdModal.skus}</span> Units:{' '}
              <span className='font-semibold text-black'>{assignWorkflowIdModal.units}</span>
            </p>
          </div>
          <p className='text-[11.2px] text-[var(--bs-secondary-color)]'>
            * After Uploading the template file to a new workflow in Amazon Seller Central, Assign it to a ShelfCloud Fulfillment. ShelfCloud would then handle the whole
            fulfillment process.
          </p>
          {!loadingWorflows ? (
            <div className='px-3 w-full'>
              <p className='text-[16.25px] font-semibold'>Amazon Active Workflows List</p>
              <div className='overflow-x-auto'>
              <table className='w-full align-middle mb-0 border border-[color:var(--border)] [&_td]:border-t [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                <thead className='bg-[color:var(--vz-light)]'>
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
                                variant='success'
                                onClick={() => handleAssignWorkflowId(workflow.inboundPlanId)}>
                                {loadingWorflows ? <Spinner className='text-white' /> : 'Assing'}
                              </Button>
                            </td>
                          </tr>
                        )
                    )}
                </tbody>
              </table>
              </div>
              <div className='flex flex-wrap -mx-3'>
                <div className='text-right mt-2 flex flex-row gap-6 justify-end'>
                  <div className='flex flex-row gap-4'>
                    <Button
                      disabled={loadingWorflows || loadingAssignment}
                      type='button'
                      variant='light'
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
              </div>
            </div>
          ) : (
            <div className='px-3 w-full'>
              <Spinner className='text-primary' /> <span>Retrieving active workflows...</span>
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignWorkflowId
