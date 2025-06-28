import { IProduct } from "../../store/models/product.interface";

export type OnChangeModel = {
    value: string | number | boolean,
    error: string,
    touched: boolean,
    field: string
};

export interface IFormStateField<T> {error: string, value: T};

export interface IProductFormState {
    name: IFormStateField<string>;
    description: IFormStateField<string>;
    price: IFormStateField<number>;
    initialQuantity: IFormStateField<number>;
    minThreshold: IFormStateField<number>;
    criticalThreshold: IFormStateField<number>;
    unit: IFormStateField<string>;
}

export  interface IStockFormState {
    quantity: { error: string, value: number };
    reason: { error: string, value: string };
    reference: { error: string, value: string };
};