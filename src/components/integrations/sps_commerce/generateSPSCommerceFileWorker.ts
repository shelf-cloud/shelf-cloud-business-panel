import { type SPSCommerceBusinessInfo, type SPSCommerceItem } from '@hooks/integrations/useSPSCommerceIntegrations'
import ExcelJS from 'exceljs'
import moment from 'moment'

self.onmessage = async (e) => {
  const { integrationInfo, items, warehouseId }: { integrationInfo: SPSCommerceBusinessInfo; items: SPSCommerceItem[]; warehouseId: string } = e.data

  try {
    const currentDate = moment().format('YYYYMMDD')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    worksheet.addRow('')
    worksheet.addRow(['', 'Fields in BOLD TYPE are required. Hover mouse over a column head to see a description of the column contents.'])
    worksheet.addRow(['H', '', '', '', '', '', '', 'I', 'I', 'I', '', 'I', '', '', 'I', '']).hidden = true
    worksheet.addRow(['1', '=+#REF!+1', '4', '', '', '', '', '=+#REF!+1', '=+#REF!+1', '=+#REF!+1', '', '=+#REF!+1', '', '', '=+#REF!+1', '']).hidden = true
    worksheet.addRow([
      'CATALOG ID',
      'INVENTORY REFERENCE #',
      'VENDOR NUMBER',
      'REPORTING LOCATION NAME',
      'REPORTING LOCATION NUMBER',
      'VENDOR PART NUMBER',
      'BUYER PART NUMBER',
      'UPC ',
      'PRODUCT DESCRIPTION',
      'QUANTITY AVAILABLE FOR SALE',
      'QUANTITY AVAILABLE FOR SALE UOM',
      'AVAILABLE TO SHIP DATE',
      'ON-ORDER QUANTITY ',
      'ON-ORDER QUANTITY UOM',
      'ON-ORDER QUANTITY AVAILABLE TO SHIP DATE',
      'UPC QUALIFIER',
    ])

    worksheet.getCell('H3').font = { bold: true }
    worksheet.getCell('I3').font = { bold: true }

    worksheet.getCell('A4').font = { bold: true }
    worksheet.getCell('C4').font = { bold: true }
    worksheet.getCell('H4').font = { bold: true }
    worksheet.getCell('I4').font = { bold: true }

    worksheet.getCell('B5').font = { bold: true }
    worksheet.getCell('C5').font = { bold: true }
    worksheet.getCell('D5').font = { bold: true }
    worksheet.getCell('F5').font = { bold: true }
    worksheet.getCell('G5').font = { bold: true }
    worksheet.getCell('I5').font = { bold: true }
    worksheet.getCell('J5').font = { bold: true }
    worksheet.getCell('K5').font = { bold: true }
    worksheet.getCell('L5').font = { bold: true }

    worksheet.columns = [
      { hidden: true, width: 15.72 },
      { width: 31.53 },
      { width: 20.72 },
      { width: 26.17 },
      { width: 20.72 },
      { width: 24.44 },
      { width: 23.26 },
      { width: 20.72 },
      { width: 47.81 },
      { width: 20.72 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 17.72 },
      { width: 9.17 },
    ]

    items.forEach((item) => {
      worksheet.addRow([
        '',
        currentDate,
        integrationInfo['VENDOR NUMBER'],
        integrationInfo.locations[warehouseId]['REPORTING LOCATION NAME'],
        integrationInfo.locations[warehouseId]['REPORTING LOCATION NUMBER'],
        item.sku,
        item.integrationSku,
        item.barcode,
        item.title,
        item.quantity[warehouseId] || 0,
        integrationInfo['QUANTITY AVAILABLE FOR SALE UOM'],
        currentDate,
        '',
        '',
        '',
        '',
      ])
    })

    const worksheetExtra = workbook.addWorksheet('UOM')

    const uomData = [
      'List of Acceptable UOMs:',
      'BA:Bale',
      'BB:Base Box',
      'BC:Bucket',
      'BD:Bundle',
      'BG:Bag',
      'BJ:Band',
      'BK:Book',
      'BL:Block',
      'BM:Bolt',
      'BN:Bulk',
      'BO:Bottle',
      'BR:Barrel',
      'BT:Belt',
      'BX:Box',
      'CA:Case',
      'CH:Container',
      'CN:Can',
      'CO:Cubic Meter (Net)(Uncertified RSX qual)',
      'CR:Cubic Meter',
      'CS:Cassette',
      'CT:Carton',
      'CU:Cup',
      'DL:Deciliter',
      'DP:Dozen Pair',
      'DZ:Dozen',
      'EA:Each',
      'GA:Gallon',
      'GL:Grams per Liter',
      'JR:Jar',
      'JU:Jug',
      'KI:Kilograms/Millimeter Width (Uncertified RSX qual)',
      'KT:Kit',
      'LB:Pound',
      'LT:Liter',
      'OZ:Ounce Av',
      'P3:Three Pack',
      'P4:Four Pack',
      'P5:Five Pack',
      'P6:Six Pack',
      'P8: Eight Pack',
      'PA:Pail',
      'PC:Piece',
      'PD:Pad',
      'PG:Pounds Gross (Uncertified RSX qual)',
      'PH:Pack[Pak]',
      'PK:Package',
      'PR:Pair',
      'QT:Quart',
      'RA:Rack',
      'RL:Roll',
      'RO:Round (Uncertified RSX qual)',
      'SE:Section (Uncertified RSX qual)',
      'SH:Sheet',
      'SJ:Sack',
      'SL:Sleeve',
      'SM:Square Meter',
      'SN:Square Rod (Uncertified RSX qual)',
      'SP:Shelf Package',
      'ST:Set',
      'TB:Tube',
      'TP:Ten Pack',
      'TR:Ten Square Feet',
      'TU:Thousand Yards[Linear]',
      'UN:Unit',
      'YD:Yard',
    ]

    uomData.forEach((uom) => {
      worksheetExtra.addRow([uom])
    })

    const buffer = await workbook.xlsx.writeBuffer()
    self.postMessage({ buffer, error: null })
  } catch (error) {
    self.postMessage({ buffer: null, error: error instanceof Error ? error.message : String(error) })
  }
}
