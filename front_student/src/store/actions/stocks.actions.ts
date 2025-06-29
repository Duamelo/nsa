import { IStock } from "../models/stock.interface";
import axios from "axios";
import Cookies from "js-cookie";
import { addNotification } from "./notifications.action";

export const GET_STOCKS: string = "GET_STOCKS";
export const ADD_STOCK: string = "ADD_STOCK";

const instance = axios.create({
  baseURL: "http://" + process.env.REACT_APP_API_URL,
  timeout: 5000,
  headers: {},
});

export function entryStock(stock: IStock) {
  return async (dispatch: any) => {
    try {
      const response = await instance.post(
        "/stock/entry",
        {
          quantity: stock.quantity,
          productId: stock.product.id,
          reason: stock.reason,
          reference: stock.reference,
        },
        {
          headers: {
            auth: Cookies.get("token"),
          },
        }
      );

      dispatch({ type: ADD_STOCK, stock: response.data });
      dispatch(addNotification("Success", "Stock ajouté avec succès", "success"));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };
}

export function fetchStocks({
  startDate,
  endDate,
  productId,
}: { startDate: string; endDate: string; productId: string }) {
  return async (dispatch: any) => {
    try {
      const response = await instance.get("/stock/report", {
        headers: {
          auth: Cookies.get("token"),
        },
        params: {
          startDate,
          endDate,
          productId,
        },
      });

      dispatch({ type: "GET_STOCKS", stocks: response.data.movements });
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };
}

export function exitStock(stock: IStock) {
  return async (dispatch: any) => {
    try {
      const response = await instance.post(
        "/stock/exit",
        {
          quantity: stock.quantity,
          productId: stock.product.id,
          reason: stock.reason,
          reference: stock.reference,
        },
        {
          headers: {
            auth: Cookies.get("token"),
          },
        }
      );

      dispatch({ type: ADD_STOCK, stock: response.data });
      dispatch(addNotification("Success", "Stock sorti avec succès", "success"));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error exiting stock:", error);
    }
  };
}
