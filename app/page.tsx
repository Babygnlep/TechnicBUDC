import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ApplicationForm from "@/components/ApplicationForm";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <ApplicationForm />
      <Footer />
    </main>
  );
}
