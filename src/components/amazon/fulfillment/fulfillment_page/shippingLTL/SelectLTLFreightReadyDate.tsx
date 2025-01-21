import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { TransportationOption } from '@typesTs/amazon/fulfillments/fulfillment'
import moment from 'moment'
import React, { useContext, useMemo } from 'react'
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
      <p className='my-2 p-0 fw-semibold fs-7'>Freight Ready Date</p>

      <div className='w-100 gap-2' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', alignContent: 'center', justifyItems: 'center' }}>
        {carrierTransportationOptions.map((option, index) => (
          <div
            key={index}
            className={
              'fs-7 py-1 px-2 border border-2 rounded-3' +
              (selectedLTLTransportationOption.transportationOptionId === option.transportationOptionId ? ' border-primary shadow-lg' : '')
            }
            style={{ cursor: 'pointer' }}
            onClick={() => handleChangeFreightReadyDate(option.transportationOptionId)}>
            <p className='m-0 p-0 fw-semibold'>{moment.utc(option.carrierAppointment?.startTime).format('ddd')}</p>
            <p className='m-0 p-0 fw-semibold'>{moment.utc(option.carrierAppointment?.startTime).format('MMM D')}</p>
            <p className='m-0 p-0'>
              <span className='text-muted' style={{ fontSize: '0.875em' }}>
                from
              </span>{' '}
              {FormatCurrency(state.currentRegion, option.quote?.cost.amount || 0)}
            </p>
            {option.quote?.expiration && (
              <>
                <p className='m-0 p-0 text-muted' style={{ fontSize: '0.875em' }}>
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

      <div className='mt-3 mb-2 d-flex flex-row justify-content-between align-items-center gap-3'>
        <p className='my-2 p-0 fw-semibold fs-7'>Carrier</p>
        <Select className='fs-7' value={selectedCarrier} onChange={handleChangeCarrier} options={commonCarriers} />
      </div>
      <table className='table table-sm table-borderless table-responsive fs-7'>
        <thead>
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
  )
}

export default SelectLTLFreightReadyDate
