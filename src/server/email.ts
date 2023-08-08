import { APP_NAME, EMAIL_DOMAIN } from "@/utils/constants";
import { type ReactElement, type JSXElementConstructor } from "react";
import { Resend } from "resend";
import { nanoid } from "./nanoid";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  email,
  subject,
  react,
  marketing,
  test,
}: {
  email: string;
  subject: string;
  react: ReactElement<any, string | JSXElementConstructor<any>>;
  marketing?: boolean;
  test?: boolean;
}) => {
  return resend.emails.send({
    from: marketing
      ? `Rohid from ${APP_NAME} <rohid@${EMAIL_DOMAIN}>`
      : `${APP_NAME} <system@${EMAIL_DOMAIN}>`,
    to: test ? "delivered@resend.dev" : email,
    subject,
    react,
    headers: {
      "X-Entity-Ref-ID": nanoid(),
    },
  });
};
