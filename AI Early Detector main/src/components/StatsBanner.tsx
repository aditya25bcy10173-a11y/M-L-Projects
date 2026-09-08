import { useNavigate } from "react-router-dom";

const StatsBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-16 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white text-center">
      {/* Decorative SVG pattern behind banner */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[size:20px_20px]" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase mb-3 leading-tight">
          OVER 1,000 GENETIC TESTS & STUDIES!
        </h2>
        <p className="text-xs md:text-sm text-cyan-100 max-w-2xl mx-auto leading-relaxed mb-8">
          Curabitur a congue cubilia cras dictum tempora augue fusce luctus, convallis tellus dolor est donec convallis.
        </p>
        <div>
          <button
            onClick={() => navigate("/contact")}
            className="inline-flex items-center justify-center rounded-xl bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-3.5 text-xs font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer uppercase"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
