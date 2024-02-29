import React, { useContext, useState, useEffect } from 'react'
import AppContext from '@context/AppContext'
import dynamic from 'next/dynamic'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import moment from 'moment'
import { Button } from 'reactstrap'
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const ProductPerformanceTimeline = ({ productTimeLine }) => {
  const { state } = useContext(AppContext)
  const [grouping, setGrouping] = useState('daily')

  useEffect(() => {
  }, [grouping])

  const dailytimeLineSorted = Object.keys(productTimeLine)
    .sort()
    .reduce(function (result, key) {
      result[key] = productTimeLine[key]
      return result
    }, {})

  const weeklyTimeLineSorted = Object.keys(productTimeLine)
    .sort()
    .reduce(function (result, key) {
      // const weekYear = `${moment(key).year()}-${moment(key).format('MM')}`
      const weekYear = `${moment(key).startOf('week').format('YYYY-MM-DD')}`
      if (result[weekYear] === undefined) {
        result[weekYear] = {
          grossRevenue: productTimeLine[key].grossRevenue,
          expenses: productTimeLine[key].expenses,
          unitsSold: productTimeLine[key].unitsSold,
        }
      } else {
        result[weekYear].grossRevenue += productTimeLine[key].grossRevenue
        result[weekYear].expenses += productTimeLine[key].expenses
        result[weekYear].unitsSold += productTimeLine[key].unitsSold
      }
      return result
    }, {})

  const monthlyTimeLineSorted = Object.keys(productTimeLine)
    .sort()
    .reduce(function (result, key) {
      const weekYear = `${moment(key).year()}-${moment(key).format('MM')}`
      if (result[weekYear] === undefined) {
        result[weekYear] = {
          grossRevenue: productTimeLine[key].grossRevenue,
          expenses: productTimeLine[key].expenses,
          unitsSold: productTimeLine[key].unitsSold,
        }
      } else {
        result[weekYear].grossRevenue += productTimeLine[key].grossRevenue
        result[weekYear].expenses += productTimeLine[key].expenses
        result[weekYear].unitsSold += productTimeLine[key].unitsSold
      }
      return result
    }, {})

  const timeLineSorted = grouping === 'daily' ? dailytimeLineSorted : grouping === 'weekly' ? weeklyTimeLineSorted : monthlyTimeLineSorted

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
        enabled: true,
      },
      toolbar: {
        show: true,
      },
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    markers: {
      size: grouping === 'daily' ? 0 : 4,
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
        //   return FormatCurrency(state.currentRegion, value)
        // },
      },
    },
    xaxis: {
      type: 'datetime',
      // tickAmount: Object.keys(timeLineSorted).length / 8,
      categories: Object.keys(timeLineSorted).map((item) => new Date(item).getTime()),
      labels: {
        show: true,
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
  return (
    <>
      <div className='px-4 m-0 d-flex flex-row justify-content-start align-items-center gap-2'>
        <Button size='sm' color={grouping === 'daily' ? 'primary' : 'light'} onClick={() => setGrouping('daily')}>
          Daily
        </Button>
        <Button size='sm' color={grouping === 'weekly' ? 'primary' : 'light'} onClick={() => setGrouping('weekly')}>
          Weekly
        </Button>
        <Button size='sm' color={grouping === 'monthly' ? 'primary' : 'light'} onClick={() => setGrouping('monthly')}>
          Monthly
        </Button>
      </div>
      <ApexCharts options={options} series={series} type='line' height={330} />
    </>
  )
}

export default ProductPerformanceTimeline
