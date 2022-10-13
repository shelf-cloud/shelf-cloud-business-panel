import React from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import Image from 'next/image';
import { ProductSummary } from '@typings';

type Props = {
    products: ProductSummary[] | undefined
}

const MostInvenotryList = ({products}: Props) => {
    return (
        <React.Fragment>
            <Col xl={6}>
                <Card>
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Top 10 Stock Inventory</h4>
                    </CardHeader>

                    <CardBody>
                        <div className="table-responsive table-card">
                            <table className="table table-hover table-centered align-middle mb-0">
                                <tbody>
                                    {(products || []).map((item, key) => (
                                        <tr key={key}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm bg-light rounded p-1 me-2">
                                                        <Image src={item.image} alt="" width={60} height={60} className="img-fluid d-block" />
                                                    </div>
                                                    <div>
                                                        <h5 className="fs-14 my-1 mw-30">{item.title}</h5>
                                                        <span className="text-muted">{item.sku}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <h5 className="fs-14 my-1 fw-normal">{item.totalQty}</h5>
                                                <span className="text-muted">Stock</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="align-items-center mt-4 pt-2 justify-content-between d-flex">
                            <div className="flex-shrink-0">
                                <Link href={'/Products'}>View All Products</Link>
                            </div>
                        </div>

                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default MostInvenotryList;