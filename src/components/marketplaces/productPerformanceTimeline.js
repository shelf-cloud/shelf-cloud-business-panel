import React, { useContext } from 'react'
import AppContext from '@context/AppContext'
import dynamic from 'next/dynamic'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import moment from 'moment'
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const ProductPerformanceTimeline = ({ productTimeLine }) => {
  const { state } = useContext(AppContext)
  const timeLineSorted = Object.keys(productTimeLine)
    .sort()
    .reduce(function (result, key) {
      result[key] = productTimeLine[key]
      return result
    }, {})
  const series = [
    {
      name: 'Gross Revenue',
      data: Object.values(timeLineSorted).map((item) => Number(item.grossRevenue).toFixed(2)),
    },
    {
      name: 'Expenses',
      data: Object.values(timeLineSorted).map((item) => Number(item.expenses).toFixed(2)),
    },
    {
      name: 'Profit',
      data: Object.values(timeLineSorted).map((item) => Number(item.grossRevenue - item.expenses).toFixed(2)),
    },
    {
      name: 'Units',
      data: Object.values(timeLineSorted).map((item) => Number(item.unitsSold).toFixed(2)),
    },
  ]

  const options = {
    chart: {
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    markers: {
      size: 3,
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
    colors: ['#3577f1', '#f06548', '#0ab39c', '#f7b84b'],
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
        // formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
        //   // console.log('value', series, seriesIndex, dataPointIndex, w)
        //   return FormatCurrency(state.currentRegion, value)
        // },
      },
    },
    xaxis: {
      categories: Object.keys(timeLineSorted).map((item) => moment(item).format('DD-MM-YYYY')),
      //   max: Number(Math.max(...series[0].data) + 10),
      labels: {
        show: false,
      },
    },
    yaxis: [
      {
        seriesName: 'Gross Revenue',
        show: true,
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
        seriesName: 'Gross Revenue',
        show: true,
        labels: {
          show: false,
          align: 'left',
          trim: false,
          formatter: function (val) {
            return FormatCurrency(state.currentRegion, val)
          },
          // style: {
          //   fontSize: '14px',
          //   fontWeight: 400,
          //   cssClass: 'chargesTitles',
          // },
        },
      },
      {
        seriesName: 'Gross Revenue',
        show: true,
        labels: {
          show: false,
          align: 'left',
          trim: false,
          formatter: function (val) {
            return FormatCurrency(state.currentRegion, val)
          },
          // style: {
          //   fontSize: '14px',
          //   fontWeight: 400,
          //   cssClass: 'chargesTitles',
          // },
        },
      },
      {
        opposite: true,
        seriesName: 'Units',
        show: true,
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
  return <ApexCharts options={options} series={series} type='line' height={330} />
}

export default ProductPerformanceTimeline
