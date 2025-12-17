export const RECEIVING_SHIPMENT_TYPES = [
  { value: 'parcel_boxes', label: 'Parcel Boxes' },
  { value: 'ltl', label: 'LTL / Pallets' },
  { value: 'container', label: 'Container' },
]

export const IGNORE_WAREHOUSES_FOR_SHIPMENT_TYPES: { [key: string]: string[] } = {
  parcel_boxes: [],
  ltl: ['1'],
  container: ['1'],
}
