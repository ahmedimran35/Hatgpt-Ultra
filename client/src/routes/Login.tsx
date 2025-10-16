import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Removed unused UI imports
import FadeInSection from '../components/FadeInSection';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string>('');
	const navigate = useNavigate();

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		try {
			const res = await axios.post('/api/auth/login', { email, password });
			localStorage.setItem('token', res.data.token);
			if (res.data.user) {
				localStorage.setItem('user', JSON.stringify(res.data.user));
			}
			navigate('/app');
		} catch (err: any) {
			setError(err?.response?.data?.error || 'Login failed');
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
			{/* Navbar */}
			<header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<div className="h-9 w-9 rounded-md bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold shadow">H</div>
						<span className="font-semibold text-lg tracking-tight">HatGPT Ultra</span>
					</Link>
					<nav className="flex items-center gap-6 text-sm">
						<Link to="/" className="text-gray-700 hover:text-emerald-600 font-medium transition">Home</Link>
						<Link to="/signup" className="text-gray-700 hover:text-emerald-600 font-medium transition">Sign Up</Link>
						<Link to="/login" className="text-emerald-600 font-semibold">Sign In</Link>
					</nav>
				</div>
			</header>

			{/* Sign-In Form */}
			<div className="flex-grow flex items-center justify-center px-4 sm:px-6">
				<FadeInSection className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 mt-10 mb-16">
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white font-bold text-lg mb-4">H</div>
						<h1 className="text-2xl font-bold text-gray-900">Welcome Back to HatGPT Ultra</h1>
						<p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">
							Reconnect with your personal AI workspace. Access your projects, saved prompts, and AI comparisons — all for free.
						</p>
					</div>

					<form onSubmit={onSubmit} className="space-y-5">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none"
								required
							/>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter your password"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none"
									required
								/>
								<button 
									type="button" 
									onClick={() => setShowPassword(!showPassword)} 
									className="absolute inset-y-0 right-0 mr-3 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
								>
									{showPassword ? 'Hide' : 'Show'}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between text-sm">
							<label className="flex items-center gap-2">
								<input type="checkbox" className="rounded border-gray-300" />
								<span className="text-gray-600">Remember me</span>
							</label>
							<a href="#forgot" className="text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</a>
						</div>

						{error && (
							<div className="rounded-lg bg-red-50 border border-red-200 p-3">
								<p className="text-sm text-red-600 font-medium">{error}</p>
							</div>
						)}

						<button
							type="submit"
							className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-semibold rounded-lg shadow hover:opacity-90 transition"
						>
							Sign In
						</button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-gray-600 text-sm max-w-sm mx-auto">
							Your account gives you access to saved chat comparisons, personalized prompts, and experimental AI tools — all 100% free and ad-free.
						</p>
					</div>

					<div className="mt-8 text-center text-sm text-gray-600">
						<p>Don't have an account? <Link to="/signup" className="text-emerald-600 font-medium hover:text-emerald-700">Create one free</Link></p>
						<p className="mt-2">No subscriptions. No hidden features. Just open AI access.</p>
					</div>
				</FadeInSection>
			</div>

			{/* Footer */}
			<footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-600">
				<p>© {new Date().getFullYear()} HatGPT Ultra. 100% Free and Open WebApp.</p>
			</footer>
		</div>
	);
}
