import { Thread } from "./thread.js";

const ASCII = /**@type {const} */ ({
    numbers: [[48, 57]],
    letters: [[65, 90], [97, 122]]
})

/**
 * @param { number } min 
 * @param { number } max 
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * @param  {...readonly [number, number]} ranges 
 */
function getRandomInRange(...ranges) {
    const lengths = ranges.map(e => e[1] - e[0] + 1);
    const elements = lengths.reduce((a, e) => a + e, 0);
    let num = getRandomInt(0, elements);
    for (let i = 0; i < lengths.length; i++) {
        const length = lengths[i];
        if (num < length) return ranges[i][0] + num;
        num -= length;
    }
    throw new Error("unreachable")
}

class AArray extends Array {
    /**@type { Array<(value: any) => void> } */
    #queue = [];
    /**
     * @param { any } value
     */
    async aPush(value){
        if (this.#queue.length > 0) {
            while (this.#queue.length > 0) {
                this.#queue.pop()(value);
            }
        } else {
            this.unshift(value);
        }
    }
    /**
     * @returns { Promise<any> }
     */
    aPop() {
        if (this.length > 0) {
            return Promise.resolve(this.pop());
        } else {
            return new Promise((resolve, reject) => {
                this.#queue.push(resolve);
            });
        }
    }
}

const bufferContainer = document.querySelector("#buffer>div");
const outContainer = document.getElementById("out")

/**
 * @param { AArray } buffer 
 */
async function* generator(buffer){
    while (true) {
        const L = String.fromCharCode.apply(null, Array.from({ length: getRandomInt(1, 19) },
            () => (Math.random() < 0.5) ?
            getRandomInRange(...ASCII.letters) :
            getRandomInRange(...ASCII.numbers)
        ));
        

        const elem = document.createElement("div");
        elem.innerText = L;
        bufferContainer.append(elem)
        buffer.aPush([L, elem]);
        yield L;
    }
}

/**
 * @param { AArray } buffer 
 */
async function* consumer(buffer) {
    while (true) {
        /**@type { [string, HTMLElement] } */
        const [L, elem] = await buffer.aPop();
        console.log(L, buffer.length);
        elem.remove();

        yield L.length;
    }
}

const initControlls = (function(){
    /**@type { HTMLTemplateElement } */
    const template = /**@type { any } */ (document.getElementById("controlls"));
    const container = document.getElementById("controlls-container");
    /**
     * @param { Thread } t 
     */
    return function(t) {
        /**@type { DocumentFragment } */
        const controlls = /**@type { any } */ (template.content.cloneNode(true));
        const btn = controlls.querySelector("button");
        const btn_icon = controlls.querySelector("use");
        const speed = controlls.querySelector("input");
        const lable = controlls.querySelector("legend");

        lable.innerText = t.name;

        const num = parseInt(speed.min) + parseInt(speed.max);
        speed.addEventListener("change", function (e) {
            t.delay = num - parseInt(this.value)
        });

        let state = false;
        btn.addEventListener("click", function (e) {
            state = !state;
            state ? t.pause() : t.start();
            btn_icon.setAttribute("href", state ? "#icon-play" : "#icon-pause");
        });

        container.append(controlls);
    }
})();

const buffer = new AArray();
    
const t1 = new Thread(generator(buffer), "generator");
initControlls(t1);
t1.start();

const t2 = new Thread(consumer(buffer), "consumer");
initControlls(t2);
t2.start();
