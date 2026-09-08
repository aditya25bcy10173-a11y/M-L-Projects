import { Heart, Twitter, Github, Linkedin, Instagram, Youtube, Mail } from "lucide-react";

const socials = [
  { href: "https://twitter.com", label: "Twitter", Icon: Twitter },
  { href: "https://github.com", label: "GitHub", Icon: Github },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: Linkedin },
  { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
  { href: "https://youtube.com", label: "YouTube", Icon: Youtube },
  { href: "mailto:team@helios.ai", label: "Email", Icon: Mail },
];

const Footer = () => (
  <footer id="contact-us" className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12">
    <div className="container mx-auto flex flex-col items-center justify-center px-4 sm:px-6 text-center">
      <div className="flex items-center justify-center gap-2.5 text-base sm:text-lg font-bold">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/20">
          <Heart className="h-5 w-5 text-white fill-white animate-pulse" />
        </span>
        <span className="text-white font-extrabold uppercase tracking-wide">AI Early <span className="text-cyan-500 font-bold">Detector</span></span>
      </div>

      <ul className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
        {socials.map(({ href, label, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-cyan-500 hover:bg-cyan-500 hover:text-white hover:-translate-y-0.5 duration-300"
            >
              <Icon className="h-4 w-4" />
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-slate-500">
        Team <span className="text-cyan-500 font-semibold">HELIOS</span>
      </p>
    </div>
  </footer>
);

export default Footer;
