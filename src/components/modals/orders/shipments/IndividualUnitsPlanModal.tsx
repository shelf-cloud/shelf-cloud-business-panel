/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { IndividualUnitsPlan } from '@typings'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'

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
            <h5 class='mt-6'>Item List</h5>
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
    <Dialog
      open={!!state.showIndividualUnitsPlan}
      onOpenChange={(open) => {
        if (!open) setIndividualUnitsPlan(!state.showIndividualUnitsPlan)
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='myModal'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Individual Units Plan</DialogTitle>
        </DialogHeader>
        <div style={{ overflow: 'auto' }}>
        <div className='px-3 flex-1 basis-0'>
          <div className='overflow-x-auto'>
          <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
            <thead className='bg-[color:var(--vz-light)] text-center font-semibold'>
              <tr>
                <td className='text-left'>SKU Details</td>
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
                    <div className='flex flex-row justify-start items-center gap-2'>
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
                        <span className='font-bold'>{item.sku}</span>
                        <br />
                        <span className='font-normal'>{item.name}</span>
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
                      <td key={`empty-${box.boxId}`} className='text-center text-muted-foreground'>
                        -
                      </td>
                    )
                  )}
                </tr>
              ))}
              <tr style={{ backgroundColor: '#E5E7E9' }}>
                <td className='font-bold'>Total SKUs: {individualUnitsPlan.plan.items.length}</td>
                <td className='font-bold text-center'>{individualUnitsPlan.plan.items.reduce((total: number, item) => total + Number(item.qtyToShip), 0)}</td>
                {individualUnitsPlan.plan.cartons.map((box) => (
                  <td key={box.boxId} className='font-bold text-center'>
                    {box.skus.reduce((total: number, item) => total + Number(item.qtyInBox), 0)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          </div>
        </div>
        <div className='px-3 flex-1 basis-0'>
          <div className='overflow-x-auto'>
          <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
            <thead className='bg-[color:var(--vz-light)] text-center font-semibold'>
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
                  <td className='font-bold'>{`BOX ${box.boxId}`}</td>
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
                <td className='text-center font-bold'>
                  Total: {individualUnitsPlan.plan.cartons.reduce((total: number, box) => total + Number(box.box.weight), 0)} {state.currentRegion == 'us' ? 'lb' : 'kg'}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
        <div className='px-3 md:w-full'>
          <div className='text-right'>
            <Button
              type='submit'
              variant='light'
              className='mr-4'
              onClick={() => {
                setIndividualUnitsPlan(!state.showIndividualUnitsPlan)
              }}>
              Close
            </Button>
            <Button type='submit' variant='success' onClick={handlePrintPlan}>
              Print Plan
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IndividualUnitsPlanModal
