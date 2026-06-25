// src/pages/Register.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Upload, Loader2 } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1500);
    console.log(data);
    
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-surface p-8 rounded-2xl border border-surface shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold text-textMain mb-2">Join the Pack</h2>
          <p className="text-textMuted">Create your account and start organizing rides.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          {/* Avatar Upload Placeholder */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-background border border-dashed border-primary flex items-center justify-center cursor-pointer hover:bg-background/80 transition-colors group">
              <Upload className="h-8 w-8 text-primary group-hover:-translate-y-1 transition-transform" />
            </div>
            <span className="text-xs text-textMuted mt-2">Upload Avatar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  type="tel"
                  {...register("phone")}
                  className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-textMuted" />
              </div>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  type="password"
                  {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 characters" }})}
                  className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  type="password"
                  {...register("confirmPassword", { 
                    validate: value => value === password || "Passwords do not match"
                  })}
                  className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
             <p className="text-sm text-red-500 text-center">Please fix the errors above.</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-background bg-primary hover:bg-secondary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-textMuted relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-secondary transition-colors">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;