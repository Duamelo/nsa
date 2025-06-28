import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IStateType, IProductState } from "../../store/models/root.interface";
import { fetchProducts } from "../../store/actions/products.action";
import {
  IProduct,
  ProductModificationStatus,
} from "../../store/models/product.interface";


function ProductList({ onSelect }: { onSelect?: (product: IProduct) => void }): JSX.Element {

  const dispatch = useDispatch();
  const products: IProductState = useSelector((state: IStateType) => state.products);


  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.modificationState === ProductModificationStatus.None) {
      dispatch({ type: "CLEAR_SELECTED_PRODUCT" });
    }
  }, [products.modificationState, dispatch]);

  if (!products.products || products.products.length === 0) {
    return <div className="alert alert-info">No products available</div>;
  }

  return (
    <div className="table-responsive portlet">
      <table className="table">
        <thead className="thead-light">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Price</th>
            <th scope="col">Description</th>
            <th scope="col">Quantity</th>
            <th scope="col">Min Threshold</th>
            <th scope="col">Critical Threshold</th>
            <th scope="col">Unit</th>
          </tr>
        </thead>
        <tbody>
          {products.products.map(product => (
            <tr
              key={product.id}
              className={products.selectedProduct?.id === product.id ? "table-active" : ""}
              onClick={() => onSelect && onSelect(product)}
            >
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.price} €</td>
              <td>{product.description}</td>
              <td>{product.stock?.quantity}</td>
              <td>{product.stock?.minThreshold}</td>
              <td>{product.stock?.criticalThreshold}</td>
              <td>{product.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;
