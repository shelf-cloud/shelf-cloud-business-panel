import { KitRow, Product } from '@typings'
import moment from 'moment'

export const sortStringsLocaleCompare = (a: string, b: string) => a.localeCompare(b)

export const sortStringsCaseInsensitive = (string1: string, string2: string) => {
  const a = string1.toLowerCase()
  const b = string2.toLowerCase()
  if (a > b) {
    return 1
  }
  if (b > a) {
    return -1
  }
  return 0
}

export const sortNumbers = (a: number, b: number) => {
  if (a > b) {
    return 1
  }
  if (b > a) {
    return -1
  }
  return 0
}

export const sortBooleans = (a: boolean, b: boolean) => {
  if (a === b) {
    return 0
  }
  if (a) {
    return 1
  }
  return -1
}

export const sortDates = (Adate: string, Bdate: string) => {
  const a = moment(Adate)
  const b = moment(Bdate)
  if (a.isBefore(b)) {
    return -1
  } else {
    return 1
  }
}

export const loadBarcode = (product: Product | KitRow) => {
  var html = '<!DOCTYPE html><html><head>'
  html += '<style>@page{margin:0px;}'
  html += 'body{width:21cm;margin:0px;padding:0px;}'
  html += '.pageBreak{page-break-after:always;}'
  html += '.barcodeSection{position:relative;float:left;top:0cm;left:0.9cm;width: 6.7cm;height: 2.5cm;margin-right:0.3cm;text-align: center;overflow:hidden;margin-bottom:2px;}'
  html += '.barcodeSection svg{transform: translate(0px, 0px) !important;}'
  html += '.barcodeSection svg text{font:12px monospace !important;}'
  html += '.barcodeSection p{position:relative;float:left;left:5%;width:95%;text-align:left;margin-top:0px;margin-bottom:0px;font-size:14px;z-index:5;}'
  html += '.barcodeSection svg{width:90%;transform: translate(0px, -10px) !important;}'
  html += '</style></head><body>'
  html +=
    '<div class="barcodeSection"><p style="text-align:center;">' +
    product.sku +
    '</p><p style="text-align:center;white-space: nowrap;overflow: hidden;">' +
    product.title +
    '</p><svg id="barcode" width="100%" height="100%"></svg></div>'
  html +=
    '</body><script src="https://cdn.jsdelivr.net/jsbarcode/3.6.0/JsBarcode.all.min.js"></script><script>JsBarcode("#barcode", "' +
    product.barcode +
    '", {text: "' +
    product.barcode +
    '",fontSize: 12,textMargin: 0, height:31});</script></html>'
  var wnd = window.open('about:Barcode-Generated', '', '_blank')
  wnd?.document.write(html)
}
