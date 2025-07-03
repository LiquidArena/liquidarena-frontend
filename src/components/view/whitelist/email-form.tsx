import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

interface EmailFormProps {
  onSubmit?: (email: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  loadingText?: string;
  emailValidation?: (email: string) => string | null;
  className?: string;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  onSubmit,
  placeholder = "Enter your email address",
  buttonText = "Join Waitlist",
  loadingText = "Joining Waitlist...",
  emailValidation,
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const defaultValidation = (email: string): string | null => {
    if (!email || !email.includes("@gmail.com")) {
      return "Please enter a valid Gmail address";
    }
    return null;
  };

  const validateEmail = emailValidation || defaultValidation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (onSubmit) {
        await onSubmit(email);
        setMessage("Successfully added to whitelist!");
        setEmail("");
      } else {
        // Default behavior - simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setMessage("Successfully added to whitelist!");
        setEmail("");
      }
    } catch (error) {
      setMessage("Failed to join whitelist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      <div className="grid md:grid-cols-6 gap-4 pb-4">
        <div className="md:col-span-4 text-xl  ">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-8 py-8 bg-white/10 backdrop-blur-xl border border-white/30 rounded-lg text-white placeholder-white/50 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 focus:bg-white/15 transition-all duration-300 text-lg font-light"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-br from-slate-400/20 to-blue-400/20 backdrop-blur-xl rounded-lg text-white font-semibold px-6 py-8 transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:hover:scale-100 border border-white/20 hover:border-white/30 text-lg whitespace-nowrap"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {loadingText}
              </span>
            ) : (
              buttonText
            )}
          </Button>
        </div>

        {message && (
          <div
            className={`md:col-span-6 mt-4 text-center p-4 rounded-2xl backdrop-blur-xl border ${
              message.includes("Successfully")
                ? "bg-green-500/10 border-green-400/30 text-green-300"
                : "bg-red-500/10 border-red-400/30 text-red-300"
            }`}
          >
            <p className="font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
