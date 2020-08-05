import { serverRequestData } from './../SQL/linking'

export class ArrayTimer {
    public arr: serverRequestData[];
    private timeout: number; //  milliseconds

    constructor(timeout: number) {
        this.arr = new Array<serverRequestData>();
        this.timeout = timeout;
        setInterval(() => console.log(this.arr), 2000);
    }

    public add(data:serverRequestData) {
        data.timestamp = Date.now();
        this.arr.push(data);
        setTimeout(() => {
            this.arr = this.arr.filter((_data) => _data != data);
        }, this.timeout);
    }

    public includes(data: serverRequestData): boolean {
        return this.arr.includes(data);
    }
}
