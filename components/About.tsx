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
        <div className="max-w-xl">
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
              className="group rounded-xl2 border border-line bg-white/10 backdrop-blur-xl p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-reel hover:shadow-glow"
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
