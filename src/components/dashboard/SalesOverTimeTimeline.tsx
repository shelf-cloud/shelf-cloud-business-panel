import React, { useContext } from 'react'
import AppContext from '@context/AppContext'
import dynamic from 'next/dynamic'
import { FormatCurrency } from '@lib/FormatNumbers'
import { ApexOptions } from 'apexcharts'
import moment from 'moment'
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const TIMELINE = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
]

const CUURENTHOUR = moment().format('h A')

type Props = {
  salesOverTime: { [key: string]: { [key: string]: number } }
}
const SalesOverTimeTimeline = ({ salesOverTime }: Props) => {
  const { state }: any = useContext(AppContext)
  const currentHourIndex = TIMELINE.indexOf(CUURENTHOUR)
  const YESTERDAY = moment.utc().local().subtract(1, 'days').format('YYYY-MM-DD')
  const TODAY = moment.utc().local().format('YYYY-MM-DD')
  const series = [
    {
      name: 'Today',
      type: 'line',
      data: salesOverTime[TODAY] ? Object?.values(salesOverTime[TODAY]).slice(0, currentHourIndex + 1) : [],
    },
    {
      name: 'Yesterday',
      type: 'area',
      data: salesOverTime[YESTERDAY] ? Object?.values(salesOverTime[YESTERDAY]) : [],
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
      width: [2, 1],
      curve: 'smooth',
      lineCap: 'round',
      dashArray: [0, 5],
    },
    fill: {
      type: 'solid',
      opacity: [1, 0.05],
    },
    markers: {
      size: 3,
      colors: ['#3577f1', '#999d9c'],
    },
    legend: {
      onItemClick: {
        toggleDataSeries: false,
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
    colors: ['#3577f1', '#999d9c'],
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
        //   return FormatCurrency(state.currentRegion, value)
        // },
      },
    },
    xaxis: {
      type: 'category',
      // tickAmount: Object.keys(timeLineSorted).length / 8,
      categories: TIMELINE,
      labels: {
        show: true,
      },
    },
    yaxis: [
      {
        seriesName: 'Today',
        show: true,
        showAlways: true,
        labels: {
          show: true,
          align: 'left',
          trim: false,
          formatter: function (val: number) {
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
        seriesName: 'Today',
        show: true,
        showAlways: true,
        labels: {
          show: false,
          align: 'left',
          trim: false,
          formatter: function (val: number) {
            return FormatCurrency(state.currentRegion, val)
          },
          // style: {
          //   fontSize: '14px',
          //   fontWeight: 400,
          //   cssClass: 'chargesTitles',
          // },
        },
      },
      // {
      //   opposite: true,
      //   seriesName: 'Units',
      //   show: true,
      //   showAlways: true,
      //   labels: {
      //     show: true,
      //     align: 'left',
      //     trim: false,
      //     formatter: function (val) {
      //       return FormatIntNumber(state.currentRegion, val)
      //     },
      //     style: {
      //       fontSize: '12px',
      //       fontWeight: 300,
      //       cssClass: 'chargesTitles',
      //     },
      //   },
      // },
    ],
  } as ApexOptions

  return (
    <>
      <ApexCharts options={options} series={series} type='line' height={300} />
    </>
  )
}

export default SalesOverTimeTimeline
