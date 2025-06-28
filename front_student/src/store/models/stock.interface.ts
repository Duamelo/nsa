import { IProduct } from "./product.interface";

export interface IStock {
    id: number;
    name: string;
    product: IProduct;
    amount: number;
    totalPrice: number;
}