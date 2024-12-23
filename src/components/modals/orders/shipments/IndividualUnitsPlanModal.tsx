/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { IndividualUnitsPlan } from '@typings'
import { useContext } from 'react'
import { Button, Col, Modal, ModalBody, ModalHeader } from 'reactstrap'

type Props = {
  individualUnitsPlan: IndividualUnitsPlan
}

const IndividualUnitsPlanModal = ({ individualUnitsPlan }: Props) => {
  const { state, setIndividualUnitsPlan }: any = useContext(AppContext)

  const handlePrintPlan = () => {
    let html = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Individual Units Plan</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>@page{margin:0px;}
            body{width:21cm;margin:0px;padding:12px;}
            .pageBreak{page-break-after:always;}
            </style>
        </head>
        <body>
        <h2 class='mt-2'>Box List</h2>
        <div>
          <table class='table align-middle table-responsive table-nowrap'>
            <thead class='table-light text-center fw-semibold'>
              <tr>
                <td>Box ID</td>
                <td>Width ${state.currentRegion == 'us' ? '(in)' : '(cm)'}</td>
                <td>Height ${state.currentRegion == 'us' ? '(in)' : '(cm)'}</td>
                <td>Length ${state.currentRegion == 'us' ? '(in)' : '(cm)'}</td>
                <td>Weight ${state.currentRegion == 'us' ? '(lb)' : '(kg)'}</td>
              </tr>
            </thead>
            <tbody>`

    {
      individualUnitsPlan.plan.cartons.map(
        (box) =>
          (html += `<tr key=${box.boxId} class='text-center'>
                  <td class='fw-bold'>BOX ${box.boxId}</td>
                  <td>${box.box.width}</td>
                  <td>${box.box.height}</td>
                  <td>${box.box.length}</td>
                  <td>${box.box.weight}</td>
                </tr>`)
      )
    }
    html += `</tbody>
            </table>
            </div>
            <h5 class='mt-4'>Item List</h5>
            <div>`
    {
      individualUnitsPlan.plan.items.map((item) => {
        html += `<table key=${item.sku} class='table table-sm align-middle table-responsive table-nowrap'>
                    <thead class='table-light fw-semibold'>
                      <tr>
                        <td class='w-75'>
                          <span class='fw-bold'>${item.sku}</span>
                          <br />
                          <span class='fw-normal'>${item.name}</span>
                        </td>
                        <td class='text-center'>Qty In Box</td>
                      </tr>
                    </thead>
                    <tbody>`

        item.cartons.map(
          (box) =>
            (html += `<tr key=${box.boxId} class='text-center'>
                          <td class='fw-bold'>BOX ${box.boxId}</td>
                          <td>${box.qtyInBox}</td>
                        </tr>`)
        )

        html += `</tbody></table>`
      })
    }

    html += `</body>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
                </html>`

    var wnd = window.open('about:Barcode-Generated', '', '_blank')
    wnd?.document.write(html)
  }

  return (
    <Modal
      fade={false}
      size='lg'
      id='myModal'
      isOpen={state.showIndividualUnitsPlan}
      toggle={() => {
        setIndividualUnitsPlan(!state.showIndividualUnitsPlan)
      }}>
      <ModalHeader
        toggle={() => {
          setIndividualUnitsPlan(!state.showIndividualUnitsPlan)
        }}
        className='modal-title'
        id='myModalLabel'>
        Individual Units Plan
      </ModalHeader>
      <ModalBody style={{ overflow: 'auto' }}>
        <Col>
          <table className='table table-sm align-middle table-responsive table-striped table-nowrap table-bordered'>
            <thead className='table-light text-center fw-semibold'>
              <tr>
                <td className='text-start'>SKU Details</td>
                <td>Units Boxed</td>
                {individualUnitsPlan.plan.cartons.map((box) => (
                  <td key={box.boxId}>BOX {box.boxId}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {individualUnitsPlan.plan.items.map((item) => (
                <tr key={item.sku}>
                  <td>
                    <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                      <div
                        style={{
                          width: '50px',
                          height: '40px',
                          margin: '2px 0px',
                          position: 'relative',
                        }}>
                        <img
                          loading='lazy'
                          src={item.image ? item.image : NoImageAdress}
                          alt='product Image'
                          style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                        />
                      </div>
                      <div>
                        <span className='fw-bold'>{item.sku}</span>
                        <br />
                        <span className='fw-normal'>{item.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className='text-center'>{item.qtyToShip}</td>
                  {individualUnitsPlan.plan.cartons.map((box, index) =>
                    box.skus.some((sku) => sku.sku == item.sku) ? (
                      box.skus.map(
                        (sku) =>
                          sku.sku == item.sku &&
                          index + 1 == box.boxId && (
                            <td key={box.boxId} className='text-center'>
                              {sku.qtyInBox}
                            </td>
                          )
                      )
                    ) : (
                      <td className='text-center text-muted'>-</td>
                    )
                  )}
                </tr>
              ))}
              <tr style={{ backgroundColor: '#E5E7E9' }}>
                <td className='fw-bold'>Total SKUs: {individualUnitsPlan.plan.items.length}</td>
                <td className='fw-bold text-center'>{individualUnitsPlan.plan.items.reduce((total: number, item) => total + Number(item.qtyToShip), 0)}</td>
                {individualUnitsPlan.plan.cartons.map((box) => (
                  <td key={box.boxId} className='fw-bold text-center'>
                    {box.skus.reduce((total: number, item) => total + Number(item.qtyInBox), 0)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Col>
        <Col>
          <table className='table table-sm align-middle table-responsive table-striped table-nowrap table-bordered'>
            <thead className='table-light text-center fw-semibold'>
              <tr>
                <td>Box #</td>
                <td>Width {state.currentRegion == 'us' ? '(in)' : '(cm)'}</td>
                <td>Height {state.currentRegion == 'us' ? '(in)' : '(cm)'}</td>
                <td>Length {state.currentRegion == 'us' ? '(in)' : '(cm)'}</td>
                <td>Weight {state.currentRegion == 'us' ? '(lb)' : '(kg)'}</td>
              </tr>
            </thead>
            <tbody>
              {individualUnitsPlan.plan.cartons.map((box) => (
                <tr key={box.boxId} className='text-center'>
                  <td className='fw-bold'>{`BOX ${box.boxId}`}</td>
                  <td>{box.box.width}</td>
                  <td>{box.box.height}</td>
                  <td>{box.box.length}</td>
                  <td>{box.box.weight}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#E5E7E9' }}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className='text-center fw-bold'>
                  Total: {individualUnitsPlan.plan.cartons.reduce((total: number, box) => total + Number(box.box.weight), 0)} {state.currentRegion == 'us' ? 'lb' : 'kg'}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
        <Col md={12}>
          <div className='text-end'>
            <Button
              type='submit'
              color='light'
              className='btn me-4'
              onClick={() => {
                setIndividualUnitsPlan(!state.showIndividualUnitsPlan)
              }}>
              Close
            </Button>
            <Button type='submit' color='success' className='btn' onClick={handlePrintPlan}>
              Print Plan
            </Button>
          </div>
        </Col>
      </ModalBody>
    </Modal>
  )
}

export default IndividualUnitsPlanModal
