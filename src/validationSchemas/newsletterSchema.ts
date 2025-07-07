import * as Yup from "yup";

export const newsletterSchema = Yup.object({
  email: Yup.string().email().required().label("Email"),
  subscriptionStatus: Yup.string().required().label("Subscription Status"),
  newsletterType: Yup.string().required().label("Newsletter Type"),
});

export const newsletterInitialValues: NewsletterValues = {
  email: "",
  subscriptionStatus: "SUBSCRIBED",
  newsletterType: "GENERAL",
};

export interface NewsletterValues {
  email: string;
  subscriptionStatus: string;
  newsletterType: string;
}
