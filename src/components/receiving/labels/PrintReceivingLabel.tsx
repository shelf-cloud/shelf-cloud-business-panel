import { FinalBoxConfiguration } from '@hooks/receivings/useReceivingsBoxes'
import { Document, Page, StyleSheet } from '@react-pdf/renderer'
import { Warehouse } from '@typesTs/warehouses/warehouse'

import SingleReceivingLabel from './SingleReceivingLabel'

export const ReceivingStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  container: {
    flex: 1,
    border: '2px solid #000000',
    position: 'relative',
    flexDirection: 'row',
  },
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: '#000000',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
    padding: 0,
  },
  verticalText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: -1.3,
    padding: 0,
    lineHeight: 1,
    transform: 'rotate(-90deg)',
  },
  mainContent: {
    marginLeft: 25,
    padding: 10,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  logoSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logo: {
    width: 40,
    height: 25,
    marginBottom: 5,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3577f1',
  },
  boxInfo: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  addressSection: {
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  addressLabel: {
    width: 50,
    fontWeight: 'bold',
  },
  addressValue: {
    fontSize: 8,
    flex: 1,
  },
  divider: {
    borderBottom: '1px solid #000000',
    marginVertical: 2,
  },
  contentsHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  contentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  skuSection: {
    flex: 1,
  },
  skuItem: {
    marginBottom: 3,
  },
  skuCode: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  skuDescription: {
    fontSize: 8,
    marginBottom: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  skuQty: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  qrSection: {
    alignItems: 'center',
    marginLeft: 20,
  },
  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  qrLabel: {
    fontSize: 6,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 25,
    right: 10,
  },
  footerRow: {
    flexDirection: 'row',
    borderTop: '1px solid #000000',
    paddingTop: 5,
  },
  footerColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  footerText: {
    fontSize: 8,
  },
  barcodeSection: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcode: {
    width: '60%',
    height: 30,
    marginTop: 10,
    backgroundColor: '#000000',
  },
})

type Props = {
  boxes: FinalBoxConfiguration[]
  warehouse: Warehouse
  companyName: string
  prefix3PL: string
  orderBarcode: string
  isManualReceiving?: boolean
}

const PrintReceivingLabel = ({ boxes, warehouse, companyName, prefix3PL, orderBarcode, isManualReceiving = false }: Props) => {
  return (
    <Document>
      {boxes.map((box, index) => {
        if (box.items.length === 0) return null // Skip empty boxes
        return (
          <Page key={index} size={[288, 432]} style={ReceivingStyles.page}>
            <SingleReceivingLabel
              boxNumber={index + 1}
              data={box}
              warehouse={warehouse}
              totalBoxes={boxes.length}
              companyName={companyName}
              prefix3PL={prefix3PL}
              orderBarcode={orderBarcode}
              isManualReceiving={isManualReceiving}
            />
          </Page>
        )
      })}
    </Document>
  )
}

export default PrintReceivingLabel
