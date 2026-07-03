import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import FBAShipmentsTable from '@components/amazon/shipments/FBAShipmentsTable'
import FilterFBAShipments, { FBAFiltersType } from '@components/amazon/shipments/FilterFBAShipments'
import ChangeFBAShipmentName from '@components/modals/amazon/ChangeFBAShipmentName'
import AppContext from '@context/AppContext'
import { FBAShipment, FBAShipmentsRepsonse } from '@typesTs/amazon/fbaShipments.interface'
import axios from 'axios'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import useSWR, { mutate } from 'swr'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionToken = context.req.cookies['next-auth.session-token'] ? context.req.cookies['next-auth.session-token'] : context.req.cookies['__Secure-next-auth.session-token']
  const session = await getSession(context)

  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session, sessionToken },
  }
}

type Props = {
  sessionToken: string
  session: {
    user: {
      businessName: string
      businessOrderStart: string
    }
  }
}

const ShipmentsCompleted = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const title = `Amazon Complete FBA Shipments | ${session?.user?.businessName}`
  const [searchValue, setSearchValue] = useState<any>('')
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<FBAShipment[]>([])
  const [editShipmentName, seteditShipmentName] = useState({
    show: false,
    shipmentId: '',
    shipmentName: '',
  })
  const [filters, setFilters] = useState<FBAFiltersType>({
    status: { value: 'all', label: 'All' },
    showOnlyMissingQty: false,
  })

  const controller = new AbortController()
  const signal = controller.signal
  const fetcher = (endPoint: string) => {
    allData.length === 0 && setPending(true)
    axios(endPoint, {
      signal,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
      .then(({ data }: { data: FBAShipmentsRepsonse }) => {
        if (data.error) {
          toast.error(data.message)
          setPending(false)
        } else {
          setAllData(data.shipments)
          setPending(false)
        }
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error fetching shipment Log data')
          setAllData([])
          setPending(false)
        }
      })
  }
  useSWR(
    session && sessionToken && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerFbaShipmentsCompleted/${state.currentRegion}/${state.user.businessId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const filteredItems = useMemo(() => {
    return allData.filter(
      (item: FBAShipment) =>
        (searchValue !== ''
          ? item.shipment.shipmentConfirmationId.toLowerCase().includes(searchValue.toLowerCase()) || item.shipment.name.toLowerCase().includes(searchValue.toLowerCase())
          : true) &&
        (filters.status!.value !== 'all' ? (item.status ? item.status === filters.status!.value : item.shipment.status === filters.status!.value) : true) &&
        (filters.showOnlyMissingQty
          ? (item.receipts ? Object.values(item.receipts).reduce((total, item) => total + item.quantity, 0) : 0) <
            item.shipmentItems.items.reduce((total, item) => total + item.quantity, 0)
          : true)
    )
  }, [allData, filters.showOnlyMissingQty, filters.status, searchValue])

  const getFBAShipmentProofOfShipped = async (shipmentId: string) => {
    const downloadingProofOfShipped = toast.loading('Searching Proof Of Shipped...')

    const response = await axios
      .get(`/api/amazon/shipments/getFBAShipmentProofOfShipped?region=${state.currentRegion}&businessId=${state.user.businessId}&shipmentId=${shipmentId}`)
      .then(({ data }) => data)
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error Generating Bill Of Lading')
        }
      })

    if (!response.error) {
      toast.update(downloadingProofOfShipped, {
        render: response.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      const a = document.createElement('a')
      a.href = response.url
      a.target = '_blank'
      a.click()
    } else {
      toast.update(downloadingProofOfShipped, {
        render: response.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const setFBAShipmentCompleteStatus = async (shipmentId: string, newStatus: number, isManualComplete: number, status: string) => {
    const setFBAShipmentCompleteStatus = toast.loading('Updating Status...')

    const response = await axios
      .post(`/api/amazon/shipments/setFBAShipmentCompleteStatus?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shipmentId,
        newStatus,
        isManualComplete,
        status,
      })
      .then(({ data }) => data)
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error updating status')
        }
      })

    if (!response.error) {
      toast.update(setFBAShipmentCompleteStatus, {
        render: response.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerFbaShipmentsCompleted/${state.currentRegion}/${state.user.businessId}`)
    } else {
      toast.update(setFBAShipmentCompleteStatus, {
        render: response.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const setFBAShipmentReviewingStatus = async (shipmentId: string, isManualComplete: number, status: string) => {
    const setFBAShipmentReviewingStatus = toast.loading('Updating Status...')

    const response = await axios
      .post(`/api/amazon/shipments/setFBAShipmentReviewingStatus?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shipmentId,
        isManualComplete,
        status,
      })
      .then(({ data }) => data)
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error updating status')
        }
      })

    if (!response.error) {
      toast.update(setFBAShipmentReviewingStatus, {
        render: response.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerFbaShipmentsCompleted/${state.currentRegion}/${state.user.businessId}`)
    } else {
      toast.update(setFBAShipmentReviewingStatus, {
        render: response.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Amazon Complete FBA Shipments' pageTitle='Amazon' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3 flex-col-reverse justify-center items-end gap-2 mb-2 md:flex-row md:justify-end md:items-center px-4'>
              <div className='app-search flex flex-row justify-between items-center p-0'>
                <div className='w-full flex flex-col justify-center items-start gap-2 mb-0 lg:flex-row lg:justify-start lg:items-center px-0'>
                  <FilterFBAShipments filters={filters} setfilters={setFilters} />
                  <Link href={'/amazon-sellers/fulfillments'}>
                    <Button className='text-[11.2px] text-nowrap'>
                      <span className='icon-on'>
                        <i className='ri-external-link-fill align-bottom me-1' />
                        Fulfillments
                      </span>
                    </Button>
                  </Link>
                  <Link href={'/amazon-sellers/shipments'}>
                    <Button variant='info' className='text-[11.2px] text-nowrap'>
                      <span className='icon-on'>
                        <i className='ri-external-link-fill align-bottom me-1' />
                        Shipments
                      </span>
                    </Button>
                  </Link>
                </div>
                <div className='w-full flex flex-col-reverse justify-center items-start gap-2 mb-0 lg:flex-row lg:justify-end lg:items-center px-0'>
                  <div className='app-search p-0 w-full lg:w-5/12'>
                    <div className='relative flex rounded-lg w-full overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                      <DebounceInput
                        type='text'
                        minLength={3}
                        debounceTimeout={300}
                        className='h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 input_background_white text-[13px]'
                        placeholder='Search...'
                        id='search-options'
                        value={searchValue}
                        onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      <span className='mdi mdi-magnify search-widget-icon text-[19.5px]'></span>
                      <span
                        className='flex items-center justify-center input_background_white'
                        style={{
                          cursor: 'pointer',
                        }}
                        onClick={() => setSearchValue('')}>
                        <i className='mdi mdi-window-close text-[19.5px] m-0 px-2 py-0 text-[color:var(--bs-secondary-color)]' />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Card>
              <CardContent>
                <FBAShipmentsTable
                  filteredItems={filteredItems}
                  pending={pending}
                  getFBAShipmentProofOfShipped={getFBAShipmentProofOfShipped}
                  seteditShipmentName={seteditShipmentName}
                  setFBAShipmentCompleteStatus={setFBAShipmentCompleteStatus}
                  setFBAShipmentReviewingStatus={setFBAShipmentReviewingStatus}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        {editShipmentName.show && <ChangeFBAShipmentName editShipmentName={editShipmentName} seteditShipmentName={seteditShipmentName} />}
      </React.Fragment>
    </div>
  )
}

export default ShipmentsCompleted
