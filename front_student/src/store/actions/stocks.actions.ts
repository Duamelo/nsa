import { IStock } from "../models/stock.interface";

export const ADD_STOCK: string = "ADD_STOCK";

export function addStock(stock: IStock): IAddStockActionType {
    return { type: ADD_STOCK, stock: stock };
}

interface IAddStockActionType { type: string, stock: IStock };
