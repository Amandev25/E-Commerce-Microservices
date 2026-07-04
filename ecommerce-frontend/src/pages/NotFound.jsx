import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <div className="font-display font-extrabold text-[80px] tracking-tight text-accent leading-none">404</div>
      <h1 className="font-display font-bold text-2xl tracking-tight mt-4">Page not found</h1>
      <p className="text-muted mt-2">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to store
      </Link>
    </div>
  );
}
