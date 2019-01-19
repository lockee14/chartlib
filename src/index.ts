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
        new main().initialisation(obj);
      }
  };
  xmlhttp.send(null);

};

// 3 classe, un main qui gère le tout, un userinput pour les interaction de l'utilisateur, un useroption pour les options de l'utilisateur
//
// 3 espace dans mon graph: height * 0.03 pour le text, height * 0.85 pour les chart, height * 0.12 pour le volume
// plusieurs solution pour geré le mouvement cursuer:
//      save the last frame
//      2 canvas cursor on top of the complex one

// https://developer.mozilla.org/en-US/docs/Web/API/Touch for mobile touch and drag
class main {
    userInput: any; // useless?
    dataLength: number;
    width: number;
    height: number;
    baseInterval: number;
    ctx: any;
    lastFrame: any;
    // currentAbscisse: number = 0;
    // nextAbscisse: number = 0;
    constructor() {}
    initialisation(data: any) {
        this.dataLength = data.length;
        this.setSpace();
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
        // this.ctx.clearRect(0, 0, this.width, this.height);
        // setTimeout(this.dostuff,10);
        // this.userInput.baseInterval = width/dataLength;
    }
    
    dostuff() {
        this.ctx = this.lastFrame;
    }
    setSpace() {
        // chercher l'element canvas et son element parent;
        // mettre le width et height de canvas = width et height de parent element
        let parent = document.getElementById("supercontenaire");
        // console.log(parent.clientWidth, parent.clientHeight);
        let canvas: any = document.getElementById("canvas");
        // canvas.clientHeight = parent.clientHeight;
        this.ctx = canvas.getContext('2d');
        console.log(parent.clientWidth, this.dataLength);
        this.baseInterval = parent.clientWidth/this.dataLength;
        // this.nextAbscisse = this.baseInterval;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        this.width = parent.clientWidth;
        this.height = parent.clientHeight;
    //     this.ctx.clearRect(0, 0, canvas.width, canvas.height); // permet de clear mon espace de dessin, à faire entre chaque frame
    //     this.ctx.fillStyle = 'green';
    //     this.ctx.fillRect(0, 0, parent.clientWidth, parent.clientHeight);
        console.log(this.ctx);
        // let width, content;
        // width = document.getElementById("supercontenaire").clientWidth;
        // let content = `
        //   <img id=wheelimg src=./assets/image/icons8-settings-filled-50.png></img>
        //   <canvas id="canvas"></canvas>`;
        // document.getElementById("supercontenaire").innerHTML = content;
        
    }

    displayChart(data: any) {
        let currentAbscisse: number = 0;
        let nextAbscisse: number = this.baseInterval
        let verticalScales = this.setVerticalScale(data, 0, this.dataLength);
        // let lowestPrice, highestPrice,lowestVolume, highestVolume;
        // this.ctx.beginPath();
        for(let i = 0; i<this.dataLength; i++) {
            // do the path hire
            // externalise the chart,line,bar creation by abscrating them away
            let range = verticalScales.highestPrice - verticalScales.lowestPrice
            let y = (this.height*0.03) + (this.height * 0.85) * ( 1 - ( (data[i].highest - verticalScales.lowestPrice) / range));            
            let lenght = (this.height*0.03) + (this.height * 0.85) * ( 1 - ( (data[i].lowest - verticalScales.lowestPrice) / range)) - y;            
            // let y1 = (this.height*0.03) + this.setHeight((this.height*0.85), verticalScales, data[i].highest);
            // let y2 = (this.height*0.03) + this.setHeight((this.height*0.85), verticalScales, data[i].lowest);
            this.ctx.fillStyle = 'rgb(0, 0, 200)';
            this.ctx.fillRect(currentAbscisse, y, this.baseInterval-1, lenght)
            nextAbscisse += this.baseInterval;
            currentAbscisse += this.baseInterval; //plus tard - pan >> done
        }
        // this.nextAbscisse += this.baseInterval;
        // this.currentAbscisse += this.baseInterval; //plus tard - pan >> done
        this.lastFrame = this.ctx;
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

    setHeight(height: number, price: any, currentPrice: number) {
        let result = height * ( 1 - ( (currentPrice - price.lowestPrice) / (price.highestPrice - price.lowestPrice)));
        return result;
    }
};