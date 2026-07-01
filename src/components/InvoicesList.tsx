import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { InvoiceList } from '@typings'
import moment from 'moment'
import CountUp from 'react-countup'
import { Button, Card, CardBody, CardHeader, Col } from '@/components/migration-ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn/ui/table'

type Props = {
  invoices: InvoiceList[] | undefined
}

const InvoicesList = ({ invoices }: Props) => {
  const { state }: any = useContext(AppContext)
  const today = moment().format('YYYY-MM-DD')

  return (
    <React.Fragment>
      <Col>
        <Card>
          <CardHeader className='tw:flex tw:items-center'>
            <h4 className='tw:grow tw:mb-0 tw:text-[16px] tw:font-medium tw:text-[#212529]'>Invoices</h4>
          </CardHeader>

          <CardBody>
            <Table className='tw:mb-0'>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ textAlign: 'center' }}>Invoice #</TableHead>
                  <TableHead style={{ textAlign: 'center' }}>Total Charge</TableHead>
                  <TableHead style={{ textAlign: 'center' }}>Expire Date</TableHead>
                  <TableHead style={{ textAlign: 'center' }}>Status</TableHead>
                  {state.currentRegion == 'us' && <TableHead style={{ textAlign: 'center' }}>Payments</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((invoice) => (
                  <TableRow key={invoice.invoiceNumber}>
                    <TableCell>
                      <Link href={`/Invoices/${invoice.idOfInvoice}`}>
                        <h5 className='tw:text-[14px] tw:my-1 tw:text-center tw:text-[color:var(--bs-secondary-color)]' style={{ cursor: 'pointer' }}>
                          {invoice.invoiceNumber}
                        </h5>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <h5 className='tw:text-[14px] tw:my-1 tw:font-normal tw:text-center'>
                        <CountUp
                          start={0}
                          prefix={state.currentRegion == 'us' ? '$ ' : ''}
                          suffix={state.currentRegion == 'eu' ? ' €' : ''}
                          separator={state.currentRegion == 'us' ? '.' : ','}
                          end={invoice.totalCharge || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </TableCell>
                    <TableCell className='tw:text-center'>
                      <span
                        className={
                          invoice.paid
                            ? 'tw:text-[14px] tw:my-1 tw:text-[color:var(--bs-secondary-color)]'
                            : moment(today).isAfter(invoice.expireDate)
                              ? 'tw:text-[14px] tw:my-1 tw:text-destructive'
                              : 'tw:text-[14px] tw:my-1 tw:text-[color:var(--bs-secondary-color)]'
                        }>
                        {moment(invoice.expireDate, 'YYYY-MM-DD').format('LL')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='tw:text-center tw:px-2 tw:py-1 tw:rounded-[4px]' style={{ background: 'rgba(49, 154, 246, 0.1)' }}>
                        <span className={invoice.paid ? 'tw:text-[13px] tw:my-1 tw:text-success' : moment(today).isAfter(invoice.expireDate) ? 'tw:text-[13px] tw:my-1 tw:text-destructive' : 'tw:text-[13px] tw:my-1'}>
                          {invoice.paid
                            ? 'Paid'
                            : moment(today).isAfter(invoice.expireDate)
                              ? `Past Due ${moment(invoice.expireDate).fromNow(true)}`
                              : moment(today).isSame(invoice.expireDate)
                                ? 'Due Today'
                                : `Due in ${moment(invoice.expireDate).fromNow(true)}`}
                        </span>
                      </div>
                    </TableCell>
                    {state.currentRegion == 'us' && (
                      <TableCell className='tw:text-center'>
                        <a href={`${invoice.payLink}`} target='blank' rel='noopener noreferrer'>
                          <Button color={invoice.paid ? 'success' : 'primary'} size='sm'>
                            {invoice.paid ? 'View Receipt' : 'Pay Now'}
                          </Button>
                        </a>
                      </TableCell>
                    )}
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

export default InvoicesList
