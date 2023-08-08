import SettingsLayout from "@/layouts/settings-layout";
import { type NextPageWithLayout } from "@/types/next";
import React from "react";

const Page: NextPageWithLayout = () => {
  return <div>People Page</div>;
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;
