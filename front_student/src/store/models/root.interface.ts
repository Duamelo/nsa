import { IProduct, ProductModificationStatus } from "./product.interface";
import { INotification } from "./notification.interface";
import { IUser } from "./user.interface";
import { IStock } from "./stock.interface";
import { IAccount } from "./account.interface";

export interface IRootPageStateType {
    area: string;
    subArea: string;
}

export interface IRootStateType {
    page: IRootPageStateType;
}
export interface IStateType {
    root: IRootStateType;
    products: IProductState;
    notifications: INotificationState;
    users: IUserState;
    stocks: IStocksState;
    account: IAccount;
}

export interface IProductState {
    products: IProduct[];
    selectedProduct: IProduct | null;
    modificationState: ProductModificationStatus;
}

export interface IActionBase {
    type: string;
    [prop: string]: any;
}

export interface IStocksState {
    stocks: IStock[];
}

export interface INotificationState {
    notifications: INotification[];
}

export interface IUserState {
    users: IUser[];
    admins: IUser[];
}