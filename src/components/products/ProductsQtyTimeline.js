import dynamic from 'next/dynamic'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

function ProductsQtyTimeline({ dates, dailyQty, dailySellerValue, dailyLandedValue }) {
  const { state } = useContext(AppContext)
  const series = [
    {
      name: 'Daily Seller Value',
      data: dailySellerValue,
    },
    {
      name: 'Daily Landed Value',
      data: dailyLandedValue,
    },
    {
      name: 'Daily Qty',
      data: dailyQty,
    },
  ]

  const options = {
    chart: {
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    markers: {
      size: 3,
    },
    legend: {
      onItemClick: {
        toggleDataSeries: true,
      },
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
    colors: ['#3577f1', '#0ab39c', '#f7b84b'],
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
          return FormatIntNumber(state.currentRegion, value)
        },
      },
    },
    xaxis: {
      type: 'datetime',
      categories: dates.map((date) => new Date(date).getTime()),
      labels: {
        show: true,
      },
    },
    yaxis: [
      {
        seriesName: 'Daily Seller Value',
        show: true,
        showAlways: true,
        labels: {
          show: true,
          align: 'left',
          trim: false,
          formatter: function (val) {
            return FormatCurrency(state.currentRegion, val)
          },
          style: {
            fontSize: '12px',
            fontWeight: 300,
            cssClass: 'chargesTitles',
          },
        },
      },
      {
        seriesName: 'Daily Seller Value',
        show: true,
        showAlways: true,
        labels: {
          show: false,
          align: 'left',
          trim: false,
          formatter: function (val) {
            return FormatCurrency(state.currentRegion, val)
          },
          style: {
            fontSize: '12px',
            fontWeight: 300,
            cssClass: 'chargesTitles',
          },
        },
      },
      {
        opposite: true,
        seriesName: 'Daily Qty',
        show: true,
        showAlways: true,
        labels: {
          show: true,
          align: 'left',
          trim: false,
          formatter: function (val) {
            return FormatIntNumber(state.currentRegion, val)
          },
          style: {
            fontSize: '12px',
            fontWeight: 300,
            cssClass: 'chargesTitles',
          },
        },
      },
    ],
  }

  return <ApexCharts options={options} series={series} type='line' height={400} />
}

export default ProductsQtyTimeline
