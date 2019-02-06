export class ShapeCreator {

    constructor() {}

    // changeBackground (value: string) {
    //     // let supercontenaire = document.getElementById("supercontenaire");
    //     // supercontenaire.style["background-color"] = value ;
    //     document.getElementById("supercontenaire").style['background-color'] = value;
    // }

    creatVolBar (main: any, X:number, i: number, verticalScales:any) {    
    // creatVolBar (main_ctx: any, dataGap: number, X:number, Y_volumeSpace: number, h: number, data: any, i: number, verticalScales:any) {
        let dataGap = main.dataGap*main.zoom;
        let h = main.Y_mainSpace + main.Y_upperTextSpace
        let yRange = verticalScales.highestVolume - verticalScales.lowestVolume;
        let  y = h + 5 + main.Y_volumeSpace * ( 1 - ( (main.data[i].volume - verticalScales.lowestVolume) / yRange)); // + 5 pour que volume ne touche jamais les chart bar
        let length = main.Y_volumeSpace;
        main.main_ctx.fillStyle = '#007491' 
        main.main_ctx.fillRect(X, y, dataGap, length);
    }

    creatBar(main: any, x:number, i: number, verticalScales:any) {
        let dataGap = main.dataGap*main.zoom
        let yRange = verticalScales.highestPrice - verticalScales.lowestPrice;
        let y = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].highest - verticalScales.lowestPrice) / yRange));            
        let lenght = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].lowest - verticalScales.lowestPrice) / yRange)) - y;
        // main.main_ctx.globalCompositeOperation='destination-over';
        main.main_ctx.fillStyle = (i > 0 && main.data[i].average < main.data[i-1].average) ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
        main.main_ctx.fillRect(x, y, dataGap, lenght);
        // for average point, hmm faire une crois plutot ça rendra mieu (genre +)
        let yAv = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].average - verticalScales.lowestPrice) / yRange));
        main.main_ctx.fillStyle = 'black';
        main.main_ctx.fillRect((x+dataGap/2)-1.125, yAv, 2.5, 2.5);
    }

    // creatLine(x1, x2, price, height, data, i) {
    creatLine(main: any, x1: number, x2: number, verticalScales: any, i: number) { // ha corriger zoom pour comprendre >> done, approfondir lire la doc
        if( i < main.dataLength - 1) {
            let dataGap = main.dataGap*main.zoom
            let yRange = verticalScales.highestPrice - verticalScales.lowestPrice;
            let y1 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i].average - verticalScales.lowestPrice) / yRange));
            let y2 = main.Y_upperTextSpace + main.Y_mainSpace * ( 1 - ( (main.data[i+1].average - verticalScales.lowestPrice) / yRange));
            main.main_ctx.globalCompositeOperation='multiply';
            main.main_ctx.beginPath();
            main.main_ctx.fillStyle = 'black';
            main.main_ctx.moveTo(x1+dataGap/2, y1);
            main.main_ctx.lineTo(x2+dataGap/2, y2);
            main.main_ctx.stroke();
        }
    }
    
    // creatMovAv5d(x1, x2, movAv5d, price, height, data, i, dataLength) {
    //     let y1 = 0;
    //     let y2 = 0;
    //     if (i<=3) {
    //         y1 = height.marginHeight + setHeight(height.chartHeight, price, (movAv5d/(i+1)));
    //         y2 = height.marginHeight + setHeight(height.chartHeight, price, (movAv5d + data[i + 1].average) / (i+2));
    //         return creatSvgElement("line",{"class":"MovAv5d","x1":x1,"y1":y1,"x2":x2,"y2":y2,"stroke":this.colour});
    //     } else if (i < dataLength-1) {
    //         y1 = height.marginHeight + setHeight(height.chartHeight, price, (movAv5d/5));
    //         y2 = height.marginHeight + setHeight(height.chartHeight, price, ((movAv5d + data[i + 1].average - data[i - 4].average) / 5 ));
    //         return creatSvgElement("line",{"class":"MovAv5d","x1":x1,"y1":y1,"x2":x2,"y2":y2,"stroke":this.colour});
    //     }
    // }
    
    // creatMovAv20d(x1, x2, movAv20d, price, height, data, i, dataLength) { // ligne brisé à i === 20 >> probleme reglé
    //     let y1 = 0;
    //     let y2 = 0;
    //     if (i<=18) {
    //         y1 = height.marginHeight + setHeight(height.chartHeight, price, (movAv20d/(i+1)));
    //         y2 = height.marginHeight + setHeight(height.chartHeight, price, ((movAv20d + data[i + 1].average) / (i+2) ));
    //         return creatSvgElement("line",{"class":"MovAv20d","x1":x1,"y1":y1,"x2":x2,"y2":y2,"stroke":this.colour});
    //     } else if (i < dataLength-1) {
    //         y1 = height.marginHeight + setHeight(height.chartHeight, price, (movAv20d/20));
    //         y2 = height.marginHeight + setHeight(height.chartHeight, price, ((movAv20d + data[i + 1].average - data[i - 19].average) / 20 ));
    //         return creatSvgElement("line",{"class":"MovAv20d","x1":x1,"y1":y1,"x2":x2,"y2":y2,"stroke":this.colour});
    //     }
    // }
      
    // creatDonchian(x1, x2, donchian, price, height, data, i, dataLength) { // ne fonctionne pas bien
    //     let y1,y2,y3,y4,nextLow,nextHigh,temp;
    //     x2 = x2 + 0.1;
    //     if (i<=4) {
    //         data[i+1].lowest < donchian.lastLow ? nextLow = data[i+1].lowest : nextLow = donchian.lastLow;
    //         data[i+1].highest > donchian.lastHigh ? nextHigh = data[i+1].highest : nextHigh = donchian.lastHigh;
    //         y1 = height.marginHeight + setHeight(height.chartHeight, price, donchian.lastLow);
    //         y2 = height.marginHeight + setHeight(height.chartHeight, price, donchian.lastHigh);
    //         y3 = height.marginHeight + setHeight(height.chartHeight, price, nextLow);
    //         y4 = height.marginHeight + setHeight(height.chartHeight, price, nextHigh);
    //         return creatSvgElement("polygon",{"class":"donchian","points":`${x1},${y1} ${x1},${y2} ${x2},${y4} ${x2},${y3}`,"fill":this.colour,"opacity":0.5});
    //     } else if (i < dataLength-1) {
    //         if ((i - donchian.lastLowIndex) > 4) { 
    //               temp = findPic('low', data, i); 
    //               donchian.lastLow = temp[0]; 
    //               donchian.lastLowIndex = temp[1] 
    //          }
    //         if ((i - donchian.lastHighIndex) > 4) { 
    //               temp = findPic('high', data, i); 
    //               donchian.lastHigh = temp[0]; 
    //               donchian.lastHighIndex = temp[1] 
    //         }
    //         nextLow = findPic('low', data, i+1)[0];
    //         nextHigh = findPic('high', data, i+1)[0];
    //         y1 = height.marginHeight + setHeight(height.chartHeight, price, donchian.lastLow);
    //         y2 = height.marginHeight + setHeight(height.chartHeight, price, donchian.lastHigh);
    //         y3 = height.marginHeight + setHeight(height.chartHeight, price, nextLow);
    //         y4 = height.marginHeight + setHeight(height.chartHeight, price, nextHigh);
    //         return creatSvgElement("polygon",{"class":"donchian","points":`${x1},${y1} ${x1},${y2} ${x2},${y4} ${x2},${y3}`,"fill":this.colour,"opacity":0.5});
    //     }
      
    //     function findPic(type, data, i) {
    //         let temp = [0,0]; // [value, index]
    //         if (type === 'low') {
    //             temp[0] = data[i-4].lowest;
    //             for(let j = 5; j >= 0; j--) {
    //                 if(temp[0] > data[i-j].lowest) {
    //                     temp[0] = (data[i-j].lowest);
    //                     temp[1] = (i-j);
    //                 }
    //             }
    //         } else {
    //             temp[0] = data[i-4].highest;
    //             for(let j = 5; j >= 0; j--) {
    //                 if(temp[0] < data[i-j].highest) {
    //                     temp[0] = (data[i-j].highest);
    //                     temp[1] = (i-j);
    //                 }
    //             }
    //         }
    //         return temp;
    //     }

}