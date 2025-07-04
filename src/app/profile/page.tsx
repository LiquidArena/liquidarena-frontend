import FooterConnector from "@/components/ui/footer-connector";
import ProfileSection from "@/components/view/profile/profile-section";
import { getServerSideAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const auth = await getServerSideAuth();

  if (!auth) {
    redirect("/");
  }

  return (
    <>
      <section className="min-h-screen bg-gradient-primary py-28 px-4 lg:px-16 flex">
        <ProfileSection />
      </section>
      <FooterConnector />
    </>
  );
}
