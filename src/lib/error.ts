export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, HttpError.prototype);

    }
}


export const createError = (status: number, message: string): HttpError => {
    return new HttpError(status, message);
}
