import { Button } from "@/components/ui/button";
import { ArrowRight, GithubIcon } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="my-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-6xl font-black leading-tight tracking-tight">
          ChatGPT tailored to{" "}
          <span className="bg-gradient-to-r from-[#08A6FF] to-[#BD19FF] bg-clip-text text-transparent">
            &ldquo;Your Website&rdquo;
          </span>
        </h1>
        <p className="mt-8 text-lg font-medium leading-normal text-muted-foreground">
          Answer user questions effortlessly with our Chatbot powered by GPT,
          specifically trained on your website&apos;s data, eliminating the need
          for a support team.
        </p>
        <div className="mt-16 flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signin">
              Start for Free
              <ArrowRight className="-mr-1 ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link
              href="https://github.com/iam-rohid/supabot-ai"
              target="_blank"
            >
              <GithubIcon className="-ml-1 mr-2 h-5 w-5" />
              Star on Github
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
