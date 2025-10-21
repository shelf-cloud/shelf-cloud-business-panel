import { useContext, useState } from 'react'

import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import InputNumberForm from '@components/ui/forms/InputNumberForm'
import AppContext from '@context/AppContext'
import { AddSKUToMultiSKUBoxType, MultiSkuBoxes } from '@hooks/receivings/useReceivingsBoxes'
import { NoImageAdress } from '@lib/assetsConstants'
import { Badge, Button, Col, Collapse, Label, Row } from 'reactstrap'

/* eslint-disable @next/next/no-img-element */
type Props = {
  multiSkuPackages: MultiSkuBoxes[]
  addNewMultiSkuBoxConfiguration: () => void
  removeMultiSkuBoxConfiguration: (index: number) => void
  addSkuToMultiSkuBox: (info: AddSKUToMultiSKUBoxType) => void
  removeSkuFromMultiSkuBox: (index: number, sku: string) => void
  setMixedSkuBoxesUsingMasterBoxes: () => void
  clearMultiSkuBoxes: () => void
}

const Create_Receiving_Boxes_Multi = ({
  multiSkuPackages,
  setMixedSkuBoxesUsingMasterBoxes,
  addNewMultiSkuBoxConfiguration,
  removeMultiSkuBoxConfiguration,
  addSkuToMultiSkuBox,
  removeSkuFromMultiSkuBox,
  clearMultiSkuBoxes,
}: Props) => {
  const { state } = useContext(AppContext)
  const [allCollapse, setallCollapse] = useState(false)
  const [addSkuToBox, setaddSkuToBox] = useState({
    boxIndex: -1,
    poId: '',
    sku: '',
    quantity: 0,
    receiving: 0,
    name: '',
    inventoryId: 0,
    image: '',
    poNumber: '',
    boxQty: 0,
  })
  const [errorAddingSKU, seterrorAddingSKU] = useState<string | null>(null)

  const handleAddSkuToBox = () => {
    seterrorAddingSKU(null)
    const { boxIndex, sku, quantity, name, inventoryId, image, receiving, poId, poNumber, boxQty } = addSkuToBox
    if (boxIndex < 0 || !sku) {
      seterrorAddingSKU('Please select an SKU and a box.')
      return
    }

    if (quantity <= 0) {
      seterrorAddingSKU('Quantity must be greater than 0.')
      return
    }

    addSkuToMultiSkuBox({ boxIndex, sku, quantity, name, inventoryId, image, receiving, poId, poNumber, boxQty })
    setaddSkuToBox({
      boxIndex: -1,
      poId: '',
      sku: '',
      quantity: 0,
      receiving: 0,
      name: '',
      inventoryId: 0,
      image: '',
      poNumber: '',
      boxQty: 0,
    })
  }

  const toggleCollapse = () => {
    const collapseElements = document.querySelectorAll('.collapse-content')
    collapseElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.classList.toggle('show', !allCollapse)
      }
    })
    setallCollapse(!allCollapse)
  }

  return (
    <Row key='mixed-skus'>
      <Col md={4}>
        <div className='d-flex flex-row justify-content-between align-items-center gap-3 mb-2'>
          <p className='m-0 fw-bold fs-5'>Receiving SKUs</p>
          <Button size='sm' color='primary' onClick={() => setMixedSkuBoxesUsingMasterBoxes()} className='fs-6'>
            Prefill Boxes
          </Button>
        </div>
        <div className='fs-7 d-flex flex-column gap-2 py-2'>
          {Object.entries(state.receivingFromPo.items)
            .sort(([_poIdA, inventoryIdA], [_poIdB, inventoryIdB]) => {
              const supplerA = Object.values<any>(inventoryIdA)[0].suppliersName
              const supplerB = Object.values<any>(inventoryIdB)[0].suppliersName
              if (supplerA < supplerB) {
                return -1
              }
              if (supplerA > supplerB) {
                return 1
              }
              return 0
            })
            .map(([poId, inventoryId]) =>
              Object.entries(inventoryId).map(([inventoryId, item]) => {
                const alreadyBoxed = multiSkuPackages.reduce((acc, box) => {
                  if (!box[item.sku]) return acc
                  return acc + box[item.sku].quantity
                }, 0)

                const pendingToBoxed = item.receivingQty - alreadyBoxed
                return (
                  <div key={`${poId}-${inventoryId}`} className='d-flex flex-row justify-content-between align-items-center gap-3 border rounded py-2 px-2'>
                    <div className='text-center'>
                      <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '40px',
                            height: '50px',
                            margin: '0px',
                            position: 'relative',
                          }}>
                          <img
                            loading='lazy'
                            src={item.image ? item.image : NoImageAdress}
                            alt='product Image'
                            style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                          />
                        </div>
                        <div className='text-start'>
                          <p className='text-nowrap m-0 fw-semibold'>{item.sku}</p>
                          <p className='text-nowrap m-0 text-muted'>PO: {item.orderNumber}</p>
                          <p className='text-nowrap m-0'>Receiving: {item.receivingQty}</p>
                        </div>
                      </div>
                    </div>
                    <Badge
                      color={pendingToBoxed > 0 ? 'light' : pendingToBoxed < 0 ? 'danger' : 'success'}
                      className={'text-center fs-7 ' + (pendingToBoxed > 0 ? 'text-muted' : pendingToBoxed < 0 ? 'text-white' : 'text-white')}>
                      {pendingToBoxed}
                    </Badge>
                  </div>
                )
              })
            )}
        </div>
      </Col>
      <Col md={8}>
        <div className='mb-2 border-bottom pb-1'>
          <Row>
            <p className='m-0 fw-bold fs-5'>Add SKU to Box</p>
          </Row>
          {/* ADD SKU TO BOX */}
          <Row className='d-flex flex-row justify-content-around align-items-end gap-0'>
            <Col md={4}>
              <SelectSingleFilter
                inputLabel='*Select SKU'
                inputName='select-sku-add-multi-sku'
                placeholder='Choose SKU'
                selected={(() => {
                  const item = state.receivingFromPo.items[addSkuToBox.poId]?.[addSkuToBox.inventoryId]
                  return item ? { value: item.inventoryId, label: item.sku, description: `PO: ${item.orderNumber} // ${addSkuToBox.poId}` } : { value: '', label: 'Choose SKU...' }
                })()}
                options={(() => {
                  const skuList = [] as any[]
                  Object.entries(state.receivingFromPo.items)
                    .sort(([_poIdA, inventoryIdA], [_poIdB, inventoryIdB]) => {
                      const supplerA = Object.values<any>(inventoryIdA)[0].suppliersName
                      const supplerB = Object.values<any>(inventoryIdB)[0].suppliersName
                      if (supplerA < supplerB) {
                        return -1
                      }
                      if (supplerA > supplerB) {
                        return 1
                      }
                      return 0
                    })
                    .forEach(([poId, inventoryId]) =>
                      Object.entries(inventoryId).forEach(([inventoryId, item]) => {
                        const alreadyBoxed = multiSkuPackages.reduce((acc, box) => {
                          if (!box[item.sku]) return acc
                          return acc + box[item.sku].quantity
                        }, 0)
                        const pendingToBoxed = item.receivingQty - alreadyBoxed
                        if (pendingToBoxed <= 0) return null // Skip already boxed items
                        skuList.push({
                          value: inventoryId,
                          label: item.sku,
                          description: `PO: ${item.orderNumber} // ${poId}`,
                        })
                      })
                    )

                  return skuList
                })()}
                handleSelect={(option: SelectSingleValueType) => {
                  const poId = option?.description?.split(' // ')[1]
                  const item = state.receivingFromPo.items[poId!][option!.value]
                  setaddSkuToBox((prev) => ({
                    ...prev,
                    poId: poId!,
                    sku: item.sku,
                    name: item.title,
                    receiving: item.receivingQty,
                    inventoryId: item.inventoryId,
                    image: item.image,
                    poNumber: item.orderNumber,
                    boxQty: item.boxQty,
                  }))
                }}
              />
            </Col>
            <Col md={4}>
              <SelectSingleFilter
                inputLabel='*Select Box'
                inputName='select-box-add-multi-sku'
                placeholder='Choose Box'
                selected={
                  multiSkuPackages
                    .map((_box, index) => {
                      return { value: index, label: `Box ${index + 1}` }
                    })
                    .find((_, index) => index === addSkuToBox.boxIndex) || { value: '', label: 'Choose Box...' }
                }
                options={[
                  { value: '', label: 'Choose Box...' },
                  ...multiSkuPackages.map((_box, index) => {
                    return { value: index, label: `Box ${index + 1}` }
                  }),
                ]}
                handleSelect={(option: SelectSingleValueType) => {
                  setaddSkuToBox((prev) => ({
                    ...prev,
                    boxIndex: option!.value as number,
                  }))
                }}
              />
            </Col>
            <Col md={2} className='mb-2'>
              <Label htmlFor={`add-sku-to-box-quantity`} className='form-label fs-7'>
                *Quantity
              </Label>
              <InputNumberForm
                inputName={`add-sku-to-box-quantity`}
                value={addSkuToBox.quantity}
                isInvalid={false}
                placeholder='Quantity'
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => setaddSkuToBox((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                handleBlur={() => {}}
              />
            </Col>
            <Col md={2} className='mb-2 d-flex flex-row justify-content-end align-items-end'>
              <Button size='sm' color='primary' onClick={() => handleAddSkuToBox()} className='fs-6'>
                Add To Box
              </Button>
            </Col>
          </Row>
          {errorAddingSKU && <p className='m-0 text-danger fs-7'>{errorAddingSKU}</p>}
        </div>

        {/* ADD BOX */}
        <div className='d-flex flex-row flex-wrap justify-content-between align-items-center gap-3 mb-3'>
          <p className='m-0 fw-bold fs-5'>Boxes</p>

          <div className='d-flex flex-row justify-content-end align-items-center gap-2'>
            <Button size='sm' color='light' onClick={() => toggleCollapse()} className='fs-6'>
              {allCollapse ? '- Collapse All' : '+ Expand All'}
            </Button>
            <Button size='sm' color='success' onClick={() => addNewMultiSkuBoxConfiguration()} className='fs-6'>
              + Add New Box
            </Button>
            <Button size='sm' color='light' onClick={() => clearMultiSkuBoxes()} className='fs-6 d-flex flex-row justify-content-center align-items-center gap-1'>
              <i className='mdi mdi-trash-can-outline text-danger' /> All Boxes
            </Button>
          </div>
        </div>

        {/* BOXES LIST */}

        <div className='gap-2 d-flex flex-row flex-wrap justify-content-start align-items-start pb-2'>
          {multiSkuPackages.map((box, boxIndex) => (
            <Col xs={12} md={5} key={`boxed-${boxIndex}`} className='border rounded p-2 fs-7 shadow-sm bg-white'>
              <div className='d-flex flex-row justify-content-between align-items-center mb-1'>
                <div style={{ cursor: 'pointer' }} onClick={() => document.getElementById(`box-${boxIndex}-content`)?.classList.toggle('show')}>
                  <p className='m-0 fw-semibold fs-6'>Box {boxIndex + 1}</p>
                  <p className={'m-0 fs-7 ' + (Object.entries(box).length === 0 ? 'text-danger' : 'text-muted')}>
                    {Object.entries(box).length} SKUs, {Object.values(box).reduce((acc, item) => acc + item.quantity, 0)} total units
                  </p>
                </div>
                <div className='d-flex flex-row justify-content-end align-items-center gap-2'>
                  <Button size='sm' color='ghost' onClick={() => removeMultiSkuBoxConfiguration(boxIndex)} className='fs-7 btn-icon'>
                    <i className='mdi mdi-trash-can-outline fs-5' />
                  </Button>
                  <Button size='sm' color='ghost' className='fs-7 btn-icon' onClick={() => document.getElementById(`box-${boxIndex}-content`)?.classList.toggle('show')}>
                    <i className='mdi mdi-chevron-down fs-5' />
                  </Button>
                </div>
              </div>
              <Collapse isOpen={allCollapse} id={`box-${boxIndex}-content`} className='collapse-content'>
                <div className='d-flex flex-column justify-content-start align-items-start gap-1'>
                  {Object.entries(box).map(([sku, item]) => (
                    <div key={`boxed-${boxIndex}-${sku}`} className='w-100 d-flex flex-row justify-content-between align-items-center gap-3 bg-light px-3 py-1 rounded'>
                      <div className='text-start'>
                        <p className='text-nowrap m-0 fw-semibold'>{sku}</p>
                        <p className='text-nowrap m-0 text-muted'>Qty: {item.quantity}</p>
                      </div>
                      <Button size='sm' color='ghost' onClick={() => removeSkuFromMultiSkuBox(boxIndex, sku)} className='fs-7 btn-icon'>
                        <i className='mdi mdi-trash-can-outline fs-5' />
                      </Button>
                    </div>
                  ))}
                </div>
              </Collapse>
            </Col>
          ))}
        </div>
      </Col>
    </Row>
  )
}

export default Create_Receiving_Boxes_Multi
