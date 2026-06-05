import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../context/ToastContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToasts();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      success("Logged in successfully!", "Welcome back!");
      navigate("/dashboard");
    } catch (e: any) {
      error(e.message || "Invalid credentials", "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 dark:bg-black/80 dark:border-neutral-800 dark:backdrop-blur-md dark:backdrop-saturate-150 rounded-2xl p-8 shadow-xl flex flex-col gap-6 select-none">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xl font-bold text-black dark:text-white">Welcome Back</h3>
        <p className="text-xs text-black dark:text-white">Enter your credentials to access your workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email */}
        <Input
          {...register("email")}
          autoComplete="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          icon={<Mail className="w-4 h-4" />}
        />

        {/* Password */}
        <Input
          {...register("password")}
          autoComplete="current-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          icon={<Lock className="w-4 h-4" />}
        />

        {/* Action Button */}
        <Button
          type="submit"
          loading={loading}
          icon={<LogIn className="w-4.5 h-4.5" />}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="text-center select-none text-xs text-black dark:text-white mt-2">
        Don\'t have an account?{" "}
        <Link
          to="/auth/register"
          className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
        >
          Create account
        </Link>
      </div>
    </div>
  );
};
export default Login;
