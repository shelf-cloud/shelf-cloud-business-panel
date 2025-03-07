/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from 'react'
import AppContext from '@context/AppContext'
import dynamic from 'next/dynamic'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import moment, { min } from 'moment'
import { Button } from 'reactstrap'
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const ReorderingPointsTimeLine = ({ productTimeLine, leadtime, daysRemaining, poDates, forecast, bestModel }) => {
    const { state } = useContext(AppContext)
    const [grouping, setGrouping] = useState('daily')
    const [currentDateIndex, setcurrentDateIndex] = useState(0)

    const today = moment().startOf('day').format('YYYY-MM-DD')
    const currentStartOfWeek = moment().startOf('week').format('YYYY-MM-DD')
    const currentMonth = moment().format('YYYY-MM')
    const dateAfterLeadTime = moment().startOf('day').add(leadtime, 'days').format('YYYY-MM-DD')
    const OutOfStockDate = moment().startOf('day').add(daysRemaining, 'days').format('YYYY-MM-DD')

    useEffect(() => {
        if (grouping === 'daily') {
            setcurrentDateIndex(Object.keys(timeLineSorted).indexOf(today))
        } else if (grouping === 'weekly') {
            setcurrentDateIndex(Object.keys(timeLineSorted).indexOf(currentStartOfWeek))
        } else if (grouping === 'monthly') {
            setcurrentDateIndex(Object.keys(timeLineSorted).indexOf(currentMonth))
        }
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
            const weekYear = `${moment(key).startOf('week').format('YYYY-MM-DD')}`
            if (result[weekYear] === undefined) {
                result[weekYear] = {
                    unitsSold: productTimeLine[key].unitsSold,
                    dailyStock: productTimeLine[key].dailyStock,
                    dailyStockFBA: productTimeLine[key].dailyStockFBA,
                }
            } else {
                result[weekYear].unitsSold += productTimeLine[key].unitsSold
                // result[weekYear].dailyStock += productTimeLine[key].dailyStock
                // result[weekYear].dailyStockFBA += productTimeLine[key].dailyStockFBA
            }
            return result
        }, {})

    const monthlyTimeLineSorted = Object.keys(productTimeLine)
        .sort()
        .reduce(function (result, key) {
            const weekYear = `${moment(key).year()}-${moment(key).format('MM')}`
            if (result[weekYear] === undefined) {
                result[weekYear] = {
                    unitsSold: productTimeLine[key].unitsSold,
                    dailyStock: productTimeLine[key].dailyStock,
                    dailyStockFBA: productTimeLine[key].dailyStockFBA,
                }
            } else {
                result[weekYear].unitsSold += productTimeLine[key].unitsSold
                // result[weekYear].dailyStock += productTimeLine[key].dailyStock
                // result[weekYear].dailyStockFBA += productTimeLine[key].dailyStockFBA
            }
            return result
        }, {})

    const dailytimeForecast = forecast ? Object.entries(forecast)?.reduce(function (result, [date, unitsSold]) {
        result[moment(date).startOf('day').format("YYYY-MM-DD")] = Math.ceil(unitsSold)
        return result
    }, {}) : []

    const weeklyForecast = forecast ? Object.entries(forecast)?.reduce(function (result, [date, unitsSold]) {
        const weekYear = `${moment(date).startOf('week').format('YYYY-MM-DD')}`
        if (result[weekYear] === undefined) {
            result[weekYear] = Math.ceil(unitsSold)
        } else {
            result[weekYear] += Math.ceil(unitsSold)
        }
        return result
    }, {}) : []

    const monthlyForecast = forecast ? Object.entries(forecast)?.reduce(function (result, [date, unitsSold]) {
        const weekYear = `${moment(date).year()}-${moment(date).format('MM')}`
        if (result[weekYear] === undefined) {
            result[weekYear] = Math.ceil(unitsSold)
        } else {
            result[weekYear] += Math.ceil(unitsSold)
        }
        return result
    }, {}) : []

    const timeLineSorted = grouping === 'daily' ? dailytimeLineSorted : grouping === 'weekly' ? weeklyTimeLineSorted : monthlyTimeLineSorted
    const forecastSorted = grouping === 'daily' ? dailytimeForecast : grouping === 'weekly' ? weeklyForecast : monthlyForecast

    const series = [
        {
            name: 'Units Sold',
            data: Object.entries(timeLineSorted).slice(0, currentDateIndex + 1).map(([date, item]) => { return { x: date, y: item.unitsSold } }),
        },
        {
            name: 'Forecast',
            data: Object.entries(forecastSorted).map(([date, item]) => { return { x: date, y: item } }),
        },
        {
            name: 'Daily Stock',
            data: Object.entries(timeLineSorted).slice(0, currentDateIndex + 1).map(([date, item]) => { return { x: date, y: item.dailyStock + item.dailyStockFBA } }),
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
            width: [2, 2, 3],
            curve: 'smooth',
        },
        markers: {
            size: grouping === 'daily' ? 0 : 4,
        },
        legend: {
            onItemClick: {
                toggleDataSeries: true
            }
        },
        annotations: {
            xaxis: [
                {
                    x: new Date(today).getTime(),
                    borderColor: '#0ab39c',
                    label: {
                        borderColor: '#0ab39c',
                        style: {
                            color: "#fff",
                            background: "#0ab39c"
                        },
                        orientation: 'vertical',
                        text: 'Today'
                    }
                },
                {
                    x: new Date(dateAfterLeadTime).getTime(),
                    borderColor: '#2980B9',
                    label: {
                        borderColor: '#2980B9',
                        style: {
                            color: "#fff",
                            background: "#2980B9"
                        },
                        orientation: 'vertical',
                        text: 'Lead Time'
                    }
                },
                {
                    x: new Date(OutOfStockDate).getTime(),
                    borderColor: '#E74C3C',
                    label: {
                        borderColor: '#E74C3C',
                        style: {
                            color: "#fff",
                            background: "#E74C3C"
                        },
                        orientation: 'vertical',
                        text: 'Out Of Sotck'
                    }
                },
                ...Object.entries(poDates).map(([date, value]) => {
                    const arrivalDate = moment(date).startOf('day').add(leadtime, 'days').format('YYYY-MM-DD')
                    return {
                        x: new Date(arrivalDate).getTime(),
                        borderColor: '#A569BD',
                        label: {
                            borderColor: '#A569BD',
                            style: {
                                color: "#fff",
                                background: "#A569BD"
                            },
                            orientation: 'vertical',
                            text: 'PO Arrival'
                        }
                    }
                })

            ]
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
                // formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
                //   return FormatCurrency(state.currentRegion, value)
                // },
            },
        },
        xaxis: {
            type: 'datetime',
            // tickAmount: Object.keys(timeLineSorted).length / 8,
            // categories: Object.keys(timeLineSorted).map((item) => new Date(item).getTime()),
            min: new Date(Object.keys(timeLineSorted)[0]).getTime(),
            max: new Date(Object.keys(timeLineSorted)[Object.keys(timeLineSorted).length - 1]).getTime(),
            labels: {
                show: true,
            },
        },
        yaxis: [
            {
                seriesName: 'Units Sold',
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
            {
                seriesName: 'Units Sold',
                show: true,
                showAlways: true,
                labels: {
                    show: false,
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
            {
                opposite: true,
                seriesName: 'Daily Stock',
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

export default ReorderingPointsTimeLine
