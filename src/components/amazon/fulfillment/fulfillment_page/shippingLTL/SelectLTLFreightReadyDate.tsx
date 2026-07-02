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
      <p className='my-2 p-0 font-semibold text-[11.2px]'>Freight Ready Date</p>

      <div className='w-full gap-2' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', alignContent: 'center', justifyItems: 'center' }}>
        {carrierTransportationOptions.map((option, index) => (
          <div
            key={index}
            className={
              'text-[11.2px] py-1 px-2 border border-[color:var(--vz-border-color)] border border-[2px] rounded-lg' +
              (selectedLTLTransportationOption.transportationOptionId === option.transportationOptionId ? ' border-primary shadow-[0_5px_10px_rgba(30,32,37,0.12)]' : '')
            }
            style={{ cursor: 'pointer' }}
            onClick={() => handleChangeFreightReadyDate(option.transportationOptionId)}>
            <p className='m-0 p-0 font-semibold'>{moment.utc(option.carrierAppointment?.startTime).format('ddd')}</p>
            <p className='m-0 p-0 font-semibold'>{moment.utc(option.carrierAppointment?.startTime).format('MMM D')}</p>
            <p className='m-0 p-0'>
              <span className='text-[var(--bs-secondary-color)]' style={{ fontSize: '0.875em' }}>
                from
              </span>{' '}
              {FormatCurrency(state.currentRegion, option.quote?.cost.amount || 0)}
            </p>
            {option.quote?.expiration && (
              <>
                <p className='m-0 p-0 text-[var(--bs-secondary-color)]' style={{ fontSize: '0.875em' }}>
                  expires
                </p>
                <p className='m-0 p-0 text-danger' style={{ fontSize: '0.875em' }}>
                  {moment.utc(option.quote?.expiration).local().format('DD/MM h:mm a')}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className='mt-4 mb-2 flex flex-row justify-between items-center gap-4'>
        <p className='my-2 p-0 font-semibold text-[11.2px]'>Carrier</p>
        <Select className='text-[11.2px]' value={selectedCarrier} onChange={handleChangeCarrier} options={commonCarriers} />
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full align-middle mb-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
          <thead className='bg-[color:var(--vz-light)]'>
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
