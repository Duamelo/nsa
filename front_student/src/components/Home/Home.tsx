import React, { Fragment, Dispatch } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentPath } from "../../store/actions/root.actions";
import TopCard from "../../common/components/TopCard";
import { IProductState, IStateType } from "../../store/models/root.interface";
import ProductList from "../Products/ProductsList";
import { IStock } from "../../store/models/stock.interface";
import StockList from "../Stocks/StockList";

const Home: React.FC = () => {
  const products: IProductState = useSelector((state: IStateType) => state.products);
  const numberItemsCount: number = products.products.length;

  const stocks: IStock[] = useSelector((state: IStateType) => state.stocks.stocks);

  const totalStockAmount = stocks.reduce((acc, movement) => {
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

  const totalCriticalProduct: number = products.products.filter(
    p =>
      p.stock &&
      p.stock.minThreshold !== undefined &&
      p.stock.quantity !== undefined &&
      p.stock.minThreshold > p.stock.quantity
  ).length;

  const dispatch: Dispatch<any> = useDispatch();
  dispatch(updateCurrentPath("home", ""));

  return (
    <Fragment>
      <h1 className="h3 mb-2 text-gray-800">Dashboard</h1>
      <p className="mb-4">Summary and overview of our admin stuff here</p>

      <div className="row">
        <TopCard title="PRODUCT COUNT" text={`${numberItemsCount}`} icon="box" class="primary" />
        <TopCard title="PRODUCT CRITICAL" text={`${totalCriticalProduct}`} icon="warehouse" class="danger" />
        <TopCard title="STOCK AMOUNT" text={totalStockAmount.toString() + " €"} icon="calculator" class="danger" />
      </div>

      <div className="row">

        <div className="col-xl-6 col-lg-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-green">Product list</h6>
            </div>
            <div className="card-body">
              <ProductList />
            </div>
          </div>

        </div>

        <div className="col-xl-6 col-lg-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-green">Stock list</h6>
            </div>
            <div className="card-body">
              <StockList />
            </div>
          </div>
        </div>

      </div>

    </Fragment>
  );
};

export default Home;
