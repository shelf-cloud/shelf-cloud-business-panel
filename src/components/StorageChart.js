import React from 'react'
import dynamic from 'next/dynamic'
import { FormatCurrency } from '@lib/FormatNumbers'
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

function StorageChart({ storageInvoices, storageDates }) {
  const series = [
    {
      name: 'Storage Fees',
      data: storageInvoices,
    },
  ]

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
    },
    markers: {
        size: 4,
    },
    // plotOptions: {
    //   bar: {
    //     horizontal: true,
    //     borderRadius: 2,
    //     dataLabels: {
    //       position: '',
    //     },
    //   },
    // },
    // dataLabels: {
    //   enabled: true,
    //   formatter: function (val) {
    //     if (val > 0) {
    //       return FormatCurrency.format(val)
    //     }
    //   },
    //   textAnchor: 'start',
    //   style: {
    //     fontSize: '14px',
    //     fontWeight: 'bold',
    //     colors: ['#000'],
    //   },
    // },
    // colors: ['#E8F4FE'],
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
          return FormatCurrency.format(value)
        },
      },
    },
    xaxis: {
      categories: storageDates,
    //   max: Number(Math.max(...series[0].data) + 10),
      labels: {
        show: false,
      },
    },
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

  return <ApexCharts options={options} series={series} type='line' />
}

export default StorageChart
