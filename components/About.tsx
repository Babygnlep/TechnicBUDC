const ROLES = [
  { title: "ช่างภาพ / ช่างภาพวิดีโอ", desc: "ผู้บันทึกภาพที่ไล่ล่าเฟรมที่ใช่ในทุกช็อต" },
  { title: "ตัดต่อวิดีโอ", desc: "นักเล่าเรื่องที่ปั้นงานให้สมบูรณ์ในขั้นตอนโพสต์" },
  { title: "ฝ่ายเสียงและไลท์ติ้ง", desc: "ทีมที่สร้างบรรยากาศและความชัดเจนให้งาน" },
  { title: "โปรดักชัน", desc: "ผู้ดูแลหน้างานให้ทุกอย่างเดินหน้าได้ราบรื่น" },
];

/** Short, content-driven bridge between the hero and the application form. */
export default function About() {
  return (
    <section id="about" className="bg-canvas px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_80px_-35px_rgba(255,209,0,0.2)] backdrop-blur-xl sm:p-10">
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            เทคนิคคือหน่วยเก็บความทรงจำและทีมงานซัพพอตห้องกล้อง BUDC
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-smoke md:text-base">
            ทีมงานของเราต้อนรับน้อง ๆ ที่รักงานสร้างสรรค์ มีใจอยากเรียนรู้
            และพร้อมร่วมผลิตโปรเจกต์ที่สะท้อนความเป็นดิจิตอลมีเดียและศิลปะภาพยนตร์
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ROLES.map((role) => (
            <div
              key={role.title}
              className="group rounded-[1.5rem] border border-line/70 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-[0_16px_60px_-28px_rgba(2,6,23,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-reel/60 hover:shadow-[0_24px_90px_-28px_rgba(255,209,0,0.24)]"
            >
              <h3 className="font-display text-lg text-ink">
                {role.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-smoke">
                {role.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
