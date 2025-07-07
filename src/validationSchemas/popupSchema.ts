import * as Yup from "yup";

export const popupSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  descriptions: Yup.string().label("Descriptions"),
  image: Yup.string().label("Image"),
  popupType: Yup.string().label("Popup Type"),

  status: Yup.string().label("Status"),
});

export const popupInitialValues: PopupValues = {
  title: "",
  descriptions: "",
  image: "",
  popupType: "IMAGE",
  status: "true",
};

export interface PopupValues {
  title: string;
  descriptions: string;
  image: string;
  popupType: string;
  status: string;
}
