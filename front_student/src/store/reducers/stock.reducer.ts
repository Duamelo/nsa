import { IStocksState, IActionBase } from "../models/root.interface";
import { ADD_STOCK, GET_STOCKS } from "../actions/stocks.actions";


const initialState: IStocksState = {
    stocks: [],
};

function stockReducer(state: IStocksState = initialState, action: IActionBase): IStocksState {
    switch (action.type) {
        case ADD_STOCK: {
            let maxId: number = Math.max.apply(Math, state.stocks.map((o) => { return o.id; }));
            if(maxId === -Infinity) { maxId = 0; }
            return {...state, stocks: [...state.stocks, {...action.stock, id: maxId + 1}]};
        }
        case GET_STOCKS: {
            return { ...state, stocks: action.stocks };
        }
        default:
            return state;
    }
}


export default stockReducer;