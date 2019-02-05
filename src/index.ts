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
//      -comment implementer les options?
//      -comment externaliser la creation des chart/indicateur?
//      -utiliser un svg material design pour la roue d'option plutot que l'image

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
// declarer ces constantes plus pres de lieu d'utilisation?
const upperTextSpace: number = 0.03;
const displayPriceSpace: number = 0.045;
const mainSpace: number = 0.85;
const volumeSpace: number = 0.12;
class main {
    translation = TRANSLATION;
    defaultOptions = DEFAULTOPTIONS;
    // userInput: any; // useless?
    cursorDebug: any;
    cookieObj: any;
    data: any;
    dataLength: number;
    lang: string;

    width: number;
    height: number;
    // attention verifier de quoi on parle mettre un X ou Y devant pour abs/ord à verifier

    Y_upperTextSpace: number;
    Y_mainSpace: number;
    Y_volumeSpace: number;
    X_priceSpace: number;

    baseInterval: number;
    dataGap: number;

    upperText_canvas: any;
    displayPrices_canvas: any;
    main_canvas: any;
    cursor_canvas: any;
    upperText_ctx: any;
    displayPrices_ctx: any;
    main_ctx: any;
    cursor_ctx: any;

    // cursorStyle: any; // useless?
    lastFrame: any;
    // start: number = 0; // useless?
    // stop: number; // useless?
    lastDeltaDiff: number;
    zoom: number = 1;
    click: boolean = false;
    pan: number = 0;
    offset: number = 0;
    currentDataPosition: number = 0;
    pinchZoomDataPosition: number;
    contenaire: any;
    contenaireRect: any; // useless?
    // currentAbscisse: number = 0;
    // nextAbscisse: number = 0;
    
    constructor(
        private shapeCreator: ShapeCreator,
        private userPreference: UserPreferences
        /*debug: Debug*/
        ) {}

    init(data: any, lang: string) {
        this.cursorDebug = document.getElementById("cursorDebug");
        this.data = data;
        this.dataLength = data.length;
        this.lang = lang;
        // this.stop = this.dataLength;
        this.cookieObj = this.parseCookie();
        // this.cursorStyle = document.body.style.cursor;
        this.contenaire = document.getElementById("contenaire");
        this.contenaireRect = document.getElementById("supercontenaire").getBoundingClientRect(); // useless?

        this.createCanvas();
        this.setSpace();
        ////// debug ///////

        ////////////////////
        console.log(data);
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
        this.contenaire.addEventListener("mousemove", (event: MouseEvent) => this.handleCursor(event));
        this.contenaire.addEventListener("touchstart", (event: TouchEvent) => this.handleTouch(event))
        this.contenaire.addEventListener("wheel", (event: WheelEvent) => this.wheelHandler(event));
        this.contenaire.addEventListener("mousedown", () => this.click = this.click ? false : true);
        this.contenaire.addEventListener("mouseup", () => this.click = true ?  false : true);
        this.contenaire.addEventListener("mouseleave",() => {document.body.style.cursor = 'default';this.click === true ? this.click = false : null;});
        this.contenaire.addEventListener("touchmove", (event: TouchEvent) => this.handleTouch(event));
        // this.contenaire.addEventListener("touchend", (event: TouchEvent) => this.handleTouch(event))
        // this.contenaire.addEventListener("touchcancel", (event: TouchEvent) => this.handleTouch(event))
        // document.getElementById("wheelimg").addEventListener("mousedown", function funcRef (event) { event.preventDefault(); userInput.setOptionSpace(event, funcRef, userInput)});
        
        window.addEventListener('resize', (event:UIEvent) => {this.setSpace(); this.displayChart(this.data)})
    }

    createCanvas() {
        this.upperText_canvas = document.createElement('canvas');// .setAttribute('id', 'upperText_canvas');
        this.upperText_canvas.id = 'upperText_canvas';
        this.upperText_canvas.className = 'canvas';
        this.displayPrices_canvas = document.createElement('canvas');//.setAttribute('id', 'displayPrices_canvas');
        this.displayPrices_canvas.id = 'displayPrices_canvas';        
        this.displayPrices_canvas.className = 'canvas';
        this.main_canvas = document.createElement('canvas');//.setAttribute('id', 'main_canvas');
        this.main_canvas.id = 'main_canvas';
        this.main_canvas.className = 'canvas';
        this.cursor_canvas = document.createElement('canvas');//.setAttribute('id', 'cursor_canvas');
        this.cursor_canvas.id = 'cursor_canvas';
        this.cursor_canvas.className = 'canvas';
        
        this.contenaire.appendChild(this.upperText_canvas);
        this.contenaire.appendChild(this.displayPrices_canvas);
        this.contenaire.appendChild(this.main_canvas);
        this.contenaire.appendChild(this.cursor_canvas);

        this.upperText_ctx = this.upperText_canvas.getContext('2d');
        this.displayPrices_ctx = this.displayPrices_canvas.getContext('2d');
        this.main_ctx = this.main_canvas.getContext('2d');
        this.cursor_ctx = this.cursor_canvas.getContext('2d');
    }
    setSpace() {
        // a terme creer les 4 element canvas ici et les inserer dans contenaire >> done 
        // faire pareil pour l'image
        // chercher l'element canvas et son element parent;
        // mettre le width et height de canvas = width et height de parent element
        let parent = document.getElementById('supercontenaire');
        
        // this.baseInterval = parent.clientWidth/this.dataLength;
        this.height = parent.clientHeight;
        this.Y_upperTextSpace = this.height*upperTextSpace;
        this.Y_mainSpace = this.height*mainSpace;
        this.Y_volumeSpace = this.height*volumeSpace;
        this.X_priceSpace = parent.clientWidth * displayPriceSpace;
        this.baseInterval = (parent.clientWidth - this.X_priceSpace)/this.dataLength; // with displaypricemarge
        this.dataGap = this.baseInterval - (this.baseInterval/5);
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
        // let currentAbscisse: number = 0;
        // let nextAbscisse: number = this.baseInterval;
        let currentAbscisse: number = this.X_priceSpace;
        let currentInterval: number = this.baseInterval * this.zoom;
        // console.log("pricespace:", this.X_priceSpace, "currentAbscisse", currentAbscisse);
        let nextAbscisse: number = currentAbscisse;
        let start = this.pan > 0 ? Math.floor(this.pan/currentInterval) : 0; // pas encore de pan donc
        // this.pan > 0 ? start = Math.floor(this.user.pan/(this.user.baseInterval*this.user.zoom)) : null;
        start = start > this.dataLength-1 ? this.dataLength-1 : start;
        let stop = Math.floor(this.width/currentInterval + this.pan/currentInterval); // math.floor? ici ajouté pan >> done
        stop = stop > this.dataLength-1 ? this.dataLength-1 : stop;
        let verticalScales = this.setVerticalScale(data, start, stop);
        this.displayPrices(verticalScales);
        // let lowestPrice, highestPrice,lowestVolume, highestVolume;
        // this.ctx.beginPath();
        let yRange = verticalScales.highestPrice - verticalScales.lowestPrice;
        this.main_ctx.clearRect(0, 0, this.width, this.height);
        for(let i = 0; i<this.dataLength; i++) {
            // ici je vais devoir appeler les function qui permette de crée les indicateur voulu par l'utilisateur
            // donc:
                    // externalise the chart,line,bar creation by abscrating them away
                    // solution? faire un autre file avec les fonction necessaire?

            // test externalisation //
            let x = currentAbscisse - this.pan;
            if(x >= this.X_priceSpace) {// ici je verifie que l'abscisse (x) et > à celui de l'espace destiner à l'affichage des prix verticaux
                this.shapeCreator.creatBar(this.main_ctx, this.dataGap*this.zoom, x, this.Y_upperTextSpace, this.Y_mainSpace, data, i, verticalScales);
                this.shapeCreator.creatVolBar(this.main_ctx, this.dataGap*this.zoom, x, this.Y_volumeSpace, this.Y_mainSpace + this.Y_upperTextSpace, data, i, verticalScales)
            }
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

            nextAbscisse += this.baseInterval;
            currentAbscisse += currentInterval;
        }

        this.lastFrame = this.main_ctx; // useless?
    }

    setVerticalScale(data: any, start: number, stop: number) { // permet de gerer l'echelle des prix (axes des ordonnée : y) ainsi que l'affichage des prix et aussi pour le volume >> à renommer setScale
        let lowestPrice, highestPrice, lowestVolume, highestVolume;
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

    displayPrices(verticalScales: any) { // dispose les prix 
        // pour que les prix s'ajuste je vais devoir modifier les input de la fonction qui donne l'echelle verticale, car start et stop sont assigné au valeur par default de data >> done
        let h, w, priceInterval, displayData, y, newText, newLine;
        h = this.height;
        w = this.width;
        let yRange = verticalScales.highestPrice - verticalScales.lowestPrice;
        // priceRange = p[1] - p[0]; //ça je le calcul aussi dans vertical
        priceInterval = verticalScales.lowestPrice;
        // displayData = document.getElementById("priceContenaire");
        this.displayPrices_ctx.clearRect(0, 0, this.width, this.height);
        for(let i=0;i<5;i++) {
            //priceInterval += preciseRound((priceRange/6),1); // il y a bug prix de type xxxx.xxxxx apparaisse >> pourquoi?
            priceInterval += Math.round(yRange/6); // simplement faire ça?
            priceInterval = this.preciseRound(priceInterval, 2);
            // priceInterval += preciseRound(priceRange/6,2);
            y = h*(1-((priceInterval-verticalScales.lowestPrice)/(yRange))); // encore p[1]-p[0] aka priceRange ça je le calcul aussi dans vertical et juste au dessus
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
            //   newText = creatSvgElement("text",{"x":0,"y":y,"class":"priceData"})
        //   newText.appendChild(document.createTextNode(new Intl.NumberFormat('en-US', { style: 'decimal'}).format(priceInterval.toFixed(0))));
          // newText.appendChild(document.createTextNode(priceInterval));
          //crée la ligne // x1:50 et x2:w+50 car il y a 100 de difference entre #supercontenaire et #contenaire
        //   newLine = creatSvgElement("line",{"x1":50,"x2":(w+50),"y1":y,"y2":y,"class":"priceData","stroke":"black","stroke-dasharray":"5, 5","opacity":"0.2","z-index":5})
          // ajoute le tout à mon element svg displayData
        //   displayData.appendChild(newText);
        //   displayData.appendChild(newLine);
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
            const x0 = event.touches[0].clientX;
            const x1 = event.touches[1].clientX;
            const contenaireRect = document.getElementById("contenaire").getBoundingClientRect();
            
            let delta1 = event.touches[0].clientX / event.touches[0].clientY;
            let delta2 = event.touches[1].clientX / event.touches[1].clientY;
            this.lastDeltaDiff = delta1 > delta2 ? delta1-delta2 : delta2 - delta1;

            let chartWidthOffset: number = (this.dataGap*this.zoom)/2;
            let interval: number = this.baseInterval*this.zoom; // calcule l'interval courant entre chaque data
            let midx = x0 > x1 ? x1 + (x0-x1)/2 : x0 + (x1-x0)/2;
            this.pinchZoomDataPosition = Math.round(((midx-contenaireRect.left - this.X_priceSpace - chartWidthOffset)/interval) + this.pan/interval)

        } else if (touchNumber === 2 && event.type === 'touchmove') {
            let delta1 = event.touches[0].clientX / event.touches[0].clientY;
            let delta2 = event.touches[1].clientX / event.touches[1].clientY;
            let deltaDiff = delta1 > delta2 ? delta1-delta2 : delta2 - delta1;
            let lastInterval = this.zoom*this.baseInterval

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
        let contenaireRect = document.getElementById("contenaire").getBoundingClientRect();
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

    displayData(currentData: any) {
        this.upperText_ctx.clearRect(0, 0, this.width, this.height);
        this.upperText_ctx.font = "13px sans serif";
        this.upperText_ctx.fillText(`${this.translation['date'][this.lang]}: ${currentData.date}, ${this.translation['average'][this.lang]}: ${currentData.average}, ${this.translation['highest'][this.lang]}: ${currentData.highest}, ${this.translation['lowest'][this.lang]}: ${currentData.lowest}, ${this.translation['volume'][this.lang]}: ${currentData.volume}, ${this.translation['order_count'][this.lang]}: ${currentData.order_count}`,5, 12, this.width);
        // this.upperText_ctx.fillText(`date: ${currentData.date}, average: ${currentData.average}, highest: ${currentData.highest}, lowest: ${currentData.lowest}, volume: ${currentData.volume}, order count: ${currentData.order_count}`, 5, 12, this.width);
    }

    wheelHandler(event: WheelEvent) {
        event.preventDefault(); // sert à eviter que la page entière ne scroll
        // this.user.cursorPosition.x = event.clientX; // utiliser ça ou plutot mettre dans mon object d'appel le numero de data dans cursor (dataPosition) et l'utiliser ici avec this.dataPosition    
        ////////// test pour zoom centré ////////////////////
        let lastInterval = this.zoom*this.baseInterval;
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
        // document.getElementById("displayChart").innerHTML = ""; // vide displaychart
        // document.getElementById("priceContenaire").innerHTML = ""; // vide priceContenaire
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
        this.pan <= -(this.width/2) ? this.pan = -(this.width/2) : null;
        this.pan >= this.width*this.zoom-this.width/2 ? this.pan = this.width*this.zoom-this.width/2 : null;
    }

    preciseRound(number: number, precise: number) {
        let factor = Math.pow(10,precise);
        return (Math.round(number*factor)/factor);
    }
    
    parseCookie() {
        let cookieObj: any = {};
        const allCookie = document.cookie;
        // console.log('allCookie:', allCookie)
        const cookieArray = allCookie.split('; ');
        // console.log('cookieArray:', cookieArray);
        const cookieArrayLength = cookieArray.length;
        // let cookie;
        for (let i = 0; i < cookieArrayLength; i++) {
          const cookie: string[] = cookieArray[i].split('=');
          // console.log('cookie:',cookie);
          cookie[0] === "userChartPreference" ? cookieObj[cookie[0]] = JSON.parse(cookie[1]) : null;
          // cookie[0] === "" && cookie[1] === undefined ? null : cookieObj[cookie[0]] = JSON.parse(cookie[1]);
        }
        return cookieObj;
    }

};