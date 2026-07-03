import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Fragment, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import SPSCommerceTable from '@components/integrations/sps_commerce/SPSCommerceTable'
import GenerateSPSCommerceFileButton from '@components/integrations/sps_commerce/generateSPSCommerceFileButton'
import SearchInput from '@components/ui/SearchInput'
import { SPSCommerceItem, useSPSCommerceIntegrations } from '@hooks/integrations/useSPSCommerceIntegrations'
import { ChevronDownIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'

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

const ProductsListings = ({ session }: Props) => {
  const title = `Listings | ${session?.user?.businessName}`

  const { integrationInfo, warehouses, items, isLoading } = useSPSCommerceIntegrations()

  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<SPSCommerceItem[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [warehouse, setwarehouse] = useState<SelectSingleValueType>(null)

  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Fragment>
        <div className='page-content'>
          <BreadCrumb title='SPS Commerce' pageTitle='Integrations' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full'>
                <div className='flex flex-wrap -mx-3 flex flex-col justify-center items-end gap-2 mb-2 md:flex-row md:justify-end md:items-center px-4'>
                  <div className='flex flex-col justify-between items-start p-0 md:flex-row md:items-center gap-2'>
                    <div className='flex flex-row flex-wrap justify-start items-center gap-2 w-full'>
                      <SimpleSelect
                        selected={warehouse}
                        options={warehouses ? Object.entries(warehouses).map(([key, warehouse]) => ({ value: key, label: warehouse.name })) : []}
                        handleSelect={(selected) => setwarehouse(selected)}
                        className='w-30 text-[13px]'
                        customStyle='base'
                        placeholder={'Select Warehouse...'}
                        hasError={false}
                      />

                      {integrationInfo && (
                        <GenerateSPSCommerceFileButton
                          integrationInfo={integrationInfo}
                          items={items}
                          warehouseId={warehouse?.value.toString() || ''}
                          disabled={!warehouse?.value}
                        />
                      )}

                      {selectedRows.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type='button' className='btn btn-primary text-[13px] py-2'>
                              <span className='font-semibold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
                              <ChevronDownIcon className='ml-1 size-4' />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='start'>
                            <DropdownMenuItem className='text-nowrap' onClick={(e) => e.stopPropagation()}>
                              {integrationInfo && (
                                <GenerateSPSCommerceFileButton
                                  integrationInfo={integrationInfo}
                                  items={selectedRows}
                                  warehouseId={warehouse?.value.toString() || ''}
                                  color='ghost'
                                  disabled={!warehouse?.value}
                                />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className='text-nowrap text-right text-[13px] text-[var(--bs-secondary-color)]' onClick={clearAllSelectedRows}>
                              Clear All
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={2} />
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <p className='m-0 p-0'>
                      <span className='text-[var(--bs-secondary-color)]'> Vendor Number:</span> <span className='font-semibold'>{integrationInfo?.['VENDOR NUMBER']}</span>
                    </p>
                    <p className='text-[11.2px] mt-1 mb-0 p-0'>Location Details:</p>
                    <div className='flex gap-4'>
                      <p className='m-0 p-0'>
                        <span className='text-[var(--bs-secondary-color)]'>Reporting Location Name:</span>{' '}
                        <span className='font-semibold'>{integrationInfo?.locations[warehouse?.value.toString() || '']?.['REPORTING LOCATION NAME']}</span>
                      </p>
                      <p className='m-0 p-0'>
                        <span className='text-[var(--bs-secondary-color)]'>Reporting Location Number: </span>
                        <span className='font-semibold'>{integrationInfo?.locations[warehouse?.value.toString() || '']?.['REPORTING LOCATION NUMBER']}</span>
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SPSCommerceTable tableData={items} pending={isLoading} setSelectedRows={setSelectedRows} toggledClearRows={toggledClearRows} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    </div>
  )
}

export default ProductsListings
