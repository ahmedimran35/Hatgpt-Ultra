import { Outlet, Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';

export default function RootLayout() {
	const location = useLocation();
	const isAppRoute = location.pathname.startsWith('/app');
	const isLandingPage = location.pathname === '/';
	const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
	
	return (
		<div className="min-h-screen flex flex-col">
			{!isAppRoute && !isLandingPage && !isAuthPage && (
				<header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
					<div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
						<Link to="/" className="flex items-center gap-2 font-semibold text-brand-700">
							<span className="inline-block h-3 w-3 rounded-full bg-brand-500" />
							HatGPT Ultra
						</Link>
						<nav className="flex items-center gap-3 text-sm">
							<Link to="/login"><Button variant="ghost" size="sm" className={location.pathname === '/login' ? 'text-brand-700' : 'text-slate-700'}>Login</Button></Link>
							<Link to="/signup"><Button variant="primary" size="sm">Sign up</Button></Link>
						</nav>
					</div>
				</header>
			)}
			<main className="flex-1">
				<Outlet />
			</main>
			{!isAppRoute && !isLandingPage && !isAuthPage && (
				<footer className="border-t text-center text-xs text-slate-500 py-4">© {new Date().getFullYear()} HatGPT Ultra</footer>
			)}
		</div>
	);
}
