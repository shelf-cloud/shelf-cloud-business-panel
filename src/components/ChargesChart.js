import dynamic from 'next/dynamic'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

function ChargesChart({ totalCharges }) {
  const { state } = useContext(AppContext)
  const series = [
    {
      name: 'Charge',
      data: [
        Number(totalCharges?.totalpickpackCharge),
        Number(totalCharges?.totalshippingCharge),
        Number(totalCharges?.totallabeling),
        Number(totalCharges?.totalmanHour),
        Number(totalCharges?.totalextraCharge),
        Number((totalCharges?.totalreceivingService || 0) + (totalCharges?.totalreceivingPallets || 0) + (totalCharges?.totalreceivingWrapService || 0)),
      ],
    },
  ]

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 2,
        dataLabels: {
          position: '',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        if (val > 0) {
          return FormatCurrency(state.currentRegion, val)
        }
      },
      textAnchor: 'start',
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        colors: ['#000'],
      },
    },
    colors: ['#E8F4FE'],
    grid: {
      show: true,
      borderColor: '#000',
      position: 'back',
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
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
    xaxis: {
      categories: ['Pick and Pack', 'Shipping', 'Labeling', 'Man Hours', 'Extra Charges', 'Receiving'],
      max: Number(Math.max(...series[0].data) + 10),
      labels: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
        align: 'left',
        trim: false,
        style: {
          fontSize: '14px',
          fontWeight: 400,
          cssClass: 'chargesTitles',
        },
      },
    },
  }

  return <ApexCharts options={options} series={series} type='bar' />
}

export default ChargesChart
