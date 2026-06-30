import React from 'react';
import { Link } from 'react-router-dom';
import { FiCoffee, FiHeart, FiUsers } from 'react-icons/fi';

const team = [
  { name: 'Deep Mondal', role: 'Head of Store' },
  { name: 'Deep Mondal', role: 'Production' },
  { name: 'Biswajit Naskar', role: 'Techinical Team' },
];

export default function About() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <div className="relative py-12 sm:py-16 md:py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/page-banner.jpg')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-3 sm:mb-4">Our Story</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base md:text-lg">A passion for coffee, a commitment to quality</p>
        </div>
      </div>

      {/* Story */}
      <section className="section-padding bg-white">
        <div className="container-max grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <div>
            <span className="text-primary font-semibold uppercase tracking-widest text-xs sm:text-sm">Est. 2010</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-dark mt-2 mb-4 sm:mb-5 leading-tight">From a Small Café to Your Door</h2>
            <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              Coffee Haven started as a small corner café in San Francisco, founded by two coffee lovers who believed that great coffee deserved to be shared with the world.
            </p>
            <p className="text-gray-600 leading-relaxed mb-5 sm:mb-6 text-sm sm:text-base">
              Over the years, we've grown from a single café to a beloved online destination, but our core mission remains the same: source the best beans, roast them with care, and deliver extraordinary coffee experiences.
            </p>
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {[['15K+', 'Happy Customers'], ['50+', 'Coffee Varieties'], ['12', 'Countries Sourced']].map(([num, label]) => (
                <div key={label}>
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{num}</p>
                  <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl overflow-hidden h-56 sm:h-72 md:h-96 shadow-xl">
            <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" alt="Coffee Haven café" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>



      {/* Team */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-dark">Meet the Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto mb-3 sm:mb-4">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-heading font-bold text-dark">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-1 sm:mb-2">{member.role}</p>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sourcing */}
      <section className="section-padding bg-primary">
        <div className="container-max text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-3 sm:mb-4">Our Sourcing Philosophy</h2>
          <p className="text-secondary max-w-2xl mx-auto leading-relaxed text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
            We partner directly with small-scale farmers across Ethiopia, Colombia, Brazil, and Guatemala. Every bag of Coffee Haven is traceable from farm to cup.
          </p>
          <Link to="/category" className="bg-accent text-dark font-bold px-8 py-3 sm:px-10 sm:py-4 rounded-lg hover:bg-secondary transition-colors inline-block text-sm sm:text-base">
            Explore Our Coffees
          </Link>
        </div>
      </section>
    </div>
  );
}
