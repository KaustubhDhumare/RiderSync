// src/pages/Login.jsx
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/authApi'
const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const onSubmit = async (data) => {
    console.log("CHECKPOINT 1 - Form Data:", data);
    setIsLoading(true);
    setApiError(''); // Clear previous errors

    try {

      const response = await authApi.login(data);
      
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message); // Set the error message to display in UI
    } finally {
      setIsLoading(false);
    }
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
          {/* Error Banner Display */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{apiError}</p>
            </div>
          )}
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
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                className="block w-full pl-10 pr-10 py-3 border border-surface bg-background rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textMain transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
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