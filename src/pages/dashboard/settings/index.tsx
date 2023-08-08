import DeleteAccountForm from "@/components/forms/delete-account-form";
import UpdateAccountEmailForm from "@/components/forms/update-account-email-form";
import UpdateAccountNameForm from "@/components/forms/update-account-name-form";
import SettingsLayout from "@/layouts/settings-layout";
import { getServerAuthSession } from "@/server/auth";
import { type NextPageWithLayout } from "@/types/next";
import { type GetServerSideProps } from "next";

const Page: NextPageWithLayout = () => {
  return (
    <div className="grid gap-8">
      <UpdateAccountNameForm />
      <UpdateAccountEmailForm />
      <DeleteAccountForm />
    </div>
  );
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
