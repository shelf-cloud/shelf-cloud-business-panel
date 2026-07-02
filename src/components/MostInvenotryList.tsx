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
          <CardHeader className='flex items-center justify-between'>
            <h4 className='grow mb-0 text-[16px] font-medium text-[#212529]'>Stock Inventory</h4>
            <Link href={'/Products?brand=All&supplier=All&category=All&condition=All&status=All'} className='text-[13px] text-primary font-normal'>
              View All Products
            </Link>
          </CardHeader>

          <CardBody>
            <Table className='mb-0'>
              <TableHeader>
                <TableRow>
                  <TableHead className='font-semibold'>Image</TableHead>
                  <TableHead className='font-semibold'>Name</TableHead>
                  <TableHead className='font-semibold'>SKU</TableHead>
                  <TableHead className='font-semibold'>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(products || []).map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <div className='h-12 w-12 bg-light rounded-[4px] p-1 me-2'>
                        <img
                          loading='lazy'
                          src={item.image}
                          alt='Product Img'
                          style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                          className='block max-w-full'
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='text-[13px]'>{item.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className='text-[color:var(--bs-secondary-color)]'>{item.sku}</span>
                    </TableCell>
                    <TableCell>
                      <h5 className='text-[14px] my-1 font-normal text-center'>{FormatIntNumber(state.currentRegion, item.totalQty)}</h5>
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
