import { Link } from 'react-router-dom';
import { useState } from 'react';
import AnimatedText from '../components/AnimatedText';
import FadeInSection from '../components/FadeInSection';

export default function Landing() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-800 antialiased">
			{/* Header */}
			<header className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-xl">
								H
							</div>
							<div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-sm opacity-30"></div>
						</div>
						<span className="font-bold text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">HatGPT Ultra</span>
					</div>
					<nav className="hidden md:flex items-center gap-8 text-sm">
						<a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors duration-300 font-medium">Features</a>
						<a href="#whyus" className="text-gray-600 hover:text-emerald-600 transition-colors duration-300 font-medium">Why Free</a>
						<a href="#community" className="text-gray-600 hover:text-emerald-600 transition-colors duration-300 font-medium">Community</a>
						<Link to="/login">
							<button className="px-6 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105">Sign In</button>
						</Link>
						<Link to="/signup">
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-sm opacity-75"></div>
								<button className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
									Get Started
								</button>
							</div>
						</Link>
					</nav>
					{/* Mobile menu (hamburger) */}
					<div className="relative md:hidden">
						<button
							onClick={() => setMobileMenuOpen(v => !v)}
							aria-label="Open menu"
							className="p-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all duration-300"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
						{mobileMenuOpen && (
							<div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl py-3 z-50">
								<a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-300 font-medium">Features</a>
								<a href="#whyus" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-300 font-medium">Why Free</a>
								<a href="#community" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-300 font-medium">Community</a>
								<div className="my-2 border-t border-gray-200"></div>
								<Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-300 font-medium">Sign In</Link>
								<Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors duration-300 font-semibold">Get Started</Link>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Hero Section */}
            <section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-teal-600/5 to-cyan-600/5"></div>
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							<div className="space-y-6">
								<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 backdrop-blur-sm border border-emerald-200/50">
									<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
									<span className="text-sm font-semibold text-emerald-700">100% Free & Open Source</span>
								</div>
								<AnimatedText 
									text="The Ultimate AI Workspace for Everyone" 
									className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent"
									delay={200}
								/>
								<p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
									Compare multiple AI models in one clean, distraction-free interface. No subscriptions, no limits, no hidden costs — just pure creativity and learning.
								</p>
							</div>
							<div className="flex flex-wrap gap-4">
								<Link to="/signup">
									<div className="relative">
										<div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-sm opacity-75"></div>
										<button className="relative px-8 py-4 text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl font-semibold shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
											Start Using Free
										</button>
									</div>
								</Link>
								<Link to="/login">
									<button className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-emerald-300 transition-all duration-300 font-semibold">
										Sign In
									</button>
								</Link>
							</div>
							<div className="flex items-center gap-6 text-sm text-gray-500">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-green-500"></div>
									<span>Instant access</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-blue-500"></div>
									<span>No sign-up walls</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-purple-500"></div>
									<span>No ads</span>
								</div>
							</div>
						</div>
						
						<FadeInSection className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20"></div>
							<div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-3 h-3 rounded-full bg-emerald-500"></div>
									<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
									<div className="w-3 h-3 rounded-full bg-red-500"></div>
									<h3 className="text-lg font-bold text-gray-800 ml-4">Live Preview</h3>
								</div>
								<div className="space-y-4">
									<ModelCard title="GPT-5" text="Fast and factual answers for research." color="from-emerald-50 to-teal-50" />
									<ModelCard title="Claude 4" text="Creative ideas and natural writing." color="from-green-50 to-lime-50" />
									<ModelCard title="Gemini 2" text="Clean summaries and helpful explanations." color="from-cyan-50 to-emerald-50" />
								</div>
							</div>
						</FadeInSection>
					</div>
				</div>
			</section>

			{/* Why Free */}
            <FadeInSection className="relative overflow-hidden py-20 sm:py-24">
				<div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
					<div className="space-y-8">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 backdrop-blur-sm border border-emerald-200/50">
								<span className="text-2xl">💚</span>
								<span className="text-sm font-semibold text-emerald-700">100% Free Forever</span>
							</div>
							<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
								Why HatGPT Ultra is 100% Free
							</h2>
							<p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
								We believe in open access to AI. Our mission is to make powerful tools available to everyone — no paywalls, no trials, just genuine value for learners, creators, and curious minds.
							</p>
						</div>
						<div className="grid md:grid-cols-3 gap-8">
							<FeatureCard icon="🌍" title="Global Access" text="Free for everyone, anywhere in the world." />
							<FeatureCard icon="🤝" title="Community Driven" text="Built and improved with help from our users." />
							<FeatureCard icon="🧩" title="Open & Transparent" text="No hidden APIs or upsells — you see what you get." />
						</div>
					</div>
				</div>
			</FadeInSection>

			{/* Community */}
            <FadeInSection className="relative overflow-hidden py-20 sm:py-24">
				<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
					<div className="space-y-8">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200/50">
								<span className="text-2xl">👥</span>
								<span className="text-sm font-semibold text-blue-700">Growing Community</span>
							</div>
							<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
								Join a Growing AI Community
							</h2>
							<p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
								HatGPT Ultra is supported by curious thinkers, open-source developers, and educators. Share ideas, test features, and help shape the future of AI accessibility.
							</p>
						</div>
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-75"></div>
							<button className="relative px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
								Join Our Discord
							</button>
						</div>
					</div>
				</div>
			</FadeInSection>

			{/* CTA */}
            <FadeInSection className="relative overflow-hidden py-20 sm:py-24">
				<div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"></div>
				<div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
					<div className="space-y-8">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 backdrop-blur-sm border border-emerald-200/50">
								<span className="text-2xl">🚀</span>
								<span className="text-sm font-semibold text-emerald-700">Ready to Start?</span>
							</div>
							<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
								Experience AI Without Barriers
							</h2>
							<p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
								No fees. No signups. No gimmicks. Just open, accessible tools to help you explore, learn, and create.
							</p>
						</div>
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-sm opacity-75"></div>
							<Link to="/signup">
								<button className="relative px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
									Start Using for Free
								</button>
							</Link>
						</div>
					</div>
				</div>
			</FadeInSection>

			{/* Footer */}
            <footer className="relative overflow-hidden border-t border-white/20 bg-white/90 backdrop-blur-xl py-12">
				<div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-teal-600/5 to-cyan-600/5"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-6">
						<div className="flex items-center gap-3">
							<div className="relative">
								<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
									H
								</div>
								<div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg blur-sm opacity-30"></div>
							</div>
							<div className="text-sm text-gray-600">
								© {new Date().getFullYear()} HatGPT Ultra. 100% Free and Open WebApp.
							</div>
						</div>
						<div className="flex gap-6">
							<a href="#privacy" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-300 font-medium">Privacy</a>
							<a href="#contact" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-300 font-medium">Contact</a>
							<a href="#community" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-300 font-medium">Community</a>
						</div>
					</div>
				</div>
			</footer>
			</div>
	);
}

type ModelCardProps = { title: string; text: string; color: string };
function ModelCard({ title, text, color }: ModelCardProps) {
	return (
		<div className={`rounded-2xl bg-gradient-to-r ${color} p-5 shadow-lg border border-white/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
			<h4 className="font-bold text-gray-900 text-lg">{title}</h4>
			<p className="text-sm text-gray-600 mt-2 leading-relaxed">{text}</p>
		</div>
	);
}

type FeatureCardProps = { icon: string; title: string; text: string };
function FeatureCard({ icon, title, text }: FeatureCardProps) {
	return (
		<div className="relative group">
			<div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
			<div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
				<div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
				<h4 className="font-bold text-gray-900 mb-3 text-xl">{title}</h4>
				<p className="text-gray-600 leading-relaxed">{text}</p>
			</div>
		</div>
	);
}
