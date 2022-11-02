import React from 'react'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { StorageBin, StorageRowProduct } from '@typings'

type Props = {
  data: StorageRowProduct
}

const StorageTable = ({ data }: Props) => {
  return (
    <div style={{ backgroundColor: '#f3f3f9', padding: '10px' }}>
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="table-responsive table-card">
                <table className="table table-sm align-middle text-center table-bordered mb-0">
                  <thead className="table-light text-muted">
                    <tr className="fs-5 fw-bold">
                      <th scope="col">Bin Name</th>
                      <th scope="col">Bin Quantity</th>
                      <th scope="col">Bin Current Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bins.map((bin: StorageBin, key) => (
                      <tr key={key}>
                        <td className="fs-16 fw-semibold text-primary">
                          {bin.binName || ''}
                        </td>
                        <td className="fs-15">{bin.quantity}</td>
                        <td className="text-center">
                          {bin.idBin != 156
                            ? `$ ${bin.binBalance.toFixed(2)}`
                            : bin.countEntry
                            ? `$ ${bin.binBalance.toFixed(2)}`
                            : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default StorageTable
