/* eslint-disable jsx-a11y/alt-text */
import { FinalBoxConfiguration } from '@hooks/receivings/useReceivingsBoxes'
import { Image, Text, View } from '@react-pdf/renderer'
import { Warehouse } from '@typesTs/warehouses/warehouse'

import { generateBarcode, generateQRCode } from './GenerateCodes'
import { ReceivingStyles } from './PrintReceivingLabel'

type Props = {
  data: FinalBoxConfiguration
  companyName: string
  prefix3PL: string
  warehouse: Warehouse
  boxNumber: number
  totalBoxes: number
  orderBarcode: string
}

const chars = 'Place this Label Securely Outside Box'.split('').reverse()

const SingleReceivingLabel = ({ boxNumber, data, warehouse, totalBoxes, companyName, prefix3PL, orderBarcode }: Props) => {
  const isShipjoy = warehouse?.name3PL === 'shipjoy'
  const fromCompany = isShipjoy ? 'Onix Electronics LLC' : companyName
  const qrCodeUrl = generateQRCode(data.items[0].sku, data.items[0].quantity)
  const barcodeUrl = generateBarcode(orderBarcode)
  return (
    <View style={ReceivingStyles.container}>
      {/* Left black border with rotated text */}
      <View style={ReceivingStyles.leftBorder}>
        {chars.map((char, index) => (
          <Text key={index} style={ReceivingStyles.verticalText}>
            {char}
          </Text>
        ))}
      </View>

      {/* Main content */}
      <View style={ReceivingStyles.mainContent}>
        {/* Header with logo and box info */}
        <View style={ReceivingStyles.header}>
          <View style={ReceivingStyles.logoSection}>
            {/* <Image style={ReceivingStyles.logo} src={ShelfCloudLogo.src} alt="Shelf-Cloud Logo" /> */}
            <Text style={ReceivingStyles.companyName}>Shelf-Cloud</Text>
          </View>
          <Text style={ReceivingStyles.boxInfo}>
            Box {boxNumber} of {totalBoxes}
          </Text>
        </View>

        {/* Address section */}
        <View style={ReceivingStyles.addressSection}>
          <View style={ReceivingStyles.addressRow}>
            <Text style={ReceivingStyles.addressLabel}>From:</Text>
            <Text style={ReceivingStyles.addressValue}>{fromCompany}</Text>
          </View>
          <View style={ReceivingStyles.addressRow}>
            <Text style={ReceivingStyles.addressLabel}>Ship To:</Text>
            <Text style={ReceivingStyles.addressValue}>{warehouse.name}</Text>
          </View>
          <View style={ReceivingStyles.addressRow}>
            <Text style={ReceivingStyles.addressLabel}></Text>
            <Text style={ReceivingStyles.addressValue}>{warehouse.address1}</Text>
          </View>
          <View style={ReceivingStyles.addressRow}>
            <Text style={ReceivingStyles.addressLabel}></Text>
            <Text style={ReceivingStyles.addressValue}>{warehouse.address2}</Text>
          </View>
          <View style={ReceivingStyles.addressRow}>
            <Text style={ReceivingStyles.addressLabel}></Text>
            <Text style={ReceivingStyles.addressValue}>
              {warehouse.city}, {warehouse.state} {warehouse.zipcode}
            </Text>
          </View>
          <View style={ReceivingStyles.addressRow}>
            <Text style={ReceivingStyles.addressLabel}></Text>
            <Text style={ReceivingStyles.addressValue}>{warehouse.phone}</Text>
          </View>
        </View>

        <View style={ReceivingStyles.divider} />

        {/* Contents header */}
        <Text style={ReceivingStyles.contentsHeader}>Contents:</Text>

        {/* SKU section with QR code */}
        <View style={ReceivingStyles.contentSection}>
          <View style={ReceivingStyles.skuSection}>
            {data.items.map((item, index) => (
              <View key={index} style={ReceivingStyles.skuItem}>
                <Text style={ReceivingStyles.skuCode}>SKU: {isShipjoy ? `${prefix3PL}${item.sku}` : item.sku}</Text>
                <Text style={ReceivingStyles.skuDescription}>{item.name?.substring(0, 40)}</Text>
                <Text style={ReceivingStyles.skuQty}>QTY: {item.quantity}</Text>
              </View>
            ))}
          </View>

          {data.items.length === 1 && !isShipjoy && (
            <View style={ReceivingStyles.qrSection}>
              <Image style={ReceivingStyles.qrCode} src={qrCodeUrl} />
              <Text style={ReceivingStyles.qrLabel}>Internal use only</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={ReceivingStyles.footer}>
        <View style={ReceivingStyles.footerRow}>
          <View style={ReceivingStyles.footerColumn}>
            <Text style={ReceivingStyles.footerLabel}>PO Number:</Text>
            <Text style={ReceivingStyles.footerText}>{data.items[0].poNumber}</Text>
          </View>
          <View style={ReceivingStyles.footerColumn}>
            <Text style={ReceivingStyles.footerLabel}>Receiving #:</Text>
            <Text style={ReceivingStyles.footerText}>{data.items[0].orderNumber}</Text>
          </View>
        </View>

        {barcodeUrl && (
          <View style={ReceivingStyles.barcodeSection}>
            <Image style={ReceivingStyles.barcode} src={barcodeUrl} />
            <Text style={ReceivingStyles.footerText}>{orderBarcode}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default SingleReceivingLabel
