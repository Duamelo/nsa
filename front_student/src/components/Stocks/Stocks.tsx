import React, { Fragment, Dispatch, useEffect } from "react";
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

    const totalProducts = stocks.reduce((acc, movement) => {
        if (movement.type == "ENTRY") {
            return acc + movement.quantity;
        } else if (movement.type == "EXIT") {
            return acc - movement.quantity;
        }
        return acc; 
    }, 0);

    const totalAmount = stocks.reduce((acc, movement) => {
        let price = typeof movement.product.price == "string"
            ? parseFloat(movement.product.price)
            : movement.product.price ?? 0;

        if (movement.type == "ENTRY") {
            return acc + movement.quantity * price;
        } else if (movement.type == "EXIT") {
            return acc - movement.quantity * price;
        }
        return acc;
    }, 0);

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
                <TopCard title="TOTAL PRODUCTS" text={totalProducts.toString()} icon="donate" class="primary" />
                <TopCard title="TOTAL AMOUNT" text={totalAmount.toString() + " €"}  icon="calculator" class="danger" />
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

                <div className="col-md-6">
                    <StockForm />
                </div>

                <div className="col-md-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-green">Products List</h6>
                        </div>
                        <div className="card-body">
                            <ProductList onSelect={selectProduct} />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Stocks;