export const DEFAULTOPTIONS: any = {
  chart: {
    'line': {
      exist: true,
      func: 'creatLine', 
      colour: '#000000',
      layer: 7
    },
    'bar': {
      exist: true,
      func: 'creatBar', 
      colour: {
        higher: '#00FF00',
        lower: '#FF0000',
      },
      layer: 2,
    },
    'average': {
      exist: true,
      func: 'averageDot', 
      colour: '#000000',
      layer: 4
    },
    'volume': {
      exist: true,
      func: 'creatVolBar',
      colour: '#007491',
      layer: 1
    },
    'background': {
      colour: '#1f4c60',
    }
  },
  indicator: {
    'movingAverage5d': {
      exist: true,
      func: 'creatMovAv5d', 
      colour: '#20677d',
      layer: 5
    },
    'movingAverage20d': {
      exist: true,
      func: 'creatMovAv20d',
      colour: '#a87515',
      layer: 6
    },
    'donchianChannel': {
      exist: true,
      colour: '#2a2a31',
      func: 'creatDonchian',
      layer: 0
    }
  }
}