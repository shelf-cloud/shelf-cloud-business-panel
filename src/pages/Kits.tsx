/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { KitRow } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, Input, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR, { useSWRConfig } from 'swr'
// import { CSVLink } from 'react-csv'
import Link from 'next/link'
import KitsTable from '@components/kits/KitsTable'
import { useRouter } from 'next/router'
import EditKitModal from '@components/kits/EditKitModal'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
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
    props: { session },
  }
}

type Props = {
  session: {
    user: {
      name: string
    }
  }
}

const Kits = ({ session }: Props) => {
  const { push } = useRouter()
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<KitRow[]>([])
  const [tableData, setTableData] = useState<KitRow[]>([])
  const [serachValue, setSerachValue] = useState('')

  useEffect(() => {
    if (!state.user[state.currentRegion]?.showKits) {
      push('/')
    }
  }, [])

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId ? `/api/getBusinessKitsInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher
  )

  useEffect(() => {
    if (data?.error) {
      setTableData([])
      setAllData([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      setTableData(data)
      setAllData(data)
      setPending(false)
    }
  }, [data])

  const filterByText = (e: any) => {
    if (e.target.value !== '') {
      setSerachValue(e.target.value)
      const filterTable = allData.filter(
        (item) =>
          item?.title?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.sku?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.asin?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.fnSku?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.barcode?.toLowerCase().includes(e.target.value.toLowerCase())
      )
      setTableData(filterTable)
    } else {
      setSerachValue(e.target.value)
      setTableData(allData)
    }
  }
  const clearSearch = () => {
    setSerachValue('')
    setTableData(allData)
  }

  const changeProductState = async (inventoryId: number, businessId: number, sku: string) => {
    confirm(`Are you sure you want to set Inactive: ${sku}`)

    const response = await axios.post(`/api/setStateToProduct?region=${state.currentRegion}&businessId=${businessId}&inventoryId=${inventoryId}`, {
      newState: 0,
      sku,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      mutate(`/api/getBusinessInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.msg)
    }
  }

  // const csvData = useMemo(() => {
  //   const data: any[] = [
  //     [
  //       'Title',
  //       'SKU',
  //       'AISN',
  //       'FNSKU',
  //       'Barcode',
  //       'Quantity',
  //       'Weight',
  //       'Length',
  //       'Width',
  //       'Height',
  //       'Box Weight',
  //       'Box Length',
  //       'Box Width',
  //       'Box Height',
  //       'Box Quantity',
  //     ],
  //   ]

  //   allData.forEach((item) =>
  //     data.push([
  //       item?.Title,
  //       item?.SKU,
  //       item?.ASIN,
  //       item?.FNSKU,
  //       item?.Barcode,
  //       item?.Quantity?.quantity,
  //       item?.unitDimensions?.weight,
  //       item?.unitDimensions?.length,
  //       item?.unitDimensions?.width,
  //       item?.unitDimensions?.height,
  //       item?.boxDimensions?.weight,
  //       item?.boxDimensions?.length,
  //       item?.boxDimensions?.width,
  //       item?.boxDimensions?.height,
  //       item?.qtyBox,
  //     ])
  //   )

  //   return data
  // }, [allData])

  const title = `Products | ${session?.user?.name}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Products' pageTitle='Warehouse' />
            <Row>
              <Col lg={12}>
                <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-3 flex-md-row justify-content-md-between align-items-md-center'>
                  <div className='w-auto d-flex flex-row align-items-center justify-content-between gap-4'>
                    <Link href={'/AddKit'} passHref>
                      <Button color='primary' className='fs-5 py-1 p3-1'>
                        <i className='mdi mdi-plus-circle label-icon align-middle fs-5 me-2' />
                        Add Kit
                      </Button>
                    </Link>
                    {/* <CSVLink data={csvData} style={{ width: 'fit-content' }} filename={`${session?.user?.name.toUpperCase()}-Products.csv`}>
                      <Button color='primary' className='fs-5 py-1 p3-1'>
                        <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
                        Export
                      </Button>
                    </CSVLink> */}
                  </div>
                  <div className='col-sm-12 col-md-3'>
                    <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                      <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                        <Input
                          type='text'
                          className='form-control input_background_white'
                          placeholder='Search...'
                          id='search-options'
                          value={serachValue}
                          onChange={filterByText}
                        />
                        <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                        <span
                          className='d-flex align-items-center justify-content-center input_background_white'
                          style={{ cursor: 'pointer' }}
                          onClick={clearSearch}>
                          <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                        </span>
                      </div>
                    </div>
                  </div>
                </Row>
                <Card>
                  {/* <CardHeader>
                  </CardHeader> */}
                  <CardBody>
                    <KitsTable
                      tableData={tableData}
                      pending={pending}
                      changeProductState={changeProductState}
                      setMsg={'Set Inactive'}
                      icon={'las la-eye-slash align-middle fs-5 me-2'}
                      activeText={'text-danger'}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showEditKitModal && <EditKitModal />}
    </div>
  )
}

export default Kits
