import React, { useEffect, useState, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IStock } from "../../store/models/stock.interface";
import { IStateType } from "../../store/models/root.interface";
import { fetchStocks } from "../../store/actions/stocks.actions";
import { IProduct } from "../../store/models/product.interface";

const StockList: React.FC = () => {
    const dispatch = useDispatch();

    const stocks: IStock[] = useSelector((state: IStateType) => state.stocks.stocks);
    const products: IProduct[] = useSelector((state: IStateType) => state.products.products);

    // ⏳ États locaux pour filtres
    const [startDate, setStartDate] = useState<string>("1970-01-01");
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [selectedProductId, setSelectedProductId] = useState<string>("");

    // helper utils
    function formatDateToStartOfDay(date: string) {
        return new Date(`${date}T00:00:00.000Z`).toISOString();
    }

    function formatDateToEndOfDay(date: string) {
        return new Date(`${date}T23:59:59.999Z`).toISOString();
    }

    useEffect(() => {
        if (products.length > 0) {
            const firstProductId = products[0].id.toString();
            setSelectedProductId(firstProductId);
            dispatch(fetchStocks({
                startDate,
                endDate,
                productId: firstProductId,
            }));
        }
    }, [dispatch, products]);

    useEffect(() => {
        if (products.length === 0) return;

        if (!selectedProductId) {
            setSelectedProductId(products[0].id.toString());
            return;
        }

        const formattedStart = formatDateToStartOfDay(startDate);
        const formattedEnd = formatDateToEndOfDay(endDate);

        dispatch(fetchStocks({
            startDate: formattedStart,
            endDate: formattedEnd,
            productId: selectedProductId,
        }));

    }, [products, selectedProductId, startDate, endDate, dispatch]);


    // 🎛 Gestion des champs de filtre
    const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedProductId(e.target.value);
    };

    // 🧾 Affichage des stocks
    const stockList = stocks.map((stock) => (
        <tr key={`stock_${stock.id}`}>
            <th scope="row">{stock.id}</th>
            <td>{stock.product?.name}</td>
            <td>{stock.previousQuantity}</td>
            <td>{stock.newQuantity}</td>
            <td>{stock.quantity}</td>
            <td>{stock.reason}</td>
            <td>{stock.reference}</td>
            <td>{stock.type}</td>
        </tr>
    ));

    return (
        <div className="portlet overflow-auto">
            <div className="mb-3" style={{ display: "flex", gap: "1rem", justifyContent: "end" }}>
                <label>
                    Product:
                    <select className="form-control" value={selectedProductId} onChange={handleProductChange}>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Start date:
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={handleStartDateChange}
                    />
                </label>

                <label>
                    End date:
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={handleEndDateChange}
                    />
                </label>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="thead-light">
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Old Qty</th>
                            <th>New Qty</th>
                            <th>Quantity</th>
                            <th>Reason</th>
                            <th>Reference</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>{stockList}</tbody>
                </table>
            </div>
        </div>
    );
};

export default StockList;
