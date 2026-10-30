import { AppHeader } from "@/components/shared/app-header";
import { LandingHero } from "@/features/landing/components/hero";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1">
        <LandingHero />
      </main>
    </div>
  );
}
