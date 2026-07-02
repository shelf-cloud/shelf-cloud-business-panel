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
import { Card, CardBody, CardHeader, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from '@/components/migration-ui'

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
          <Container fluid>
            <Row>
              <Col xs={12}>
                <Row className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:mb-2 tw:md:flex-row tw:md:justify-end tw:md:items-center tw:px-4'>
                  <div className='tw:flex tw:flex-col tw:justify-between tw:items-start tw:p-0 tw:md:flex-row tw:md:items-center tw:gap-2'>
                    <div className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-center tw:gap-2 tw:w-full'>
                      <SimpleSelect
                        selected={warehouse}
                        options={warehouses ? Object.entries(warehouses).map(([key, warehouse]) => ({ value: key, label: warehouse.name })) : []}
                        handleSelect={(selected) => setwarehouse(selected)}
                        className='w-30 tw:text-[13px]'
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
                        <UncontrolledButtonDropdown>
                          <DropdownToggle className='btn btn-primary tw:text-[13px] tw:py-2' caret>
                            <span className='tw:font-semibold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem className='tw:text-nowrap' onClick={(e) => e.stopPropagation()}>
                              {integrationInfo && (
                                <GenerateSPSCommerceFileButton
                                  integrationInfo={integrationInfo}
                                  items={selectedRows}
                                  warehouseId={warehouse?.value.toString() || ''}
                                  color='ghost'
                                  disabled={!warehouse?.value}
                                />
                              )}
                            </DropdownItem>
                            <DropdownItem className='tw:text-nowrap tw:text-right tw:text-[13px] tw:text-[var(--bs-secondary-color)]' onClick={clearAllSelectedRows}>
                              Clear All
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledButtonDropdown>
                      )}
                    </div>
                    <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={2} />
                  </div>
                </Row>
                <Card>
                  <CardHeader>
                    <p className='tw:m-0 tw:p-0'>
                      <span className='tw:text-[var(--bs-secondary-color)]'> Vendor Number:</span> <span className='tw:font-semibold'>{integrationInfo?.['VENDOR NUMBER']}</span>
                    </p>
                    <p className='tw:text-[11.2px] tw:mt-1 tw:mb-0 tw:p-0'>Location Details:</p>
                    <div className='tw:flex tw:gap-4'>
                      <p className='tw:m-0 tw:p-0'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Reporting Location Name:</span>{' '}
                        <span className='tw:font-semibold'>{integrationInfo?.locations[warehouse?.value.toString() || '']?.['REPORTING LOCATION NAME']}</span>
                      </p>
                      <p className='tw:m-0 tw:p-0'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Reporting Location Number: </span>
                        <span className='tw:font-semibold'>{integrationInfo?.locations[warehouse?.value.toString() || '']?.['REPORTING LOCATION NUMBER']}</span>
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <SPSCommerceTable tableData={items} pending={isLoading} setSelectedRows={setSelectedRows} toggledClearRows={toggledClearRows} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    </div>
  )
}

export default ProductsListings
