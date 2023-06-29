import React, { useContext } from 'react'
import AppContext from '@context/AppContext'
import dynamic from 'next/dynamic'
import { FormatCurrency } from '@lib/FormatNumbers'
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

function InvoicesChart({ billingStatus }) {
  const { state } = useContext(AppContext)
  const series = billingStatus

  const options = {
    labels: ['Pending Payment', 'Overdue Payment', 'Not Invoiced'],
    // chart: {
    //   toolbar: {
    //     show: false,
    //   },
    // },
    // stroke: {
    //   curve: 'smooth',
    // },
    // markers: {
    //     size: 4,
    // },
    // plotOptions: {
    //   bar: {
    //     horizontal: true,
    //     borderRadius: 2,
    //     dataLabels: {
    //       position: '',
    //     },
    //   },
    // },
    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        console.log(opt)
        return FormatCurrency(state.currentRegion, billingStatus[opt.seriesIndex])
      },
      // textAnchor: 'start',
      // style: {
      //   fontSize: '14px',
      //   fontWeight: 'bold',
      //   colors: ['#000'],
      // },
    },
    colors: ['#0AB39C', '#F06548', '#4481FD'],
    // grid: {
    //   show: true,
    //   borderColor: '#000',
    //   position: 'back',
    //   xaxis: {
    //     lines: {
    //       show: true,
    //     },
    //   },
    //   yaxis: {
    //     lines: {
    //       show: false,
    //     },
    //   },
    // },
    tooltip: {
      intersect: false,
      x: {
        show: true,
      },
      y: {
        formatter: function (value) {
          return FormatCurrency(state.currentRegion, value)
        },
      },
    },
    // xaxis: {
    //   categories: storageDates,
    //   max: Number(Math.max(...series[0].data) + 10),
    //   labels: {
    //     show: false,
    //   },
    // },
    // yaxis: {
    //   show: true,
    //   labels: {
    //     show: true,
    //     align: 'left',
    //     trim: false,
    //     style: {
    //       fontSize: '14px',
    //       fontWeight: 400,
    //       cssClass: 'chargesTitles',
    //     },
    //   },
    // },
  }

  return <ApexCharts options={options} series={series} type='pie' />
}

export default InvoicesChart
