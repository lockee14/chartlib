export class ShapeCreator {

    constructor() {}

    creatVolBar (main_ctx: any, dataGap: number, X:number, Y_volumeSpace: number, h: number, data: any, i: number, verticalScales:any) {    
        let yRange = verticalScales.highestVolume - verticalScales.lowestVolume;
        let  y = h + 5 + Y_volumeSpace * ( 1 - ( (data[i].volume - verticalScales.lowestVolume) / yRange)); // + 5 pour que volume ne touche jamais les chart bar
        let length = Y_volumeSpace;
        main_ctx.fillStyle = 'rgb(0, 0, 255)' 
        main_ctx.fillRect(X, y, dataGap, length);
    }

    creatBar(main_ctx: any, dataGap: number, X:number, Y_upperTextSpace: number, Y_mainSpace: number, data: any, i: number, verticalScales:any) {
        let yRange = verticalScales.highestPrice - verticalScales.lowestPrice;
        let y = Y_upperTextSpace + Y_mainSpace * ( 1 - ( (data[i].highest - verticalScales.lowestPrice) / yRange));            
        let lenght = Y_upperTextSpace + Y_mainSpace * ( 1 - ( (data[i].lowest - verticalScales.lowestPrice) / yRange)) - y;            
        main_ctx.fillStyle = (i > 0 && data[i].average < data[i-1].average) ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
        main_ctx.fillRect(X, y, dataGap, lenght);
    }
}