import React, { useState, FormEvent, Dispatch, Fragment } from "react";
import { IStateType, IProductState } from "../../store/models/root.interface";
import { useSelector, useDispatch } from "react-redux";
import { IProduct, ProductModificationStatus } from "../../store/models/product.interface";
import TextInput from "../../common/components/TextInput";
import { editProduct, clearSelectedProduct, setModificationState, addProduct } from "../../store/actions/products.action";
import { addNotification } from "../../store/actions/notifications.action";
import NumberInput from "../../common/components/NumberInput";
import { OnChangeModel, IProductFormState } from "../../common/types/Form.types";

const ProductForm: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const products: IProductState | null = useSelector((state: IStateType) => state.products);
  const isCreate: boolean = (products.modificationState === ProductModificationStatus.Create);
  let product: IProduct;

  if (!products.selectedProduct || isCreate) {
    product = {
      id: 0,
      name: "",
      description: "",
      price: 0,
      initialQuantity: 0,
      minThreshold: 0,
      criticalThreshold: 0,
      unit: ""
    };
  } else {
    product = products.selectedProduct;
    product.criticalThreshold = product.stock?.criticalThreshold || 0;
    product.minThreshold = product.stock?.minThreshold || 0;
    product.initialQuantity = product.stock?.quantity || 0;
  }

  const [formState, setFormState] = useState({
    name: { error: "", value: product.name },
    description: { error: "", value: product.description },
    price: { error: "", value: product.price },
    initialQuantity: { error: "", value: product.initialQuantity || 0 },
    minThreshold: { error: "", value: product.minThreshold || 0 },
    criticalThreshold: { error: "", value: product.criticalThreshold || 0 },
    unit: { error: "", value: product.unit || "" },
  });

  function hasFormValueChanged(model: OnChangeModel): void {
    setFormState({ ...formState, [model.field]: { error: model.error, value: model.value } });
  }

  function saveUser(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (isFormInvalid()) {
      return;
    }

    let saveUserFn: Function = (isCreate) ? addProduct : editProduct;
    saveForm(formState, saveUserFn);
  }

  function saveForm(formState: IProductFormState, saveFn: Function): void {
    if (product) {
      dispatch(saveFn({
        ...product,
        name: formState.name.value,
        description: formState.description.value,
        price: formState.price.value,
        initialQuantity: formState.initialQuantity.value,
        minThreshold: formState.minThreshold.value,
        criticalThreshold: formState.criticalThreshold.value,
        unit: formState.unit.value
      }));

      dispatch(addNotification("Product edited", `Product ${formState.name.value} edited by you`));
      dispatch(clearSelectedProduct());
      dispatch(setModificationState(ProductModificationStatus.None));
    }
  }

  function cancelForm(): void {
    dispatch(setModificationState(ProductModificationStatus.None));
  }

  function getDisabledClass(): string {
    let isError: boolean = isFormInvalid();
    return isError ? "disabled" : "";
  }

  function isFormInvalid(): boolean {
    return (
      !!formState.name.error || !formState.name.value ||
      !!formState.description.error || !formState.description.value ||
      !!formState.price.error || !formState.price.value ||
      !!formState.initialQuantity.error || !formState.initialQuantity.value ||
      !!formState.minThreshold.error || !formState.minThreshold.value ||
      !!formState.criticalThreshold.error || !formState.criticalThreshold.value ||
      !!formState.unit.error || !formState.unit.value
    );
  }

  return (
    <Fragment>
      <div className="col-xl-7 col-lg-7">
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-green">Product {(isCreate ? "create" : "edit")}</h6>
          </div>
          <div className="card-body">
            <form onSubmit={saveUser}>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <TextInput id="input_email"
                    value={formState.name.value}
                    field="name"
                    onChange={hasFormValueChanged}
                    required={true}
                    maxLength={20}
                    label="Name"
                    placeholder="Name" />
                </div>

                <div className="form-group col-md-6">
                  <TextInput id="input_unit"
                    value={formState.unit.value}
                    field="unit"
                    onChange={hasFormValueChanged}
                    required={true}
                    maxLength={10}
                    label="Unit"
                    placeholder="Unit" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <NumberInput id="input_initial_quantity"
                    value={formState.initialQuantity.value}
                    field="initialQuantity"
                    onChange={hasFormValueChanged}
                    max={1000}
                    label="Initial quantity" />
                </div>
                <div className="form-group col-md-6">
                  <NumberInput id="input_min_threshold"
                    value={formState.minThreshold.value}
                    field="minThreshold"
                    onChange={hasFormValueChanged}
                    max={1000}
                    label="Min threshold" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <NumberInput id="input_critical_threshold"
                    value={formState.criticalThreshold.value}
                    field="criticalThreshold"
                    onChange={hasFormValueChanged}
                    max={1000}
                    label="Critical threshold" />
                </div>
                <div className="form-group col-md-6">
                  <NumberInput id="input_price"
                    value={formState.price.value}
                    field="price"
                    onChange={hasFormValueChanged}
                    max={1000}
                    label="Price" />
                </div>
              </div>
              <div className="form-group">
                <TextInput id="input_description"
                  field="description"
                  value={formState.description.value}
                  onChange={hasFormValueChanged}
                  required={false}
                  maxLength={100}
                  label="Description"
                  placeholder="Description" />
              </div>
              <button className="btn btn-danger" onClick={() => cancelForm()}>Cancel</button>
              <button type="submit" className={`btn btn-success left-margin ${getDisabledClass()}`}>Save</button>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ProductForm;
