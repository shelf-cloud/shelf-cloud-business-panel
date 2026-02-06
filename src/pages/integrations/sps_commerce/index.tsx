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
import { Card, CardBody, CardHeader, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from 'reactstrap'

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
                <Row className='d-flex flex-column justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center px-3'>
                  <div className='d-flex flex-column justify-content-between align-items-start p-0 flex-md-row align-items-md-center gap-2'>
                    <div className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-2 w-100'>
                      <SimpleSelect
                        selected={warehouse}
                        options={warehouses ? Object.entries(warehouses).map(([key, warehouse]) => ({ value: key, label: warehouse.name })) : []}
                        handleSelect={(selected) => setwarehouse(selected)}
                        className='w-30 fs-6'
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
                          <DropdownToggle className='btn btn-primary fs-6 py-2' caret>
                            <span className='fw-semibold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem className='text-nowrap' onClick={(e) => e.stopPropagation()}>
                              {integrationInfo && (
                                <GenerateSPSCommerceFileButton
                                  integrationInfo={integrationInfo}
                                  items={selectedRows}
                                  warehouseId={warehouse?.value.toString() || ''}
                                  color='ghost'
                                />
                              )}
                            </DropdownItem>
                            <DropdownItem className='text-nowrap text-end fs-6 text-muted' onClick={clearAllSelectedRows}>
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
                    <p className='m-0 p-0'>
                      <span className='text-muted'> Vendor Number:</span> <span className='fw-semibold'>{integrationInfo?.['VENDOR NUMBER']}</span>
                    </p>
                    <p className='fs-7 mt-1 mb-0 p-0'>Location Details:</p>
                    <div className='d-flex gap-3'>
                      <p className='m-0 p-0'>
                        <span className='text-muted'>Reporting Location Name:</span>{' '}
                        <span className='fw-semibold'>{integrationInfo?.locations[warehouse?.value.toString() || '']?.['REPORTING LOCATION NAME']}</span>
                      </p>
                      <p className='m-0 p-0'>
                        <span className='text-muted'>Reporting Location Number: </span>
                        <span className='fw-semibold'>{integrationInfo?.locations[warehouse?.value.toString() || '']?.['REPORTING LOCATION NUMBER']}</span>
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
