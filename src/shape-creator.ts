export class ShapeCreator {

    constructor() {}

    changeBackground (value: string) {
        document.getElementById("supercontenaire").style['background-color'] = value;
    }

    creatVolBar (main: any, prop: string, x:number, x2: number, verticalScales:any, i: number, colour: any) {   
        let dataGap: number = main.dataGap*main.zoom;
        let h: number = main.Y_mainSpace + main.Y_upperTextSpace;
        let yRange: number = verticalScales.highestVolume - verticalScales.lowestVolume;
        let  y: number = h + 5 + main.Y_volumeSpace * ( 1 - ( (main.data[i].volume - verticalScales.lowestVolume) / yRange)); // + 5 pour que volume ne touche jamais les chart bar
        let length: number = main.Y_volumeSpace;
        main.renderObj[prop].getContext('2d').fillStyle = colour;
        main.renderObj[prop].getContext('2d').rect(x, y, dataGap, length);
    }

    creatBar(main: any, prop: string, x:number, x2: number, verticalScales:any, i: number, colour: any) {
        let dataGap: number = main.dataGap*main.zoom;
        let yRange: number = verticalScales.highestPrice - verticalScales.lowestPrice;
        let y: number = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].highest - verticalScales.lowestPrice) / yRange));            
        let length: number = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].lowest - verticalScales.lowestPrice) / yRange)) - y;
        let yAv: number = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].average - verticalScales.lowestPrice) / yRange));
        let type = (i > 0 && main.data[i].average < main.data[i-1].average) ? 'lower' : 'higher';
        main.renderObj[`${prop}${type}`].getContext('2d').globalCompositeOperation = 'destination-over';
        main.renderObj[`${prop}${type}`].getContext('2d').fillStyle = colour[type];
        main.renderObj[`${prop}${type}`].getContext('2d').rect(x, y, dataGap, length);
    }
    
    averageDot(main: any, prop: string, x:number, x2: number, verticalScales:any, i: number, colour: string) {
        let dataGap: number = main.dataGap*main.zoom;
        let yRange: number = verticalScales.highestPrice - verticalScales.lowestPrice;
        let yAv: number = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].average - verticalScales.lowestPrice) / yRange));
        main.renderObj[`${prop}`].getContext('2d').fillStyle = colour;
        main.renderObj[`${prop}`].getContext('2d').rect((x+dataGap/2)-1.25, yAv-1.25, 2.5, 2.5);
    }

    creatLine(main: any, prop: string, x1:number, x2: number, verticalScales:any, i: number, colour: any) {
        if( i < main.dataLength - 1) {
            let dataGap: number = main.dataGap*main.zoom;
            let yRange: number = verticalScales.highestPrice - verticalScales.lowestPrice;
            let y1: number = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].average - verticalScales.lowestPrice) / yRange));
            let y2: number = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i+1].average - verticalScales.lowestPrice) / yRange));
            main.renderObj[prop].getContext('2d').strokeStyle = colour;
            main.renderObj[prop].getContext('2d').lineWidth = 2;
            main.renderObj[prop].getContext('2d').moveTo(x1+dataGap/2, y1);
            main.renderObj[prop].getContext('2d').lineTo(x2+dataGap/2, y2);
        }
    }

    creatMovAv5d(main: any, prop: string, x1: number, x2: number, movAv5d: number, verticalScales: any, i: number, colour: string) {
        let dataGap: number = main.dataGap*main.zoom;
        let yRange: number = verticalScales.highestPrice - verticalScales.lowestPrice;
        let y1: number = 0;
        let y2: number = 0;
        if (i<=3) {
            y1 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( ((movAv5d/(i+1)) - verticalScales.lowestPrice) / yRange));
            y2 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (((movAv5d + main.data[i + 1].average)/(i+2)) - verticalScales.lowestPrice) / yRange));
        } else {
            y1 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( ((movAv5d/5) - verticalScales.lowestPrice) / yRange));
            y2 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( ((movAv5d + main.data[i + 1].average - main.data[i - 4].average) / 5 ) - verticalScales.lowestPrice) / yRange);
        }

        main.renderObj['movingAverage5d'].getContext('2d').lineWidth = 2;
        main.renderObj['movingAverage5d'].getContext('2d').strokeStyle = colour;
        main.renderObj['movingAverage5d'].getContext('2d').moveTo(x1+dataGap/2, y1);
        main.renderObj['movingAverage5d'].getContext('2d').lineTo(x2+dataGap/2, y2);
    }
    
    creatMovAv20d(main: any, prop: string, x1: number, x2: number, movAv20d: number, verticalScales: any, i: number, colour: string) {
        let dataGap: number = main.dataGap*main.zoom;
        let yRange: number = verticalScales.highestPrice - verticalScales.lowestPrice;
        let y1: number = 0;
        let y2: number = 0;
        if (i<=18) {
            y1 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( ((movAv20d/(i+1)) - verticalScales.lowestPrice) / yRange));
            y2 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (((movAv20d + main.data[i + 1].average)/(i+2)) - verticalScales.lowestPrice) / yRange));
        } else {
            y1 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( ((movAv20d/20) - verticalScales.lowestPrice) / yRange));
            y2 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( ((movAv20d + main.data[i + 1].average - main.data[i - 19].average) / 20 ) - verticalScales.lowestPrice) / yRange);
        }

        main.renderObj['movingAverage20d'].getContext('2d').lineWidth = 2;
        main.renderObj['movingAverage20d'].getContext('2d').strokeStyle = colour;
        main.renderObj['movingAverage20d'].getContext('2d').moveTo(x1+dataGap/2, y1);
        main.renderObj['movingAverage20d'].getContext('2d').lineTo(x2+dataGap/2, y2);
    }

    creatDonchian(main: any, prop: string, x1: number, x2: number, donchian: any, verticalScales: any, i: number, colour: string) {
        let yRange: number = verticalScales.highestPrice - verticalScales.lowestPrice;
        let y1: number, y2: number ,y3: number ,y4: number ,nextLow: number ,nextHigh: number ,temp: number[];
        main.renderObj['donchianChannel'].getContext('2d').globalAlpha = 0.3;
        if (i<=4) {
            main.data[i+1].lowest < donchian.lastLow ? nextLow = main.data[i+1].lowest : nextLow = donchian.lastLow;
            main.data[i+1].highest > donchian.lastHigh ? nextHigh = main.data[i+1].highest : nextHigh = donchian.lastHigh;
            
            y1 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (donchian.lastLow - verticalScales.lowestPrice) / yRange));
            y2 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (donchian.lastHigh - verticalScales.lowestPrice) / yRange));
            y3 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (nextLow - verticalScales.lowestPrice) / yRange));
            y4 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (nextHigh - verticalScales.lowestPrice) / yRange));

            main.renderObj['donchianChannel'].getContext('2d').fillStyle = colour;
            main.renderObj['donchianChannel'].getContext('2d').moveTo(x1, y1);
            main.renderObj['donchianChannel'].getContext('2d').lineTo(x1, y2);
            main.renderObj['donchianChannel'].getContext('2d').lineTo(x2, y4);
            main.renderObj['donchianChannel'].getContext('2d').lineTo(x2, y3);
        } else {        
            if ((i - donchian.lastLowIndex) > 4) { 
                  temp = findPic('low', main.data, i); 
                  donchian.lastLow = temp[0]; 
                  donchian.lastLowIndex = temp[1];
             }
            if ((i - donchian.lastHighIndex) > 4) { 
                  temp = findPic('high', main.data, i); 
                  donchian.lastHigh = temp[0]; 
                  donchian.lastHighIndex = temp[1]; 
            }
            nextLow = findPic('low', main.data, i+1)[0];
            nextHigh = findPic('high', main.data, i+1)[0];

            y1 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (donchian.lastLow - verticalScales.lowestPrice) / yRange));
            y2 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (donchian.lastHigh - verticalScales.lowestPrice) / yRange));
            y3 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (nextLow - verticalScales.lowestPrice) / yRange));
            y4 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (nextHigh - verticalScales.lowestPrice) / yRange));
            main.renderObj['donchianChannel'].getContext('2d').fillStyle = colour;
            main.renderObj['donchianChannel'].getContext('2d').moveTo(x1, y1);
            main.renderObj['donchianChannel'].getContext('2d').lineTo(x1, y2);
            main.renderObj['donchianChannel'].getContext('2d').lineTo(x2, y4);
            main.renderObj['donchianChannel'].getContext('2d').lineTo(x2, y3);
        }
      
        function findPic(type: string, data: any, i: number) {
            let temp: number[] = [0,0]; // [value, index]
            if (type === 'low') {
                temp[0] = data[i-4].lowest;
                for(let j = 5; j >= 0; j--) {
                    if(temp[0] > data[i-j].lowest) {
                        temp[0] = (data[i-j].lowest);
                        temp[1] = (i-j);
                    }
                }
            } else {
                temp[0] = data[i-4].highest;
                for(let j = 5; j >= 0; j--) {
                    if(temp[0] < data[i-j].highest) {
                        temp[0] = (data[i-j].highest);
                        temp[1] = (i-j);
                    }
                }
            }
            return temp;
        }
    }
}