import {
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  homepageSchema,
  HomepageValues,
  homepageInitialValues,
} from "../../validationSchemas/homepageSchema";
import { useEffect, useState } from "react";
import { addUrlToFile, get, post, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL, FILE_URL } from "../../constants";
import { ReactHelmet } from "../../components/ui/ReactHelmet";

export function HomepageContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

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
    setValues,
  } = useFormik({
    onSubmit: async function (
      values: HomepageValues,
      helpers: FormikHelpers<HomepageValues>,
    ) {
      setLoading(true);

      const apiResponse = await post("/homepage", values, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: homepageInitialValues,
    validationSchema: homepageSchema,
  });

  // Get Data From Database
  useEffect(function () {
    async function getData() {
      let url = `/homepage`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        const apiData = apiResponse.body;
        delete apiData.isDeleted;
        delete apiData.createdAt;
        delete apiData.updatedAt;
        delete apiData._id;
        setValues(apiData);
      } else {
        toast.error(apiResponse?.message);
      }
    }

    getData();
  }, []);

  // handleUploadAboutusImage
  async function handleUploadAboutusImage(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("aboutusImage", true);
      setFieldError("aboutusImage", "Image is required field");
      toast.error("Image is required field");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("aboutusImage", true);
      setFieldError("aboutusImage", "Must select the valid image file");
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
        setFieldTouched("aboutusImage", false);
        setFieldError("aboutusImage", "");
        setFieldValue("aboutusImage", apiData.body[0].filename);
      } else {
        setFieldTouched("aboutusImage", false);
        setFieldError("aboutusImage", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteAboutusImage
  async function handleDeleteAboutusImage(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("aboutusImage", "");
        setFieldValue("aboutusImage", "");
      } else {
        setFieldError("aboutusImage", "");
        setFieldValue("aboutusImage", "");
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

  // handleUploadMarketingImage
  async function handleUploadMarketingImage(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("marketingImage", true);
      setFieldError("marketingImage", "Image is required field");
      toast.error("Image is required field");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("marketingImage", true);
      setFieldError("marketingImage", "Must select the valid image file");
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
        setFieldTouched("marketingImage", false);
        setFieldError("marketingImage", "");
        setFieldValue("marketingImage", apiData.body[0].filename);
      } else {
        setFieldTouched("marketingImage", false);
        setFieldError("marketingImage", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteMarketingImage
  async function handleDeleteMarketingImage(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("marketingImage", "");
        setFieldValue("marketingImage", "");
      } else {
        setFieldError("marketingImage", "");
        setFieldValue("marketingImage", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        `marketingImageFile`,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  return (
    <>
      <ReactHelmet
        title="Homepage Content : Crown"
        description="Homepage Content"
      />

      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Homepage Content</h4>
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
              {/* About Us */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">About US</h5>
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Aboutus Title"
                        name="aboutusTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter title"
                        value={values.aboutusTitle}
                        required={false}
                        touched={touched.aboutusTitle}
                        error={errors.aboutusTitle}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Aboutus Sub Title"
                        name="aboutusSubTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter sub title"
                        value={values.aboutusSubTitle}
                        required={false}
                        touched={touched.aboutusSubTitle}
                        error={errors.aboutusSubTitle}
                      />
                    </div>

                    <div className="form-group col-md-8">
                      <label htmlFor={"imageFile"}>
                        Aboutus Image
                        {/* <span className="text-danger"> *</span> */}
                      </label>
                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          name="imageFile"
                          id="imageFile"
                          onChange={(evt) => {
                            handleUploadAboutusImage(evt);
                          }}
                          className="form-control"
                        />
                        {values.aboutusImage ? (
                          <Link to={`${values.aboutusImage}`} target="_blank">
                            <img
                              className="img"
                              height={43}
                              width={43}
                              src={`${addUrlToFile(values.aboutusImage)}`}
                            />
                          </Link>
                        ) : null}
                        {values.aboutusImage ? (
                          <button
                            type="button"
                            className="btn p-1"
                            onClick={(evt) => {
                              handleDeleteAboutusImage(
                                evt,
                                values.aboutusImage,
                              );
                            }}
                          >
                            <i className="fa fa-trash text-danger"></i>
                          </button>
                        ) : null}
                      </div>
                      {touched.aboutusImage && errors.aboutusImage ? (
                        <p className="custom-form-error text-danger">
                          {errors.aboutusImage}
                        </p>
                      ) : null}
                    </div>

                    <div className="form-group col-md-12">
                      <InputBox
                        label="Aboutus Video"
                        name="aboutusVideo"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter video link"
                        value={values.aboutusVideo}
                        required={false}
                        touched={touched.aboutusVideo}
                        error={errors.aboutusVideo}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <TextareaBox
                        label="Aboutus Description"
                        name="aboutusDescription"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        placeholder="Enter description"
                        value={values.aboutusDescription}
                        touched={touched.aboutusDescription}
                        error={errors.aboutusDescription}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Aboutus Button Text"
                        name="aboutusButtonText"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Button Text"
                        value={values.aboutusButtonText}
                        touched={touched.aboutusButtonText}
                        error={errors.aboutusButtonText}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Aboutus Button Link"
                        name="aboutusButtonLink"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Button Link"
                        value={values.aboutusButtonLink}
                        touched={touched.aboutusButtonLink}
                        error={errors.aboutusButtonLink}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing */}
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h5 className="mb-2">Marketing</h5>
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Marketing Title"
                        name="marketingTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter title"
                        value={values.marketingTitle}
                        required={false}
                        touched={touched.marketingTitle}
                        error={errors.marketingTitle}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Marketing Sub Title"
                        name="marketingSubTitle"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter sub title"
                        value={values.marketingSubTitle}
                        required={false}
                        touched={touched.marketingSubTitle}
                        error={errors.marketingSubTitle}
                      />
                    </div>

                    <div className="form-group col-md-8">
                      <label htmlFor={"marketingImageFile"}>
                        Marketing Image{" "}
                        <span className="text-danger text-small">
                          (Size - 500X500 PX)
                        </span>
                        {/* <span className="text-danger"> *</span> */}
                      </label>
                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          name="marketingImageFile"
                          id="marketingImageFile"
                          onChange={(evt) => {
                            handleUploadMarketingImage(evt);
                          }}
                          className="form-control"
                        />
                        {values.marketingImage ? (
                          <Link to={`${values.marketingImage}`} target="_blank">
                            <img
                              className="img"
                              height={43}
                              width={43}
                              src={`${addUrlToFile(values.marketingImage)}`}
                            />
                          </Link>
                        ) : null}
                        {values.marketingImage ? (
                          <button
                            type="button"
                            className="btn p-1"
                            onClick={(evt) => {
                              handleDeleteMarketingImage(
                                evt,
                                values.marketingImage,
                              );
                            }}
                          >
                            <i className="fa fa-trash text-danger"></i>
                          </button>
                        ) : null}
                      </div>
                      {touched.marketingImage && errors.marketingImage ? (
                        <p className="custom-form-error text-danger">
                          {errors.marketingImage}
                        </p>
                      ) : null}
                    </div>

                    <div className="form-group col-md-12">
                      <InputBox
                        label="Marketing Video"
                        name="marketingVideo"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Enter video link"
                        value={values.marketingVideo}
                        required={false}
                        touched={touched.marketingVideo}
                        error={errors.marketingVideo}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <TextareaBox
                        label="Marketing Description"
                        name="marketingDescription"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        placeholder="Enter description"
                        value={values.marketingDescription}
                        touched={touched.marketingDescription}
                        error={errors.marketingDescription}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Marketing Button Text"
                        name="marketingButtonText"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Button Text"
                        value={values.marketingButtonText}
                        touched={touched.marketingButtonText}
                        error={errors.marketingButtonText}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <InputBox
                        label="Marketing Button Link"
                        name="marketingButtonLink"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        type="text"
                        placeholder="Button Link"
                        value={values.marketingButtonLink}
                        touched={touched.marketingButtonLink}
                        error={errors.marketingButtonLink}
                      />
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
                      <SubmitButton loading={false} text="Update Details" />
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
