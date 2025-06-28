import React, { Fragment, Dispatch } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentPath } from "../../store/actions/root.actions";
import { IStock } from "../../store/models/stock.interface";
import StockList from "./StockList";
import TopCard from "../../common/components/TopCard";
import StockForm from "./StockForm";
import ProductList from "../Products/ProductsList";
import { IProduct } from "../../store/models/product.interface";
import { changeSelectedProduct, clearSelectedProduct } from "../../store/actions/products.action";
import { IStateType } from "../../store/models/root.interface";

const Stocks: React.FC = () => {
    const dispatch: Dispatch<any> = useDispatch();
    const stocks: IStock[] = useSelector((state: IStateType) => state.stocks.stocks);
    const totalSales: number = stocks.reduce((prev, next) => prev + next.totalPrice, 0);
    const totalAmount: number = stocks.reduce((prev, next) => prev + next.amount, 0);
    dispatch(updateCurrentPath("stocks", "list"));
    dispatch(clearSelectedProduct());

    function selectProduct(product: IProduct): void {
        dispatch(changeSelectedProduct(product));
    }

    return (
        <Fragment>
            <h1 className="h3 mb-2 text-gray-800">Stock</h1>
            <p className="mb-4">Stocks here</p>

            <div className="row">
                <TopCard title="TOTAL SALES" text={totalSales.toString()} icon="donate" class="primary" />
                <TopCard title="TOTAL AMOUNT" text={totalAmount.toString()} icon="calculator" class="danger" />
            </div>

            <div className="row">
                <div className="col-xl-12 col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-green">Stock List</h6>
                            <div className="header-buttons">
                            </div>
                        </div>
                        <div className="card-body">
                            <StockList />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <StockForm />
                </div>
            </div>
        </Fragment>
    )
}

export default Stocks;