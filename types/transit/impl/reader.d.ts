

declare module "transit.impl.reader" {
    export interface Reader {
        read(payload: string): any;
    }
}