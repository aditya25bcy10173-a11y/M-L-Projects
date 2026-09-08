import { ArrowLeft, MapPin, Phone, Mail, Clock, Globe, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticlesBackground />
      <div className="relative z-10 container mx-auto px-6 py-10 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Contact <span className="text-gradient">Our Team</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Questions, partnerships, or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {[
            { icon: MapPin, label: "Address", value: "Plot 42, MedTech Park, Sector 18, Bengaluru, Karnataka 560100, India" },
            { icon: Phone, label: "Phone", value: "+91 98765 43210" },
            { icon: Mail, label: "Email", value: "support@aiearlydetector.health" },
            { icon: Clock, label: "Hours", value: "Mon – Sat, 9:00 AM – 7:00 PM IST" },
            { icon: Globe, label: "Website", value: "www.aiearlydetector.health" },
            { icon: Heart, label: "Emergency", value: "For medical emergencies, call 112 immediately" },
          ].map((c, i) => (
            <div key={i} className="rounded-2xl bg-card card-glow p-6 flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-hero-gradient flex items-center justify-center flex-shrink-0">
                <c.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{c.label}</p>
                <p className="text-foreground font-medium mt-1">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card card-glow p-8">
          <h2 className="text-2xl font-bold mb-4">Send us a message</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll get back to you soon."); }}
            className="grid gap-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Your name" className="p-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary" />
              <input required type="email" placeholder="Your email" className="p-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary" />
            </div>
            <input placeholder="Subject" className="p-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary" />
            <textarea required placeholder="Your message..." className="p-3 rounded-xl bg-secondary border border-border text-foreground min-h-32 focus:outline-none focus:border-primary" />
            <button className="py-3 rounded-xl bg-hero-gradient text-primary-foreground font-semibold hover:opacity-90 transition">
              Send Message
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 italic">
            * Sample contact details shown. Final company information will be updated soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
