import { sleep } from "./sleep.js";

/**@type { () => Promise<void> } */
let call;

export class Thread {
    /**
     * @param { AsyncGenerator } func 
     * @param {string} name 
     */
    constructor(func, name = "") {
        this.#name = name;
        this.#func = func;
    }

    #name;
    #func;

    /**
     * @param { number } value
     */
    set delay(value) {
        this.#delay = value;
    }

    get name() {
        return this.#name;
    }

    /**@type { number } */
    #delay = 100;

    start() {
        if (!this.#done) {
            this.#pause = false;
            if (!this.#running) {
                this.#running = true;
                queueMicrotask(this.#call)
            }
        }
    }
    pause() {
        this.#pause = true;
    }

    #pause = false;
    #running = false;
    #done = false;

    static {
        /**@this {Thread} */
        call = async function () {
            await sleep(this.#delay);
            const { done = false } = await this.#func.next();
            this.#done = done;
            if (!done) {
                if (!this.#pause) queueMicrotask(this.#call)
                else this.#running = false;
            }
        }
    }

    #call = call.bind(this);
}