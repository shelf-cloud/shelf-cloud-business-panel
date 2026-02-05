 
import Image from 'next/image'

import MultiSkusPerBox from '@assets/images/multi-sku-per-box.png'
import OneBoxAllSkus from '@assets/images/one-box-all-skus.png'
import SingleSkuPerBox from '@assets/images/single-sku-per-box.png'
import { ManualAddSKUToMultiSKUBoxType, ManualMultiSkuBoxes, ManualSingleSkuBoxes } from '@hooks/receivings/useCreateManualReceivingsBoxes'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { Button, Col, Label, Row } from 'reactstrap'

import Create_Manual_Receiving_Boxes_Box from './Create_Manual_Receiving_Boxes_Box'
import Create_Manual_Receiving_Boxes_Multi from './Create_Manual_Receiving_Boxes_Multi'
import Create_Manual_Receiving_Boxes_Single from './Create_Manual_Receiving_Boxes_Single'

type Props = {
  orderProducts: ReceivingInventory[]
  packingConfiguration: string
  setPackingConfiguration: (field: string, value: string) => void
  singleSkuPackages: ManualSingleSkuBoxes
  addNewSingleSkuBoxConfiguration: (sku: string) => void
  removeSingleSkuBoxConfiguration: (sku: string, index: number) => void
  changeUnitsPerBox: (sku: string, index: number, value: number) => void
  changeQtyOfBoxes: (sku: string, index: number, value: number) => void
  multiSkuPackages: ManualMultiSkuBoxes[]
  addNewMultiSkuBoxConfiguration: () => void
  removeMultiSkuBoxConfiguration: (index: number) => void
  addSkuToMultiSkuBox: (info: ManualAddSKUToMultiSKUBoxType) => void
  removeSkuFromMultiSkuBox: (index: number, sku: string) => void
  setMixedSkuBoxesUsingMasterBoxes: () => void
  clearMultiSkuBoxes: () => void
}

const Create_Manual_Receiving_Packages_Tab = ({
  orderProducts,
  packingConfiguration,
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
      {packingConfiguration === 'single' && (
        <Create_Manual_Receiving_Boxes_Single
          singleSkuPackages={singleSkuPackages}
          addNewSingleSkuBoxConfiguration={addNewSingleSkuBoxConfiguration}
          removeSingleSkuBoxConfiguration={removeSingleSkuBoxConfiguration}
          changeUnitsPerBox={changeUnitsPerBox}
          changeQtyOfBoxes={changeQtyOfBoxes}
        />
      )}
      {packingConfiguration === 'multi' && (
        <Create_Manual_Receiving_Boxes_Multi
          orderProducts={orderProducts}
          multiSkuPackages={multiSkuPackages}
          addNewMultiSkuBoxConfiguration={addNewMultiSkuBoxConfiguration}
          removeMultiSkuBoxConfiguration={removeMultiSkuBoxConfiguration}
          addSkuToMultiSkuBox={addSkuToMultiSkuBox}
          removeSkuFromMultiSkuBox={removeSkuFromMultiSkuBox}
          setMixedSkuBoxesUsingMasterBoxes={setMixedSkuBoxesUsingMasterBoxes}
          clearMultiSkuBoxes={clearMultiSkuBoxes}
        />
      )}
      {packingConfiguration === 'box' && <Create_Manual_Receiving_Boxes_Box orderProducts={orderProducts} />}
    </div>
  )
}

export default Create_Manual_Receiving_Packages_Tab
