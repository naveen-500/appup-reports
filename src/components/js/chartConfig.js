/* eslint-disable no-debugger */
const config = {
  pie: {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: true,
      type: 'pie',
      width: '',
      height: ''
    },
    title: {
      text: '',
      align: 'left',
      x: 10,
    },
    tooltip: {
      pointFormatter: function () {
        return '<span style="color:{point.color}">\u25CF</span> ' + this.series.name + ': <b>' + this.y + '</b><br/>'
      },
      backgroundColor: '#FFFFFF',
      borderColor: '#ccc',
      borderRadius: 10,
      borderWidth: 0.2
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      symbolPadding: 12,
      itemWidth: 100,
      itemMarginTop: 5,
      itemMarginBottom: 5,
      itemStyle: {
        lineHeight: '12px',
      },
    },
    plotOptions: {
      series: {
        pointWidth: 20,
        borderRadius: 2,
      },
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
      },
    },
    series: [
      {
        innerSize: '70%',
        name: '',
        data: [],
      },
    ],
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'downloadCSV']
        }
      }
    },

    lang: {
      noData: 'No data available',
    },
    noData: {
      position: {
        align: 'center',
        verticalAlign: 'middle',
        x: 0,
        y: 0,
      },
      style: {
        fontWeight: 'bold',
        fontSize: '20px',
        color: '#303030',
      },
    },
  },
  bar: {
    time: {
      timezoneOffset: '-330',
    },
    tooltip: {},
    title: {
      text: '',
      align: 'left',
      x: 10,
    },
    chart: {
      type: 'column',
      plotShadow: true,
      width: '',
      height: '',
    },
    xAxis: {
      type: '',
      title: {
        text: ''
      }
    },
    yAxis: {
      title: {
        text: '',
        offset: 40,
        x: 0
      }
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      symbolPadding: 12,
      itemWidth: 100,
      itemMarginTop: 5,
      itemMarginBottom: 5,
      itemStyle: {
        lineHeight: '12px',
      },
    },
    plotOptions: {
      series: {
        pointWidth: 20,
        borderRadius: 2,
      },
    },
    series: [
      {
        name: '',
        data: [],
      },
    ],
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'downloadCSV']
        }
      }
    },
    lang: {
      noData: 'No data available',
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '20px',
        color: '#303030',
      },
    },
  },
  line: {
    time: {
      timezoneOffset: '-330',
    },
    tooltip: {
      shared: true
    },
    title: {
      text: '',
      align: 'left',
      x: 10,
    },
    chart: {
      type: 'areaspline',
      width: '',
      height: '',
      plotShadow: true,
    },
    xAxis: {
      type: '',
      title: {
        text: ''
      }
    },
    yAxis: {
      title: {
        text: ''
      }
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      symbolPadding: 12,
      itemWidth: 100,
      itemMarginTop: 5,
      itemMarginBottom: 5,
      itemStyle: {
        lineHeight: '12px',
      },
    },
    plotOptions: {
      areaspline: {
        lineColor: '#c6ffd7',
      },
      series: {
        marker: {
          enabled: true,
          states: {
            hover: {
              enabled: true,
              radius: 5
            }
          }
        },
      }
    },
    series: [
      {
        color: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1,
          },
          stops: [
            [0, '#c6ffd7'],
            [1, '#ffffff'],
          ],
        },
        data: [],
      },
    ],
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'downloadCSV']
        }
      }
    },
    lang: {
      noData: 'No data available',
    },
    noData: {
      position: {
        align: 'center',
        verticalAlign: 'middle',
        x: 0,
        y: 0,
      },
      style: {
        fontWeight: 'bold',
        fontSize: '20px',
        color: '#303030',
      },
    },
  },
  table: {
    table_name: '',
    collection: {
      url: '',
      ac_cursor: {},
      method: 'GET',
      params: {},
      sort_key: 'name',
    },
    card_links: [
      {
        label: 'First',
        href: '/first',
        variant: 'primary',
      },
      {
        label: 'Second',
        href: '/second',
        variant: 'success',
      },
    ],
    table_data: '',
    dropdown: {
      options: [
        {
          label: 'Edit',
          type: 'edit',
          icon: 'fas fa-pencil-alt',
          handler: 'hello',
        },
        {
          label: 'Delete',
          type: 'delete',
          icon: 'fas fa-trash-alt',
          handler: 'hello',
        },
      ],
      button_options: {
        icon: 'fal fa-ellipsis-h',
        variant: 'bg-transparent p-0',
        size: 'lg',
        right: true,
      },
      tabledata: {},
    },
  },
  card: {
    collection: {
      url: '',
    },
    title: '',
  },
  groupedbar: {
    chart: {
      type: 'GroupBar',
      width: '',
      height: ''
    },
    title: {
      text: '',
      align: 'left',
      x: 10,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'downloadCSV']
        }
      }
    },
    xAxis: {
      categories: [],
      crosshair: true,
      title: {
        text: ''
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      }
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [],
  }

};
export default config;
