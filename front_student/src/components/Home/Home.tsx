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
  const totalPrice: number = products.products.reduce((prev, next) => prev + ((next.price * 0) || 0), 0);
  const totalProductAmount: number = products.products.reduce((prev, next) => prev + (0 || 0), 0);

  const stocks: IStock[] = useSelector((state: IStateType) => state.stocks.stocks);
  const totalSales: number = stocks.reduce((prev, next) => prev + next.totalPrice, 0);
  const totalStockAmount: number = stocks.reduce((prev, next) => prev + 0, 0);

  const dispatch: Dispatch<any> = useDispatch();
  dispatch(updateCurrentPath("home", ""));

  return (
    <Fragment>
      <h1 className="h3 mb-2 text-gray-800">Dashboard</h1>
      <p className="mb-4">Summary and overview of our admin stuff here</p>

      <div className="row">
        <TopCard title="PRODUCT COUNT" text={`${numberItemsCount}`} icon="box" class="primary" />
        <TopCard title="PRODUCT CRITICAL" text={`${totalProductAmount}`} icon="warehouse" class="danger" />
        <TopCard title="SUMMARY PRICE" text={`$${totalPrice}`} icon="dollar-sign" class="success" />
      </div>

      <div className="row">
        <TopCard title="SALES" text={totalSales.toString()} icon="donate" class="primary" />
        <TopCard title="STOCK AMOUNT" text={totalStockAmount.toString()} icon="calculator" class="danger" />
      </div>

      <div className="row">

        <div className="col-xl-6 col-lg-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-green">Product list</h6>
            </div>
            <div className="card-body">
              {/* <ProductList products={products} /> */}
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
