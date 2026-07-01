import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../context/ToastContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const { success, error } = useToasts();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-transparent" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-rose-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-emerald-500" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-cyan-500" };
      default:
        return { score: 0, label: "", color: "bg-transparent" };
    }
  };

  const strength = getPasswordStrength(passwordInput);

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      success("Account created successfully!", "Welcome aboard!");
      navigate("/dashboard");
    } catch (e: any) {
      error(e.message || "Registration failed", "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 dark:bg-black/80 dark:border-neutral-800 dark:backdrop-blur-md dark:backdrop-saturate-150 rounded-2xl p-8 shadow-xl flex flex-col gap-5 select-none">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-black dark:text-white">Create Account</h3>
        <p className="text-xs text-black dark:text-white">Join other job hunters and organize your applications</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Name */}
        <Input
          {...register("name")}
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          icon={<User className="w-4 h-4" />}
        />

        {/* Email */}
        <Input
          {...register("email")}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          icon={<Mail className="w-4 h-4" />}
        />

        {/* Password */}
        <div>
          <Input
            {...register("password")}
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            icon={<Lock className="w-4 h-4" />}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          {/* Strength Meter */}
          {passwordInput && (
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-black dark:text-white">
                <span>Password Strength</span>
                <span className={strength.score <= 50 ? "text-amber-600 dark:text-amber-400" : "text-cyan-600 dark:text-cyan-400"}>
                  {strength.label}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300 ${
                    strength.score < 25
                      ? "w-1/4"
                      : strength.score < 50
                        ? "w-1/2"
                        : strength.score < 75
                          ? "w-3/4"
                          : "w-full"
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          {...register("confirmPassword")}
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          icon={<Lock className="w-4 h-4" />}
        />

        {/* Action Button */}
        <Button
          type="submit"
          loading={loading}
          icon={<UserPlus className="w-4.5 h-4.5" />}
          className="w-full mt-2"
        >
          Sign Up
        </Button>
      </form>

      <div className="text-center select-none text-xs text-black dark:text-white mt-1">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};
export default Register;
