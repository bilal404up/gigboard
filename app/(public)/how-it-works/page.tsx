import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HowTheCounterWorks } from "@/components/how-it-works/how-the-counter-works";

export const metadata = {
  title: "How it works | Gigboard",
  description: "From finding the right freelancer to releasing payment, see exactly how Gigboard works for buyers and sellers.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <HowTheCounterWorks />
      <Footer />
    </>
  );
}
