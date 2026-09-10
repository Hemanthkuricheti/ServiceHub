import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import PasswordInput from '../components/common/PasswordInput';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import GoogleAuthButton from '../components/common/GoogleAuthButton';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const user = await login(values);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-gray-50 px-4 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-200/50 blur-3xl dark:bg-primary-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary-300/40 blur-3xl dark:bg-primary-500/10" />
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100"
        >
          <ShieldCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          ServiceHub
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Sign in to continue to your account</p>
        <div className="mb-4">
          <GoogleAuthButton />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Sign In
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          New service provider?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
