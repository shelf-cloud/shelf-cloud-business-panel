/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { MarketplaceFees, MarketplaceFeesResponse } from '@typesTs/marketplaces/marketplaceManager'
import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { Button, Spinner } from 'reactstrap'
import useSWR, { useSWRConfig } from 'swr'
import { toast } from 'react-toastify'
import AssignNewMarketplaceLogo from './AssignNewMarketplaceLogo'

type Props = {}

const MarketplacesFees = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setshowEditFields] = useState(false)
  const [marketplaceFees, setmarketplaceFees] = useState<{ [key: string]: MarketplaceFees }>({})
  const [isLoaded, setisLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [updatingFees, setUpdatingFees] = useState(false)
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data }: { data?: MarketplaceFeesResponse } = useSWR(
    state.user.businessId ? `/api/marketplaces/getMarketplacesFees?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    setisLoaded(true)
    if (data?.marketplaceFees) {
      setmarketplaceFees(data?.marketplaceFees!)
      setisLoaded(false)
    }
  }, [data])

  const handleUpdateMarketplaceFees = async () => {
    setUpdatingFees(true)

    const response = await axios.post(`/api/marketplaces/updateMarketplacesFees?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      marketplaceFees: Object.values(marketplaceFees),
    })

    if (!response.data.error) {
      setshowEditFields(false)
      toast.success(response.data.message)
      mutate(`/api/marketplaces/getMarketplacesFees?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.message)
    }
    setUpdatingFees(false)
  }

  const sortStrings = (rowA: string, rowB: string) => {
    if (rowA.localeCompare(rowB)) {
      return 1
    } else {
      return -1
    }
  }

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Logo</span>,
      selector: (row: MarketplaceFees) => {
        return (
          <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
            <div
              style={{
                width: '30px',
                height: '30px',
                margin: '0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={
                  row.logoLink
                    ? row.aliasLogo ?? row.logoLink
                    : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                }
                onError={(e) =>
                  (e.currentTarget.src =
                    'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
                }
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
            {showEditFields && (
              <AssignNewMarketplaceLogo
                selected={row.aliasLogo ? { value: row.aliasLogo, label: row.storeName } : { value: '', label: 'Default Logo' }}
                setLogo={(selected) => setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, aliasLogo: selected.value !== '' ? selected.value : null } }))}
              />
            )}
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortStrings(rowA.storeName, rowB.storeName),
    },
    {
      name: <span className='fw-bold fs-6'>Marketplace</span>,
      selector: (row: MarketplaceFees) => row.name,
      sortable: true,
      center: false,
      grow: 1.3,
      compact: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortStrings(rowA.name, rowB.name),
    },
    {
      name: <span className='fw-bold fs-6'>Sales Channel</span>,
      selector: (row: MarketplaceFees) => row.storeName,
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortStrings(rowA.storeName, rowB.storeName),
    },
    {
      name: <span className='fw-bold fs-6'>Alias</span>,
      selector: (row: MarketplaceFees) => {
        if (!showEditFields) return <span className=''>{row.alias}</span>
        return (
          <div className='d-flex flex-row justify-content-center align-items-center gap-2'>
            <DebounceInput
              type='text'
              minLength={1}
              debounceTimeout={400}
              className='form-control fs-6'
              style={{ padding: '0.2rem 0.5rem', minWidth: '80px' }}
              onChange={(e) => setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, alias: e.target.value !== '' ? e.target.value : null } }))}
              value={row.alias || ''}
            />
          </div>
        )
      },
      sortable: true,
      center: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortStrings(rowA.storeName, rowB.storeName),
    },
    {
      name: <span className='fw-bold fs-6'>Comission Fee</span>,
      selector: (row: MarketplaceFees) => {
        if (!showEditFields)
          return (
            <span
              className={
                row.comissionFee === 0 ? 'text-muted fw-light' : row.comissionFee < 0 || row.comissionFee > 100 ? 'text-danger fw-bold' : 'text-dark'
              }>{`${row.comissionFee} %`}</span>
          )
        return (
          <div className='d-flex flex-row justify-content-center align-items-center gap-2'>
            <DebounceInput
              minLength={1}
              debounceTimeout={200}
              type='number'
              className={'form-control fs-6 ' + ((row.comissionFee < 0 || row.comissionFee > 100) && 'is-invalid')}
              style={{ padding: '0.2rem 0.9rem', minWidth: '80px' }}
              max={100}
              min={0}
              onChange={(e) => {
                parseInt(e.target.value) < 0 || parseInt(e.target.value) > 100 ? setHasError(true) : setHasError(false)
                setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, comissionFee: parseInt(e.target.value) } }))
              }}
              value={row.comissionFee || 0}
            />
            <span className='fw-sembold fs-5'>%</span>
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => (rowA.comissionFee > rowB.comissionFee ? 1 : -1),
    },
    {
      name: <span className='fw-bold fs-6'>Fixed Fee</span>,
      selector: (row: MarketplaceFees) => {
        if (!showEditFields) return <span className={row.fixedFee === 0 ? 'text-muted fw-light' : 'text-dark'}>{FormatCurrency(state.currentRegion, row.fixedFee)}</span>
        return (
          <DebounceInput
            minLength={1}
            debounceTimeout={200}
            type='number'
            className={'form-control fs-6 ' + (row.fixedFee < 0 && 'is-invalid')}
            style={{ padding: '0.2rem 0.9rem', minWidth: '80px' }}
            min={0}
            onChange={(e) => {
              parseFloat(e.target.value) < 0 ? setHasError(true) : setHasError(false)
              setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, fixedFee: parseFloat(e.target.value) } }))
            }}
            value={row.fixedFee || 0}
          />
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => (rowA.fixedFee > rowB.fixedFee ? 1 : -1),
    },
    {
      name: <span className='fw-bold fs-6'>Commerce Hub</span>,
      selector: (row: MarketplaceFees) => {
        if (!showEditFields) return row.isCommerceHub && 'Active'
        return (
          <div className='d-flex flex-row justify-content-center align-items-center gap-2'>
            <input
              type='checkbox'
              className='form-check-input'
              onChange={(e) => setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, isCommerceHub: e.target.checked } }))}
              checked={row.isCommerceHub}
            />
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MarketplaceFees) => (rowA.isCommerceHub ? 1 : -1),
    },
    {
      name: <span className='fw-bold fs-6'>Pay Terms</span>,
      selector: (row: MarketplaceFees) => {
        if (!showEditFields) return <span className={row.payTerms === 0 ? 'text-muted fw-light' : 'text-dark'}>{row.payTerms}</span>
        return (
          <DebounceInput
            minLength={1}
            debounceTimeout={200}
            type='number'
            className={'form-control fs-6 ' + (row.payTerms < 0 && 'is-invalid')}
            style={{ padding: '0.2rem 0.9rem', minWidth: '80px' }}
            min={0}
            onChange={(e) => {
              parseInt(e.target.value) < 0 ? setHasError(true) : setHasError(false)
              setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, payTerms: parseInt(e.target.value) } }))
            }}
            value={row.payTerms || 0}
          />
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => (rowA.payTerms > rowB.payTerms ? 1 : -1),
    },
  ]

  return (
    <>
      <div className='text-end'>
        {!showEditFields ? (
          <Button color='primary' onClick={() => setshowEditFields(true)}>
            Edit
          </Button>
        ) : (
          <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
            <Button color='light' onClick={() => setshowEditFields(false)}>
              cancel
            </Button>
            <Button color='success' disabled={hasError} onClick={handleUpdateMarketplaceFees}>
              {updatingFees ? <Spinner size={'sm'} color='white' /> : 'Save'}
            </Button>
          </div>
        )}
      </div>
      <DataTable columns={columns} data={Object.values(marketplaceFees)} progressPending={isLoaded} striped={true} defaultSortFieldId={2} />
    </>
  )
}

export default MarketplacesFees
