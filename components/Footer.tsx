// components/Footer.tsx

export function Footer() {
    return (
      <footer className="w-full py-6 bg-white/80 text-center text-gray-500 text-sm mt-auto">
        © {new Date().getFullYear()} Aanstekerloos — met kleine stappen vooruit ·{" "}
        <a href="#privacy" className="underline hover:text-orange-500">Privacy</a>
      </footer>
    );
  }
  