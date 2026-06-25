// src/pages/Login.jsx
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login({ id: 1, name: 'Kaustubh', email: data.email }, 'fake-jwt-token');
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl border border-surface shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold text-textMain mb-2">Welcome Back</h2>
          <p className="text-textMuted">Enter your credentials to access your rides.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-textMuted" />
              </div>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="rider@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-textMuted">Password</label>
              <a href="#" className="text-sm text-primary hover:text-secondary transition-colors">Forgot Password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-textMuted" />
              </div>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-background bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log In'}
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-textMuted relative z-10">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-secondary transition-colors">
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;