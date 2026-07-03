import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-canvas px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 sm:h-10 sm:w-10">
            <Image
              src="/TECNIC_LOGO.png"
              alt="Bangkok University Digital Media Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-display text-lg tracking-wide text-ink">
            TECHNIC<span className="text-reel"> BUDC</span>
          </span>
        </div>
        <p className="text-xs tracking-[0.15em] text-smoke/60">
          © {new Date().getFullYear()} TECHNIC BUDC — สงวนลิขสิทธิ์
        </p>
      </div>
    </footer>
  );
}
