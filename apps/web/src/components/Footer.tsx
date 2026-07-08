import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 px-6 py-6 text-center text-xs text-zinc-600">
      <p>
        © {new Date().getFullYear()} ExploitYard™. All rights reserved.{' '}
        <Link to="/terms" className="text-zinc-500 underline hover:text-zinc-300">
          Terms of Service
        </Link>
      </p>
    </footer>
  );
}
