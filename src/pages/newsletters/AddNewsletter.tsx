import {
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  newsletterSchema,
  NewsletterValues,
  newsletterInitialValues,
} from "../../validationSchemas/newsletterSchema";
import { useState } from "react";
import { post } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export function AddNewsletter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      onSubmit: async function (
        values: NewsletterValues,
        helpers: FormikHelpers<NewsletterValues>
      ) {
        setLoading(true);

        const apiResponse = await post("/newsletters", values, true);

        if (apiResponse?.status == 200) {
          toast.success(apiResponse?.message);
          navigate(-1);
        } else {
          helpers.setErrors(apiResponse?.errors);
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      },
      initialValues: newsletterInitialValues,
      validationSchema: newsletterSchema,
    });

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Add Newsletter Email</h4>
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

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card rounded-2">
            <div className="card-body">
              <form className="forms-sample" onSubmit={handleSubmit}>
                <div className="row">
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
                    <label htmlFor="">Subscription Status</label>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="subscriptionStatus"
                          id="subscribed"
                          value={"SUBSCRIBED"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.subscriptionStatus == "SUBSCRIBED"}
                        />
                        <label htmlFor="subscribed" className="mt-2">
                          Subscribed
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="radio"
                          name="subscriptionStatus"
                          id="unsubscribed"
                          value={"UNSUBSCRIBED"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.subscriptionStatus == "UNSUBSCRIBED"}
                        />
                        <label htmlFor="unsubscribed" className="mt-2">
                          Unsubscribed
                        </label>
                      </div>
                    </div>
                    {errors.subscriptionStatus && touched.subscriptionStatus ? (
                      <p className="custom-form-error text-danger">
                        {errors.subscriptionStatus}
                      </p>
                    ) : null}
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="">Newsletter Source</label>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="source"
                          id="admin"
                          value={"ADMIN"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.source == "ADMIN"}
                        />
                        <label htmlFor="admin" className="mt-2">
                          Admin
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="radio"
                          name="source"
                          id="homepage"
                          value={"HOMEPAGE"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.source == "HOMEPAGE"}
                        />
                        <label htmlFor="homepage" className="mt-2">
                          Homepage
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="radio"
                          name="source"
                          id="popup"
                          value={"POPUP"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.source == "POPUP"}
                        />
                        <label htmlFor="popup" className="mt-2">
                          Popup
                        </label>
                      </div>
                    </div>
                    {errors.source && touched.source ? (
                      <p className="custom-form-error text-danger">
                        {errors.source}
                      </p>
                    ) : null}
                  </div>
                </div>

                <SubmitButton loading={false} text="Add Email" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
