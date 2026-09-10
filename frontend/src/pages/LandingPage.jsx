import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UserPlus,
  ClipboardList,
  FileCheck2,
  BadgeCheck,
  Briefcase,
  Clock,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';

const STEPS = [
  { icon: UserPlus, title: 'Register', description: 'Create your provider account in minutes.' },
  { icon: Briefcase, title: 'Complete Profile', description: 'Add your services, skills, and location.' },
  { icon: FileCheck2, title: 'Upload Documents', description: 'Submit your ID and verification documents.' },
  { icon: BadgeCheck, title: 'Get Verified', description: 'Our team reviews and approves your application.' },
];

const FEATURES = [
  {
    icon: Clock,
    title: 'Track Your Status',
    description: 'Follow your application from submission to approval in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Verification',
    description: 'Your documents are reviewed securely by our admin team.',
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Onboarding',
    description: 'Get smart category suggestions as you describe your work.',
  },
];

const LandingPage = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    <header className="border-b border-gray-100 dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          <ShieldCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          ServiceHub
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Login
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>

    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
      <div>
        <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          Join Our Network of{' '}
          <span className="text-primary-600 dark:text-primary-400">Trusted Service Providers</span>
        </h1>
        <p className="mt-5 text-lg text-gray-500 dark:text-gray-400">
          Register, get verified, and start managing your services on one simple platform.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register">
            <Button className="px-6 py-3 text-base">Register as Provider</Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" className="px-6 py-3 text-base">
              Learn More
            </Button>
          </a>
        </div>
      </div>

      <div className="relative rounded-2xl bg-primary-50 p-8 dark:bg-primary-500/10">
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.slice(0, 2).map((f) => (
            <div key={f.title} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <f.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{f.title}</p>
            </div>
          ))}
          <div className="col-span-2 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <BadgeCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Verified Professionals</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Every provider goes through document verification.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" className="border-t border-gray-100 bg-gray-50 py-16 dark:border-gray-800 dark:bg-gray-800/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">How It Works</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-semibold text-primary-600 dark:text-primary-400">
                Step {index + 1}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Built for Service Providers
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-200 p-5 dark:border-gray-700">
              <f.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{f.title}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="border-t border-gray-100 bg-primary-600 py-14 dark:border-gray-800">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-white">Ready to grow your business?</h2>
        <p className="mt-2 text-primary-100">Register today and start receiving bookings once verified.</p>
        <Link to="/register" className="mt-6 inline-block">
          <Button variant="secondary" className="px-6 py-3 text-base">
            Register as Provider
          </Button>
        </Link>
      </div>
    </section>

    <footer className="border-t border-gray-100 py-6 dark:border-gray-800">
      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} ServiceHub. All rights reserved.
      </p>
    </footer>
  </div>
);

export default LandingPage;
