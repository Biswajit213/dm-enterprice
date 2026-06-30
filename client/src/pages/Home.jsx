import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const heroSlides = [
  { image: '/hero1.jpg' },
  { image: '/hero2.jpg' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState([
    { image: { url: '/hero1.jpg' } },
    { image: { url: '/hero2.jpg' } },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [f, b, h] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/bestsellers'),
          api.get('/hero'),
        ]);
        setFeatured(f.data.products);
        setBestSellers(b.data.products);
        if (h.data.slides.length > 0) setHeroSlides(h.data.slides);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden">
        {/* Sliding backgrounds */}
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${slide.image?.url || slide.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === currentSlide ? 1 : 0,
            }}
          />
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative container-max px-4 sm:px-6 md:px-8 py-16 sm:py-20 z-10">
          <div className="max-w-xl sm:max-w-2xl">
            <span className="badge bg-accent/20 text-accent border border-accent/30 mb-4 sm:mb-6 inline-block px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              ☕ Premium Coffee Experience
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight mb-4 sm:mb-6">
              Brew Your
              <span className="text-accent block">Perfect Moment</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed">
              From farm to cup, we craft exceptional coffee experiences. Discover our artisan blends and find your perfect brew.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link to="/category" className="bg-accent text-dark font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                Explore Products <FiArrowRight />
              </Link>
              <Link to="/about" className="border-2 border-white text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-white hover:text-dark transition-colors text-sm sm:text-base lg:text-lg">
                Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-accent w-6' : 'bg-white/50'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-primary font-semibold uppercase tracking-widest text-xs sm:text-sm">Our Selection</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-dark mt-2">Featured Coffees</h2>
            <p className="text-gray-500 mt-2 sm:mt-3 max-w-lg mx-auto text-sm sm:text-base">Handpicked selections from our expert baristas</p>
          </div>
          {loading ? (
            <Spinner size="lg" className="py-12" />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No featured products yet.</p>
          )}
          <div className="text-center mt-8 sm:mt-10">
            <Link to="/category" className="btn-primary inline-flex items-center gap-2">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/promo-banner.jpg')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container-max flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
          <div>
            <span className="inline-block bg-accent text-dark text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Limited Offer</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white">20% Off Your First Order</h2>
            <p className="text-white/75 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg">Use code <strong className="text-accent">WELCOME20</strong> at checkout</p>
          </div>
          <Link to="/register" className="flex-shrink-0 bg-accent text-dark font-bold px-7 py-3 sm:px-9 sm:py-4 rounded-lg hover:bg-yellow-400 transition-colors whitespace-nowrap text-sm sm:text-base shadow-lg">
            Claim Offer
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-primary font-semibold uppercase tracking-widest text-xs sm:text-sm">Top Picks</span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-dark mt-2">Best Sellers</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
