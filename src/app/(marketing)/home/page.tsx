import Chatbox from "./chatbox";
import Hero from "./hero";

export default function Page() {
  return (
    <main className="relative py-16">
      <div className="absolute left-0 right-0 top-0 -z-10 h-[400px] bg-gradient-to-b from-secondary to-background"></div>
      <Hero />
      <Chatbox />
    </main>
  );
}
