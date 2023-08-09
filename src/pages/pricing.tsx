import MarketingLayout from "@/layouts/marketing-layout";
import { type NextPageWithLayout } from "@/types/next";

const Page: NextPageWithLayout = () => {
  return <div>Pricing Page</div>;
};

Page.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>;

export default Page;
