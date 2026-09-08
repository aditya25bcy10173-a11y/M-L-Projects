import { useNavigate } from "react-router-dom";

const DoctorBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-slate-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 bg-white">
          {/* Left: Doctor Portrait */}
          <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
            <img
              src="/doctor-banner.png"
              alt="Doctor Geneticist"
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right: Informational Content */}
          <div className="md:w-1/2 p-8 md:p-12 bg-gradient-to-r from-cyan-600 to-blue-700 text-white flex flex-col justify-center">
            <span className="text-xs font-extrabold tracking-widest uppercase text-cyan-200 mb-2">
              Our Experts
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight tracking-tight uppercase">
              DOCTORS GENETICISTS
            </h2>
            <p className="text-xs md:text-sm text-cyan-50 leading-relaxed mb-8">
              Genetic Counseling is a clinical process in which the illness, its conditions, causes, diagnostic tests, inheritance patterns, recurrence risk, and its clinical implications for the patient and family are evaluated and explained by certified specialists.
            </p>
            <div>
              <button
                onClick={() => navigate("/doctor")}
                className="inline-flex items-center justify-center rounded-xl bg-white text-cyan-700 hover:bg-cyan-50 px-6 py-3.5 text-xs font-bold shadow transition-all duration-300 hover:scale-105 cursor-pointer uppercase"
              >
                Book An Appointment <span className="ml-1.5">➜</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorBanner;
