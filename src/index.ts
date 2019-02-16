// comment vais je faire?
// transposer mon code de chartlib vers chartlib_canvas
// utiliser les import via typescript pour separer mon code en unité logique
// apprendre à utiliser canvas
// chose à ajouté:
//      -performance: lors du deplacement du curseur, plutot que de tout redessiner, enregistrer l'etat precedent de mon canva et le reservir avec le mouvement du cursuer (sauf si deplacement dans les chart evidemment)
//      -prise en charge de la langue, comment faire?: >> done
//          -en entré une variable fourni par mon apli ex: "en-us"
//          -crée un objet contenant les traduction
//          -appeler les element de mon object en fonction de [context][lang]
//      -zoom et deplacement pour modible, voir le touch event >> done?
//      -comment implementer les options? >> done
//      -comment externaliser la creation des chart/indicateur? >> done
//      -utiliser un svg material design pour la roue d'option plutot que l'image >> done
//      -faire en sorte que les options soit compatible avec mobile


// Bug:
//      -reflechir à comment bien disposer le contenue des options
//      -lorsqu'il y a reset des options aussi reinitialiser le contenue de option space
//          >> rendre la creation de options space plus modulaire pour permettre uniquement la réecriture de du contenue de options space lors d'un reset


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



// https://developer.mozilla.org/en-US/docs/Web/API/Touch for mobile touch and drag

// import { test } from './cursor_movement';

// faire attention lors du deplacement du curseur faire des tests
    // debug curseur car c'est foireux >> done?

// ajouter quelque chose pour le debug
// import{ Debug } from './debug';
import { ShapeCreator } from './shape-creator';
import { UserPreferences } from './user-preferences';
import { TRANSLATION } from './translation';
import { DEFAULTOPTIONS } from './default-options';

interface Data { // data est un array qui contient des object
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
// declarer ces constantes plus pres de lieu d'utilisation?
const upperTextSpace: number = 0.03;
const displayPriceSpace: number = 0.045;
const mainSpace: number = 0.85;
const volumeSpace: number = 0.12;
class main {
    translation: any = TRANSLATION;
    // options = DEFAULTOPTIONS;
    options: any = {};
    openOptionBox: boolean = false;
    // userInput: any; // useless?
    cursorDebug: HTMLElement;
    cookieObj: any; // useless
    data: ReadonlyArray<Data>;
    dataLength: number;
    lang: string;

    width: number;
    height: number;
    // attention verifier de quoi on parle mettre un X ou Y devant pour abs/ord à verifier

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

    // cursorStyle: any; // useless?
    // lastFrame: any; // useless?
    // start: number = 0; // useless?
    // stop: number; // useless?
    lastDeltaDiff: number;
    zoom: number = 1;
    click: boolean = false;
    pan: number = 0;
    offset: number = 0;
    currentDataPosition: number = 0;
    pinchZoomDataPosition: number;
    superContenaire: any;
    contenaire: HTMLElement;
    contenaireRect: any; // useless? >> non utile
    // currentAbscisse: number = 0;
    // nextAbscisse: number = 0;
    
    constructor(
        private shapeCreator: ShapeCreator,
        private userPreference: UserPreferences
        /*debug: Debug*/
        ) {}

    init(data: any, lang: string) {
        this.options = this.deepCopyObject(DEFAULTOPTIONS);
        this.cursorDebug = document.getElementById("cursorDebug");
        this.data = data;
        this.dataLength = data.length;
        this.lang = lang;
        // this.stop = this.dataLength;

        let cookieObj: any = this.userPreference.parseCookie();

        for(let prop in cookieObj.userChartPreference) {
            let propArray: string[] = prop.split('.');
            this.setObjValue(propArray, cookieObj.userChartPreference[prop], this.options);
        }
        // this.contenaire = document.getElementById("contenaire"); // ancienne version, privilegié celle ci ou supercontenaire?
        this.contenaire = document.getElementById("supercontenaire");
        this.contenaireRect = document.getElementById("supercontenaire").getBoundingClientRect(); // useless? >> non je ne pense pas

        this.createCanvas();
        this.setSpace();

        // console.log(data);
        // let width,height,baseInterval,dataLength, userInput, cookieObj, propArray;
        // width = document.getElementById("contenaire").getBoundingClientRect().width;
        // height = document.getElementById("supercontenaire").clientHeight;
        // height = document.getElementById("supercontenaire").clientHeight; // faire 2 height un pour le volume un pour le graph 80% graph 15% volume 5% margin-top
        // this.dataLength = data.length;
        // this.ctx.fillStyle = 'black';
        // this.ctx.fillRect(500, 50, 100, 100);
        this.displayChart(data);
        // test pour recuperer la derniere image
        // let pulu: any = document.getElementById("canvas");
        // pulu = pulu.toDataURL()
        // console.log(pulu);
        //// fin du test
        // scope.setTimeout(fonction[, delai, param1, param2, ...]);
        this.contenaire.addEventListener('mousemove', (event: MouseEvent) => this.handleCursor(event));
        this.contenaire.addEventListener('touchstart', (event: TouchEvent) => this.handleTouch(event))
        this.contenaire.addEventListener('wheel', (event: WheelEvent) => this.wheelHandler(event));
        this.contenaire.addEventListener('mousedown', () => this.click = this.click ? false : true);
        this.contenaire.addEventListener('mouseup', () => this.click = true ?  false : true);
        this.contenaire.addEventListener('mouseleave',() => {document.body.style.cursor = 'default';this.click === true ? this.click = false : null;});
        this.contenaire.addEventListener('touchmove', (event: TouchEvent) => this.handleTouch(event));
        // this.contenaire.addEventListener('touchend', (event: TouchEvent) => this.handleTouch(event))
        // this.contenaire.addEventListener('touchcancel', (event: TouchEvent) => this.handleTouch(event))
        // document.getElementById('wheelimg').addEventListener('mousedown', function funcRef (event) { event.preventDefault(); userInput.setOptionSpace(event, funcRef, userInput)});
        document.getElementById('wheelimg').addEventListener('click', (event: MouseEvent) => this.testOption(event));
        // this.contenaire.addEventListener('click', (event: MouseEvent) => this.testOption(event));

        window.addEventListener('resize', (event:UIEvent) => {this.setSpace(); this.displayChart(this.data)})
    }

    testOption(event: MouseEvent) { // cette solution fonctionne, le comportement est tres bizar, lorsque je modifie les attribus de mon svg ça position dans le dom change
        // sinon je peu modifier svg des ça creation pour qu'il s'affiche au bon endroit puis faire mes trucs normalement
        // ça ne fonctionne pas de la même maniere dans chrome et firefox et sur edge rien ne fonctionne brave fonctionne comme chrome
        // console.log('clicked on optionWheel', event);
        this.openOptionBox = this.openOptionBox ? false : true;
        // console.log('bingo', 'openOptionBox: ', this.openOptionBox)
        if(this.openOptionBox) {
            this.userPreference.setOptionSpace(this);
        } else {
            this.userPreference.closeOptionSpace();
        }
        // if(true) {
        //     console.log('bingo');
            // this.optionWheel.setAttribute('visibility', 'hidden')
            // let i = 0
            // let t = window.setInterval( () => {
            //     console.log(this, this.optionWheel);
            //     i += 36
            //     this.optionWheel.setAttributeNS(null, 'transform', `rotate(${i})`);
            // }, 20)
            // // clearInterval(t);
            // window.setTimeout( () => {
            //     // i++
            //     console.log(t);
            //     clearInterval(t);
            //     // console.log(this, i);
            //     // i++
            //     // console.log(i)
            // }, 200);
        // }

        // function rotate() {
        // }
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
        /*************test roue d'option en svg***************/
        // maintenant j'ai un problem avec l'event listener plus haut
        // >> le problèmes et que mes element canvas couvre mon image svg
        // >> solution faire une marge qui contient la rouge d'option comme dans l'ancienne version?
        // >> ajouter un event click sur this.container qui ne se declenche que si sur l'espace de la roue d'option
        // >> google le problem
        let svg: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttributeNS(null, 'width', '24');
        svg.setAttributeNS(null, 'height', '24');
        svg.setAttributeNS(null, 'id', 'wheelimg');
        svg.setAttributeNS(null, 'position', 'absolute');
        // svg.setAttributeNS(null, 'top', '1%');
        // svg.setAttributeNS(null, 'right', '1%');

        svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
        svg.setAttributeNS(null, 'z-index', '10');
        // svg.style.zIndex = '10';
        let newPath: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg',"path");
        newPath.setAttributeNS(null, 'd', 'M19.44 12.99l-.01.02c.04-.33.08-.67.08-1.01 0-.34-.03-.66-.07-.99l.01.02 2.44-1.92-2.43-4.22-2.87 1.16.01.01c-.52-.4-1.09-.74-1.71-1h.01L14.44 2H9.57l-.44 3.07h.01c-.62.26-1.19.6-1.71 1l.01-.01-2.88-1.17-2.44 4.22 2.44 1.92.01-.02c-.04.33-.07.65-.07.99 0 .34.03.68.08 1.01l-.01-.02-2.1 1.65-.33.26 2.43 4.2 2.88-1.15-.02-.04c.53.41 1.1.75 1.73 1.01h-.03L9.58 22h4.85s.03-.18.06-.42l.38-2.65h-.01c.62-.26 1.2-.6 1.73-1.01l-.02.04 2.88 1.15 2.43-4.2s-.14-.12-.33-.26l-2.11-1.66zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z');
        svg.appendChild(newPath);
        this.optionWheel = svg;
        // this.contenaire.appendChild(svg);
        // document.getElementById('supercontenaire').appendChild(svg);
        this.contenaire.appendChild(svg);
        this.optionWheel.setAttributeNS(null, 'transform', `rotate(0)`);
        // this.optionWheel.style.marginLeft = `${this.contenaire.clientWidth-24}px`;
        // document.getElementById('optionWheel').appendChild(svg);


        /***************************************/

        this.upperText_ctx = this.upperText_canvas.getContext('2d');
        this.displayPrices_ctx = this.displayPrices_canvas.getContext('2d');
        this.main_ctx = this.main_canvas.getContext('2d');
        this.cursor_ctx = this.cursor_canvas.getContext('2d');
    }
    setSpace() {
        // a terme creer les 4 element canvas ici et les inserer dans contenaire >> done 
        // faire pareil pour l'image >> done
        // chercher l'element canvas et son element parent;
        // mettre le width et height de canvas = width et height de parent element
        let parent: HTMLElement = document.getElementById('supercontenaire');
        
        // this.baseInterval = parent.clientWidth/this.dataLength;
        this.height = parent.clientHeight;
        this.Y_upperTextSpace = this.height*upperTextSpace;
        this.Y_mainSpace = this.height*mainSpace;
        this.Y_volumeSpace = this.height*volumeSpace;
        this.X_priceSpace = parent.clientWidth * displayPriceSpace;
        this.X_chartSpace = parent.clientWidth - parent.clientWidth * displayPriceSpace;
        this.baseInterval = (parent.clientWidth - this.X_priceSpace)/this.dataLength; // with displaypricemarge
        this.dataGap = this.baseInterval - (this.baseInterval/5);

        let optionWheel: HTMLElement = document.getElementById('wheelimg');
        optionWheel.style.marginLeft = `${parent.clientWidth-24}px`;
        // optionWheel.addEventListener('click', () => /*{ event.preventDefault();*/ console.log('clicked on optionWheel')/*}*/);
        // this.nextAbscisse = this.baseInterval;

        this.upperText_canvas.width = parent.clientWidth;
        this.upperText_canvas.height = parent.clientHeight;
        this.displayPrices_canvas.width = parent.clientWidth;
        this.displayPrices_canvas.height = parent.clientHeight; 
        this.main_canvas.width = parent.clientWidth;
        this.main_canvas.height = parent.clientHeight;
        this.cursor_canvas.width = parent.clientWidth;
        this.cursor_canvas.height = parent.clientHeight;
        // this.width = parent.clientWidth;
        this.width = this.main_canvas.width;
        // this.height = parent.clientHeight;
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
        this.shapeCreator.changeBackground(this.options.chart.background.colour);
        // let currentAbscisse: number = 0;
        // let nextAbscisse: number = this.baseInterval;
        let currentAbscisse: number = this.X_priceSpace;
        let currentInterval: number = this.baseInterval * this.zoom;
        // console.log("pricespace:", this.X_priceSpace, "currentAbscisse", currentAbscisse);
        let nextAbscisse: number = currentAbscisse + currentInterval;
        let start: number = this.pan > 0 ? Math.floor(this.pan/currentInterval) : 0; // pas encore de pan donc
        // this.pan > 0 ? start = Math.floor(this.user.pan/(this.user.baseInterval*this.user.zoom)) : null;
        start = start > this.dataLength-1 ? this.dataLength-1 : start;
        let stop: number = Math.floor(this.width/currentInterval + this.pan/currentInterval); // math.floor? ici ajouté pan >> done
        stop = stop > this.dataLength-1 ? this.dataLength-1 : stop;
        let verticalScales: VerticalScales = this.setVerticalScale(data, start, stop);
        this.displayPrices(verticalScales);
        // let lowestPrice, highestPrice,lowestVolume, highestVolume;
        // this.ctx.beginPath();
        // let yRange = verticalScales.highestPrice - verticalScales.lowestPrice;
        this.main_ctx.clearRect(0, 0, this.width, this.height);
        // console.log(this.options)
        for(let i = 0; i<this.dataLength; i++) {
            movAv5d += data[i].average;
            movAv20d += data[i].average;
            donchian.lastLow > data[i].lowest ? (donchian.lastLow = data[i].lowest, donchian.lastLowIndex = i) : null;
            donchian.lastHigh < data[i].highest ? (donchian.lastHigh = data[i].highest, donchian.lastHighIndex = i) : null;

            i >= 5 ? movAv5d -= data[i-5].average : null;
            i >= 20 ? movAv20d -= data[i-20].average : null;
            // ici je vais devoir appeler les function qui permette de crée les indicateur voulu par l'utilisateur
            // donc:
                    // externalise the chart,line,bar creation by abscrating them away
                    // solution? faire un autre file avec les fonction necessaire?
            this.main_ctx.globalAlpha = 1;
            let x: number = currentAbscisse - this.pan;
            // console.log(this.options.chart.background)
            // test externalisation + option //
            if(x >= this.X_priceSpace && x < this.width) {
                for(let prop in this.options.chart) {
                    let colour: string = this.options.chart[prop].colour;
                    // console.log(prop, this.options.chart[prop])
                    if(this.options.chart[prop]['exist']) {
                        switch (prop) {
                            case 'line':
                                this.shapeCreator.creatLine(this, x, nextAbscisse - this.pan, verticalScales, i, colour);
                                break;
                            case 'bar':
                                this.shapeCreator.creatBar(this, x, verticalScales, i, colour);
                                break;
                            case 'volume':
                                this.shapeCreator.creatVolBar(this, x, verticalScales, i, colour);
                                break;
                        }
                    }
                }
                for(let prop in this.options.indicator) {
                    // console.log(prop, this.options.indicator[prop])
                    let colour: string = this.options.indicator[prop].colour
                    if(this.options.indicator[prop]['exist']) {
                        switch (prop) {
                            case 'movingAverage5d':
                                this.shapeCreator.creatMovAv5d(this, x, nextAbscisse - this.pan, movAv5d, verticalScales, i, colour);
                                break;
                            case 'movingAverage20d':
                                this.shapeCreator.creatMovAv20d(this, x, nextAbscisse - this.pan, movAv20d, verticalScales, i, colour);
                                break;
                            case 'donchianChannel':
                                this.shapeCreator.creatDonchian(this, x, nextAbscisse - this.pan, donchian, verticalScales, i, colour);
                                break;
                        }
                    }
                }
            }
            // test externalisation //
            // if(x >= this.X_priceSpace && x < this.width) {// ici je verifie que l'abscisse (x) et > à celui de l'espace destiner à l'affichage des prix verticaux
            //     // this.shapeCreator.creatBar(this.main_ctx, this.dataGap*this.zoom, x, this.Y_upperTextSpace, this.Y_mainSpace, data, i, verticalScales);
            //     this.shapeCreator.creatLine(this, x, nextAbscisse - this.pan, verticalScales, i);
            //     this.shapeCreator.creatMovAv5d(this, x, nextAbscisse - this.pan, movAv5d, verticalScales, i);
            //     this.shapeCreator.creatMovAv20d(this, x, nextAbscisse - this.pan, movAv20d, verticalScales, i);
            //     // this.shapeCreator.creatDonchian(this, x, nextAbscisse - this.pan, donchian, verticalScales, i);
            //     // func(currentAbscisse-this.user.pan, nextAbscisse-this.user.pan, donchian, price, this.user.heights, data, i, this.dataLength))
            //     this.shapeCreator.creatBar(this, x, i, verticalScales);
            //     this.shapeCreator.creatVolBar(this, x, i, verticalScales);
            //     this.shapeCreator.creatDonchian(this, x, nextAbscisse - this.pan, donchian, verticalScales, i);

            //     // this.shapeCreator.creatVolBar(this.main_ctx, this.dataGap*this.zoom, x, this.Y_volumeSpace, this.Y_mainSpace + this.Y_upperTextSpace, data, i, verticalScales)
            //     // this.shapeCreator.creatLine(this, x, nextAbscisse - this.pan, verticalScales, i);
            //     // this.shapeCreator.creatMovAv5d(this, x, nextAbscisse - this.pan, movAv5d, verticalScales, i);
            // }
            // this.shapeCreator.creatBar(this.Y_upperTextSpace, this.Y_mainSpace, data, i, verticalScales);
            //////////////////////////
            // let y = this.Y_upperTextSpace + this.Y_mainSpace * ( 1 - ( (data[i].highest - verticalScales.lowestPrice) / yRange));            
            // let lenght = this.Y_upperTextSpace + this.Y_mainSpace * ( 1 - ( (data[i].lowest - verticalScales.lowestPrice) / yRange)) - y;            
            // let interval = this.baseInterval*this.zoom;
            // this.main_ctx.fillStyle = (i > 0 && data[i].average < data[i-1].average) ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
            // let x = currentAbscisse - this.pan;

            // if(x >= this.X_priceSpace) {// ici je verifie que l'abscisse (x) et > à celui de l'espace destiner à l'affichage des prix verticaux
            //     this.main_ctx.fillRect(x, y, this.dataGap*this.zoom, lenght); //test
            // }

            nextAbscisse += currentInterval;
            currentAbscisse += currentInterval;
        }

        // this.lastFrame = this.main_ctx; // useless?
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
        // pour que les prix s'ajuste je vais devoir modifier les input de la fonction qui donne l'echelle verticale, car start et stop sont assigné au valeur par default de data >> done
        let h: number, w: number, priceInterval: number,/* displayData, */y: number; //, newText, newLine;
        h = this.height;
        w = this.width;
        let yRange: number = verticalScales.highestPrice - verticalScales.lowestPrice;
        // priceRange = p[1] - p[0]; //ça je le calcul aussi dans vertical
        priceInterval = verticalScales.lowestPrice;
        // displayData = document.getElementById("priceContenaire");
        this.displayPrices_ctx.clearRect(0, 0, this.width, this.height);
        for(let i=0;i<5;i++) {
            //priceInterval += preciseRound((priceRange/6),1); // il y a bug prix de type xxxx.xxxxx apparaisse >> pourquoi?
            priceInterval += Math.round(yRange/6); // simplement faire ça?
            priceInterval = this.preciseRound(priceInterval, 2);
            // priceInterval += preciseRound(priceRange/6,2);
            y = this.Y_mainSpace*(1-((priceInterval-verticalScales.lowestPrice)/(yRange))); // encore p[1]-p[0] aka priceRange ça je le calcul aussi dans vertical et juste au dessus
            // crée le text
            this.displayPrices_ctx.fillText(priceInterval.toString(), 0, y);
            this.displayPrices_ctx.beginPath();
            this.displayPrices_ctx.strokeStyle = "rgba(0,0,0,0.4)";
            this.displayPrices_ctx.setLineDash([5, 15]);
            this.displayPrices_ctx.moveTo(this.X_priceSpace, y-3.5);
            this.displayPrices_ctx.lineTo(this.width, y-3.5);
            this.displayPrices_ctx.stroke();
            this.displayPrices_ctx.fillStyle = 'rgb(0, 0, 0)';
            // this.displayPrices_ctx.fillRect(this.width*0.045, this.height/2, 50, 50); // for test purpose
            this.displayPrices_ctx.stroke()
        }
    }

    handleCursor(event: MouseEvent) {
        event.preventDefault(); // sert à eviter que la page entière ne scroll
        this.click === true ? this.panHandler(event) : this.offset = 0; // handle pan;
        this.moveGraph(event.clientX, event.clientY);
    }

    handleTouch(event: TouchEvent) {
        event.preventDefault();
        const touchNumber: number = event.touches.length;
        if (touchNumber === 1) {
            event.type === 'touchmove' ? this.panHandler(event.touches[0]) : this.offset = 0;
            this.moveGraph(event.touches[0].clientX, event.touches[0].clientY);
        } else if (touchNumber === 2 && event.type === 'touchstart') {
            const x0: number = event.touches[0].clientX;
            const x1: number = event.touches[1].clientX;
            const contenaireRect: any = document.getElementById("contenaire").getBoundingClientRect();
            
            let delta1: number = event.touches[0].clientX / event.touches[0].clientY;
            let delta2: number = event.touches[1].clientX / event.touches[1].clientY;
            this.lastDeltaDiff = delta1 > delta2 ? delta1-delta2 : delta2 - delta1;

            let chartWidthOffset: number = (this.dataGap*this.zoom)/2;
            let interval: number = this.baseInterval*this.zoom; // calcule l'interval courant entre chaque data
            let midx: number = x0 > x1 ? x1 + (x0-x1)/2 : x0 + (x1-x0)/2;
            this.pinchZoomDataPosition = Math.round(((midx-contenaireRect.left - this.X_priceSpace - chartWidthOffset)/interval) + this.pan/interval)

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
        let contenaireRect: any = document.getElementById("contenaire").getBoundingClientRect();
        // let ajustedHeight: number = this.height*upperTextSpace;
        let interval: number = this.baseInterval*this.zoom; // calcule l'interval courant entre chaque data
        let chartWidthOffset: number = (this.dataGap*this.zoom)/2;
        let dataPosition: number = Math.round(((x-contenaireRect.left - this.X_priceSpace - chartWidthOffset)/interval) + this.pan/interval); // calcule la position courante au sein de data        
        this.currentDataPosition = dataPosition
        let xCoordonnée: number = interval*dataPosition-this.pan;
        let yCoordonnée: number = y - contenaireRect.top;
        this.cursorDebug.innerHTML = 
            `<p>interval: ${interval}, priceSpace: ${this.X_priceSpace}, dataLenght: ${this.dataLength},
            rawdata: ${(x-contenaireRect.left - this.X_priceSpace - chartWidthOffset)/interval} : ${this.pan/interval}, dataPosition: ${dataPosition}, xcoordonnée: ${xCoordonnée},
            x: ${x}, y: ${y}, contenaireRect: ${JSON.stringify(contenaireRect)}</p>`

        this.cursor_ctx.clearRect(0, 0, this.width, this.height);
        if(xCoordonnée > 0 && y > this.Y_upperTextSpace) {
            // console.log(this.height*0.03, y)
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
        // this.upperText_ctx.fillText(`date: ${currentData.date}, average: ${currentData.average}, highest: ${currentData.highest}, lowest: ${currentData.lowest}, volume: ${currentData.volume}, order count: ${currentData.order_count}`, 5, 12, this.width);
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