export class AspanError extends Error {
    constructor(message = '') {
        super(message)
        this.name = 'AspanError'
        Object.setPrototypeOf(this, AspanError.prototype)
    }
}
