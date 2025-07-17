/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'

import MultiSkusPerBox from '@assets/images/multi-sku-per-box.png'
import OneBoxAllSkus from '@assets/images/one-box-all-skus.png'
import SingleSkuPerBox from '@assets/images/single-sku-per-box.png'
import { AddSKUToMultiSKUBoxType, FinalBoxConfiguration, MultiSkuBoxes, SingleSkuBoxes } from '@hooks/receivings/useEditReceivingsBoxes'
import { ShipmentOrderItem } from '@typings'
import { Button, Col, Label, Row } from 'reactstrap'

import Current_Box_Configuration from './Current_Box_Configuration'
import Edit_Receiving_Boxes_Box from './Edit_Receiving_Boxes_Box'
import Edit_Receiving_Boxes_Multi from './Edit_Receiving_Boxes_Multi'
import Edit_Receiving_Boxes_Single from './Edit_Receiving_Boxes_Single'

type Props = {
  orderItems: ShipmentOrderItem[]
  packingConfiguration: string
  boxes: FinalBoxConfiguration[]
  needsNewBoxConfiguration: boolean
  setPackingConfiguration: (field: string, value: string) => void
  singleSkuPackages: SingleSkuBoxes
  addNewSingleSkuBoxConfiguration: (poId: string, sku: string) => void
  removeSingleSkuBoxConfiguration: (poId: string, sku: string, index: number) => void
  changeUnitsPerBox: (poId: string, sku: string, index: number, value: number) => void
  changeQtyOfBoxes: (poId: string, sku: string, index: number, value: number) => void
  multiSkuPackages: MultiSkuBoxes[]
  addNewMultiSkuBoxConfiguration: () => void
  removeMultiSkuBoxConfiguration: (index: number) => void
  addSkuToMultiSkuBox: (info: AddSKUToMultiSKUBoxType) => void
  removeSkuFromMultiSkuBox: (index: number, sku: string) => void
  setMixedSkuBoxesUsingMasterBoxes: () => void
  clearMultiSkuBoxes: () => void
}

const Edit_Receiving_Packages_Tab = ({
  orderItems,
  packingConfiguration,
  boxes,
  needsNewBoxConfiguration,
  setPackingConfiguration,
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
}: Props) => {
  return (
    <div>
      <Row className='mb-3'>
        <Label htmlFor='firstNameinput' className='form-label fs-7'>
          *Select Box Distribution
        </Label>
        <Col xs={12} className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-2'>
          <Button
            disabled={needsNewBoxConfiguration}
            className='fs-7'
            size='sm'
            type='button'
            color='primary'
            outline={packingConfiguration !== 'current'}
            onClick={() => setPackingConfiguration('packingConfiguration', 'current')}>
            <Image src={MultiSkusPerBox} alt='Multi SKUs Per Box' width={30} height={30} className='me-2' />
            Current Boxes
          </Button>
          <Button
            className='fs-7'
            size='sm'
            type='button'
            color='primary'
            outline={packingConfiguration !== 'single'}
            onClick={() => setPackingConfiguration('packingConfiguration', 'single')}>
            <Image src={SingleSkuPerBox} alt='Single SKU Per Box' width={30} height={30} className='me-2' />
            Single SKU Per Box
          </Button>
          <Button
            className='fs-7'
            size='sm'
            type='button'
            color='primary'
            outline={packingConfiguration !== 'multi'}
            onClick={() => setPackingConfiguration('packingConfiguration', 'multi')}>
            <Image src={MultiSkusPerBox} alt='Multi SKUs Per Box' width={30} height={30} className='me-2' />
            Mixed SKUs
          </Button>
          <Button
            className='fs-7'
            size='sm'
            type='button'
            color='primary'
            outline={packingConfiguration !== 'box'}
            onClick={() => setPackingConfiguration('packingConfiguration', 'box')}>
            <Image src={OneBoxAllSkus} alt='One Box All SKUs' width={30} height={30} className='me-2' />
            Everything in One Box
          </Button>
        </Col>
      </Row>
      {packingConfiguration === 'current' && <Current_Box_Configuration boxes={boxes || []} />}
      {packingConfiguration === 'single' && (
        <Edit_Receiving_Boxes_Single
          singleSkuPackages={singleSkuPackages}
          addNewSingleSkuBoxConfiguration={addNewSingleSkuBoxConfiguration}
          removeSingleSkuBoxConfiguration={removeSingleSkuBoxConfiguration}
          changeUnitsPerBox={changeUnitsPerBox}
          changeQtyOfBoxes={changeQtyOfBoxes}
        />
      )}
      {packingConfiguration === 'multi' && (
        <Edit_Receiving_Boxes_Multi
          orderItems={orderItems}
          multiSkuPackages={multiSkuPackages}
          addNewMultiSkuBoxConfiguration={addNewMultiSkuBoxConfiguration}
          removeMultiSkuBoxConfiguration={removeMultiSkuBoxConfiguration}
          addSkuToMultiSkuBox={addSkuToMultiSkuBox}
          removeSkuFromMultiSkuBox={removeSkuFromMultiSkuBox}
          setMixedSkuBoxesUsingMasterBoxes={setMixedSkuBoxesUsingMasterBoxes}
          clearMultiSkuBoxes={clearMultiSkuBoxes}
        />
      )}
      {packingConfiguration === 'box' && <Edit_Receiving_Boxes_Box orderItems={orderItems} />}
    </div>
  )
}

export default Edit_Receiving_Packages_Tab
