/* eslint-disable @next/next/no-img-element */
import { useContext, useMemo, useState } from 'react'

import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import UploadFileModal, { HandleSubmitParams } from '@components/modals/shared/UploadFileModal'
import AppContext from '@context/AppContext'
import { FormatBytes, FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import { MarketplaceFees, MarketplaceFeesResponse } from '@typesTs/marketplaces/marketplaceManager'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button, Spinner } from 'reactstrap'
import useSWR, { useSWRConfig } from 'swr'

import AssignCommerceHubFileType from './AssignCommerceHubFileType'
import AssignNewMarketplaceLogo from './AssignNewMarketplaceLogo'
import { MARKETPLACE_NAME_LIST } from './constants'
import { commerceHubFileTypeOptions } from './marketplaceConstants'

type Props = {}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const MarketplacesFees = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setshowEditFields] = useState(false)
  const [editedFeesState, setEditedFeesState] = useState<{ source: MarketplaceFeesResponse['marketplaceFees'] | undefined; data: { [key: string]: MarketplaceFees } } | null>(null)
  const [hasError, setHasError] = useState(false)
  const [updatingFees, setUpdatingFees] = useState(false)

  const [uploadLogoImage, setuploadLogoImage] = useState({
    isOpen: false,
    headerText: 'Upload Marketplace Logo',
    primaryText: 'Add New Marketplace Logo',
    primaryTextSub: 'supported formats: PNG, JPG. Max size: 2MB.',
    descriptionText: 'Upload a new logo for a marketplace. The image should be in PNG or JPG format and optimized for web use.',
    uploadZoneText: 'Drag & drop a logo file here, or click to select one (PNG, JPG)',
    confirmText: 'Upload',
    loadingText: 'Uploading...',
    select: { value: '', label: 'Select Marketplace' } as SelectSingleValueType,
    selectedFiles: [] as any[],
    acceptedFiles: {
      'image/jpeg': [],
      'image/png': [],
    },
    handleSelect: (selected: SelectSingleValueType) => {
      setuploadLogoImage((prev) => ({ ...prev, select: selected }))
    },
    handleAcceptedFiles: (acceptedFiles: File[]) => {
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          formattedSize: FormatBytes(file.size),
        })
      )
      setuploadLogoImage((prev) => ({ ...prev, selectedFiles: acceptedFiles }))
    },
    handleClearFiles: () => {
      setuploadLogoImage((prev) => ({ ...prev, selectedFiles: [] }))
    },
    handleSubmit: async ({ region, businessId, selectedFiles, marketplace }: HandleSubmitParams) => {
      if (selectedFiles.length === 0) {
        toast.error('Please select a file to upload')
        return { error: false }
      }

      const uploadingAsset = toast.loading('Uploading logo...')

      const formData = new FormData()
      formData.append('assetType', 'marketplace')
      formData.append('fileName', selectedFiles[0].name)
      formData.append('fileType', selectedFiles[0].type.split('/')[1])
      formData.append('file', selectedFiles[0])
      formData.append('marketplaceName', marketplace!)

      const { data } = await axios.post(`/api/assets/uploadNewAsset?region=${region}&businessId=${businessId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!data.error) {
        toast.update(uploadingAsset, {
          render: data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: true }
      } else {
        toast.update(uploadingAsset, {
          render: data.message ?? 'Error uploading logo',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: false }
      }
    },
    handleClose: () => {
      setuploadLogoImage((prev) => ({ ...prev, isOpen: false, select: { value: '', label: 'Select Marketplace' }, selectedFiles: [] }))
    },
  })

  const { data }: { data?: MarketplaceFeesResponse } = useSWR(
    state.user.businessId ? `/api/marketplaces/getMarketplacesFees?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const baseMarketplaceFees = useMemo(() => data?.marketplaceFees ?? {}, [data])

  const marketplaceFees = useMemo(() => {
    if (editedFeesState && editedFeesState.source === data?.marketplaceFees) return editedFeesState.data
    return baseMarketplaceFees
  }, [editedFeesState, data?.marketplaceFees, baseMarketplaceFees])

  const setmarketplaceFees = (updater: { [key: string]: MarketplaceFees } | ((prev: { [key: string]: MarketplaceFees }) => { [key: string]: MarketplaceFees })) => {
    setEditedFeesState((prev) => {
      const previousData = prev && prev.source === data?.marketplaceFees ? prev.data : baseMarketplaceFees
      const nextData = typeof updater === 'function' ? updater(previousData) : updater
      return { source: data?.marketplaceFees, data: nextData }
    })
  }

  const isLoaded = !data?.marketplaceFees

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

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Logo</span>,
      selector: (row: MarketplaceFees) => {
        return (
          <div className='d-flex flex-row justify-content-start align-items-center gap-2 fs-7'>
            <div
              style={{
                width: '22px',
                height: '22px',
                margin: '0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.aliasLogo ?? row.logoLink}
                onError={(e) => (e.currentTarget.src = NoImageAdress)}
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
            {showEditFields && (
              <AssignNewMarketplaceLogo
                selected={row.aliasLogo ?? row.logoLink}
                defaultLogo={row.logoLink}
                setLogo={(selected) => setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, aliasLogo: selected!.value !== '' ? selected!.value : null } }))}
              />
            )}
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: false,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortStringsCaseInsensitive(rowA.storeName, rowB.storeName),
    },
    {
      name: <span className='fw-bold fs-6'>Marketplace</span>,
      selector: (row: MarketplaceFees) => row.name,
      sortable: true,
      left: true,
      grow: 1.3,
      compact: false,
      wrap: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortStringsCaseInsensitive(rowA.name, rowB.name),
    },
    {
      name: <span className='fw-bold fs-6'>Sales Channel</span>,
      selector: (row: MarketplaceFees) => row.storeName,
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortStringsCaseInsensitive(rowA.storeName, rowB.storeName),
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
              className='form-control fs-7'
              style={{ padding: '0.2rem 0.5rem', minWidth: '80px' }}
              onChange={(e) => setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, alias: e.target.value !== '' ? e.target.value : null } }))}
              value={row.alias || ''}
            />
          </div>
        )
      },
      sortable: true,
      center: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortStringsCaseInsensitive(rowA.storeName, rowB.storeName),
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
          <div className='d-flex flex-row justify-content-center align-items-center gap-1'>
            <DebounceInput
              minLength={1}
              debounceTimeout={200}
              type='number'
              className={'form-control fs-7 ' + ((row.comissionFee < 0 || row.comissionFee > 100) && 'is-invalid')}
              style={{ padding: '0.2rem 0.9rem', minWidth: '80px' }}
              max={100}
              min={0}
              onChange={(e) => {
                parseInt(e.target.value) < 0 || parseInt(e.target.value) > 100 ? setHasError(true) : setHasError(false)
                setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, comissionFee: parseInt(e.target.value) } }))
              }}
              value={row.comissionFee || 0}
            />
            <span className='fw-sembold fs-6'>%</span>
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortNumbers(rowA.comissionFee, rowB.comissionFee),
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
            className={'form-control fs-7 ' + (row.fixedFee < 0 && 'is-invalid')}
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
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortNumbers(rowA.fixedFee, rowB.fixedFee),
    },
    {
      name: <span className='fw-bold fs-6 text-center'>Commerce Hub</span>,
      selector: (row: MarketplaceFees) => {
        if (!showEditFields)
          return (
            row.isCommerceHub && (
              <div className='my-2 d-flex flex-column justify-content-center align-items-center gap-0'>
                <p className='fs-7 text-center m-0 text-primary'>Active</p>
                <p className='fs-7 text-center m-0'>File: {row.commerceHubFileType}</p>
              </div>
            )
          )
        return (
          <div className='py-2 d-flex flex-column justify-content-center align-items-center gap-2'>
            <div className='fs-7 d-flex flex-row justify-content-center align-items-center gap-2'>
              <input
                type='checkbox'
                className='form-check-input'
                onChange={(e) => {
                  e.target.checked && row.commerceHubFileType === '' ? setHasError(true) : setHasError(false)
                  setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, isCommerceHub: e.target.checked, commerceHubFileType: '' } }))
                }}
                checked={row.isCommerceHub}
              />
              {row.isCommerceHub && (
                <AssignCommerceHubFileType
                  selected={commerceHubFileTypeOptions.find((option) => option.value === row.commerceHubFileType) ?? { value: '', label: 'Select File Type' }}
                  setSelected={(selected: any) => {
                    row.isCommerceHub && selected.value === '' ? setHasError(true) : setHasError(false)
                    setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, commerceHubFileType: selected.value } }))
                  }}
                  options={commerceHubFileTypeOptions}
                />
              )}
            </div>
            {row.isCommerceHub && (
              <span className={'fs-7 text-info fw-light ' + (row.isCommerceHub && row.commerceHubFileType === '' ? 'text-danger' : '')}>
                File: {row.commerceHubFileType || 'Required'}
              </span>
            )}
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: false,
      style: {
        fontSize: '0.7rem',
      },
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
            className={'form-control fs-7 ' + (row.payTerms < 0 && 'is-invalid')}
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
      compact: false,
      sortFunction: (rowA: MarketplaceFees, rowB: MarketplaceFees) => sortNumbers(rowA.payTerms, rowB.payTerms),
    },
    {
      name: <span className='fw-bold fs-6'>Notes</span>,
      selector: (row: MarketplaceFees) => {
        if (!showEditFields) return <p className='fs-7 my-1'>{row.notes}</p>
        return (
          <div className='d-flex flex-row justify-content-center align-items-center gap-2 my-1'>
            <DebounceInput
              element='textarea'
              minLength={3}
              debounceTimeout={500}
              className='form-control fs-7'
              style={{ padding: '0.2rem 0.5rem', minWidth: '80px' }}
              onChange={(e) => setmarketplaceFees((prev) => ({ ...prev, [row.storeId]: { ...row, notes: e.target.value !== '' ? e.target.value : null } }))}
              value={row.notes || ''}
            />
          </div>
        )
      },
      wrap: true,
      sortable: false,
      center: true,
      compact: false,
    },
  ]

  return (
    <>
      <div className='d-flex flex-row justify-content-end align-items-center gap-3 mb-2'>
        <Button color='primary' size='sm' onClick={() => setuploadLogoImage((prev) => ({ ...prev, isOpen: true }))}>
          Add New Logo
        </Button>
        {!showEditFields ? (
          <Button color='primary' size='sm' onClick={() => setshowEditFields(true)}>
            Edit
          </Button>
        ) : (
          <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
            <Button color='success' size='sm' disabled={hasError} onClick={handleUpdateMarketplaceFees}>
              {updatingFees ? <Spinner size={'sm'} color='white' /> : 'Save'}
            </Button>
            <Button color='light' size='sm' onClick={() => setshowEditFields(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
      <DataTable columns={columns} data={Object.values(marketplaceFees)} dense progressPending={isLoaded} striped={true} defaultSortFieldId={2} />
      {uploadLogoImage.isOpen ? <UploadFileModal {...uploadLogoImage} showSelect options={MARKETPLACE_NAME_LIST.map((name) => ({ value: name, label: name }))} /> : null}
    </>
  )
}

export default MarketplacesFees
