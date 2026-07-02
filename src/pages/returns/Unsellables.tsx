import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import ExportUnsellables from '@components/returns/ExportUnsellables'
import FilterUnsellables from '@components/returns/FilterUnsellables'
import ReturnUnsellablesTable from '@components/returns/ReturnUnsellablesTable'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { UnsellablesType } from '@typesTs/returns/unsellables'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, Row } from '@/components/migration-ui'
import useSWR from 'swr'

import ShowBiggerImageDialog, { SelectedUnsellableImage } from '@/components/returns/ShowBiggerImageDialog'
import ShowReturnImagesDialog from '@/components/returns/ShowReturnImagesDialog'

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
      businessName: string
    }
  }
}

const Unsellables = ({ session }: Props) => {
  const title = `Return Unsellables | ${session?.user?.businessName}`

  const { state }: any = useContext(AppContext)
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<UnsellablesType[]>([])
  const [imagesDialogItem, setImagesDialogItem] = useState<UnsellablesType | null>(null)
  const [selectedImage, setSelectedImage] = useState<SelectedUnsellableImage | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [searchStatus, setSearchStatus] = useState<string>('')
  const [searchReason, setSearchReason] = useState<string>('')

  const fetcher = (endPoint: string) => {
    setPending(true)
    axios(endPoint)
      .then((res) => {
        setAllData(res.data)
        setPending(false)
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error fetching shipment Log data')
          setAllData([])
          setPending(false)
        }
      })
  }

  useSWR(session && state.user.businessId ? `/api/returns/getReturnUnsellables?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  const filterDataTable = useMemo(() => {
    if (searchValue === '' && searchStatus === '' && searchReason === '') {
      return allData
    }

    if (searchValue === '') {
      return allData.filter(
        (item) =>
          (searchStatus !== '' ? (searchStatus === 'dispose' ? item?.dispose : searchStatus === 'unsellable' ? !item?.converted && !item.dispose : item?.converted) : true) &&
          (searchReason !== '' ? item?.returnReason?.toLowerCase() === searchReason.toLowerCase() : true)
      )
    }

    if (searchValue !== '') {
      return allData.filter(
        (item) =>
          (searchStatus !== '' ? (searchStatus === 'dispose' ? item?.dispose : searchStatus === 'unsellable' ? !item?.converted && !item.dispose : item?.converted) : true) &&
          (searchReason !== '' ? item?.returnReason?.toLowerCase() === searchReason.toLowerCase() : true) &&
          (item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.barcode.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.returnRMA?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.returnReason?.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }
  }, [allData, searchValue, searchStatus, searchReason])

  const openImagesDialog = (item: UnsellablesType) => {
    setImagesDialogItem(item)
    setSelectedImage(null)
  }

  const resetImagesDialog = () => {
    setImagesDialogItem(null)
    setSelectedImage(null)
  }

  const handleImagesDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetImagesDialog()
    }
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Return Unsellables' pageTitle='Orders' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Row className='tw:flex tw:flex-col-reverse tw:justify-center tw:items-end tw:gap-2 tw:mb-1 tw:md:flex-row tw:md:justify-between tw:md:items-center'>
                  <div className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:md:flex-row tw:md:justify-between tw:md:items-center tw:w-auto'>
                    <div>
                      <Link href={'/Returns'}>
                        <Button color='primary' style={{ cursor: 'pointer' }}>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line tw:align-bottom tw:me-1' />
                            Returns
                          </span>
                        </Button>
                      </Link>
                    </div>
                    <FilterUnsellables searchStatus={searchStatus} setSearchStatus={setSearchStatus} searchReason={searchReason} setSearchReason={setSearchReason} />
                    <ExportUnsellables unsellables={filterDataTable || allData} />
                  </div>
                  <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' />
                </Row>
                <Card>
                  <CardBody>
                    <ReturnUnsellablesTable filterDataTable={filterDataTable || []} pending={pending} openImagesDialog={openImagesDialog} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
        <ShowReturnImagesDialog
          imagesDialogItem={imagesDialogItem}
          imagesDialogImages={imagesDialogItem?.images || []}
          handleImagesDialogOpenChange={handleImagesDialogOpenChange}
          setSelectedImage={setSelectedImage}
        />
        <ShowBiggerImageDialog selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
      </React.Fragment>
    </div>
  )
}

export default Unsellables
