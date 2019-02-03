// comment vais je faire?
// transposer mon code de chartlib vers chartlib_canvas
// utiliser les import via typescript pour separer mon code en unité logique
// apprendre à utiliser canvas
// chose à ajouté:
//      -performance: lors du deplacement du curseur, plutot que de tout redessiner, enregistrer l'etat precedent de mon canva et le reservir avec le mouvement du cursuer (sauf si deplacement dans les chart evidemment)
//      -prise en charge de la langue
//      -?

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
        new main().init(obj);
      }
  };
  xmlhttp.send(null);

};

// 3 classe, un main qui gère le tout, un userinput pour les interaction de l'utilisateur, un useroption pour les options de l'utilisateur
//
// 3 verticale espace dans mon graph: height * 0.03 pour le text, height * 0.85 pour les chart, height * 0.12 pour le volume

// 2 espace horizontal dans mon graph: width * 0.045 pour les prix, le reste pour le graph
    // >> 2éme solution ? definis cette espace dans le html avec un canvas externe qui contient les autres canvas, une difference de 100px donc 50px de coté
        // en faite non 1er solution plus simple
// plusieurs solution pour geré le mouvement cursuer:
//      save the last frame
//      2 canvas cursor on top of the complex one

// https://developer.mozilla.org/en-US/docs/Web/API/Touch for mobile touch and drag

// 2 solution pour le deplacement du curseur:
//      -sauvegarder la dernier frame et ne mettre à jour que le necessaire, oui mais comment?
//      -superposer 2 element canvas (ou plus) et afficher les chart dans l'un le curseur dans l'autre
// import { test } from './cursor_movement';

// faire attention lors du deplacement du curseur faire des tests
    // debug curseur car c'est foireux

// ajouter quelque chose pour le debug
// import{ Debug } from './debug';
const upperTextSpace: number = 0.03;
const displayPriceSpace: number = 0.045;
const mainSpace: number = 0.85;
const restSpace: number = 0.12;
class main {
    // userInput: any; // useless?
    cursorDebug: any;
    cookieObj: any;
    data: any;
    dataLength: number;
    width: number;
    height: number;
    priceSpace: number;
    baseInterval: number;
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
    zoom: number = 1;
    click: boolean = false;
    pan: number = 0;
    offset: number = 0;
    currentDataPosition: number = 0;
    contenaire: any;
    contenaireRect: any;
    // currentAbscisse: number = 0;
    // nextAbscisse: number = 0;
    
    constructor(/*debug: Debug*/) {}

    init(data: any) {
        this.cursorDebug = document.getElementById("cursorDebug");
        this.data = data;
        this.dataLength = data.length;
        // this.stop = this.dataLength;
        this.cookieObj = this.parseCookie();
        // this.cursorStyle = document.body.style.cursor;
        this.contenaire = document.getElementById("contenaire");
        this.contenaireRect = document.getElementById("supercontenaire").getBoundingClientRect();
        ////// test /////////
        // let canvas = document.createElement('canvas').setAttribute('id', 'displayPrices_canvas');
        // // Element.setAttribute(name, value);
        // canvas.setAttribute('id', 'upperText_canvas'); //.id = 'upperText_canvas';
        // this.contenaire.appendChild(document.createElement('canvas').setAttribute('id', 'displayPrices_canvas'));
        // console.log(canvas)
        // canvas.setAttribute('id', 'displayPrices_canvas');//.id = 'displayPrices_canvas';
        // this.contenaire.appendChild(document.createElement('canvas').setAttribute('id', 'displayPrices_canvas'));
        // console.log(canvas)

        // canvas.setAttribute('id', 'main_canvas');//id = 'main_canvas';
        // this.contenaire.appendChild(document.createElement('canvas').setAttribute('id', 'displayPrices_canvas'));
        // console.log(canvas)

        // canvas.setAttribute('id', 'cursor_canvas');//id = 'cursor_canvas';
        // this.contenaire.appendChild(canvas);
        // console.log(canvas)

        // this.contenaire.appendChild(canvas.id = 'displayPrices_canvas')
        // this.contenaire.appendChild(canvas.id = 'main_canvas')
        // this.contenaire.appendChild(canvas.id = 'curso_canvas')
        // <canvas id="upperText_canvas" class="canvas"></canvas>
        //                 <canvas id="displayPrices_canvas" class="canvas"></canvas>
        //                 <canvas id="main_canvas" class="canvas"></canvas>
        //                 <canvas id="cursor_canvas" class="canvas"></canvas>
        /// end of test///////
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
        this.contenaire.addEventListener("mousemove", (event: MouseEvent) => this.cursor(event));
        this.contenaire.addEventListener("wheel", (event: WheelEvent) => this.wheelHandler(event));
        this.contenaire.addEventListener("mousedown", (event: MouseEvent) => this.click = this.click ? false : true);
        this.contenaire.addEventListener("mouseup", (event: MouseEvent) => this.click = true ?  false : true);
        this.contenaire.addEventListener("mouseleave",(event: MouseEvent) => {document.body.style.cursor = 'default';this.click === true ? this.click = false : null;});
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
        this.priceSpace = parent.clientWidth * displayPriceSpace;
        this.baseInterval = (parent.clientWidth - this.priceSpace)/this.dataLength; // with displaypricemarge
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
        this.height = parent.clientHeight;
    }

    displayChart(data: any) {
        // let currentAbscisse: number = 0;
        // let nextAbscisse: number = this.baseInterval;
        let currentAbscisse: number = this.priceSpace;
        let currentInterval: number = this.baseInterval * this.zoom;
        // console.log("pricespace:", this.priceSpace, "currentAbscisse", currentAbscisse);
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
            // do the path hire
            // externalise the chart,line,bar creation by abscrating them away
            // let yRange = verticalScales.highestPrice - verticalScales.lowestPrice;
            let y = (this.height*0.03) + (this.height * 0.85) * ( 1 - ( (data[i].highest - verticalScales.lowestPrice) / yRange));            
            let lenght = (this.height*0.03) + (this.height * 0.85) * ( 1 - ( (data[i].lowest - verticalScales.lowestPrice) / yRange)) - y;            
            // let y1 = (this.height*0.03) + this.setHeight((this.height*0.85), verticalScales, data[i].highest);
            // let y2 = (this.height*0.03) + this.setHeight((this.height*0.85), verticalScales, data[i].lowest);
            // this.main_ctx.fillStyle = 'rgb(0, 0, 200)';
            // this.main_ctx.fillRect(currentAbscisse, y, this.baseInterval-1, lenght)
            let interval = this.baseInterval*this.zoom;
            // this.main_ctx.clearRect(0, 0, this.width, this.height);
            this.main_ctx.fillStyle = (i > 0 && data[i].average < data[i-1].average) ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
            /*if (i>0 && data[i].average < data[i-1].average) { // ce if/else ne sert qu'a changer la couleur ici rouge/vert le faire dans la fonction?
                this.main_ctx.fillStyle = 'rgb(255, 0, 0)';
                // this.main_ctx.fillRect(currentAbscisse*this.zoom-this.pan, y, this.baseInterval-1, lenght);
                // this.main_ctx.fillRect(currentAbscisse*this.zoom-this.pan, y, (this.baseInterval-1)*this.zoom, lenght);
                // this.main_ctx.fillRect(this.priceSpace + currentAbscisse*this.zoom, y, (this.baseInterval-1)*this.zoom, lenght); //test
            } else {
                this.main_ctx.fillStyle = 'rgb(0, 255, 0)';
                // this.main_ctx.fillRect(currentAbscisse*this.zoom-this.pan, y, this.baseInterval-1, lenght);
                // this.main_ctx.fillRect(currentAbscisse*this.zoom-this.pan, y, (this.baseInterval-1)*this.zoom, lenght);
                // this.main_ctx.fillRect(this.priceSpace + currentAbscisse*this.zoom, y, (this.baseInterval-1)*this.zoom, lenght); //test
            }*/
            // let x = currentAbscisse*this.zoom - this.pan;
            let x = currentAbscisse - this.pan;
            if(x >= this.priceSpace) {
                this.main_ctx.fillStyle = i > 0 && data[i].average < data[i-1].average ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
                this.main_ctx.fillRect(x, y, (this.baseInterval-1)*this.zoom, lenght); //test
            }
            nextAbscisse += this.baseInterval;
            // currentAbscisse += this.baseInterval; //plus tard - pan >> done
            currentAbscisse += currentInterval;
        }
        // this.nextAbscisse += this.baseInterval;
        // this.currentAbscisse += this.baseInterval; //plus tard - pan >> done
        this.lastFrame = this.main_ctx;
        // this.ctx.stroke();
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
            this.displayPrices_ctx.moveTo(this.width*0.045, y-3.5);
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

    cursor(event:any) {
        // prendre en compte les decallages comme displayPriceSpace
        // reflechir aux calcul de datapPosition xcoordonnée
        // je dois recuperer contenaireRect depuis le dom sinon les valeur ne change pas
        event.preventDefault(); // sert à eviter que la page entière ne scroll
        // this.cursorStyle = 'crosshair'; // ne fonctionne pas ;'(
        console.log(this.contenaireRect.top);
        let x: number = event.clientX;
        let y: number = event.clientY;
        let ajustedHeight: number = this.height*upperTextSpace;
        let interval: number = this.baseInterval*this.zoom; // calcule l'interval courant entre chaque data
        let chartWidthOffset: number = ((this.baseInterval-1)*this.zoom)/2;
        // let dataPosition: number = Math.round((x-this.contenaireRect.left - this.priceSpace - chartWidthOffset)/interval) + Math.round(this.pan/interval); // calcule la position courante au sein de data
        let dataPosition: number = Math.round(((x-this.contenaireRect.left - this.priceSpace - chartWidthOffset)/interval) + this.pan/interval); // calcule la position courante au sein de data        
        this.currentDataPosition = dataPosition
        let xCoordonnée: number = interval*dataPosition-this.pan;
        let yCoordonnée: number = y - this.contenaireRect.top;
        this.cursorDebug.innerHTML = 
            `<p>interval: ${interval}, priceSpace: ${this.priceSpace}, dataLenght: ${this.dataLength},
            rawdata: ${(x-this.contenaireRect.left - this.priceSpace - chartWidthOffset)/interval} : ${this.pan/interval}, dataPosition: ${dataPosition}, xcoordonnée: ${xCoordonnée},
            x: ${x}, y: ${y}, contenaireRect: ${JSON.stringify(this.contenaireRect)}</p>`
        // dataPosition >= 0 && dataPosition < this.dataLength ? showData(this.data[dataPosition]) : null; // prendre en compte le pan
        this.click === true ? this.panHandler(event) : this.offset = 0; // handle pan;
        // console.log(xCoordonnée, this.contenaireRect);
        // console.log('top', this.contenaireRect.top, 'left', this.contenaireRect.left);
        this.cursor_ctx.clearRect(0, 0, this.width, this.height);
        if(xCoordonnée > 0 && y > ajustedHeight) {
            // console.log(this.height*0.03, y)
            document.body.style.cursor = 'crosshair';
            this.cursor_ctx.fillStyle = 'rgb(255, 0, 0)';
            this.cursor_ctx.fillRect(xCoordonnée + this.priceSpace + chartWidthOffset, ajustedHeight, 1, this.height); //ligne verticale
            // this.cursor_ctx.fillRect(xCoordonnée + this.priceSpace /*+((this.baseInterval-1)*this.zoom)/2*/, ajustedHeight, 1, this.height); //ligne verticale
            this.cursor_ctx.fillRect(this.priceSpace, yCoordonnée, this.width, 1); //ligne horizontal
        }
        // this.cursor_ctx.fillStyle = 'rgb(255, 0, 0)';
        // // this.cursor_ctx.fillRect(xCoordonnée, 0, 1, this.height);
        // this.cursor_ctx.fillRect(xCoordonnée+((this.baseInterval-1)*this.zoom)/2, this.height*upperTextSpace, 1, this.height);
        // // this.cursor_ctx.fillRect(0, y - this.contenaireRect.top, this.width, 1);
        // this.cursor_ctx.fillRect(this.priceSpace, y - this.contenaireRect.top, this.width, 1);
        if (dataPosition >= 0 && dataPosition < this.dataLength) {
            this.displayData(this.data[dataPosition]);
        }
        // dataPosition >= 0 && dataPosition < this.dataLength ? showData(this.data[dataPosition]) : null; // prendre en compte le pan
        // this.click === true ? this.panHandler(event) : this.offset = 0; // handle pan;
    }

    displayData(currentData: any) {
        this.upperText_ctx.clearRect(0, 0, this.width, this.height);
        this.upperText_ctx.font = "13px sans serif";
        this.upperText_ctx.fillText(`date: ${currentData.date}, average: ${currentData.average}, highest: ${currentData.highest}, lowest: ${currentData.lowest}, volume: ${currentData.volume}, order count: ${currentData.order_count}`, 5, 12, this.width);
    }

    wheelHandler(event: any) {
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