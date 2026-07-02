/* eslint-disable react-hooks/exhaustive-deps */
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import EditKitModal from '@components/kits/EditKitModal'
import KitsTable from '@components/kits/KitsTable'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { KitRow } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Container } from '@/components/migration-ui'
import useSWR from 'swr'

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

const fetcher = (endPoint: string) => axios<KitRow[]>(endPoint).then((res) => res.data)

const Kits = ({ session }: Props) => {
  const { push } = useRouter()
  const { state }: any = useContext(AppContext)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    if (!state.user[state.currentRegion]?.showKits) {
      push('/')
    }
  }, [])

  const {
    data: kitsData,
    isValidating,
    mutate: mutateKits,
  } = useSWR(state.user.businessId ? `/api/kits/get-kits-Inventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  const filterDataTable = useMemo(() => {
    if (!kitsData) {
      return []
    }

    const textInput = searchValue.toLowerCase()

    if (textInput !== '') {
      return kitsData.filter(
        (item) =>
          item?.title?.toLowerCase().includes(textInput) ||
          textInput.split(' ').every((word) => item?.title?.toLowerCase().includes(word)) ||
          item?.sku?.toLowerCase().includes(textInput) ||
          item?.asin?.toLowerCase().includes(textInput) ||
          item?.fnSku?.toLowerCase().includes(textInput) ||
          item?.barcode?.toLowerCase().includes(textInput) ||
          item.children.some(
            (child) =>
              child?.title?.toLowerCase().includes(textInput) ||
              textInput.split(' ').every((word) => child?.title?.toLowerCase().includes(word)) ||
              child?.sku?.toLowerCase().includes(textInput)
          )
      )
    }

    return kitsData
  }, [kitsData, searchValue])

  const changeProductState = async (inventoryId: number, businessId: number, sku: string) => {
    confirm(`Are you sure you want to set Inactive: ${sku}`)

    const response = await axios.post(`/api/setStateToProduct?region=${state.currentRegion}&businessId=${businessId}&inventoryId=${inventoryId}`, {
      newState: 0,
      sku,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      mutateKits()
    } else {
      toast.error(response.data.msg)
    }
  }

  const title = `Kits | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Kits' pageTitle='Warehouse' />
          <Container fluid>
            <div className='flex flex-col justify-center items-end gap-2 mb-2 lg:flex-row md:justify-between md:items-center px-1'>
              <div className='w-full flex flex-col justify-center items-start gap-2 mb-0 lg:flex-row lg:justify-start lg:items-center px-0'>
                <Link href={'/AddKit'}>
                  <Button color='primary' className='text-[13px] py-1'>
                    <i className='mdi mdi-plus-circle label-icon align-middle text-[16.25px] me-2' />
                    Add Kit
                  </Button>
                </Link>
              </div>
              <div className='w-full flex flex-col-reverse justify-center items-start gap-2 mb-0 lg:flex-row lg:justify-end lg:items-center px-0'>
                <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={3} widths='col-12 col-md-8' />
              </div>
            </div>
            <Card>
              <CardBody>
                <KitsTable
                  tableData={filterDataTable}
                  pending={isValidating}
                  changeProductState={changeProductState}
                  setMsg={'Set Inactive'}
                  icon={'las la-eye-slash align-middle text-[16.25px] me-2'}
                  activeText={'text-destructive'}
                />
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
      {state.showEditKitModal && <EditKitModal mutateKits={mutateKits} />}
    </div>
  )
}

export default Kits
