/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AmazonAdsAuthButton from '@components/amazon/AmazonAdsAuthButton'
import AmazonAuthButton from '@components/amazon/AmazonAuthButton'
import AmazonReconnectButton from '@components/amazon/AmazonReconnectButton'
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { Button, Card, CardBody, Col, Row } from '@/components/migration-ui'

type Props = {
  env: string
}

const Integrations = ({ env }: Props) => {
  const { state }: any = useContext(AppContext)

  return (
    <Row>
      {state.user[state.currentRegion]?.showAmazonTab && (
        <Col sm={6} xl={4}>
          <Card>
            <CardBody>
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-4'>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    margin: '0px',
                    position: 'relative',
                  }}>
                  <img
                    loading='lazy'
                    src={'https://onixventuregroup.goflow.com/images/channels/amazon.svg'}
                    onError={(e) => (e.currentTarget.src = NoImageAdress)}
                    alt='product Image'
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </div>
                <span className='tw:text-[22.75px] tw:font-bold'>Amazon Seller FBA</span>
              </div>
              <p className='tw:text-[var(--bs-secondary-color)] tw:text-[13px]'>Connect to Amazon FBA through Seller Central. You will be able to manage listings, product performance, orders and more...</p>
              <div className='tw:text-right'>
                {!state.user[state.currentRegion]?.amazonConnected ? (
                  <AmazonAuthButton />
                ) : state.user[state.currentRegion]?.amazonNeedsUpdate ? (
                  <AmazonReconnectButton />
                ) : (
                  <Button outline color='success' className='tw:font-semibold'>
                    Active
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      )}
      {state.user[state.currentRegion]?.showAmazonAdsTab && (
        <Col sm={6} xl={4}>
          <Card>
            <CardBody>
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-4'>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    margin: '0px',
                    position: 'relative',
                  }}>
                  <img
                    loading='lazy'
                    src={'https://onixventuregroup.goflow.com/images/channels/amazon.svg'}
                    onError={(e) => (e.currentTarget.src = NoImageAdress)}
                    alt='product Image'
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </div>
                <span className='tw:text-[22.75px] tw:font-bold'>Amazon Ads</span>
              </div>
              <p className='tw:text-[var(--bs-secondary-color)] tw:text-[13px]'>Connect to Amazon Ads. You will be able to get PPC costs and display cost for accurate product performance more...</p>
              <div className='tw:text-right'>
                {!state.user[state.currentRegion]?.amazonAdsConnected ? (
                  <AmazonAdsAuthButton env={env} />
                ) : (
                  <Button outline color='success' className='tw:font-semibold'>
                    Active
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      )}
    </Row>
  )
}

export default Integrations
