import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Parcours from '../components/Parcours';
import Enseignement from '../components/Enseignement';
import Competences from '../components/Competences';
import CoursEpreuves from '../components/CoursEpreuves';
import Temoignages from '../components/Temoignages';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-900">
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Hero */}
      <Hero />

      {/* 3. À propos */}
      <About />

      {/* 4. Parcours académique */}
      <Parcours />

      {/* 5. Expérience d'enseignement */}
      <Enseignement />

      {/* 6. Compétences & formations */}
      <Competences />

      {/* 7. Cours & Épreuves (Nouveauté) */}
      <CoursEpreuves />

      {/* 8. Témoignages (Nouveauté) */}
      <Temoignages />

      {/* 9. Contact */}
      <Contact />

      {/* 10. Footer */}
      <Footer />
    </main>
  );
}