import { Eye, Target, FlaskConical, Cpu } from "lucide-react";

const WhoWeAre = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 uppercase">
            WHO <span className="text-cyan-500">WE ARE</span>
          </h2>
          <div className="h-1 w-16 bg-cyan-500 mx-auto mt-4 mb-6" />
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            Genos Medical is a Specialized Clinic in Genetics, made up of a group of professional certified by the American Board of Medical Genetics. The team includes experts in Medical Genetics, Perinatal Genetics, Cytogenetics, Molecular Cytogenetics, Molecular Biology (scientists and researchers).
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {/* Card 1: Vision */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 transition-transform">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 uppercase">Vision</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide specialized medical care in the diagnosis, counseling and management of patients.
              </p>
            </div>
            <button className="mt-6 inline-flex items-center text-xs font-bold text-cyan-600 hover:text-cyan-700 transition cursor-pointer">
              Read More <span className="ml-1 group-hover:translate-x-1 transition-transform">➜</span>
            </button>
          </div>

          {/* Card 2: Mission (Active Card - Cyan Background) */}
          <div className="group rounded-2xl bg-cyan-500 p-6 shadow-md shadow-cyan-500/20 text-white transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 uppercase">Mission</h3>
              <p className="text-xs text-cyan-50 leading-relaxed">
                To be the leading, dynamic clinic specialized in medical genetics services and diagnostics.
              </p>
            </div>
            <button className="mt-6 inline-flex items-center text-xs font-bold text-white hover:text-cyan-50 transition cursor-pointer">
              Read More <span className="ml-1 group-hover:translate-x-1 transition-transform">➜</span>
            </button>
          </div>

          {/* Card 3: Our Samples */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 transition-transform">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 uppercase">Our Samples</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Over 50,000+ demo biological samples in genetics database, testing and clinical references.
              </p>
            </div>
            <button className="mt-6 inline-flex items-center text-xs font-bold text-cyan-600 hover:text-cyan-700 transition cursor-pointer">
              Read More <span className="ml-1 group-hover:translate-x-1 transition-transform">➜</span>
            </button>
          </div>

          {/* Card 4: Comprehensive Solutions */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 uppercase">Solutions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Support for research and diagnostic testing in hereditary and specialized genetic diseases.
              </p>
            </div>
            <button className="mt-6 inline-flex items-center text-xs font-bold text-cyan-600 hover:text-cyan-700 transition cursor-pointer">
              Read More <span className="ml-1 group-hover:translate-x-1 transition-transform">➜</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
