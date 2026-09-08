const teamMembers = [
  {
    name: "DR. JANE DOE",
    specialty: "Specialist in Clinical Genetics",
    image: "/doctor-avatar1.png",
  },
  {
    name: "DR. SARAH DOE",
    specialty: "Specialist in Molecular Genetics",
    image: "/doctor-avatar2.png",
  },
  {
    name: "DR. ELIZA DOE",
    specialty: "Specialist in Medical Genetics",
    image: "/doctor-avatar1.png",
  },
  {
    name: "DR. MICHELLE DOE",
    specialty: "Specialist in Cytogenetics",
    image: "/doctor-avatar2.png",
  },
];

const OurTeam = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 uppercase">
            OUR <span className="text-cyan-500">TEAM</span>
          </h2>
          <div className="h-1 w-16 bg-cyan-500 mx-auto mt-4 mb-6" />
          <p className="text-slate-500 text-sm leading-relaxed">
            Facilisis class dictum inceptos elementum, vestibulum ante posuere. Pretium vel lectus pretium posuere cubilia curae.
          </p>
        </div>

        {/* Members Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="text-center group">
              {/* Circular Avatar with glowing border */}
              <div className="relative mx-auto w-40 h-40 rounded-full p-1.5 border-2 border-cyan-400/30 group-hover:border-cyan-500 transition-all duration-300 overflow-hidden mb-6">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide group-hover:text-cyan-600 transition-colors">
                {member.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 uppercase font-medium">
                {member.specialty}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
