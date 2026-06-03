'use client';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import ManufacturingProcess from '@/components/landing/ManufacturingProcess';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ManufacturingProcess />
      <CTASection />
      <Footer />
    </main>
  );
}
