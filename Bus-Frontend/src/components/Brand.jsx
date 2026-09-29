import { Link } from 'react-router-dom';
export default function Brand() {
  return <Link to="/" className="brand" aria-label="SmartTrack home">
    <img className="brand-logo brand-logo-light" src="/light-logo-transparent.png" alt="" aria-hidden="true" />
    <img className="brand-logo brand-logo-dark" src="/dark-logo-transparent.png" alt="" aria-hidden="true" />
  </Link>;
}
