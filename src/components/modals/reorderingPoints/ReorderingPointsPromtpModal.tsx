import { useContext, useTransition } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { Textarea } from '@shadcn/ui/textarea'
import { Alert } from '@/components/ui/Alert'
import snarkdown from 'snarkdown'
import useSWR from 'swr'

import { BusinessPromptResponse } from '@/features/reordering-points/business-prompt'

type Props = {
  promptModal: {
    show: boolean
  }
  setPromptModal: (prev: any) => void
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
    <Dialog
      open={!!promptModal.show}
      onOpenChange={(open) => {
        if (!open) {
          setPromptModal({
            show: false,
          })
        }
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl'>
        <DialogHeader className='pr-6'>
          <DialogTitle>Business Prompt</DialogTitle>
        </DialogHeader>
        <div className='px-6 py-4' style={{ overflowX: 'hidden', overflowY: 'auto', minWidth: 0 }}>
        <p className='text-[13px]'>To forecast using different AI models, you can add custom instructions/rules additionally.</p>
        {isValidating ? (
          <div className='flex items-center gap-2 text-muted-foreground py-4'>
            <Spinner className='size-4' role='status' aria-hidden='true' />
            <span>Loading prompt...</span>
          </div>
        ) : error ? (
          <Alert color='danger' className='mb-0'>
            Failed to fetch prompt. Please try again.
          </Alert>
        ) : data?.error ? (
          <Alert color='warning' className='mb-0'>
            {data.message || 'Prompt service returned an error.'}
          </Alert>
        ) : data?.prompt ? (
          <div className='flex flex-col gap-4' style={{ minWidth: 0, width: '100%' }}>
            {[
              // { label: 'General', content: snarkdown(data.prompt.general) },
              { label: 'Objective', content: snarkdown(data.prompt.objective) },
              { label: 'Core Rules', content: snarkdown(data.prompt.corerules) },
              // { label: 'Restrictions', content: snarkdown(data.prompt.restrictions) },
              // { label: 'Output', content: snarkdown(data.prompt.output) },
            ].map(({ label, content }) => (
              <div key={label} className='border rounded p-4 shadow-sm' style={{ minWidth: 0, overflow: 'hidden' }}>
                <p className='font-semibold text-muted-foreground uppercase mb-2' style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                  {label}
                </p>
                <div
                  className='prompt-content'
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflow: 'none', minWidth: 0, maxWidth: '100%' }}
                  dangerouslySetInnerHTML={{ __html: content as string }}
                />
              </div>
            ))}
            <div className='border rounded p-4 shadow-sm'>
              <p className='font-semibold text-muted-foreground uppercase mb-4' style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                Business Rules
              </p>
              <Textarea
                rows={4}
                placeholder={placeholderBusinessRules}
                id='businessRules'
                name='businessRules'
                defaultValue={data.prompt.businessrules.replace(/\\n/g, '\n')}
              />
            </div>
          </div>
        ) : (
          <p className='text-muted-foreground mb-0'>No prompt available.</p>
        )}
        </div>
        <DialogFooter className='items-center'>
          <Button
            variant='light'
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReorderingPointsPromptModal
