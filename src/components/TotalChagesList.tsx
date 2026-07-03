import React from 'react'

import { TotalChagres } from '@typings'
import { Card, CardHeader, CardContent } from '@shadcn/ui/card'

import ChargesChart from './ChargesChart'

// import CountUp from 'react-countup'

type Props = {
  totalCharges: TotalChagres | undefined
}

const TotalChagesList = ({ totalCharges }: Props) => {
  return (
    <React.Fragment>
      <div className='px-3 flex-1 basis-0'>
        <Card>
          <CardHeader className='flex items-center'>
            <h4 className='grow mb-0 text-[16px] font-medium text-[#212529]'>Total Charges</h4>
          </CardHeader>

          <CardContent>
            <ChargesChart totalCharges={totalCharges} />
            {/* <div className="table-responsive table-card">
              <table className="table table-sm table-hover [&_:is(th,td)]:align-middle align-middle table-nowrap mb-0">
                <tbody>
                  <tr>
                    <td>
                      <div className="flex items-center">
                        <h5 className="fs-14 my-1">Pick and Pack</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 font-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totalpickpackCharge || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex items-center">
                        <h5 className="fs-14 my-1">Shipping</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 font-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totalshippingCharge || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex items-center">
                        <h5 className="fs-14 my-1">Labeling</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 font-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totallabeling || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex items-center">
                        <h5 className="fs-14 my-1">Man Hours</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 font-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totalmanHour || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex items-center">
                        <h5 className="fs-14 my-1">Extra Charges</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 font-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totalextraCharge || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex items-center">
                        <h5 className="fs-14 my-1">Receiving</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 font-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={(totalCharges?.totalreceivingService || 0) + (totalCharges?.totalreceivingPallets || 0) + (totalCharges?.totalreceivingWrapService || 0)}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </React.Fragment>
  )
}

export default TotalChagesList
