import {
  GoBackButton,
  InputBox,
  OverlayLoading,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  popupSchema,
  PopupValues,
  popupInitialValues,
} from "../../validationSchemas/popupSchema";
import { useEffect, useState } from "react";
import {
  addUrlToFile,
  get,
  put,
  remove,
  validateTextNumber,
} from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { ReactHelmet } from "../../components/ui/ReactHelmet";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export function EditPopup() {
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
    setValues,
    setFieldError,
    setFieldTouched,
    setFieldValue,
  } = useFormik({
    onSubmit: async function (
      values: PopupValues,
      helpers: FormikHelpers<PopupValues>
    ) {
      setUpdating(true);

      const apiResponse = await put(`/popups/${id}`, values);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: popupInitialValues,
    validationSchema: popupSchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        let url = `/popups/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          apiData.status = `${apiData.status}`;
          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;
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

  // handleUploadFile
  async function handleUploadFile(
    event: React.ChangeEvent<HTMLInputElement>,
    source?: "MAIN_IMAGE" | "LISTING_IMAGE"
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
    source?: "MAIN_IMAGE" | "LISTING_IMAGE"
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
          `imageFile`
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
      } else {
        const fileInput = document.getElementById(
          `listingImageFile`
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
      <ReactHelmet title="Edit Popup : Crown" description="Edit Popup" />
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <GoBackButton />
                <h4 className="font-weight-bold mb-0">Edit Popup</h4>
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
              <div className="card rounded-2 mt-4">
                <div className="card-body">
                  <div className="row">
                    <div className="form-group col-md-12">
                      <InputBox
                        label="Popup Title"
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

                    <div className="col-md-12 form-group">
                      <label htmlFor={"descriptions"} className="mb-2">
                        Descriptions
                      </label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={values.descriptions}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFieldValue("descriptions", data);
                        }}
                        onBlur={(event, editor) => {
                          setFieldTouched("descriptions", true);
                        }}
                        onFocus={(event, editor) => {}}
                        id={"descriptions"}
                      />
                      {errors.descriptions && touched.descriptions ? (
                        <p className="custom-form-error text-danger">
                          {errors.descriptions}
                        </p>
                      ) : null}
                    </div>
                    <div className="form-group col-md-8">
                      <label htmlFor={"imageFile"}>
                        Image
                        {/* <span className="text-danger"> *</span> */}
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
                      <label htmlFor="">Popup Type</label>
                      <div className="d-flex gap-3">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            name="popupType"
                            id="imagePopup"
                            value={"IMAGE"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.popupType == "IMAGE"}
                          />
                          <label htmlFor="imagePopup" className="mt-2">
                            IMAGE
                          </label>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            name="popupType"
                            id="imageAndContentPopup"
                            value={"IMAGE_AND_CONTENT"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.popupType == "IMAGE_AND_CONTENT"}
                          />
                          <label
                            htmlFor="imageAndContentPopup"
                            className="mt-2"
                          >
                            IMAGE AND CONTENT
                          </label>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            name="popupType"
                            id="newsletterPopup"
                            value={"NEWSLETTER"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.popupType == "NEWSLETTER"}
                          />
                          <label htmlFor="newsletterPopup" className="mt-2">
                            NEWSLETTER
                          </label>
                        </div>
                      </div>
                      {errors.popupType && touched.popupType ? (
                        <p className="custom-form-error text-danger">
                          {errors.popupType}
                        </p>
                      ) : null}
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
                      <SubmitButton loading={updating} text="Update Popup" />
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
