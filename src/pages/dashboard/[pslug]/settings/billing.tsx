import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SettingsLayout from "@/layouts/settings-layout";
import { type NextPageWithLayout } from "@/types/next";

const Page: NextPageWithLayout = () => {
  return (
    <div>
      <Card>
        <CardHeader className="flex-row items-center space-x-6 space-y-0">
          <div className="flex-1 space-y-1.5">
            <CardTitle>Billing</CardTitle>
            <CardDescription>You are currently on free plan.</CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
          <Button>Upgrade</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

Page.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Page;
