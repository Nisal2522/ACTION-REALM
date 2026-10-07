import { Link } from 'react-router-dom';
import useTitle from '../hooks/useTitle';

export default function NotFound() {
  useTitle('Page Not Found');
  return (
    <div className="container narrow center-page">
      <h1>404 — Lost in the Multiverse</h1>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn">Back To Home</Link>
    </div>
  );
}
