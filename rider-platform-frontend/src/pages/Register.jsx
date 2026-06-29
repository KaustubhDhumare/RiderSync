// src/pages/Register.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { authApi } from "../api/authApi";
const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
  );

  const avatars = [
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Mason",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Leo",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Bella",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Daisy",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna",
  ];

  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    try {
      const { confirmPassword, ...registerData } = data;
      const finalData = { 
      ...registerData, 
      avatar: selectedAvatar 
    };
      await authApi.register(finalData);
      navigate("/login");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-surface p-8 rounded-2xl border border-surface shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold text-textMain mb-2">
            Join the Pack
          </h2>
          <p className="text-textMuted">
            Create your account and start organizing rides.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 relative z-10"
        >
          {/* 🔴 NEW: Error Banner Display */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{apiError}</p>
            </div>
          )}
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <img
                src={selectedAvatar}
                alt="Selected"
                className="w-24 h-24 rounded-full border-4 border-primary cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsModalOpen(true)}
              />
              {/* Optional: Add a small camera icon overlay if you want extra polish */}
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-primary mt-3 font-medium hover:text-secondary underline underline-offset-4 transition-colors"
            >
              Change Avatar
            </button>

            {/* Modal remains outside the layout flow because of 'fixed' positioning */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-surface p-6 rounded-2xl max-w-sm w-full border border-surface shadow-2xl">
                  <h3 className="text-lg font-bold text-textMain mb-4 text-center">
                    Choose an Avatar
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {avatars.map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt="avatar"
                        onClick={() => {
                          setSelectedAvatar(url);
                          setIsModalOpen(false);
                        }}
                        className={`w-16 h-16 rounded-full cursor-pointer border-4 transition-transform hover:scale-105 ${
                          selectedAvatar === url
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-6 w-full py-2 bg-textMuted/20 hover:bg-textMuted/30 rounded-lg text-textMain transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                    pattern: {
                      value: /^[A-Za-z\s]+$/,
                      message: "Name can only contain letters",
                    },
                  })}
                  className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  type="tel"
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Must be exactly 10 digits",
                    },
                  })}
                  className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">
              Email Address
            </label>
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
              <label className="block text-sm font-medium text-textMuted mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
                      message: "Min 8 chars, 1 uppercase, 1 number",
                    },
                  })}
                  className="block w-full pl-10 pr-10 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textMain transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-textMuted" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className="block w-full pl-10 pr-10 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textMain transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* {Object.keys(errors).length > 0 && (
            <p className="text-sm text-red-500 text-center">
              Please fix the errors above.
            </p>
          )} */}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-background bg-primary hover:bg-secondary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-textMuted relative z-10">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-secondary transition-colors"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
