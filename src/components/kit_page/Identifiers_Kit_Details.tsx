import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { Identifier } from '@typings'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { NativeSelect } from '@shadcn/ui/native-select'
import { useSWRConfig } from 'swr'
import { z } from 'zod'

type Props = {
  inventoryId?: number
  sku?: string
  upc?: string
  asin?: string
  fnsku?: string
  identifiers: Identifier[]
}

const IDENTIFIERS_TYPES = {
  '': { value: '', label: 'Select Type', options: { modified: true, delete: true } },
  EAN: { value: 'EAN', label: 'EAN', options: { modified: true, delete: true } },
  Barcode: { value: 'Barcode', label: 'Barcode', options: { modified: true, delete: true } },
  WalmartCode: { value: 'WalmartCode', label: 'Walmart Code', options: { modified: true, delete: true } },
  Other: { value: 'Other', label: 'Other', options: { modified: true, delete: true } },
  FBA: { value: 'FBA', label: 'FBA', options: { modified: false, delete: false } },
}

const identifierSchema = z.object({
  type: z.string().min(1, 'Select Type'),
  value: z
    .string()
    .regex(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
    .min(1, 'Insert Value'),
})

const Identifiers_Kit_Details = ({ inventoryId, sku, upc, asin, fnsku, identifiers }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)

  const schema = z.object({
    inventoryId: z.number().optional(),
    sku: z.string().optional(),
    asin: z
      .union([
        z.literal(''),
        z
          .string()
          .regex(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
          .max(50, 'Asin is to Long'),
      ])
      .optional(),
    fnsku: z
      .union([
        z.literal(''),
        z
          .string()
          .regex(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
          .max(50, 'FNSKU is to Long'),
      ])
      .optional(),
    identifiers: z.array(identifierSchema),
  })

  const initialValues = {
    inventoryId,
    sku,
    asin,
    fnsku,
    identifiers: identifiers.length > 0 ? identifiers : [],
  }

  const validation = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  const { fields, remove, append } = useFieldArray({ control: validation.control, name: 'identifiers' })

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    const response = await axios.post(`/api/productDetails/identifiersProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
      setShowEditFields(false)
    } else {
      toast.error(response.data.msg)
    }
  }
  // const handleShowEditFields = () => {
  //   setShowEditFields(true)
  // }
  return (
    <div className='py-1 w-3/4'>
      {!showEditFields ? (
        <div className='flex flex-row justify-start items-start gap-4'>
          <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
            <thead>
              <tr>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {upc && (
                <tr>
                  <td>UPC</td>
                  <td>{upc}</td>
                </tr>
              )}
              {asin && (
                <tr>
                  <td>ASIN</td>
                  <td>{asin}</td>
                </tr>
              )}
              {fnsku && (
                <tr>
                  <td>FNSKU</td>
                  <td>{fnsku}</td>
                </tr>
              )}
              {identifiers.length > 0 &&
                identifiers.map((identifier) => (
                  <tr key={identifier.value}>
                    <td>{identifier.type}</td>
                    <td>{identifier.value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className='text-right'>{/* <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i> */}</div>
        </div>
      ) : (
        <form onSubmit={validation.handleSubmit(handleSubmit)}>
          <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
            <thead>
              <tr className='text-center'>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              <tr>
                <td className='align-middle'>UPC</td>
                <td>
                  <div className='createOrder_inputs'>
                    <Input
                      disabled
                      type='text'
                      className='text-[13px] h-8 text-xs'
                      style={{ padding: '0.2rem 0.9rem' }}
                      placeholder='Upc...'
                      id='upc'
                      name='upc'
                      value={upc || ''}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className='text-muted-foreground align-middle text-nowrap'>Additional Identifiers</td>
                <td></td>
                <td className='align-middle'>
                  <div className='flex flex-row flex-nowrap justify-center items-center mb-0 h-full'>
                    <i className='text-[26px] text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => append({ type: '', value: '' })} />
                  </div>
                </td>
              </tr>
              <tr>
                <td className='align-middle'>ASIN</td>
                <td>
                  <div className='createOrder_inputs'>
                    <Input
                      type='text'
                      className='text-[13px] h-8 text-xs'
                      style={{ padding: '0.2rem 0.9rem' }}
                      placeholder='Asin...'
                      id='asin'
                      aria-invalid={(validation.formState.touchedFields.asin && validation.formState.errors.asin ? true : false) || undefined}
                      {...validation.register('asin')}
                    />
                    {validation.formState.touchedFields.asin && validation.formState.errors.asin ? (
                      <div className='text-sm text-destructive'>{validation.formState.errors.asin.message}</div>
                    ) : null}
                  </div>
                </td>
              </tr>
              <tr>
                <td className='align-middle'>FNSKU</td>
                <td>
                  <div className='createOrder_inputs'>
                    <Input
                      type='text'
                      className='text-[13px] h-8 text-xs'
                      style={{ padding: '0.2rem 0.9rem' }}
                      placeholder='FNSKU...'
                      id='fnsku'
                      aria-invalid={(validation.formState.touchedFields.fnsku && validation.formState.errors.fnsku ? true : false) || undefined}
                      {...validation.register('fnsku')}
                    />
                    {validation.formState.touchedFields.fnsku && validation.formState.errors.fnsku ? (
                      <div className='text-sm text-destructive'>{validation.formState.errors.fnsku.message}</div>
                    ) : null}
                  </div>
                </td>
              </tr>
              {fields.map((field, index) => {
                const currentType = validation.watch(`identifiers.${index}.type`)
                const typeMeta = validation.formState.errors.identifiers?.[index]?.type
                const typeTouched = validation.formState.touchedFields.identifiers?.[index]?.type
                const valueMeta = validation.formState.errors.identifiers?.[index]?.value
                const valueTouched = validation.formState.touchedFields.identifiers?.[index]?.value
                return (
                  <tr key={field.id}>
                    <td>
                      <div className='createOrder_inputs'>
                        <NativeSelect
                          disabled={!IDENTIFIERS_TYPES[currentType as keyof typeof IDENTIFIERS_TYPES]?.options.modified}
                          className='text-center align-middle text-[13px] h-8'
                          style={{
                            padding: '0.2rem 0.9rem',
                          }}
                          size='sm'
                          aria-invalid={(typeTouched && typeMeta ? true : false) || undefined}
                          {...validation.register(`identifiers.${index}.type`)}>
                          {Object.entries(IDENTIFIERS_TYPES).map(([_type, option]) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </NativeSelect>
                        {typeTouched && typeMeta ? <div className='text-sm text-destructive'>{typeMeta.message}</div> : null}
                      </div>
                    </td>
                    <td>
                      <div className='createOrder_inputs'>
                        <Input
                          type='text'
                          className='align-middle text-[13px] h-8 text-xs'
                          disabled={!IDENTIFIERS_TYPES[currentType as keyof typeof IDENTIFIERS_TYPES]?.options.modified}
                          style={{
                            padding: '0.2rem 0.9rem',
                          }}
                          placeholder='Value...'
                          aria-invalid={(valueTouched && valueMeta ? true : false) || undefined}
                          {...validation.register(`identifiers.${index}.value`)}
                        />
                        {valueTouched && valueMeta ? <div className='text-sm text-destructive'>{valueMeta.message}</div> : null}
                      </div>
                    </td>
                    <td className='align-middle'>
                      <div className='flex flex-row flex-nowrap justify-center gap-2 items-center mb-0 h-full'>
                        {IDENTIFIERS_TYPES[currentType as keyof typeof IDENTIFIERS_TYPES]?.options.delete && (
                          <i className='align-middle text-danger text-[26px] las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className='px-3 w-full'>
            <div className='flex flex-row justify-end items-center gap-3'>
              <Button type='button' variant='light' onClick={() => setShowEditFields(false)}>
                Cancel
              </Button>
              <Button type='submit'>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default Identifiers_Kit_Details
