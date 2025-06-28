import axios, { AxiosError } from "axios";
import Cookies, { set } from "js-cookie";
import { addNotification } from "./notifications.action";

import {
  IProduct,
  ProductModificationStatus,
} from "../models/product.interface";
export const ADD_PRODUCT: string = "ADD_PRODUCT";
export const EDIT_PRODUCT: string = "EDIT_PRODUCT";
export const GET_PRODUCTS: string = "GET_PRODUCTS";
export const REMOVE_PRODUCT: string = "REMOVE_PRODUCT";
export const CHANGE_PRODUCT_AMOUNT: string = "CHANGE_PRODUCT_AMOUNT";
export const CHANGE_PRODUCT_PENDING_EDIT: string =
  "CHANGE_PRODUCT_PENDING_EDIT";
export const CLEAR_PRODUCT_PENDING_EDIT: string = "CLEAR_PRODUCT_PENDING_EDIT";
export const SET_MODIFICATION_STATE: string = "SET_MODIFICATION_STATE";

const instance = axios.create({
  baseURL: "http://" + process.env.REACT_APP_API_URL,
  timeout: 5000,
  headers: {},
});

export function addProduct(product: IProduct): any {
  return async (dispatch: any) => {
    try {
      const response = await instance.post("/products", {
        name: product.name,
        description: product.description,
        price: product.price,
        initialQuantity: product.initialQuantity,
        minThreshold: product.minThreshold,
        criticalThreshold: product.criticalThreshold,
        unit: product.unit,
      }, {
        headers: {
          auth: Cookies.get("token"),
        },
      });

      dispatch({ type: ADD_PRODUCT, product: response.data });
      dispatch(addNotification("Success", "Produit ajouté avec succès"));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      dispatch(addNotification("Error", error.response.data.message || "Erreur lors de l'ajout du produit"));
    }
  };
}

export function fetchProducts(): any {
  return async (dispatch: any) => {
    try {
      const response = await instance.get("/products", {
        headers: {
          auth: Cookies.get("token"),
        },
      });

      return dispatch({ type: GET_PRODUCTS, products: response.data.products });
    } catch (error: any) {
      console.error(error);
      dispatch(addNotification("Error", "Erreur lors de la récupération des produits"));
    }
  };
}

export function editProduct(product: IProduct): any {
  return async (dispatch: any) => {
    try {
      const response = await instance.patch(`/products/${product.id}`, {
        name: product.name,
        description: product.description,
        price: product.price,
        initialQuantity: product.initialQuantity,
        minThreshold: product.minThreshold,
        criticalThreshold: product.criticalThreshold,
        unit: product.unit,
      }, {
        headers: {
          auth: Cookies.get("token"),
        },
      });
      dispatch({ type: EDIT_PRODUCT, product: response.data });
      dispatch(addNotification("Success", "Produit modifié avec succès"));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error(error);
      dispatch(addNotification("Error", "Erreur lors de la modification du produit"));
    }
  };
}

export function removeProduct(id: number): any {
  return async (dispatch: any) => {
    try {
      await instance.delete(`/products/${id}`, {
        headers: {
          auth: Cookies.get("token"),
        },
      });
      dispatch({ type: REMOVE_PRODUCT, id: id });
      dispatch(addNotification("Success", "Produit supprimé avec succès"));
    } catch (error: any) {
      console.error(error);
      dispatch(addNotification("Error", "Erreur lors de la suppression du produit"));
    }
  };
  
}

export function changeProductAmount(
  id: number,
  amount: number
): IChangeProductAmountType {
  return { type: CHANGE_PRODUCT_AMOUNT, id: id, amount: amount };
}

export function changeSelectedProduct(
  product: IProduct
): IChangeSelectedProductActionType {
  return { type: CHANGE_PRODUCT_PENDING_EDIT, product: product };
}

export function clearSelectedProduct(): IClearSelectedProductActionType {
  return { type: CLEAR_PRODUCT_PENDING_EDIT };
}

export function setModificationState(
  value: ProductModificationStatus
): ISetModificationStateActionType {
  return { type: SET_MODIFICATION_STATE, value: value };
}

interface IAddProductActionType {
  type: void;
  product: IProduct;
}
interface IEditProductActionType {
  type: string;
  product: IProduct;
}
interface IRemoveProductActionType {
  type: string;
  id: number;
}
interface IChangeSelectedProductActionType {
  type: string;
  product: IProduct;
}
interface IClearSelectedProductActionType {
  type: string;
}
interface ISetModificationStateActionType {
  type: string;
  value: ProductModificationStatus;
}
interface IChangeProductAmountType {
  type: string;
  id: number;
  amount: number;
}
