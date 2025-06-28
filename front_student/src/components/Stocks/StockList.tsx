import React, { } from "react";
import { useSelector } from "react-redux";
import { IStock } from "../../store/models/stock.interface";
import { IStateType } from "../../store/models/root.interface";

const StockList: React.FC = () => {
    const stocks: IStock[] = useSelector((state: IStateType) => state.stocks.stocks);

    const stockList: JSX.Element[] = stocks.map(stock => {
        return (
            <tr className={`table-row`}
                key={`stock_${stock.id}`}>
                <th scope="row">{stock.id}</th>
                <td>{stock.name}</td>
                <td>{stock.product.name}</td>
                <td>{stock.amount}</td>
                <td>{stock.totalPrice}</td>
            </tr>);
    })

    return (
        <div className="table-responsive portlet">
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Product</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Total price</th>
                    </tr>
                </thead>
                <tbody>
                    {stockList}
                </tbody>
            </table>
        </div>
    )
}

export default StockList;