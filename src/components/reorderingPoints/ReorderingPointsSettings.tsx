import React, { useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useClickOutside } from '@hooks/useClickOutside'
import { Button as ShadcnButton } from '@shadcn/ui/button'
import { ChevronDownIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Switch } from '@/components/ui/Switch'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'

type Props = {
  initialHighAlert: number
  initialMediumAlert: number
  initialLowAlert: number
  handleUrgencyRange: (highAlertMax: number, mediumAlertMax: number, lowAlertMax: number) => void
  canSplit: boolean
  setsplits: (prev: any) => void
  splits: { isSplitting: boolean; splitsQty: number }
}

const toNumber = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isNaN(n) ? undefined : n
}

const settingsSchema = z
  .object({
    highAlertMax: z.preprocess(toNumber, z.number({ error: 'Required' }).min(0, 'Must be grater than 0')),
    mediumAlertMax: z.preprocess(toNumber, z.number({ error: 'Required' })),
    lowAlertMax: z.preprocess(toNumber, z.number({ error: 'Required' })),
  })
  .superRefine((values, ctx) => {
    if (!(values.mediumAlertMax > values.highAlertMax + 1)) {
      ctx.addIssue({ code: 'custom', message: 'Must be greater than Min Medium Alert', path: ['mediumAlertMax'] })
    }
    if (!(values.lowAlertMax > values.mediumAlertMax + 1)) {
      ctx.addIssue({ code: 'custom', message: 'Must be greater than Min Low Alert', path: ['lowAlertMax'] })
    }
  })

type SettingsInput = z.input<typeof settingsSchema>
type SettingsValues = z.output<typeof settingsSchema>

const ReorderingPointsSettings = ({ initialHighAlert, initialMediumAlert, initialLowAlert, handleUrgencyRange, canSplit, setsplits, splits }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const rpSettings = useRef<HTMLDivElement | null>(null)

  useClickOutside(rpSettings, () => setOpenDatesMenu(false))

  const validation = useForm<SettingsInput, any, SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      highAlertMax: initialHighAlert,
      mediumAlertMax: initialMediumAlert,
      lowAlertMax: initialLowAlert,
    },
  })

  const onSubmit = async (values: SettingsValues) => {
    setOpenDatesMenu(false)
    handleUrgencyRange(values.highAlertMax, values.mediumAlertMax, values.lowAlertMax)
  }

  const handleIsSplitting = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setsplits((prev: any) => ({ ...prev, isSplitting: true }))
    } else {
      setsplits((prev: any) => ({ ...prev, isSplitting: false }))
    }
  }

  const handleSplitsQty = (e: React.ChangeEvent<HTMLInputElement>) => {
    const splitsQty = parseInt(e.target.value)
    if (splitsQty <= 1 || isNaN(splitsQty)) {
      setsplits({ isSplitting: false, splitsQty: parseInt(e.target.value) })
      return
    }
    if (splitsQty > 3) {
      setsplits((prev: any) => ({ ...prev, splitsQty: 3 }))
      return
    }
    setsplits({ isSplitting: true, splitsQty: parseInt(e.target.value) })
  }

  const values = validation.watch()
  const { errors, touchedFields } = validation.formState

  return (
    <div ref={rpSettings} className='relative inline-block'>
      <ShadcnButton variant='light' onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-cog text-[19.5px] m-0 p-0 text-primary' />
        <ChevronDownIcon className='size-3' />
      </ShadcnButton>
      <div
        className={
          'absolute z-10 mt-1 rounded-md border border-[#E1E3E5] bg-white py-1 shadow px-2 pt-4 pb-1 ' + (openDatesMenu ? 'block' : 'hidden')
        }
        style={{ minWidth: '300px' }}>
        {canSplit && (
          <div className='mb-4 px-2'>
            <p className='text-[13px] m-0 p-0 font-semibold'>Splits</p>
            <p className='text-[11.2px] m-0 p-0 text-muted-foreground font-light'>
              Splits are used to split the Purchase Order Quantities in different PDFs. This is usefull when you want to send the Purchase Order Quantities to different Locations.
              Only One Puchase order is created. <span className='font-semibold'>Max. 3 Splits.</span>
            </p>
            <div className='mt-2 grid justify-between items-center gap-2' style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className='flex flex-row justify-start items-start'>
                <Label className='mb-2'>Split Order</Label>
                <Switch disabled={!canSplit} id='showOnlyOverdue' name='showOnlyOverdue' checked={splits.isSplitting} onChange={(e) => handleIsSplitting(e)} />
              </div>
              <InputGroup size='sm'>
                <Input
                  type='number'
                  disabled={!canSplit}
                  className='text-xs m-0'
                  style={{ padding: '0.2rem 0.9rem' }}
                  placeholder='Splits'
                  id='splitsMax'
                  name='splitsMax'
                  min={2}
                  max={3}
                  onChange={(e) => handleSplitsQty(e)}
                  value={splits.splitsQty}
                />
                <InputGroupText className='text-[11.2px] py-0'>Splits</InputGroupText>
              </InputGroup>
            </div>
          </div>
        )}
        <div className='flex flex-col justify-start px-2'>
          <p className='text-[13px] m-0 p-0 font-semibold'>Urgency Time Range</p>
          <p className='text-[11.2px] m-0 p-0 text-muted-foreground font-light'>
            A product&apos;s urgency depends on how many days of stock remain after lead time. The remaining days to place an order to avoid being out of stock during lead time.
          </p>
          <p className='text-[11.2px] m-0 p-0 text-muted-foreground font-light'></p>
          <form className='my-2' onSubmit={validation.handleSubmit(onSubmit)}>
            <div className='px-3 w-full mb-1'>
              <Label htmlFor='highAlertMax' className='mb-2'>
                <i className={'mdi mdi-alert-octagon text-destructive text-[16.25px]'} /> High Alert
              </Label>
              <div className='flex flex-row justify-between items-center gap-2'>
                <InputGroup size='sm'>
                  <Input
                    type='number'
                    disabled
                    className='text-xs m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Min'
                    id='highAlertMin'
                    name='highAlertMin'
                    value={0}
                  />
                  <InputGroupText className='text-[11.2px] py-0'>Days</InputGroupText>
                </InputGroup>
                <span>-</span>
                <InputGroup size='sm'>
                  <Input
                    type='number'
                    className='text-xs m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Max'
                    id='highAlertMax'
                    min={0}
                    aria-invalid={Boolean(touchedFields.highAlertMax && errors.highAlertMax) || undefined}
                    {...validation.register('highAlertMax')}
                  />
                  <InputGroupText className='text-[11.2px] py-0'>Days</InputGroupText>
                </InputGroup>
              </div>
              {touchedFields.highAlertMax && errors.highAlertMax ? <p className='m-0 p-0 text-right text-danger text-[11.2px]'>{errors.highAlertMax.message}</p> : null}
            </div>
            <div className='px-3 w-full mb-1'>
              <Label htmlFor='mediumAlertMin' className='mb-2'>
                <i className={'mdi mdi-alert-octagon text-warning text-[16.25px]'} /> Medium Alert
              </Label>
              <div className='flex flex-row justify-between items-center gap-2'>
                <InputGroup size='sm'>
                  <Input
                    type='number'
                    disabled
                    className='text-[13px] m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Min'
                    id='mediumAlertMin'
                    name='mediumAlertMin'
                    min={0}
                    value={Number(values.highAlertMax ?? 0) + 1 || ''}
                  />
                  <InputGroupText className='text-[11.2px] py-0'>Days</InputGroupText>
                </InputGroup>
                <span>-</span>
                <InputGroup size='sm'>
                  <Input
                    type='number'
                    className='text-xs m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Max'
                    id='mediumAlertMax'
                    min={0}
                    aria-invalid={Boolean(touchedFields.mediumAlertMax && errors.mediumAlertMax) || undefined}
                    {...validation.register('mediumAlertMax')}
                  />
                  <InputGroupText className='text-[11.2px] py-0'>Days</InputGroupText>
                </InputGroup>
              </div>
              {touchedFields.mediumAlertMax && errors.mediumAlertMax ? <p className='m-0 p-0 text-right text-danger text-[11.2px]'>{errors.mediumAlertMax.message}</p> : null}
            </div>
            <div className='px-3 w-full mb-1'>
              <Label htmlFor='lowAlertMin' className='mb-2'>
                <i className={'mdi mdi-alert-octagon text-info text-[16.25px]'} /> Low Alert
              </Label>
              <div className='flex flex-row justify-between items-center gap-2'>
                <InputGroup size='sm'>
                  <Input
                    type='number'
                    disabled
                    className='text-[13px] m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Min'
                    id='lowAlertMin'
                    name='lowAlertMin'
                    min={0}
                    value={Number(values.mediumAlertMax ?? 0) + 1 || ''}
                  />
                  <InputGroupText className='text-[11.2px] py-0'>Days</InputGroupText>
                </InputGroup>
                <span>-</span>
                <InputGroup size='sm'>
                  <Input
                    type='number'
                    className='text-xs m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Max'
                    id='lowAlertMax'
                    min={0}
                    aria-invalid={Boolean(touchedFields.lowAlertMax && errors.lowAlertMax) || undefined}
                    {...validation.register('lowAlertMax')}
                  />
                  <InputGroupText className='text-[11.2px] py-0'>Days</InputGroupText>
                </InputGroup>
              </div>
              {touchedFields.lowAlertMax && errors.lowAlertMax ? <p className='m-0 p-0 text-right text-danger text-[11.2px]'>{errors.lowAlertMax.message}</p> : null}
            </div>
            <div className='px-3 w-full mb-1'>
              <Label htmlFor='noAlertMin' className='mb-2'>
                <i className={'mdi mdi-alert-octagon text-success text-[16.25px]'} /> No Alert
              </Label>
              <div className='flex flex-row justify-between items-center gap-2'>
                <InputGroup size='sm'>
                  <Input
                    type='number'
                    disabled
                    className='text-[13px] m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Min'
                    id='noAlertMin'
                    name='noAlertMin'
                    min={0}
                    value={Number(values.lowAlertMax ?? 0) + 1 || ''}
                  />
                  <InputGroupText className='text-[11.2px] py-0'>Days</InputGroupText>
                </InputGroup>
                <span>-</span>
                <InputGroup size='sm'>
                  <Input
                    type='text'
                    disabled
                    className='text-xs m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Max'
                    id='noAlertMax'
                    name='noAlertMax'
                    value={'∞'}
                  />
                  <InputGroupText className='text-[11.2px] py-0'>Days</InputGroupText>
                </InputGroup>
              </div>
            </div>
            <div className='px-3 w-full mt-4'>
              <div className='flex flex-row justify-end items-center gap-4'>
                <ShadcnButton type='submit' className='text-[11.2px]' size='sm'>
                  Apply Urgency
                </ShadcnButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReorderingPointsSettings
