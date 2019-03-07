
// chose à ajouté:
//      -performance: lors du deplacement du curseur, plutot que de tout redessiner, enregistrer l'etat precedent de mon canva et le reservir avec le mouvement du cursuer (sauf si deplacement dans les chart evidemment)
//          -en entré une variable fourni par mon apli ex: "en-us"
//          -crée un objet contenant les traduction
//          -appeler les element de mon object en fonction de [context][lang]
//      -lors d'un click sur wheelimg >> rotation à 360 degres

//  amelioration:
//      -changer l'endroit ou je change la couleur de background voir ligne 284 de index.ts
// Bug:
//      -affichage du volume, je pense qu'il y a un probleme >> à verifier
//      -reflechir à comment bien disposer le contenue des options >> done? à tester

//function that detect if the device is mobile or not
// function isMobileDevice() {
//     return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
// };

// let test = isMobileDevice();
// alert(test);
/////////////////////////////////////////////
/////////////// for developement only //////////////////////////////////////////////////
window.onload = function() { // ici plutot faire click sur submit, recup les req et les mettre dans l'url de recherche des data peut etre dois-je setspace() en tout 1er?
  let obj = {};
//   document.body.style.backgroundColor = "#AA0000";
  let xmlhttp = new XMLHttpRequest();
  //let url = "./mock_data.json";
  let url = "./plex_data.json";
  xmlhttp.open("GET", url , true);
  xmlhttp.setRequestHeader( "Accept", "application/json; charset=utf-8" );
  xmlhttp.onreadystatechange = function () {
    let DONE = this.DONE || 4;
    if (this.readyState === DONE) {
        obj = JSON.parse(xmlhttp.response);
        // initialisation(obj);
        let lang = 'en-us'
        // let lang = 'ja'

        new main(new ShapeCreator, new UserPreferences).init(obj, lang);
      }
  };
  xmlhttp.send(null);

};
/////////////////////////////end of the dev env part///////////////////////////////////////
declare global {
    interface Window { chartlib_canvas: any; }
}
function initialisation(data: Data, lang: string) {
    new main(new ShapeCreator, new UserPreferences).init(data, lang);
}
window.chartlib_canvas = initialisation;

import { ShapeCreator } from './shape-creator'; // unfortunatly externalizing this is very slow with firefox and edge
import { UserPreferences } from './user-preferences';
import { TRANSLATION } from './translation';
import { DEFAULTOPTIONS } from './default-options';

interface Data {
    date: string;
    average: number;
    highest: number;
    lowest: number;
    volume: number;
    order_count: number;
}

interface VerticalScales {
    lowestPrice: number;
    highestPrice: number;
    lowestVolume: number;
    highestVolume: number;
}

const upperTextSpace: number = 0.03;
const displayPriceSpace: number = 0.045;
const mainSpace: number = 0.85;
const volumeSpace: number = 0.12;
class main {
    translation: any = TRANSLATION;
    options: any = {};
    isMobile: boolean = false;
    openOptionBox: boolean = false;
    cursorDebug: HTMLElement;
    cookieObj: any; // useless
    data: ReadonlyArray<Data>;
    dataLength: number;
    lang: string;

    width: number;
    height: number;

    Y_upperTextSpace: number;
    Y_mainSpace: number;
    Y_volumeSpace: number;
    X_priceSpace: number;
    X_chartSpace: number;

    baseInterval: number;
    dataGap: number;

    optionWheel: SVGElement;

    upperText_canvas: HTMLCanvasElement;
    displayPrices_canvas: HTMLCanvasElement;
    main_canvas: HTMLCanvasElement;
    cursor_canvas: HTMLCanvasElement;
    upperText_ctx: CanvasRenderingContext2D;
    displayPrices_ctx: CanvasRenderingContext2D;
    main_ctx: CanvasRenderingContext2D;
    cursor_ctx: CanvasRenderingContext2D;

    renderObj: any = {};

    lastDeltaDiff: number;
    zoom: number = 1;
    click: boolean = false;
    pan: number = 0;
    offset: number = 0;
    currentDataPosition: number = 0;
    pinchZoomDataPosition: number;
    contenaire: HTMLElement;
    contenaireRect: any;
    
    constructor(
        private shapeCreator: ShapeCreator,
        private userPreference: UserPreferences
        ) {}

    init(data: any, lang: string) {
        this.options = this.deepCopyObject(DEFAULTOPTIONS);
        this.cursorDebug = document.getElementById("cursorDebug");
        this.data = data;
        this.dataLength = data.length;
        this.lang = lang;
        this.isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
        let cookieObj: any = this.userPreference.parseCookie();

        for(let prop in cookieObj.userChartPreference) {
            let propArray: string[] = prop.split('.');
            this.setObjValue(propArray, cookieObj.userChartPreference[prop], this.options);
        }
        this.contenaire = document.getElementById("supercontenaire");

        this.createCanvas();
        this.setSpace();
        this.preRender();
        this.displayChart(data);

        this.contenaire.addEventListener('mousemove', (event: MouseEvent) => this.handleCursor(event));
        this.contenaire.addEventListener('touchstart', (event: TouchEvent) => this.handleTouch(event));
        this.contenaire.addEventListener('touchmove', (event: TouchEvent) => this.handleTouch(event));

        this.contenaire.addEventListener('wheel', (event: WheelEvent) => this.wheelHandler(event));
        this.contenaire.addEventListener('mousedown', () => this.click = this.click ? false : true);
        this.contenaire.addEventListener('mouseup', () => this.click = true ?  false : true);
        this.contenaire.addEventListener('mouseleave',() => {document.body.style.cursor = 'default';this.click === true ? this.click = false : null;});

        this.contenaire.addEventListener('click', (event: MouseEvent) => {this.optionWheelClicked(event)});

        window.addEventListener('resize', (event:UIEvent) => {this.setSpace(); this.displayChart(this.data)});
    }

    optionWheelClicked(event: any) {
        if(!this.openOptionBox && this.optionWheel.contains(event.target)) {
            this.openOptionBox = this.openOptionBox ? false : true;
            this.userPreference.setOptionSpace(this);
        } else if(this.openOptionBox) {
            let optionBox = document.getElementById('optionSpace');
            if(!optionBox.contains(event.target) && this.openOptionBox && event.target.id !== 'resetButton') {
                this.openOptionBox = this.openOptionBox ? false : true;
                this.userPreference.closeOptionSpace();
            }
        }     
    }

    createCanvas() {
        let allCanvasId: string[] = ['upperText_canvas', 'displayPrices_canvas', 'main_canvas', 'cursor_canvas'];
        let allCanvas: HTMLCanvasElement[] = new Array(4);
        for (let i = 0; i < 4; i++) {
            allCanvas[i] = document.createElement('canvas');
            allCanvas[i].className = 'canvas';
            allCanvas[i].style.position = 'absolute';
            allCanvas[i].style.left = '0px';
            allCanvas[i].style.top = '0px';

            allCanvas[i].id = allCanvasId[i]
            this[allCanvasId[i]] = allCanvas[i];
            this.contenaire.appendChild(allCanvas[i])
        }

        let svg: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttributeNS(null, 'width', '24');
        svg.setAttributeNS(null, 'height', '24');
        svg.setAttributeNS(null, 'id', 'wheelimg');
        svg.setAttributeNS(null, 'position', 'absolute');
        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        svg.setAttributeNS(null, 'z-index', '10');

        let svgWheel: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg',"path");
        svgWheel.setAttributeNS(null, 'd', 'M19.44 12.99l-.01.02c.04-.33.08-.67.08-1.01 0-.34-.03-.66-.07-.99l.01.02 2.44-1.92-2.43-4.22-2.87 1.16.01.01c-.52-.4-1.09-.74-1.71-1h.01L14.44 2H9.57l-.44 3.07h.01c-.62.26-1.19.6-1.71 1l.01-.01-2.88-1.17-2.44 4.22 2.44 1.92.01-.02c-.04.33-.07.65-.07.99 0 .34.03.68.08 1.01l-.01-.02-2.1 1.65-.33.26 2.43 4.2 2.88-1.15-.02-.04c.53.41 1.1.75 1.73 1.01h-.03L9.58 22h4.85s.03-.18.06-.42l.38-2.65h-.01c.62-.26 1.2-.6 1.73-1.01l-.02.04 2.88 1.15 2.43-4.2s-.14-.12-.33-.26l-2.11-1.66zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z');
        svg.appendChild(svgWheel);
        this.optionWheel = svg;
        this.contenaire.appendChild(svg);
        this.optionWheel.setAttributeNS(null, 'transform', `rotate(0)`);
        // this.optionWheel.style.marginLeft = `${this.contenaire.clientWidth-24}px`;
        // document.getElementById('optionWheel').appendChild(svg);

        this.upperText_ctx = this.upperText_canvas.getContext('2d');
        this.displayPrices_ctx = this.displayPrices_canvas.getContext('2d');
        this.main_ctx = this.main_canvas.getContext('2d');
        this.cursor_ctx = this.cursor_canvas.getContext('2d');
    }

    preRender() {
        for(let prop in this.options.chart) {
            if(prop === 'background') {
                continue;
            } else if(prop === 'bar') {
                for (let colour in this.options.chart[prop].colour) {
                    let canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    this.renderObj[`${prop}${colour}`] = canvas;
                }
            } else {
                let canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.renderObj[prop] = canvas;
            }
        }
        for(let prop in this.options.indicator) {
            let canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.renderObj[prop] = canvas;
        }
    }

    setSpace() {
        let parent: HTMLElement = document.getElementById('supercontenaire');
        this.contenaireRect = parent.getBoundingClientRect();
        this.height = parent.clientHeight;
        this.width = parent.clientWidth;

        this.Y_upperTextSpace = this.height*upperTextSpace;
        this.Y_mainSpace = this.height*mainSpace;
        this.Y_volumeSpace = this.height*volumeSpace;
        this.X_priceSpace = parent.clientWidth * displayPriceSpace;
        this.X_chartSpace = parent.clientWidth - parent.clientWidth * displayPriceSpace;
        this.baseInterval = (parent.clientWidth - this.X_priceSpace)/this.dataLength;
        this.dataGap = this.baseInterval - (this.baseInterval/5);

        let optionWheel: HTMLElement = document.getElementById('wheelimg');
        optionWheel.style.marginLeft = `${parent.clientWidth-24}px`;

        this.upperText_canvas.width = parent.clientWidth;
        this.upperText_canvas.height = parent.clientHeight;
        this.displayPrices_canvas.width = parent.clientWidth;
        this.displayPrices_canvas.height = parent.clientHeight; 
        this.main_canvas.width = parent.clientWidth;
        this.main_canvas.height = parent.clientHeight;
        this.cursor_canvas.width = parent.clientWidth;
        this.cursor_canvas.height = parent.clientHeight;
    }

    displayChart(data: any) {
        let movAv5d: number = 0;
        let movAv20d: number = 0;
        interface Donchian {
            lastLow: number;
            lastLowIndex: number;
            lastHigh: number;
            lastHighIndex: number;
        }
        let donchian: Donchian = {
            lastLow: data[0].lowest,
            lastLowIndex: 0,
            lastHigh: data[0].highest,
            lastHighIndex: 0
        }
        this.shapeCreator.changeBackground(this.options.chart.background.colour); // pourquoi ici? ne l'appeler qu'apres l'init ou si changement

        let currentAbscisse: number = this.X_priceSpace;
        let currentInterval: number = this.baseInterval * this.zoom;
        let nextAbscisse: number = currentAbscisse + currentInterval;

        let start: number = this.pan > 0 ? Math.floor(this.pan/currentInterval) : 0;
        start = start > this.dataLength-1 ? this.dataLength-1 : start;
        let stop: number = Math.floor(this.width/currentInterval + this.pan/currentInterval);
        stop = stop > this.dataLength-1 ? this.dataLength-1 : stop;

        let verticalScales: VerticalScales = this.setVerticalScale(data, start, stop);
        this.displayPrices(verticalScales);
        
        for(let prop in this.renderObj) {
            this.renderObj[prop].getContext('2d').clearRect(0, 0, this.width, this.height);
            this.renderObj[prop].getContext('2d').beginPath();
        }

        this.main_ctx.clearRect(0, 0, this.width, this.height);
        this.main_ctx.beginPath();
        for(let i = 0; i<this.dataLength; i++) {
            movAv5d += data[i].average;
            movAv20d += data[i].average;
            donchian.lastLow > data[i].lowest ? (donchian.lastLow = data[i].lowest, donchian.lastLowIndex = i) : null;
            donchian.lastHigh < data[i].highest ? (donchian.lastHigh = data[i].highest, donchian.lastHighIndex = i) : null;

            i >= 5 ? movAv5d -= data[i-5].average : null;
            i >= 20 ? movAv20d -= data[i-20].average : null;

            this.main_ctx.globalAlpha = 1;
            let indicatorParam: any = {
                movingAverage5d: movAv5d,
                movingAverage20d: movAv20d,
                donchianChannel: donchian
            }
            let x: number = currentAbscisse - this.pan;
            let x2: number = nextAbscisse - this.pan;
            
            if(x >= this.X_priceSpace && x < this.width) {
                for(let prop in this.options.chart) {
                    let colour: any = this.options.chart[prop].colour;
                    if(this.options.chart[prop].hasOwnProperty('func') && this.options.chart[prop]['exist']) {
                        let func = this.options.chart[prop].func;
                        this.shapeCreator[func](this, prop, x, x2, verticalScales, i, colour);
                    }
                }

                for(let prop in this.options.indicator) {
                    let colour: string = this.options.indicator[prop].colour;
                    if(this.options.indicator[prop].hasOwnProperty('func') && this.options.indicator[prop]['exist']) {
                        let func = this.options.indicator[prop].func;
                        this.shapeCreator[func](this, prop, x, x2, indicatorParam[prop], verticalScales, i, colour);
                    }
                }
            }
            nextAbscisse += currentInterval;
            currentAbscisse += currentInterval;
        }

        const drawOrder = new Array(Object.keys(this.renderObj).length-1);

        for(let prop in this.renderObj) {
            if(prop === 'donchianChannel') {
                this.renderObj[prop].getContext('2d').closePath();
                this.renderObj[prop].getContext('2d').fill();
                const order = this.options.indicator[prop].layer;
                drawOrder[order] = this.renderObj[prop];
                // this.main_ctx.drawImage(this.renderObj[prop], 0, 0);
    
            } else {
                if (prop.substr(0,3) === 'bar') {
                    const order = this.options.chart['bar'].layer;
                    if (drawOrder[order] === undefined)  {
                        drawOrder[order] = this.renderObj[prop];
                    } else {
                        drawOrder[order+1] = this.renderObj[prop];
                    }    
                } else {
                    const type =  this.options.chart[prop] ? 'chart' : 'indicator';
                    const order = this.options[type][prop].layer;
                    drawOrder[order] = this.renderObj[prop];
                }
                this.renderObj[prop].getContext('2d').closePath();
                this.renderObj[prop].getContext('2d').stroke();
                this.renderObj[prop].getContext('2d').fill();
                // this.main_ctx.drawImage(this.renderObj[prop], 0, 0);
            }
        }
        for(let i = 0; i < drawOrder.length; i++) {
            this.main_ctx.drawImage(drawOrder[i], 0, 0);
        }
    }

    setVerticalScale(data: any, start: number, stop: number) { // permet de gerer l'echelle des prix (axes des ordonnée : y) ainsi que l'affichage des prix et aussi pour le volume >> à renommer setScale
        let lowestPrice: number, highestPrice: number, lowestVolume: number, highestVolume: number;
        lowestPrice = data[start].lowest;
        highestPrice = data[start].highest;
        lowestVolume = data[start].volume;
        highestVolume = data[start].volume;
        while (start<stop) {
            if ( start < 0) { continue; } // gné?
            lowestPrice > data[start].lowest ? lowestPrice = data[start].lowest : null;
            highestPrice < data[start].highest ? highestPrice = data[start].highest : null;
            lowestVolume > data[start].volume ? lowestVolume = data[start].volume : null;
            highestVolume < data[start].volume ? highestVolume = data[start].volume : null;
            start++;
        }
        return {lowestPrice: lowestPrice, highestPrice: highestPrice, lowestVolume: lowestVolume, highestVolume: highestVolume}
    }

    displayPrices(verticalScales: VerticalScales) { // dispose les prix 
        let priceInterval: number, y: number;
        const yRange: number = verticalScales.highestPrice - verticalScales.lowestPrice;
        priceInterval = verticalScales.lowestPrice;
        this.displayPrices_ctx.clearRect(0, 0, this.width, this.height);
        for(let i=0;i<5;i++) {
            priceInterval += Math.round(yRange/6);
            priceInterval = this.preciseRound(priceInterval, 2);
            y = this.Y_upperTextSpace + this.Y_mainSpace*(1-((priceInterval-verticalScales.lowestPrice)/(yRange))); // encore p[1]-p[0] aka priceRange ça je le calcul aussi dans vertical et juste au dessus
            // crée le text
            this.displayPrices_ctx.fillText(priceInterval.toString(), 0, y);
            this.displayPrices_ctx.beginPath();
            this.displayPrices_ctx.strokeStyle = "rgba(0,0,0,0.4)";
            this.displayPrices_ctx.setLineDash([5, 15]);
            this.displayPrices_ctx.moveTo(this.X_priceSpace, y-3.5);
            this.displayPrices_ctx.lineTo(this.width, y-3.5);
            this.displayPrices_ctx.stroke();
            this.displayPrices_ctx.fillStyle = 'rgb(0, 0, 0)';
            this.displayPrices_ctx.stroke()
        }
    }

    handleCursor(event: MouseEvent) {
        event.preventDefault(); // sert à eviter que la page entière ne scroll
        this.click === true ? this.panHandler(event) : this.offset = 0; // handle pan;
        this.moveGraph(event.clientX, event.clientY);
    }

    handleTouch(event: TouchEvent) {
        let touchedElem: any = event.target;
        if(touchedElem.id === 'wheelimg' || touchedElem.parentNode.id === 'wheelimg' || this.openOptionBox) {
            return;
        }
        event.preventDefault();
        const touchNumber: number = event.touches.length;
        if (touchNumber === 1) {
            event.type === 'touchmove' ? this.panHandler(event.touches[0]) : this.offset = 0;
            this.moveGraph(event.touches[0].clientX, event.touches[0].clientY);
        } else if (touchNumber === 2 && event.type === 'touchstart') {
            const x0: number = event.touches[0].clientX;
            const x1: number = event.touches[1].clientX;
            
            let delta1: number = event.touches[0].clientX / event.touches[0].clientY;
            let delta2: number = event.touches[1].clientX / event.touches[1].clientY;
            this.lastDeltaDiff = delta1 > delta2 ? delta1-delta2 : delta2 - delta1;

            let chartWidthOffset: number = (this.dataGap*this.zoom)/2;
            let interval: number = this.baseInterval*this.zoom; // calcule l'interval courant entre chaque data
            let midx: number = x0 > x1 ? x1 + (x0-x1)/2 : x0 + (x1-x0)/2;
            this.pinchZoomDataPosition = Math.round(((midx-this.contenaireRect.left - this.X_priceSpace - chartWidthOffset)/interval) + this.pan/interval)

        } else if (touchNumber === 2 && event.type === 'touchmove') {
            let delta1: number = event.touches[0].clientX / event.touches[0].clientY;
            let delta2: number = event.touches[1].clientX / event.touches[1].clientY;
            let deltaDiff: number = delta1 > delta2 ? delta1-delta2 : delta2 - delta1;
            let lastInterval: number = this.zoom*this.baseInterval

            if(deltaDiff > (this.lastDeltaDiff + (this.lastDeltaDiff/15)) && this.zoom < 16) { // avant 16 c'etait 32
                this.lastDeltaDiff = deltaDiff;
                this.zoom = this.preciseRound((this.zoom*1.2),2);
                this.pan +=  (this.zoom*this.baseInterval - lastInterval)*this.pinchZoomDataPosition; // this.currentDataPosition; //center the zoom on the current cursor position // est-ce une bonne idée de changer pan ici?
            } else if (deltaDiff < (this.lastDeltaDiff - (this.lastDeltaDiff/15)) && this.zoom > 1) {
                this.lastDeltaDiff = deltaDiff;
                this.zoom = this.preciseRound((this.zoom/1.2),2);
                this.pan +=  (this.zoom*this.baseInterval - lastInterval)*this.pinchZoomDataPosition; // this.currentDataPosition; //center the zoom on the current cursor position // est-ce une bonne idée de changer pan ici?
            }

            this.preventOutOfScreen();
            this.displayChart(this.data);
        } 
    }

    moveGraph(x: number, y: number) {
        let contenaireRect: any = document.getElementById("supercontenaire").getBoundingClientRect();
        let interval: number = this.baseInterval*this.zoom; // calcule l'interval courant entre chaque data
        let chartWidthOffset: number = (this.dataGap*this.zoom)/2;
        let dataPosition: number = Math.round(((x-this.contenaireRect.left - this.X_priceSpace - chartWidthOffset)/interval) + this.pan/interval); // calcule la position courante au sein de data        
        this.currentDataPosition = dataPosition
        let xCoordonnée: number = interval*dataPosition-this.pan;
        let yCoordonnée: number = y - contenaireRect.top;

        // for debugging purpose
        // this.cursorDebug.innerHTML = 
        //     `<p>interval: ${interval}, priceSpace: ${this.X_priceSpace}, dataLenght: ${this.dataLength},
        //     rawdata: ${(x-contenaireRect.left - this.X_priceSpace - chartWidthOffset)/interval} : ${this.pan/interval}, dataPosition: ${dataPosition}, xcoordonnée: ${xCoordonnée},
        //     x: ${x}, y: ${y}, contenaireRect: ${JSON.stringify(contenaireRect)}</p>`;

        this.cursor_ctx.clearRect(0, 0, this.width, this.height);
        if(xCoordonnée > 0 && y > this.Y_upperTextSpace) {
            document.body.style.cursor = 'crosshair';
            this.cursor_ctx.fillStyle = 'rgb(255, 0, 0)';
            this.cursor_ctx.fillRect(xCoordonnée + this.X_priceSpace + chartWidthOffset, this.Y_upperTextSpace, 1, this.height); //ligne verticale
            this.cursor_ctx.fillRect(this.X_priceSpace, yCoordonnée, this.width, 1); //ligne horizontal
        }

        if (dataPosition >= 0 && dataPosition < this.dataLength) {
            this.displayData(this.data[dataPosition]);
        }
    }

    displayData(currentData: Data) {
        this.upperText_ctx.clearRect(0, 0, this.width, this.height);
        this.upperText_ctx.font = "13px sans serif";
        this.upperText_ctx.fillText(`${this.translation['date'][this.lang]}: ${currentData.date}, ${this.translation['average'][this.lang]}: ${currentData.average}, ${this.translation['highest'][this.lang]}: ${currentData.highest}, ${this.translation['lowest'][this.lang]}: ${currentData.lowest}, ${this.translation['volume'][this.lang]}: ${currentData.volume}, ${this.translation['order_count'][this.lang]}: ${currentData.order_count}`,5, 12, this.width - 30); // -30 pour eviter que ça rogne sur la roue des options
    }

    wheelHandler(event: WheelEvent) {
        event.preventDefault(); // sert à eviter que la page entière ne scroll
        // this.user.cursorPosition.x = event.clientX; // utiliser ça ou plutot mettre dans mon object d'appel le numero de data dans cursor (dataPosition) et l'utiliser ici avec this.dataPosition    
        ////////// test pour zoom centré ////////////////////
        let lastInterval: number = this.zoom*this.baseInterval;
        if(event.deltaY < 0 && this.zoom < 16) { // avant 16 c'etait 32
          this.zoom = this.preciseRound((this.zoom*1.2),2);
          this.pan +=  (this.zoom*this.baseInterval - lastInterval)*this.currentDataPosition; //center the zoom on the current cursor position // est-ce une bonne idée de changer pan ici?
        } else if (event.deltaY > 0 && this.zoom > 1) {
          this.zoom = this.preciseRound((this.zoom/1.2),2);
          this.pan +=  (this.zoom*this.baseInterval - lastInterval)*this.currentDataPosition; //center the zoom on the current cursor position // est-ce une bonne idée de changer pan ici?
        }
        /////////////////////////////////////////////////////
        /////////test preventOutOfScreen///////////
        this.preventOutOfScreen();
        /////////test ///////////
        this.displayChart(this.data);
    }

    panHandler(event: any) {
        if (this.offset===0) {
          this.offset = event.clientX;
        } else {
          this.pan += this.offset - event.clientX;
          this.offset = event.clientX;
        }
        ///////test preventOutOfScreen///////////////
        this.preventOutOfScreen();
        ///////////////////////////
        this.displayChart(this.data);
      
    }
    
    preventOutOfScreen() { // ça me les brise un peu de faire comme ça... puis-je trouver mieu?// fonctione >> plus ou moins meilleurs solution à trouver
        // this.pan <= -(this.width/2) ? this.pan = -(this.width/2) : null;
        this.pan = this.pan <= -(this.X_chartSpace/2) ? this.pan = -(this.X_chartSpace/2) : this.pan;

        // this.pan >= this.width*this.zoom-this.width/2 ? this.pan = this.width*this.zoom-this.width/2 : null;
        this.pan = this.pan >= this.X_chartSpace*this.zoom-this.X_chartSpace/2 ? this.pan = this.X_chartSpace*this.zoom-this.X_chartSpace/2 : this.pan;

    }

    preciseRound(number: number, precise: number) {
        let factor: number = Math.pow(10,precise);
        return (Math.round(number*factor)/factor);
    }
    
    setObjValue = (propArray: any, value: any, obj: any) => {
        if (propArray.length > 1) {
            return (obj && obj[propArray[0]]) ? this.setObjValue(propArray.slice(1), value, obj[propArray[0]]) : undefined;
        } else {
            obj[propArray[0]] = value;
            return true;
        }
      
    }

    deepCopyObject(object: any, result: any = {}) { // ça a l'air correct, à tester
        for(let prop in object) {
            if(typeof object[prop] === "object") {
                result[prop] = {};
                this.deepCopyObject(object[prop], result[prop]);
            } else {
                result[prop] = object[prop];
            }
        }
        return result;
    }

};