import Navbar from "@/components/Navbar";
import WorkSchedule from "@/components/WorkSchedule";
import Footer from "@/components/Footer";

export default function SchedulePage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24">
        <WorkSchedule />
      </div>
      <Footer />
    </main>
  );
}
