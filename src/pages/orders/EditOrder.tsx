import {
  CustomSelect,
  GoBackButton,
  InputBox,
  OverlayLoading,
  SubmitButton,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  orderSchema,
  OrderValues,
  orderInitialValues,
} from "../../validationSchemas/orderSchema";
import { useEffect, useState } from "react";
import { get, put, validateText } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { ReactHelmet } from "../../components/ui/ReactHelmet";

export function EditOrder() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldTouched,
    setFieldValue,
    setFieldError,
    getFieldProps,
    setValues,
  } = useFormik({
    onSubmit: async function (
      values: OrderValues,
      helpers: FormikHelpers<OrderValues>
    ) {
      setUpdating(true);

      let newValue = { ...values, orderStatus: values.orderStatus?.value };

      const apiResponse = await put(`/orders/${id}`, newValue);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        console.log(apiResponse);

        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: orderInitialValues,
    validationSchema: orderSchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        let url = `/orders/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;
          delete apiData.status;

          delete apiData.products;
          delete apiData.totalAmount;
          delete apiData.subtotalAmount;

          apiData.orderStatus = {
            label: apiData.orderStatus,
            value: apiData.orderStatus,
          };

          setValues(apiData);
        } else {
          toast.error(apiResponse?.message);
        }

        setLoading(false);
      }

      if (id) getData(id);
    },
    [id]
  );

  const orderStatus = [
    {
      label: "ORDER PLACED",
      value: "ORDER_PLACED",
    },
    {
      label: "DISPATCHED",
      value: "DISPATCHED",
    },
    {
      label: "DELIVERED",
      value: "DELIVERED",
    },
    {
      label: "CANCELLED",
      value: "CANCELLED",
    },
    {
      label: "RESOLVED",
      value: "RESOLVED",
    },
  ];

  return (
    <>
      <ReactHelmet title="Update Order : Crown" description="Update Order" />
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Update Order</h4>
              </div>
              {/* <div>
              <button
                type="button"
                className="btn btn-primary btn-icon-text btn-rounded"
              >
                <i className="ti-clipboard btn-icon-prepend"></i>Report
              </button>
            </div> */}
            </div>
          </div>
        </div>

        {loading ? <OverlayLoading /> : null}

        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <form className="forms-sample" onSubmit={handleSubmit}>
              {/* Personal Details */}
              <div className="card rounded-2">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Personal Details</h5>
                    </div>
                    <div className="form-group col-md-6">
                      <InputBox
                        label="User Name"
                        name="name"
                        handleBlur={handleBlur}
                        handleChange={(evt) => {
                          setFieldValue("name", validateText(evt.target.value));
                        }}
                        type="text"
                        placeholder="Enter user name"
                        value={values.name}
                        required={true}
                        touched={touched.name}
                        error={errors.name}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Email"
                        name="email"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="email"
                        placeholder="Enter email"
                        value={values.email}
                        required={true}
                        touched={touched.email}
                        error={errors.email}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Mobile"
                        name="mobile"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter mobile"
                        value={values.mobile}
                        required={true}
                        touched={touched.mobile}
                        error={errors.mobile}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Address */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-3">User Address</h5>
                    </div>
                    <div className="form-group col-md-6">
                      <InputBox
                        label="Address"
                        name="address"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter address"
                        value={values.address}
                        touched={touched.address}
                        error={errors.address}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Locality"
                        name="locality"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter locality"
                        value={values.locality}
                        required={false}
                        touched={touched.locality}
                        error={errors.locality}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="City"
                        name="city"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter city"
                        value={values.city}
                        required={false}
                        touched={touched.city}
                        error={errors.city}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="State"
                        name="state"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter state"
                        value={values.state}
                        required={false}
                        touched={touched.state}
                        error={errors.state}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Country"
                        name="country"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter country"
                        value={values.country}
                        required={false}
                        touched={touched.country}
                        error={errors.country}
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <InputBox
                        label="Pincode"
                        name="pincode"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter pincode"
                        value={values.pincode}
                        required={false}
                        touched={touched.pincode}
                        error={errors.pincode}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-3">Order Status</h5>
                    </div>

                    {/* Select Status */}
                    <div className="form-group col-md-6">
                      <CustomSelect
                        label="Order Status"
                        placeholder="Select Status"
                        name="orderStatus"
                        required={true}
                        options={orderStatus}
                        value={values.orderStatus}
                        error={errors.orderStatus}
                        touched={touched.orderStatus}
                        handleChange={(value) => {
                          setFieldValue("orderStatus", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("orderStatus", true);
                        }}
                      />
                    </div>

                    {/* Update Note */}
                    <div className="form-group col-md-6">
                      <InputBox
                        label="Update Note"
                        name="updateNote"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter updateNote"
                        value={values.updateNote}
                        required={false}
                        touched={touched.updateNote}
                        error={errors.updateNote}
                      />
                    </div>
                  </div>

                  <SubmitButton loading={updating} text="Update Order" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
