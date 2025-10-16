import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Removed unused UI imports
import FadeInSection from '../components/FadeInSection';

export default function Signup() {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		setLoading(true);

		// Client-side validation
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		if (username.length < 3) {
			setError('Username must be at least 3 characters long');
			setLoading(false);
			return;
		}

		try {
			const res = await axios.post('/api/auth/signup', { 
				email, 
				username, 
				password, 
				confirmPassword 
			});
			localStorage.setItem('token', res.data.token);
			if (res.data.user) {
				localStorage.setItem('user', JSON.stringify(res.data.user));
			}
			navigate('/app');
		} catch (err: any) {
			const errorMessage = err?.response?.data?.error || 'Signup failed';
			setError(errorMessage);
		} finally {
			setLoading(false);
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
						<Link to="/login" className="text-gray-700 hover:text-emerald-600 font-medium transition">Sign In</Link>
						<Link to="/signup" className="text-emerald-600 font-semibold">Sign Up</Link>
					</nav>
				</div>
			</header>

			{/* Sign-Up Form */}
			<div className="flex-grow flex items-center justify-center px-4 sm:px-6">
				<FadeInSection className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 mt-10 mb-16">
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white font-bold text-lg mb-4">H</div>
						<h1 className="text-2xl font-bold text-gray-900">Join HatGPT Ultra</h1>
						<p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">
							Start comparing AI models side-by-side. Save your conversations, access all models, and build your AI workflow — completely free.
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
							<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
							<input
								type="text"
								id="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Choose a username"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none"
								required
								minLength={3}
								maxLength={20}
							/>
							<p className="text-xs text-gray-500 mt-1">3-20 characters, letters and numbers only</p>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Create a password"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none"
									required
									minLength={6}
								/>
								<button 
									type="button" 
									onClick={() => setShowPassword(!showPassword)} 
									className="absolute inset-y-0 right-0 mr-3 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
								>
									{showPassword ? 'Hide' : 'Show'}
								</button>
							</div>
							<p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
						</div>
						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm your password"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none"
									required
									minLength={6}
								/>
								<button 
									type="button" 
									onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
									className="absolute inset-y-0 right-0 mr-3 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
								>
									{showConfirmPassword ? 'Hide' : 'Show'}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between text-sm">
							<label className="flex items-center gap-2">
								<input type="checkbox" className="rounded border-gray-300" />
								<span className="text-gray-600">I agree to the terms</span>
							</label>
						</div>

						{error && (
							<div className="rounded-lg bg-red-50 border border-red-200 p-3">
								<p className="text-sm text-red-600 font-medium">{error}</p>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-semibold rounded-lg shadow hover:opacity-90 transition disabled:opacity-50"
						>
							{loading ? (
								<div className="flex items-center justify-center gap-2">
									<div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
									Creating account...
								</div>
							) : (
								'Create Account'
							)}
						</button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-gray-600 text-sm max-w-sm mx-auto">
							Get instant access to compare GPT-5, Claude 4, Gemini 2, and more. Save conversations, create custom prompts, and explore AI without limits.
						</p>
					</div>

					<div className="mt-8 text-center text-sm text-gray-600">
						<p>Already have an account? <Link to="/login" className="text-emerald-600 font-medium hover:text-emerald-700">Sign in here</Link></p>
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
