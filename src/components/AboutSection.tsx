import { useSettingsStore } from '@/store/settingsStore';
import { FaInstagram, FaTiktok, FaWhatsapp, FaGlobe, FaTwitter, FaYoutube, FaFacebook } from 'react-icons/fa';
import { motion } from 'framer-motion';

const iconFor = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes('insta')) return FaInstagram;
  if (k.includes('tiktok') || k === 'tt') return FaTiktok;
  if (k.includes('whats') || k === 'wa') return FaWhatsapp;
  if (k.includes('twitter') || k === 'x') return FaTwitter;
  if (k.includes('youtube') || k === 'yt') return FaYoutube;
  if (k.includes('facebook') || k === 'fb') return FaFacebook;
  return FaGlobe;
};

export const AboutSection = () => {
  const { about, socials } = useSettingsStore((s) => s.settings);

  return (
    <section className="glass rounded-3xl p-6 md:p-8" data-testid="about-section">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground">
          N
        </div>
        <div>
          <h2 className="text-xl font-bold">About NellMusic</h2>
          <p className="text-xs text-muted-foreground">The vibe behind the app</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 whitespace-pre-line">
        {about}
      </p>
      <div className="flex flex-wrap gap-2">
        {socials.map((s, i) => {
          const Icon = iconFor(s.icon || s.label);
          return (
            <motion.a
              key={i}
              whileHover={{ y: -2 }}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 hover:bg-white/10 transition text-sm"
            >
              <Icon size={14} />
              {s.label}
            </motion.a>
          );
        })}
      </div>
    </section>
  );
};
