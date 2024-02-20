/* eslint-disable @next/next/no-img-element */
import React, { useContext, useEffect, useState } from 'react'
import AppContext from '@context/AppContext'
import { Integration, IntegrationsResponse } from '@typesTs/integrations'
import axios from 'axios'
import useSWR from 'swr'
import { Button, Card, CardBody, Col, Row } from 'reactstrap'
import AmazonAuthButton from '@components/amazon/AmazonAuthButton'
import AmazonAdsAuthButton from '@components/amazon/AmazonAdsAuthButton'

type Props = {}

const Integrations = ({}: Props) => {
  const { state }: any = useContext(AppContext)

  const [integrations, setIntegrations] = useState<{ [key: string]: Integration }>({})
  const [isLoaded, setisLoaded] = useState(false)

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data }: { data?: IntegrationsResponse } = useSWR(
    state.user.businessId ? `/api/integrations/getAllActiveIntegrations?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    setisLoaded(true)
    if (data?.integrations) {
      setIntegrations(data?.integrations!)
      setisLoaded(false)
    }
  }, [data])
  return (
    <Row>
      {!isLoaded ? (
        Object.values(integrations).map((integration: Integration) => (
          <Col sm={6} xl={4} key={integration.integrationId}>
            <Card>
              <CardBody>
                <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      margin: '0px',
                      position: 'relative',
                    }}>
                    <img
                      loading='lazy'
                      src={
                        integration.logoLink
                          ? integration.logoLink
                          : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                      }
                      onError={(e) =>
                        (e.currentTarget.src =
                          'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
                      }
                      alt='product Image'
                      style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                    />
                  </div>
                  <span className='fs-3 fw-bold'>{integration.name}</span>
                </div>
                <p className='text-muted fs-6'>{integration.description}</p>
                <div className='text-end'>
                  {integration.store === 'AmazonFBA' &&
                    (state.user[state.currentRegion]?.showAmazonTab && !state.user[state.currentRegion]?.amazonConnected ? (
                      <AmazonAuthButton />
                    ) : (
                      <Button outline color='success' className='fw-semibold'>
                        Active
                      </Button>
                    ))}
                  {integration.store === 'AmazonAds' &&
                    (true ? (
                      <AmazonAdsAuthButton />
                    ) : (
                      <Button outline color='success' className='fw-semibold'>
                        Active
                      </Button>
                    ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        ))
      ) : (
        <p>Loading</p>
      )}
    </Row>
  )
}

export default Integrations
