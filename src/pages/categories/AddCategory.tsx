import {
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  categorySchema,
  CategoryValues,
  categoryInitialValues,
} from "../../validationSchemas/categorySchema";

import { useState } from "react";
import {
  addUrlToFile,
  generateSlug,
  post,
  remove,
  validateTextNumber,
} from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { ReactHelmet } from "../../components/ui/ReactHelmet";

export function AddCategory() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState<boolean>(false);

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
      values: CategoryValues,
      helpers: FormikHelpers<CategoryValues>,
    ) {
      setCreating(true);

      const newValue = { ...values };

      const apiResponse = await post("/categories", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setCreating(false);
    },
    initialValues: categoryInitialValues,
    validationSchema: categorySchema,
  });

  function handleTitleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    let value = validateTextNumber(evt.target.value);
    let name = evt.target.name;

    setFieldValue(name, value);

    let slug = generateSlug(value);
    setFieldValue("slug", slug);
  }

  // handleUploadFile
  async function handleUploadFile(
    event: React.ChangeEvent<HTMLInputElement>,
    source?: "MAIN_IMAGE" | "LISTING_IMAGE",
  ) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      if (source == "MAIN_IMAGE") {
        setFieldTouched("image", true);
        setFieldError("image", "Image is required field");
        toast.error("Image is required field");
        return;
      } else {
        setFieldTouched("listingImage", true);
        return;
      }
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      if (source == "MAIN_IMAGE") {
        setFieldTouched("image", true);
        setFieldError("image", "Must select the valid image file");
        toast.error("Must select the valid image file");
        return;
      } else {
        setFieldTouched("listingImage", true);
        setFieldError("listingImage", "Must select the valid image file");
        toast.error("Must select the valid image file");
        return;
      }
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
        if (source == "MAIN_IMAGE") {
          setFieldTouched("image", false);
          setFieldError("image", "");
          setFieldValue("image", apiData.body[0].filename);
        } else {
          setFieldTouched("listingImage", false);
          setFieldError("listingImage", "");
          setFieldValue("listingImage", apiData.body[0].filename);
        }
      } else {
        if (source == "MAIN_IMAGE") {
          setFieldTouched("image", false);
          setFieldError("image", apiData.message);
        } else {
          setFieldTouched("listingImage", false);
          setFieldError("listingImage", apiData.message);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    source?: "MAIN_IMAGE" | "LISTING_IMAGE",
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        if (source == "MAIN_IMAGE") {
          setFieldError("image", "");
          setFieldValue("image", "");
        } else {
          setFieldError("listingImage", "");
          setFieldValue("listingImage", "");
        }
      } else {
        if (source == "MAIN_IMAGE") {
          setFieldError("image", "");
          setFieldValue("image", "");
        } else {
          setFieldError("listingImage", "");
          setFieldValue("listingImage", "");
        }
        toast.error(apiResponse?.message);
      }

      if (source == "MAIN_IMAGE") {
        const fileInput = document.getElementById(
          `imageFile`,
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
      } else {
        const fileInput = document.getElementById(
          `listingImageFile`,
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  return (
    <>
      <ReactHelmet title="Add Category : Crown" description="Add Category" />
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Add Category</h4>
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
                        label="Category Name"
                        name="name"
                        handleBlur={handleBlur}
                        handleChange={handleTitleChange}
                        type="text"
                        placeholder="Enter category name"
                        value={values.name}
                        required={true}
                        touched={touched.name}
                        error={errors.name}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Category Slug"
                        name="slug"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter category slug"
                        value={values.slug}
                        required={true}
                        touched={touched.slug}
                        error={errors.slug}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label htmlFor={"imageFile"}>
                        Category Image <span className="text-danger"> *</span>{" "}
                        <span className="text-danger text-small">
                          (Size - 890X708 PX)
                        </span>
                      </label>
                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          name="imageFile"
                          id="imageFile"
                          onChange={(evt) => {
                            handleUploadFile(evt, "MAIN_IMAGE");
                          }}
                          className="form-control"
                        />
                        {values.image ? (
                          <Link to={`${values.image}`} target="_blank">
                            <img
                              className="img"
                              height={43}
                              width={43}
                              src={`${addUrlToFile(values.image)}`}
                            />
                          </Link>
                        ) : null}
                        {values.image ? (
                          <button
                            type="button"
                            className="btn p-1"
                            onClick={(evt) => {
                              handleDeleteFile(evt, values.image, "MAIN_IMAGE");
                            }}
                          >
                            <i className="fa fa-trash text-danger"></i>
                          </button>
                        ) : null}
                      </div>
                      {touched.image && errors.image ? (
                        <p className="custom-form-error text-danger">
                          {errors.image}
                        </p>
                      ) : null}
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
                      <InputBox
                        label="Text Over Image"
                        name="textOverImage"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter description"
                        value={values.textOverImage}
                        touched={touched.textOverImage}
                        error={errors.textOverImage}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Button Text"
                        name="buttonText"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Button Text"
                        value={values.buttonText}
                        touched={touched.buttonText}
                        error={errors.buttonText}
                      />
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

              {/* Listing Details */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Listing Details</h5>
                    </div>
                    <div className="form-group col-md-12">
                      <InputBox
                        label="Listing Title"
                        name="listingTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter title"
                        value={values.listingTitle}
                        touched={touched.listingTitle}
                        error={errors.listingTitle}
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <TextareaBox
                        label="Listing Description"
                        name="listingDescription"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        placeholder="Enter description"
                        value={values.listingDescription}
                        touched={touched.listingDescription}
                        error={errors.listingDescription}
                      />
                    </div>

                    <div className="form-group col-md-8">
                      <label htmlFor={"listingImageFile"}>
                        Listing Image{" "}
                        <span className="text-danger text-small">
                          (Size - 1476X638 PX)
                        </span>
                      </label>

                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          name="listingImageFile"
                          id="listingImageFile"
                          onChange={(evt) => {
                            handleUploadFile(evt, "LISTING_IMAGE");
                          }}
                          className="form-control"
                        />
                        {values.listingImage ? (
                          <Link to={`${values.listingImage}`} target="_blank">
                            <img
                              className="img"
                              height={43}
                              width={43}
                              src={`${addUrlToFile(values.listingImage)}`}
                            />
                          </Link>
                        ) : null}
                        {values.listingImage ? (
                          <button
                            type="button"
                            className="btn p-1"
                            onClick={(evt) => {
                              handleDeleteFile(
                                evt,
                                values.listingImage,
                                "LISTING_IMAGE",
                              );
                            }}
                          >
                            <i className="fa fa-trash text-danger"></i>
                          </button>
                        ) : null}
                      </div>
                      {touched.listingImage && errors.listingImage ? (
                        <p className="custom-form-error text-danger">
                          {errors.listingImage}
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
                      <SubmitButton loading={creating} text="Add Category" />
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
