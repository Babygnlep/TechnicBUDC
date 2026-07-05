import Navbar from "@/components/Navbar";
import WorkScheduleList from "@/components/WorkScheduleList";
import Footer from "@/components/Footer";

export default function ScheduleListPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24">
        <WorkScheduleList />
      </div>
      <Footer />
    </main>
  );
}
