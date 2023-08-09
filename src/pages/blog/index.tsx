import MarketingLayout from "@/layouts/marketing-layout";
import { type NextPageWithLayout } from "@/types/next";

const Page: NextPageWithLayout = () => {
  return <div>Blog Page</div>;
};

Page.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>;

export default Page;
