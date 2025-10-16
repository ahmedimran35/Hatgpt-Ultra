import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Card, CardBody } from '../components/Card';
import ParticleBackground from '../components/ParticleBackground';
import AnimatedText from '../components/AnimatedText';
import FadeInSection from '../components/FadeInSection';

export default function Landing() {
	return (
		<div className="min-h-screen bg-white text-gray-800 antialiased">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50 shadow-sm">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="h-9 w-9 rounded-md bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold shadow">H</div>
						<span className="font-semibold text-lg tracking-tight">HatGPT Ultra</span>
					</div>
					<nav className="hidden md:flex items-center gap-6 text-sm">
						<a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
						<a href="#whyus" className="text-gray-600 hover:text-gray-900 transition">Why Free</a>
						<a href="#community" className="text-gray-600 hover:text-gray-900 transition">Community</a>
						<Link to="/login">
							<button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">Sign In</button>
						</Link>
						<Link to="/signup">
							<button className="px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-emerald-400 to-teal-400 shadow hover:opacity-90 transition">Get Started</button>
						</Link>
					</nav>
					{/* Mobile menu button */}
					<div className="md:hidden">
						<Link to="/login">
							<button className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">Sign In</button>
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
				<div>
					<AnimatedText 
						text="100% Free, Open, and Powerful AI Workspace." 
						className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900"
						delay={200}
					/>
					<p className="mt-4 text-lg text-gray-600 max-w-lg">
						HatGPT Ultra lets you compare multiple AI models in one clean, distraction-free interface. No subscriptions, no limits, no hidden costs — just pure creativity and learning.
					</p>
					<div className="mt-8 flex gap-4">
						<Link to="/signup">
							<button className="px-6 py-3 text-white bg-gradient-to-r from-emerald-400 to-teal-400 rounded-md font-medium shadow hover:opacity-90 transition">Use It Free</button>
						</Link>
						<Link to="/login">
							<button className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition">Sign In</button>
						</Link>
			</div>
					<p className="mt-3 text-sm text-gray-500">Instant access. No sign-up walls. No ads.</p>
				</div>
				
				<FadeInSection className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
					<h3 className="text-sm font-semibold mb-4 text-gray-700">Live Preview</h3>
						<div className="space-y-4">
						<ModelCard title="GPT-5" text="Fast and factual answers for research." color="from-emerald-50 to-teal-50" />
						<ModelCard title="Claude 4" text="Creative ideas and natural writing." color="from-green-50 to-lime-50" />
						<ModelCard title="Gemini 2" text="Clean summaries and helpful explanations." color="from-cyan-50 to-emerald-50" />
					</div>
				</FadeInSection>
			</section>

			{/* Why Free */}
			<FadeInSection className="py-20 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-100">
				<div className="max-w-6xl mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-6">Why HatGPT Ultra is 100% Free</h2>
					<p className="max-w-2xl mx-auto text-gray-600 mb-10">
						We believe in open access to AI. Our mission is to make powerful tools available to everyone — no paywalls, no trials, just genuine value for learners, creators, and curious minds.
					</p>
					<div className="grid md:grid-cols-3 gap-8">
						<FeatureCard icon="🌍" title="Global Access" text="Free for everyone, anywhere in the world." />
						<FeatureCard icon="🤝" title="Community Driven" text="Built and improved with help from our users." />
						<FeatureCard icon="🧩" title="Open & Transparent" text="No hidden APIs or upsells — you see what you get." />
				</div>
			</div>
		</FadeInSection>

			{/* Community */}
			<FadeInSection className="py-20 bg-white border-t border-gray-100">
				<div className="max-w-6xl mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-6">Join a Growing AI Community</h2>
					<p className="max-w-2xl mx-auto text-gray-600 mb-10">
						HatGPT Ultra is supported by curious thinkers, open-source developers, and educators. Share ideas, test features, and help shape the future of AI accessibility.
					</p>
					<button className="px-8 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-md shadow hover:opacity-90 transition">Join Our Discord</button>
				</div>
			</FadeInSection>

			{/* CTA */}
			<FadeInSection className="text-center py-24 bg-gradient-to-r from-emerald-50 via-teal-50 to-lime-50 border-t border-gray-100">
				<h2 className="text-3xl font-bold mb-4 text-gray-900">Experience AI Without Barriers</h2>
				<p className="text-gray-600 mb-8 max-w-xl mx-auto">No fees. No signups. No gimmicks. Just open, accessible tools to help you explore, learn, and create.</p>
				<Link to="/signup">
					<button className="px-8 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-md shadow hover:opacity-90 transition">Start Using for Free</button>
				</Link>
		</FadeInSection>

			{/* Footer */}
			<footer className="border-t border-gray-200 bg-white py-10">
				<div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
					<div>© {new Date().getFullYear()} HatGPT Ultra. 100% Free and Open WebApp.</div>
					<div className="flex gap-4">
						<a href="#privacy" className="hover:text-gray-900">Privacy</a>
						<a href="#contact" className="hover:text-gray-900">Contact</a>
						<a href="#community" className="hover:text-gray-900">Community</a>
					</div>
				</div>
			</footer>
			</div>
	);
}

function ModelCard({ title, text, color }) {
	return (
		<div className={`rounded-xl bg-gradient-to-r ${color} p-4 shadow-sm border border-gray-100 transition hover:scale-[1.02]`}>
			<h4 className="font-semibold text-gray-900">{title}</h4>
			<p className="text-sm text-gray-600 mt-1">{text}</p>
				</div>
	);
}

function FeatureCard({ icon, title, text }) {
	return (
		<div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
			<div className="text-3xl mb-3">{icon}</div>
			<h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
			<p className="text-sm text-gray-600">{text}</p>
			</div>
	);
}
