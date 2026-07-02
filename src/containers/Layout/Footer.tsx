import React from 'react'

import { Col, Container, Row } from '@/components/migration-ui'

const Footer = () => {
  return (
    <React.Fragment>
      <footer className='footer'>
        <Container fluid>
          <Row>
            <Col sm={6}>{new Date().getFullYear()} © Shelf Cloud.</Col>
            <Col sm={6}>
              <div className='sm:text-right hidden sm:block'>Design & Develop by Shelf Cloud</div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  )
}

export default Footer
