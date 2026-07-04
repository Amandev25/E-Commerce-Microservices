import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Wraps every "store" page with the shared navbar and footer.
// The auth pages (login/register) use their own full-screen layout instead.
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
