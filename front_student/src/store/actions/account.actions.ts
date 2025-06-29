import axios from "axios";
import Cookies from "js-cookie";
import { addNotification } from "./notifications.action";

export const LOG_IN: string = "LOG_IN";
export const REGISTER: string = "REGISTER";
export const RESET_REGISTER: string = "RESET_REGISTER";
export const LOG_OUT: string = "LOG_OUT";

const instance = axios.create({
    baseURL: 'http://' + process.env.REACT_APP_API_URL,
    timeout: 5000,
    headers: {}
});

function isAxiosError(error: any): error is { response?: any; message?: string } {
    return typeof error === "object" && error !== null && ("response" in error || "message" in error);
}

export function me(): any {
    return async (dispatch: any) => {
        try {
            const response = await instance.get('/auth/me', {
                headers: {
                    auth: Cookies.get('token')
                }
            });
            return dispatch({ type: LOG_IN, email: response.data.username });
        } catch (e: unknown) {
            if (isAxiosError(e)) {
                if (e.response === undefined) {
                    return dispatch(addNotification("Error", e.message ?? "Unknown error", "error"));
                }
                return dispatch(addNotification("Error", "Session expired", "error"));
            } else if (e instanceof Error) {
                return dispatch(addNotification("Error", e.message, "error"));
            } else {
                return dispatch(addNotification("Error", "Unknown error", "error"));
            }
        }
    };
}

export function login(email: string, password: string): any {
    return async (dispatch: any) => {
        try {
            const response = await instance.post('/auth/login', {
                username: email,
                password: password
            });
            Cookies.set('token', response.data.token);
            return dispatch({ type: LOG_IN, email: email });
        } catch (e: unknown) {
            if (isAxiosError(e)) {
                if (e.response === undefined) {
                    return dispatch(addNotification("Error", e.message ?? "Unknown error", "error"));
                }
                return dispatch(addNotification("Error", e.response.data, "error"));
            } else if (e instanceof Error) {
                return dispatch(addNotification("Error", e.message, "error"));
            } else {
                return dispatch(addNotification("Error", "Unknown error", "error"));
            }
        }
    };
}

export function register(email: string, password: string): any {
    return async (dispatch: any) => {
        try {
            const response = await instance.post('/user', {
                username: email,
                password: password,
                role: "NORMAL"
            });

            dispatch(addNotification("Success", response.data, "success"));
            dispatch({ type: REGISTER });
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);

            return;
        } catch (e: unknown) {
            if (isAxiosError(e)) {
                if (e.response === undefined) {
                    return dispatch(addNotification("Error", e.message ?? "Unknown error", "error"));
                }
                if (Array.isArray(e.response.data) && e.response.data.length > 0 && e.response.data[0].constraints?.length) {
                    return dispatch(addNotification("Error", e.response.data[0].constraints.length, "error"));
                }
                return dispatch(addNotification("Error", e.response.data, "error"));
            } else if (e instanceof Error) {
                return dispatch(addNotification("Error", e.message, "error"));
            } else {
                return dispatch(addNotification("Error", "Unknown error", "error"));
            }
        }
    };
}

export function logout(): ILogOutActionType {
    return { type: LOG_OUT };
}

interface ILogInActionType { type: string; email: string; }
interface ILogOutActionType { type: string; }
