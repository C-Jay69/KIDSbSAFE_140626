import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="border-t py-10 px-6 text-center text-sm text-[var(--text-muted)]" style={{ borderColor: "var(--border)" }}>
      <img src="/logo.png" alt="KIDSbSAFE" className="h-8 w-auto mx-auto mb-3" />
      <p>Ethical family safety. Built with transparency and trust.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
        <Link href="/legal"><span className="hover:text-white transition-colors cursor-pointer">Legal &amp; Ethics</span></Link>
        <Link href="/privacy"><span className="hover:text-white transition-colors cursor-pointer">Privacy</span></Link>
        <Link href="/terms"><span className="hover:text-white transition-colors cursor-pointer">Terms</span></Link>
        <Link href="/cookies"><span className="hover:text-white transition-colors cursor-pointer">Cookies</span></Link>
        <a href="mailto:support@kidsbsafe.online" className="hover:text-white transition-colors">Support</a>
      </div>
      <p className="mt-4 text-xs opacity-60">© 2026 KIDSbSAFE. All rights reserved.</p>
    </footer>
  );
}
