export const ADD_NOTIFICATION: string = "ADD_NOTIFICATION";
export const REMOVE_NOTIFICATION: string = "REMOVE_NOTIFICATION";

export function addNotification(title: string, text: string, status: string): IAddNotificationActionType {
    return { type: ADD_NOTIFICATION, text: text, title: title, status: status };
}

export function removeNotification(id: number): IRemoveNotificationActionType {
    return { type: REMOVE_NOTIFICATION, id: id };
}

interface IAddNotificationActionType { type: string, text: string, title: string, status: string };
interface IRemoveNotificationActionType { type: string, id: number };
