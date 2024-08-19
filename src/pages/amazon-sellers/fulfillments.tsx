import React, { useContext, useMemo, useState } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { DebounceInput } from 'react-debounce-input'
import AppContext from '@context/AppContext'
import Link from 'next/link'
import axios from 'axios'
import useSWR, { useSWRConfig } from 'swr'
import { toast } from 'react-toastify'
import { ListInboundPlan } from '@typesTs/amazon/fulfillments/listInboundPlans'
import FulfillmentsTable from '@components/amazon/fulfillment/FulfillmentsTable'
import AssignWorkflowId from '@components/modals/amazon/AssignWorkflowId'
import MasterBoxHelp from '@components/amazon/offcanvas/MasterBoxHelp'

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

const Fulfillments = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [searchValue, setSearchValue] = useState<any>('')
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<ListInboundPlan[]>([])
  const [helpOffCanvasIsOpen, setHelpOffCanvasIsOpen] = useState(false)
  const [assignWorkflowIdModal, setassignWorkflowIdModal] = useState({
    show: false,
    id: 0,
    inboundPlanName: '',
    marketplace: '',
    dateCreated: '',
    skus: 0,
    units: 0,
  })
  const title = `Send To Amazon | ${session?.user?.businessName}`

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
      .then((res) => {
        setAllData(res.data.inboundPlans)
        setPending(false)
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
    session && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerInboundPlans/${state.currentRegion}/${state.user.businessId}`
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
        (item: ListInboundPlan) =>
          item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.status.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.destinationMarketplaces.toLowerCase().includes(searchValue.toLowerCase())
      )
    }

    return []
  }, [allData, searchValue])

  const handleCancelInboundPlan = async (inboundPlanId: string) => {
    const cancelInboundPlanToast = toast.loading('Canceling Inbound Plan...')
    try {
      const response = await axios.get(
        `/api/amazon/fullfilments/cancelInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}`
      )

      if (!response.data.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerInboundPlans/${state.currentRegion}/${state.user.businessId}`)
      } else {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error(error)
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
            <BreadCrumb title='Send To Amazon' pageTitle='Amazon' />
            {/* <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-1 flex-md-row justify-content-md-end align-items-md-center px-3'> */}
            <Row className='justify-content-between gap-2 mb-1'>
              <Col xs='12' lg='6' className='d-flex justify-content-start align-items-center gap-3'>
                <Link href={'/amazon-sellers/fulfillment/sendToAmazon'}>
                  <Button color='primary'>Start New</Button>
                </Link>
                <Button color='info' className='d-flex align-items-center' onClick={() => setHelpOffCanvasIsOpen(true)}>
                  <i className='ri-question-line fs-14 p-0 m-0 me-lg-1' />
                  <span className='d-none d-lg-block'>Need help</span>
                </Button>
              </Col>
              <Col xs='12' lg='4' className='d-flex justify-content-end align-items-center'>
                <div className='flex-1'>
                  <div className='app-search d-flex flex-row justify-content-between align-items-center p-0'>
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
              </Col>
            </Row>
            <Card>
              <CardBody>
                <FulfillmentsTable
                  filteredItems={filteredItems}
                  pending={pending}
                  handleCancelInboundPlan={handleCancelInboundPlan}
                  setassignWorkflowIdModal={setassignWorkflowIdModal}
                />
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
      {assignWorkflowIdModal.show && (
        <AssignWorkflowId assignWorkflowIdModal={assignWorkflowIdModal} setassignWorkflowIdModal={setassignWorkflowIdModal} sessionToken={sessionToken} />
      )}
      <MasterBoxHelp isOpen={helpOffCanvasIsOpen} setHelpOffCanvasIsOpen={setHelpOffCanvasIsOpen} />
    </div>
  )
}

export default Fulfillments
