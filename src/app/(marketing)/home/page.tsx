import Chatbox from "./chatbox";
import Hero from "./hero";

export default function Page() {
  return (
    <main className="relative py-16">
      <Hero />
      <Chatbox />
    </main>
  );
}
