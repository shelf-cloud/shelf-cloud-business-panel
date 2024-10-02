import React, { useContext, useMemo, useState } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import { Button, Card, CardBody, Container, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { DebounceInput } from 'react-debounce-input'
import AppContext from '@context/AppContext'
import Link from 'next/link'
import axios from 'axios'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import FBAShipmentsTable from '@components/amazon/shipments/FBAShipmentsTable'
import { FBAShipment, FBAShipmentsRepsonse } from '@typesTs/amazon/fbaShipments.interface'

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

const Shipments = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const [searchValue, setSearchValue] = useState<any>('')
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<FBAShipment[]>([])
  const title = `Amazon FBA Shipments | ${session?.user?.businessName}`

  const controller = new AbortController()
  const signal = controller.signal
  const fetcher = (endPoint: string) => {
    setPending(true)
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
          toast.error(error?.data?.message || 'Error fetching shipment Log data')
          setAllData([])
          setPending(false)
        }
      })
  }
  useSWR(
    session && sessionToken && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerFbaShipments/${state.currentRegion}/${state.user.businessId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const filteredItems = useMemo(() => {
    if (searchValue === '') return allData

    if (searchValue !== '') {
      return allData.filter(
        (item: FBAShipment) =>
          item.shipment.shipmentConfirmationId.toLowerCase().includes(searchValue.toLowerCase()) || item.shipment.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    }

    return []
  }, [allData, searchValue])

  const getFBAShipmentProofOfShipped = async (shipmentId: string) => {
    const downloadingProofOfShipped = toast.loading('Searching Proof Of Shipped...')

    const response = await axios
      .get(`/api/amazon/shipments/getFBAShipmentProofOfShipped?region=${state.currentRegion}&businessId=${state.user.businessId}&shipmentId=${shipmentId}`)
      .then(({ data }) => data)
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error(error?.data?.message || 'Error Generating Bill Of Lading')
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

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Amazon FBA Shipments' pageTitle='Amazon' />
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-1 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='app-search d-flex flex-row justify-content-between align-items-center p-0'>
                <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
                  <Link href={'/amazon-sellers/fulfillments'} passHref>
                    <a>
                      <Button>
                        <span className='icon-on'>
                          <i className='ri-file-list-line align-bottom me-1' />
                          Fulfillments
                        </span>
                      </Button>
                    </a>
                  </Link>
                </div>
                <div className='col-sm-12 col-md-3'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={300}
                      className='form-control input_background_white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                    <span
                      className='d-flex align-items-center justify-content-center input_background_white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                    </span>
                  </div>
                </div>
              </div>
            </Row>
            <Card>
              <CardBody>
                <FBAShipmentsTable filteredItems={filteredItems} pending={pending} getFBAShipmentProofOfShipped={getFBAShipmentProofOfShipped} />
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default Shipments
