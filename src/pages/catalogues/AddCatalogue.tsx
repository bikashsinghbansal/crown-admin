import {
  CustomSelect,
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  catalogueSchema,
  CatalogueValues,
  catalogueInitialValues,
} from "../../validationSchemas/catalogueSchema";

import { useEffect, useState } from "react";
import { addUrlToFile, get, post, remove } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { ReactHelmet } from "../../components/ui/ReactHelmet";

export function AddCatalogue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState([]);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
  } = useFormik({
    onSubmit: async function (
      values: CatalogueValues,
      helpers: FormikHelpers<CatalogueValues>,
    ) {
      setLoading(true);

      const newValue = { ...values, category: values?.category?.value };

      const apiResponse = await post("/catalogues", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: catalogueInitialValues,
    validationSchema: catalogueSchema,
  });

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["application/pdf"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("file", true);
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("file", true);
      setFieldError("file", "Must select the valid pdf file");
      toast.error("Must select the valid pdf file");
      return;
    }

    const formData = new FormData();

    formData.append("files", file);

    try {
      let url = `${API_URL}/fileUploads`;
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        setFieldTouched("file", false);
        setFieldError("file", "");
        setFieldValue("file", apiData.body[0].filename);
      } else {
        setFieldTouched("file", false);
        setFieldError("file", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("file", "");
        setFieldValue("file", "");
      } else {
        setFieldError("file", "");
        setFieldValue("file", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        `catalogueFile`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get(
        "/catalogueCategories?status=true&limit=0",
        true,
      );
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setCategories(modifiedValue);
      }
    }
    getData();
  }, []);

  return (
    <>
      <ReactHelmet title="Add Catalogue : Crown" description="Add Catalogue" />
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Add Catalogue</h4>
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
            <form className="forms-sample" onSubmit={handleSubmit}>
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-6">
                      <InputBox
                        label="Catalogue Name"
                        name="name"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter category name"
                        value={values.name}
                        required={true}
                        touched={touched.name}
                        error={errors.name}
                      />
                    </div>

                    {/* Select Category */}
                    <div className="form-group col-md-6">
                      <CustomSelect
                        label="Select Category"
                        placeholder="Select Category"
                        name="categories"
                        required={true}
                        options={categories}
                        value={values.category}
                        error={errors.category}
                        touched={touched.category}
                        isMulti={false}
                        handleChange={(value) => {
                          setFieldValue("category", value);
                        }}
                        handleBlur={() => {
                          setFieldTouched("category", true);
                        }}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label htmlFor={"catalogueFile"}>
                        Catalogue File <span className="text-danger"> *</span>{" "}
                        <span className="text-danger text-small">
                          Select PDF file only
                        </span>
                      </label>
                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          name="catalogueFile"
                          id="catalogueFile"
                          onChange={(evt) => {
                            handleUploadFile(evt);
                          }}
                          className="form-control"
                          accept="application/pdf"
                        />
                        {values.file ? (
                          <a
                            href={`${addUrlToFile(values.file)}`}
                            target="_blank"
                          >
                            <img
                              className="img"
                              height={43}
                              width={43}
                              src={
                                "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/833px-PDF_file_icon.svg.png"
                              }
                            />
                          </a>
                        ) : null}
                        {values.file ? (
                          <button
                            type="button"
                            className="btn p-1"
                            onClick={(evt) => {
                              handleDeleteFile(evt, values.file);
                            }}
                          >
                            <i className="fa fa-trash text-danger"></i>
                          </button>
                        ) : null}
                      </div>
                      {touched.file && errors.file ? (
                        <p className="custom-form-error text-danger">
                          {errors.file}
                        </p>
                      ) : null}
                    </div>

                    <div className="form-group col-md-12">
                      <InputBox
                        label="Short Description"
                        name="shortDescription"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter description"
                        value={values.shortDescription}
                        touched={touched.shortDescription}
                        error={errors.shortDescription}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Priority"
                        name="priority"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="number"
                        placeholder="Enter priority"
                        value={values.priority}
                        touched={touched.priority}
                        error={errors.priority}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label htmlFor="">Status</label>
                      <div className="d-flex gap-3">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            id="true"
                            value={"true"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.status == "true"}
                          />
                          <label htmlFor="true" className="mt-2">
                            Active
                          </label>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            name="status"
                            id="false"
                            value={"false"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.status == "false"}
                          />
                          <label htmlFor="false" className="mt-2">
                            Disabled
                          </label>
                        </div>
                      </div>
                      {errors.status && touched.status ? (
                        <p className="custom-form-error text-danger">
                          {errors.status}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* META Details */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">META Details</h5>
                    </div>
                    <div className="form-group col-md-12">
                      <InputBox
                        label="Meta Title"
                        name="metaTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter meta title"
                        value={values.metaTitle}
                        touched={touched.metaTitle}
                        error={errors.metaTitle}
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <TextareaBox
                        label="Meta Description"
                        name="metaDescription"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        placeholder="Enter meta description"
                        value={values.metaDescription}
                        touched={touched.metaDescription}
                        error={errors.metaDescription}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <TextareaBox
                        label="Meta Keywords"
                        name="metaKeywords"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        placeholder="Enter meta keywords (comma saparated values)"
                        value={values.metaKeywords}
                        touched={touched.metaKeywords}
                        error={errors.metaKeywords}
                      />
                    </div>

                    <div className="">
                      <SubmitButton loading={loading} text="Add Catalogue" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
