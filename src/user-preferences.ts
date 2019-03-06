import { DEFAULTOPTIONS } from './default-options';
import { TRANSLATION } from './translation';

export class UserPreferences {

    defaultOptions: any = DEFAULTOPTIONS;
    translation: any = TRANSLATION;

    lang: string;

    constructor() {}
    
    setOptionSpace(main: any) {
        this.lang = main.lang;
        let optionSpace = this.creatElement('div', {'id':'optionSpace'}, {
            'z-index': 2,
            'position': 'absolute',
            'text-align': 'center',
            'border-radius': '2%',
            'opacity': '0.9',
            'width': '50%',
            'height': '300px',
            'top': '5%',
            'right': '5%',
            'background-color': '#353b44',
            'color': 'white',
            'font-size': '100%'
        })
        document.getElementById('supercontenaire').insertAdjacentElement('afterbegin', optionSpace);
        this.setOptionContent(main, optionSpace);
    }
    
    setOptionContent(main: any, optionSpace: HTMLElement) {
        optionSpace.appendChild(this.creatElement('p', undefined, undefined, this.translation.options_message[this.lang]))
        for (let prop in main.options) {
            let optionCategorie: HTMLElement;
            if (prop === 'chart') { 
                optionCategorie = this.creatElement('div', {'id': prop}, {'z-index': 2, 'text-align': 'right', 'right': '0px','width': '50%', 'position': 'absolute'})
            } else {
                optionCategorie = this.creatElement('div', {'id': prop}, {'z-index': 2, 'text-align': 'right', 'width': '50%', 'position': 'absolute'});
            }
            optionCategorie.appendChild(this.creatElement('h3', undefined, {'text-align': 'center'}, this.translation[prop][this.lang]));//`<h3 style='text-align:center;'>${prop}:<h3>`            
            optionCategorie.appendChild(this.displayOptions(main.options[prop]));
            optionCategorie.addEventListener('change', (event) => this.setPreference(event, main));
            document.getElementById('optionSpace').appendChild(optionCategorie);
        }
        let resetButton = this.creatElement('div', {'id': 'resetButton'}, {'z-index': 2, 'bottom': '3%', 'position': 'inherit', 'right': '42%'})
        resetButton.appendChild(this.creatElement('button', {'type': 'reset'}, {'z-index': 2, 'bottom': '3%', 'position': 'inherit', 'right': '50%', 'width': '100px'}, this.translation['reset_option'][this.lang]))
        optionSpace.insertAdjacentElement('beforeend', resetButton);
        resetButton.addEventListener('click', () => this.resetPreference(main));
    }
    
    displayOptions(optionsObject: any) {
        const content: HTMLElement = document.createElement('div');
        for (let prop in optionsObject) {
            const div = document.createElement('div');
            switch (prop) {
                case 'bar':
                    div.appendChild(this.creatElement('label', {'for': prop}, undefined, this.translation[prop][this.lang]));
                    div.appendChild(this.creatElement('input', {'type': 'checkbox', 'id': 'check', 'name': prop, 'checked': optionsObject[prop].exist}));
                    div.appendChild(this.creatElement('label', {'for': 'colour'}, undefined, this.translation['high'][this.lang]));
                    div.appendChild(this.creatElement('input', {'type': 'color', 'id': 'colour.higher', 'name': prop, 'value': optionsObject[prop].colour.higher}));
                    const div2 = document.createElement('div');
                    div2.appendChild(this.creatElement('label', {'for': 'colour'}, undefined, this.translation['low'][this.lang]));
                    div2.appendChild(this.creatElement('input', {'type': 'color', 'id': 'colour.lower', 'name': prop, 'value': optionsObject[prop].colour.lower}));
                    div.appendChild(div2);
                    content.appendChild(div);
                    break;
                case 'background':
                    div.appendChild(this.creatElement('label', {'for': prop}, undefined, this.translation[prop][this.lang]));
                    div.appendChild(this.creatElement('label', {'for': 'colour'}));
                    div.appendChild(this.creatElement('input', {'type': 'color', 'id': 'colour', 'name':prop, 'value': optionsObject[prop].colour}));
                    content.appendChild(div);
                    break;
                default:
                    div.appendChild(this.creatElement('label', {'for': prop}, undefined, this.translation[prop][this.lang]));
                    div.appendChild(this.creatElement('input', {'type': 'checkbox', 'id': 'check', 'name':prop, 'checked': optionsObject[prop].exist}));
                    div.appendChild(this.creatElement('input', {'type': 'color', 'id': 'colour', 'name':prop, 'value': optionsObject[prop].colour}));                    
                    content.appendChild(div);
                    break;
            }
        }
        return content;
    }

    creatElement(type: string, attribute?: any, style?: any, text?: string) { // peu etre geré les erreur notament celle qui peuvent survenir en cas de mauvais type
        let newElement = document.createElement(type);
        for(let prop in attribute) {
          newElement.setAttribute(prop,attribute[prop]);
        }
        for(let prop in style) {
            newElement.style[prop] = style[prop];
        }
        if(text !== undefined) {
            newElement.appendChild(document.createTextNode(text));
        }
        return newElement;
    }
    
    closeOptionSpace() {
        let elem: HTMLElement  = document.getElementById('optionSpace');
        elem.parentNode.removeChild(elem);
      
    }

    setPreference(event: any, main: any) {
        event.target.focus();
        let categorie: string, type: string, option: string, value: boolean;
        categorie = event.currentTarget.id;
        type = event.target.name;
        option = `${categorie}.${type}.${event.target.id}`;
        if(event.target.id === 'check') {
            main.options[categorie][type].exist = event.target.checked;
            let path: string = `${categorie}.${type}.exist`;
            value = event.target.checked;
            this.setCookie(path, value);
            main.displayChart(main.data);
        } else {
            value = event.target.value;
            main.setObjValue(option.split('.'), event.target.value, main.options);
            this.setCookie(option, value);
            main.displayChart(main.data);
        }
    }

    setCookie(path: string, value: boolean) {
        let cookie: any = this.parseCookie();
        if (cookie.userChartPreference) {
            cookie.userChartPreference[path] = value;
        } else {
            cookie.userChartPreference = {};
            cookie.userChartPreference[path] = value;
        }
        document.cookie = `userChartPreference=${JSON.stringify(cookie.userChartPreference)};max-age=31536000;path=/`;
        // ;domain=domain ;domain=eve-hub.com pour set le domain name
    }

    parseCookie() {
        let cookieObj: any = {};
        const allCookie: string = document.cookie;
        const cookieArray: string[] = allCookie.split('; ');
        const cookieArrayLength: number = cookieArray.length;
        for (let i = 0; i < cookieArrayLength; i++) {
          const cookie: string[] = cookieArray[i].split('=');
        //   cookie[0] === 'userChartPreference' ? cookieObj[cookie[0]] = JSON.parse(cookie[1]) : null;
          if (cookie[0] === 'userChartPreference') cookieObj[cookie[0]] = JSON.parse(cookie[1]);
          // cookie[0] === "" && cookie[1] === undefined ? null : cookieObj[cookie[0]] = JSON.parse(cookie[1]);
        }
        return cookieObj;
    }

    resetPreference(main: any) {
        main.options = main.deepCopyObject(this.defaultOptions);
        document.cookie = 'userChartPreference=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
        let optionSpace = document.getElementById('optionSpace');
        optionSpace.innerHTML = '';
        this.setOptionContent(main, optionSpace);
        main.displayChart(main.data);
    }
}