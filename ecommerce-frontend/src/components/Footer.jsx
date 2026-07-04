import { Link } from 'react-router-dom';
import { GithubArrowIcon } from './Icons.jsx';

const REPO_URL = 'https://github.com/Amandev25';

// The three link columns in the footer. These are demo links (they point home).
const COLUMNS = [
  { title: 'Shop', links: ['New arrivals', 'Best sellers', 'Home & Living', 'Sale'] },
  { title: 'Company', links: ['About', 'Journal', 'Careers', 'Stores'] },
  { title: 'Support', links: ['Help center', 'Shipping', 'Returns', 'Contact'] },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-[#C7C9C5] px-10 pt-12 pb-7 mt-16 rounded-t-2xl">
      <div className="container-page">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 pb-9 border-b border-[#2A2D2A]">
          <div>
            <div className="font-display font-extrabold text-[22px] text-white tracking-tight mb-3">MARLOWE</div>
            <p className="text-sm leading-relaxed max-w-[280px] mb-4">
              Everyday things, thoughtfully made. A full-stack e-commerce demo built to production quality.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[#8FE3B4] text-[13.5px] font-semibold inline-flex items-center gap-1.5 hover:underline"
            >
              View source on GitHub
              <GithubArrowIcon size={13} strokeWidth={2.2} />
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[13px] font-bold text-white tracking-wide mb-3.5">{col.title}</div>
              <div className="flex flex-col gap-2.5">
                {col.links.map((label) => (
                  <Link key={label} to="/products" className="text-sm text-[#A9ACA7] hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 pt-5 flex-wrap text-[13px]">
          <span>© 2026 Marlowe — demo / portfolio project. Not a real store.</span>
          <span className="flex gap-4">
            <a href="#" className="text-[#A9ACA7] hover:text-white">Privacy</a>
            <a href="#" className="text-[#A9ACA7] hover:text-white">Terms</a>
            <a href="#" className="text-[#A9ACA7] hover:text-white">Razorpay secured</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
