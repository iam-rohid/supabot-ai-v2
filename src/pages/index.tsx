import { Button } from "@/components/ui/button";
import MarketingLayout from "@/layouts/marketing-layout";
import { type NextPageWithLayout } from "@/types/next";
import { ChevronRight, GithubIcon } from "lucide-react";
import Link from "next/link";

const Page: NextPageWithLayout = () => {
  return (
    <main>
      <section className="my-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-6xl font-bold leading-none">
            Integrate ChatGPT on your Site with Ease
          </h1>
          <p className="mt-8 text-xl leading-snug text-muted-foreground">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maxime,
            iure exercitationem blanditiis ipsa vero consequuntur.
          </p>
          <div className="mt-16 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signin">
                Start for Free
                <ChevronRight className="-mr-1 ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signin">
                <GithubIcon className="-ml-1 mr-2 h-5 w-5" />
                Star on Github
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

Page.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>;

export default Page;
