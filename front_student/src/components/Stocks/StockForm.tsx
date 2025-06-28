import React, { useState, FormEvent, Fragment, Dispatch } from "react";
import { IProduct } from "../../store/models/product.interface";
import TextInput from "../../common/components/TextInput";
import NumberInput from "../../common/components/NumberInput";
import { OnChangeModel, IStockFormState } from "../../common/types/Form.types";
import { useDispatch, useSelector } from "react-redux";
import { entryStock, exitStock } from "../../store/actions/stocks.actions";
import { clearSelectedProduct, changeProductAmount } from "../../store/actions/products.action";
import { IStateType } from "../../store/models/root.interface";


const StockForm: React.FC = () => {
    const dispatch: Dispatch<any> = useDispatch();
    const selectedProduct: IProduct | null = useSelector((state: IStateType) => state.products.selectedProduct);

    const initialFormState: IStockFormState = {
        quantity: { error: "", value: 0 },
        reason: { error: "", value: "" },
        reference: { error: "", value: "" },
    };

    const [formState, setFormState] = useState(initialFormState);

    function handleChange(model: OnChangeModel): void {
        setFormState({ ...formState, [model.field]: { error: model.error, value: model.value } });
    }

    function resetForm(): void {
        setFormState(initialFormState);
    }

    function isFormInvalid(): boolean {
        return (
            !selectedProduct ||
            !!formState.quantity.error || !!formState.reason.error || !!formState.reference.error ||
            !formState.quantity.value || !formState.reason.value || !formState.reference.value
        );
    }

    function entrStock(e: React.MouseEvent<HTMLButtonElement>): void {
        e.preventDefault();
        // if (isFormInvalid()) return;

        const payload = {
            id: 0,
            quantity: formState.quantity.value,
            product: selectedProduct!,
            reason: formState.reason.value,
            reference: formState.reference.value,
        };

        dispatch(entryStock(payload));
        dispatch(clearSelectedProduct());
        if (selectedProduct) {
            dispatch(changeProductAmount(selectedProduct.id, formState.quantity.value));
        }
        resetForm();
    }

    function exiStock(e: React.MouseEvent<HTMLButtonElement>): void {
        e.preventDefault();
        // if (isFormInvalid()) return;

        const payload = {
            id: 0,
            quantity: formState.quantity.value,
            product: selectedProduct!,
            reason: formState.reason.value,
            reference: formState.reference.value,
        };


        dispatch(exitStock(payload));
        dispatch(clearSelectedProduct());
        if (selectedProduct) {
            dispatch(changeProductAmount(selectedProduct.id, -formState.quantity.value));
        }
        resetForm();
    }

    function getDisabledClass(): string {
        return isFormInvalid() ? "disabled" : "";
    }

    return (
        <Fragment>
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-green">Ajouter au stock</h6>
                </div>
                <div className="card-body">
                    <form onSubmit={(e) => e.preventDefault()} className="form-horizontal">
                        <div className="form-row">
                            <div className="form-group col-md-4">
                                <NumberInput
                                    id="input_quantity"
                                    value={formState.quantity.value}
                                    field="quantity"
                                    onChange={handleChange}
                                    min={1}
                                    max={1000}
                                    label="Quantité"
                                />
                            </div>
                            <div className="form-group col-md-4">
                                <TextInput
                                    id="input_reason"
                                    value={formState.reason.value}
                                    field="reason"
                                    onChange={handleChange}
                                    label="Raison"
                                    required={true}
                                    placeholder="Ex : Réassort"
                                    maxLength={50}
                                />
                            </div>
                            <div className="form-group col-md-4">
                                <TextInput
                                    id="input_reference"
                                    value={formState.reference.value}
                                    field="reference"
                                    onChange={handleChange}
                                    label="Référence"
                                    required={true}
                                    placeholder="Réf. commande ou facture"
                                    maxLength={50}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={resetForm}
                        >
                            Reset
                        </button>

                        <button
                            type="submit" onClick={entrStock}
                            className={`btn btn-success ml-2 ${getDisabledClass()}`}
                        >
                            Entry
                        </button>

                        <button
                            type="submit" onClick={exiStock}
                            className={`btn btn-warning ml-2 ${getDisabledClass()}`}
                        >
                            Exit
                        </button>

                    </form>
                </div>
            </div>
        </Fragment>
    );
};

export default StockForm;

