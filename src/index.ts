// comment vais je faire?
// transposer mon code de chartlib vers chartlib_canvas
// utiliser les import via typescript pour separer mon code en unité logique
// apprendre à utiliser canvas
// chose à ajouté:
//      -performance: lors du deplacement du curseur, plutot que de tout redessiner, enregistrer l'etat precedent de mon canva et le reservir avec le mouvement du cursuer (sauf si deplacement dans les chart evidemment)
//      -prise en charge de la langue
//      -?

//function that detect if the device is mobile or not
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

let test = isMobileDevice();
alert(test);
