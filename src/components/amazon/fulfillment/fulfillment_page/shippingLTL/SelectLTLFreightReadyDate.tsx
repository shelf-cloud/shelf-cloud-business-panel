import { useContext, useMemo } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { TransportationOption } from '@typesTs/amazon/fulfillments/fulfillment'
import moment from 'moment'
import Select from 'react-select'

import { setLTLTransportationOption, setShipmentLTLTransportationOption } from './helperFunctions'

type Props = {
  shipmentId: string
  selectedLTLTransportationOption: { shipmentId: string; transportationOptionId: string; cost: number; ltlAlphaCode: string }
  setfinalShippingCharges: (cb: (prev: any) => any) => void
  transportationOptions: TransportationOption[]
  commonCarriers: { value: string; label: string }[]
}

const SelectLTLFreightReadyDate = ({ shipmentId, selectedLTLTransportationOption, setfinalShippingCharges, transportationOptions, commonCarriers }: Props) => {
  const { state }: any = useContext(AppContext)

  const selectedCarrier = useMemo(() => {
    const selected = transportationOptions.find((option) => option.carrier.alphaCode === selectedLTLTransportationOption.ltlAlphaCode)
    return {
      value: selected?.carrier.alphaCode,
      label: selected?.carrier.name,
    }
  }, [transportationOptions, selectedLTLTransportationOption.ltlAlphaCode])

  const carrierTransportationOptions = useMemo(() => {
    return transportationOptions.filter((option) => option.carrier.alphaCode === selectedLTLTransportationOption.ltlAlphaCode)
  }, [transportationOptions, selectedLTLTransportationOption.ltlAlphaCode])

  const handleChangeFreightReadyDate = (transportationOptionId: string) => {
    const newCarrierTransportationOptions = setLTLTransportationOption(transportationOptions, transportationOptionId)
    setfinalShippingCharges((prev) => {
      return {
        ...prev,
        ltlTransportationOptions: {
          ...prev.ltlTransportationOptions,
          [shipmentId]: newCarrierTransportationOptions,
        },
      }
    })
  }

  const handleChangeCarrier = (selected: any) => {
    const newLTLAlphaCode = selected.value
    const newCarrierTransportationOptions = setShipmentLTLTransportationOption(transportationOptions, newLTLAlphaCode)
    setfinalShippingCharges((prev) => {
      return {
        ...prev,
        ltlTransportationOptions: {
          ...prev.ltlTransportationOptions,
          [shipmentId]: newCarrierTransportationOptions,
        },
      }
    })
  }

  return (
    <div>
      <p className='tw:my-2 tw:p-0 tw:font-semibold tw:text-[11.2px]'>Freight Ready Date</p>

      <div className='tw:w-full tw:gap-2' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', alignContent: 'center', justifyItems: 'center' }}>
        {carrierTransportationOptions.map((option, index) => (
          <div
            key={index}
            className={
              'tw:text-[11.2px] tw:py-1 tw:px-2 border border-2 tw:rounded-lg' +
              (selectedLTLTransportationOption.transportationOptionId === option.transportationOptionId ? ' border-primary shadow-lg' : '')
            }
            style={{ cursor: 'pointer' }}
            onClick={() => handleChangeFreightReadyDate(option.transportationOptionId)}>
            <p className='tw:m-0 tw:p-0 tw:font-semibold'>{moment.utc(option.carrierAppointment?.startTime).format('ddd')}</p>
            <p className='tw:m-0 tw:p-0 tw:font-semibold'>{moment.utc(option.carrierAppointment?.startTime).format('MMM D')}</p>
            <p className='tw:m-0 tw:p-0'>
              <span className='tw:text-[var(--bs-secondary-color)]' style={{ fontSize: '0.875em' }}>
                from
              </span>{' '}
              {FormatCurrency(state.currentRegion, option.quote?.cost.amount || 0)}
            </p>
            {option.quote?.expiration && (
              <>
                <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)]' style={{ fontSize: '0.875em' }}>
                  expires
                </p>
                <p className='tw:m-0 tw:p-0 tw:text-danger' style={{ fontSize: '0.875em' }}>
                  {moment.utc(option.quote?.expiration).local().format('DD/MM h:mm a')}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className='tw:mt-4 tw:mb-2 tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-4'>
        <p className='tw:my-2 tw:p-0 tw:font-semibold tw:text-[11.2px]'>Carrier</p>
        <Select className='tw:text-[11.2px]' value={selectedCarrier} onChange={handleChangeCarrier} options={commonCarriers} />
      </div>
      <div className='tw:overflow-x-auto'>
        <table className='tw:w-full tw:align-middle tw:mb-0 tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
          <thead className='tw:bg-[color:var(--vz-light)]'>
            <tr>
              <th>PCP Carrier</th>
              <th>Mode</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selectedLTLTransportationOption.ltlAlphaCode}</td>
              <td>LTL</td>
              <td>{FormatCurrency(state.currentRegion, selectedLTLTransportationOption.cost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SelectLTLFreightReadyDate
