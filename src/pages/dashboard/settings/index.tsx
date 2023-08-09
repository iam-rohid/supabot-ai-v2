import DeleteAccountForm from "@/components/forms/delete-account-form";
import UpdateAccountEmailForm from "@/components/forms/update-account-email-form";
import UpdateAccountNameForm from "@/components/forms/update-account-name-form";
import SettingsLayout from "@/layouts/settings-layout";
import { type NextPageWithLayout } from "@/types/next";

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
