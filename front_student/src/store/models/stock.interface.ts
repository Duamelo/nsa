import { IProduct } from "./product.interface";

export interface IStock {
    id: number;
    product: IProduct;
    quantity: number;
    reference: string;
    reason: string;
    newQuantity?: number;
    previousQuantity?: number;
    type?: string;
}