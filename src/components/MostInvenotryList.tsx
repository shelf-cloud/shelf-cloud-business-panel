/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ProductSummary } from '@typings'
import { Card, CardBody, CardHeader, Col } from '@/components/migration-ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn/ui/table'

type Props = {
  products: ProductSummary[] | undefined
}

const MostInvenotryList = ({ products }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <React.Fragment>
      <Col>
        <Card>
          <CardHeader className='tw:flex tw:items-center tw:justify-between'>
            <h4 className='tw:grow tw:mb-0 tw:text-[16px] tw:font-medium tw:text-[#212529]'>Stock Inventory</h4>
            <Link href={'/Products?brand=All&supplier=All&category=All&condition=All&status=All'} className='tw:text-[13px] tw:text-primary tw:font-normal'>
              View All Products
            </Link>
          </CardHeader>

          <CardBody>
            <Table className='tw:mb-0'>
              <TableHeader>
                <TableRow>
                  <TableHead className='tw:font-semibold'>Image</TableHead>
                  <TableHead className='tw:font-semibold'>Name</TableHead>
                  <TableHead className='tw:font-semibold'>SKU</TableHead>
                  <TableHead className='tw:font-semibold'>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(products || []).map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <div className='tw:h-12 tw:w-12 tw:bg-light tw:rounded-[4px] tw:p-1 tw:me-2'>
                        <img
                          loading='lazy'
                          src={item.image}
                          alt='Product Img'
                          style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                          className='tw:block tw:max-w-full'
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='tw:text-[13px]'>{item.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className='tw:text-[color:var(--bs-secondary-color)]'>{item.sku}</span>
                    </TableCell>
                    <TableCell>
                      <h5 className='tw:text-[14px] tw:my-1 tw:font-normal tw:text-center'>{FormatIntNumber(state.currentRegion, item.totalQty)}</h5>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default MostInvenotryList
