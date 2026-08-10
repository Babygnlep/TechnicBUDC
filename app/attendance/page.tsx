import AttendanceBoard from "@/components/AttendanceBoard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function AttendancePage() {
  return <main><Navbar /><div className="bg-canvas px-3 pb-20 pt-28 sm:px-6"><AttendanceBoard /></div><Footer /></main>;
}
