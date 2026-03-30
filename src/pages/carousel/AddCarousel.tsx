import { GoBackButton, InputBox, SubmitButton } from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  carouselSchema,
  CarouselValues,
  carouselInitialValues,
} from "../../validationSchemas/carouselSchema";
import { useState } from "react";
import { post, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { ReactHelmet } from "../../components/ui/ReactHelmet";

export function AddCarousel() {
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
      values: CarouselValues,
      helpers: FormikHelpers<CarouselValues>,
    ) {
      setCreating(true);

      const apiResponse = await post("/carousels", values, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setCreating(false);
    },
    initialValues: carouselInitialValues,
    validationSchema: carouselSchema,
  });

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("image", true);
      setFieldError("image", "Image is required field");
      toast.error("Image is required field");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("image", true);
      setFieldError("image", "Must select the valid image file");
      toast.error("Must select the valid image file");
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
        setFieldTouched("image", false);
        setFieldError("image", "");
        setFieldValue("image", apiData.body[0].filepath);
      } else {
        setFieldTouched("image", false);
        setFieldError("image", apiData.message);
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
        setFieldError("image", "");
        setFieldValue("image", "");
      } else {
        setFieldError("image", "");
        setFieldValue("image", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        `imageFile`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  function getFileNameFromUrl(url: any) {
    // Create a URL object
    const urlObj = new URL(url);

    // Get the pathname from the URL
    const pathname = urlObj.pathname;

    // Extract the last part of the pathname as the filename
    const fileName = pathname.substring(pathname.lastIndexOf("/") + 1);

    return fileName;
  }

  return (
    <>
      <ReactHelmet title="Add Carousel : Crown" description="Add Carousel" />
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Add Carousel</h4>
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
                        label="Carousel Title"
                        name="title"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter title"
                        value={values.title}
                        required={true}
                        touched={touched.title}
                        error={errors.title}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Sub Title"
                        name="subTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter sub title"
                        value={values.subTitle}
                        required={false}
                        touched={touched.subTitle}
                        error={errors.subTitle}
                      />
                    </div>

                    <div className="form-group col-md-8">
                      <label htmlFor={"imageFile"}>
                        Carousel Image <span className="text-danger"> *</span>
                      </label>
                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          name="imageFile"
                          id="imageFile"
                          onChange={(evt) => {
                            handleUploadFile(evt);
                          }}
                          className="form-control"
                        />
                        {values.image ? (
                          <Link to={`${values.image}`} target="_blank">
                            <img
                              className="img"
                              height={43}
                              width={43}
                              src={`${values.image}`}
                            />
                          </Link>
                        ) : null}
                        {values.image ? (
                          <button
                            type="button"
                            className="btn p-1"
                            onClick={(evt) => {
                              handleDeleteFile(
                                evt,
                                getFileNameFromUrl(values.image),
                              );
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

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Button Link"
                        name="buttonLink"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Button Link"
                        value={values.buttonLink}
                        touched={touched.buttonLink}
                        error={errors.buttonLink}
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

                    <div className="">
                      <SubmitButton loading={creating} text="Add Carousel" />
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
