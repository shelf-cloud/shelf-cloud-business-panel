import { useContext, useTransition } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import snarkdown from 'snarkdown'
import useSWR from 'swr'

type Props = {
  promptModal: {
    show: boolean
  }
  setPromptModal: (prev: any) => void
}

export type BusinessPromptResponse = {
  error: boolean
  message?: string
  prompt: BusinessPrompt | null
}

export interface BusinessPrompt {
  general: string
  objective: string
  corerules: string
  restrctions: string
  output: string
  businessrules: string
}

const fetcher = async (endPoint: string) => axios.get<BusinessPromptResponse>(endPoint).then((response) => response.data)

function ReorderingPointsPromptModal({ promptModal, setPromptModal }: Props) {
  const { state } = useContext(AppContext)
  const businessId = state?.user?.businessId
  const region = state?.currentRegion
  const swrKey = promptModal.show && businessId && region ? `/api/reorderingPoints/getBusinessPrompt?region=${region}&businessId=${businessId}` : null

  const { data, error, isValidating } = useSWR(swrKey, fetcher, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  })

  const placeholderBusinessRules = `- Rule 1: Always consider the lead time of products when forecasting demand.\n- Rule 2: Factor in seasonal trends and historical sales data for more accurate predictions.\n`

  const [isPending, startTransition] = useTransition()
  const handleSaveBusinessRules = async () => {
    const businessRulesInput = document.getElementById('businessRules') as HTMLInputElement
    const updatedBusinessRules = businessRulesInput.value.replace(/\n/g, '\\n')

    const loadingToast = toast.loading('Creating Order...')

    startTransition(async () => {
      try {
        const { data } = await axios.post(`/api/reorderingPoints/updateBusinessPrompt?region=${region}&businessId=${businessId}`, {
          businessRules: updatedBusinessRules,
        })
        if (!data.success) {
          toast.update(loadingToast, {
            render: data.message,
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          })
        } else {
          toast.update(loadingToast, {
            render: data.message ?? 'Error creating Purchase Order',
            type: 'error',
            isLoading: false,
            autoClose: 3000,
          })
        }
      } catch (error) {}
    })
  }

  return (
    <Modal
      fade={false}
      size='lg'
      id='businessPromptModal'
      isOpen={promptModal.show}
      toggle={() => {
        setPromptModal({
          show: false,
        })
      }}>
      <ModalHeader
        toggle={() => {
          setPromptModal({
            show: false,
          })
        }}>
        Business Prompt
      </ModalHeader>
      <ModalBody className='px-4 py-3' style={{ overflowX: 'hidden', overflowY: 'auto', minWidth: 0 }}>
        <p className='fs-6'>To forecast using different AI models, you can add custom instructions/rules additionally.</p>
        {isValidating ? (
          <div className='d-flex align-items-center gap-2 text-muted py-3'>
            <div className='spinner-border spinner-border-sm' role='status' aria-hidden='true' />
            <span>Loading prompt...</span>
          </div>
        ) : error ? (
          <div className='alert alert-danger mb-0' role='alert'>
            Failed to fetch prompt. Please try again.
          </div>
        ) : data?.error ? (
          <div className='alert alert-warning mb-0' role='alert'>
            {data.message || 'Prompt service returned an error.'}
          </div>
        ) : data?.prompt ? (
          <div className='d-flex flex-column gap-3' style={{ minWidth: 0, width: '100%' }}>
            {[
              // { label: 'General', content: snarkdown(data.prompt.general) },
              { label: 'Objective', content: snarkdown(data.prompt.objective) },
              { label: 'Core Rules', content: snarkdown(data.prompt.corerules) },
              // { label: 'Restrictions', content: snarkdown(data.prompt.restrctions) },
              // { label: 'Output', content: snarkdown(data.prompt.output) },
            ].map(({ label, content }) => (
              <div key={label} className='border rounded p-3 shadow-sm' style={{ minWidth: 0, overflow: 'hidden' }}>
                <p className='fw-semibold text-secondary text-uppercase mb-2' style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                  {label}
                </p>
                <div
                  className='prompt-content'
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflow: 'none', minWidth: 0, maxWidth: '100%' }}
                  dangerouslySetInnerHTML={{ __html: content as string }}
                />
              </div>
            ))}
            <div className='border rounded p-3 shadow-sm'>
              <p className='fw-semibold text-secondary text-uppercase mb-3' style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                Business Rules
              </p>
              <Input
                type='textarea'
                className='form-control'
                rows={4}
                placeholder={placeholderBusinessRules}
                id='businessRules'
                name='businessRules'
                defaultValue={data.prompt.businessrules.replace(/\\n/g, '\n')}
              />
            </div>
          </div>
        ) : (
          <p className='text-muted mb-0'>No prompt available.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color='light'
          onClick={() => {
            setPromptModal({
              show: false,
            })
          }}>
          Close
        </Button>
        <Button onClick={handleSaveBusinessRules} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Rules'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ReorderingPointsPromptModal
