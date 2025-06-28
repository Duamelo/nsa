import { IProductState, IActionBase } from "../models/root.interface";
import { ADD_PRODUCT, CHANGE_PRODUCT_PENDING_EDIT, EDIT_PRODUCT, REMOVE_PRODUCT, GET_PRODUCTS,
    CLEAR_PRODUCT_PENDING_EDIT, SET_MODIFICATION_STATE} from "../actions/products.action";
import { IProduct, ProductModificationStatus } from "../models/product.interface";



const initialState: IProductState = {
    modificationState: ProductModificationStatus.None,
    selectedProduct: null,
    products: [] 
};

function productsReducer(state: IProductState = initialState, action: IActionBase): IProductState {
    switch (action.type) {
        case ADD_PRODUCT: {
            let maxId: number = Math.max.apply(Math, state.products.map(function(o) { return o.id; }));
            action.product.id = maxId + 1;
            return { ...state, products: [...state.products, action.product]};
        }
        case EDIT_PRODUCT: {
            const products = state.products.map(product => 
                product.id === action.product.id 
                    ? { ...action.product } 
                    : product
            );
            return { ...state, products: products };
        }
        case REMOVE_PRODUCT: {
            return { ...state, products: state.products.filter(pr => pr.id !== action.id) };
        }
        case CHANGE_PRODUCT_PENDING_EDIT: {
            return { ...state, selectedProduct: action.product };
        }
        case CLEAR_PRODUCT_PENDING_EDIT: {
            return { ...state, selectedProduct: null };
        }
        case SET_MODIFICATION_STATE: {
            return { ...state, modificationState: action.value };
        }
        case GET_PRODUCTS: {
            return { ...state, products: action.products };
        }
        default:
            return state;
    }
}


export default productsReducer;