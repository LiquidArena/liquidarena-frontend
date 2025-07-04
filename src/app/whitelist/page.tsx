"use client";

import { AnimatedBackground } from "@/components/ui/animated-background";
import { EmailForm } from "@/components/view/whitelist/email-form";
import { FeaturesGrid } from "@/components/view/whitelist/features-grid";
import { HeroHeader } from "@/components/view/whitelist/hero-header";

export default function WhitelistPage() {
  // Custom email submission handler (optional)
  const handleEmailSubmit = async (email: string) => {
    // You can implement custom logic here
    // For example, call your API
    console.log("Submitting email:", email);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // If you want to throw an error for testing:
    // throw new Error('API Error');
  };

  // Custom email validation (optional)
  const customEmailValidation = (email: string): string | null => {
    if (!email) {
      return "Email is required";
    }
    if (!email.includes("@")) {
      return "Please enter a valid email address";
    }
    if (!email.includes("gmail.com")) {
      return "Please enter a Gmail address";
    }
    return null;
  };

  return (
    <AnimatedBackground>
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto mt-6">
          <HeroHeader title="Be the First" subtitle="LiquidArena" />

          <EmailForm
            onSubmit={handleEmailSubmit}
            emailValidation={customEmailValidation}
            placeholder="Enter your Gmail address"
            buttonText="Join Waitlist"
            loadingText="Joining Waitlist..."
          />

          <FeaturesGrid />
        </div>
      </div>
    </AnimatedBackground>
  );
}
