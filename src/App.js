import React, { useEffect, useRef, useState, createContext, useContext, useCallback, memo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Menu, X, Leaf, Heart, Sparkles, MapPin, Sprout, Award, 
  Apple, Droplets, FlaskConical, Package, Star, Instagram, 
  Facebook, Twitter, Youtube, PlayCircle, ChevronDown, ShoppingCart, 
  Check, Plus, Filter, SortAsc, Trash2, ArrowLeft, Phone,
  Search, ShoppingBag, Send, Brain, Minus, XCircle
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// CART & WISHLIST CONTEXT
// ==========================================
const CartContext = createContext();
const WishlistContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('szj_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('szj_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(prev => 
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price.replace('$', '')) * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = useCallback(() => {
    if (cart.length === 0) return;
    
    const items = cart.map(item => 
      `• ${item.name} - ${item.price} x ${item.quantity} = $${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const total = cartTotal.toFixed(2);
    const message = `Hello Jaba Boost! 👋\n\nI'd like to order:\n${items}\n\n*Total: $${total}*\n\nPlease confirm availability and payment details.\n\nThank you!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/25421648001?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setIsCartOpen(false);
  }, [cart, cartTotal]);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartTotal, cartCount, isCartOpen, setIsCartOpen, checkout 
    }}>
      {children}
    </CartContext.Provider>
  );
};

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('szj_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('szj_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = useCallback((product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  }, []);

  const isInWishlist = useCallback((id) => {
    return wishlist.some(item => item.id === id);
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Product Card Component - Original Clean Design
const ProductCard = memo(({ product, onAddToCart, onToggleWishlist, isInWishlist, compact = false }) => {
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  return (
    <div className="glass-card overflow-hidden group cursor-pointer product-card">
      <div className="relative h-80 overflow-hidden">
        <img 
          src={product.img} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {/* Badge - positioned at bottom like original */}
        {product.badge && (
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`text-xs font-semibold ${product.badgeColor} px-3 py-1 rounded-full`}>
              {product.badge}
            </span>
          </div>
        )}
        
        {/* Wishlist Button - subtle, in corner */}
        <button
          onClick={handleWishlist}
          className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-400 text-red-400' : 'text-white'}`} />
        </button>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-white/60 text-sm mb-4">{product.desc}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gradient">{product.price}</span>
          <button
            onClick={handleAddToCart}
            className={`glass px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-2 ${
              added ? 'bg-green-500/20 border-green-500/50 text-green-400' : ''
            }`}
          >
            {added ? (
              <><Check className="w-4 h-4" /> Added</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// Subscribe & Save Card Component
const SubscribeCard = ({ onClick }) => (
  <div 
    onClick={onClick}
    className="glass-card p-8 flex flex-col items-center justify-center text-center group cursor-pointer border-2 border-orange-500/30 hover:border-orange-500 transition-all h-full min-h-[400px] bg-gradient-to-br from-orange-500/10 to-transparent"
  >
    <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-orange-500/20">
      <Sparkles className="w-10 h-10 text-orange-400" />
    </div>
    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Special Offer</span>
    <h3 className="text-xl font-bold mb-2">Subscribe & Save 15%</h3>
    <p className="text-white/60 text-sm mb-6">Get your favorite juices delivered weekly or monthly. Pause or cancel anytime.</p>
    <button className="btn-primary text-sm">Subscribe Now</button>
  </div>
);

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const videoRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    // Slow down background video
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4;
    }

    // Scroll-linked background orbs animation
    gsap.to(orb1Ref.current, {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2
      },
      y: '-30%',
      x: '20%',
      rotation: 45,
      ease: 'none'
    });

    gsap.to(orb2Ref.current, {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5
      },
      y: '40%',
      x: '-15%',
      rotation: -30,
      ease: 'none'
    });

    gsap.to(orb3Ref.current, {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      },
      y: '-20%',
      x: '25%',
      scale: 1.3,
      ease: 'none'
    });

    // Hero animations - ensure elements become visible
    gsap.fromTo('.hero-content > *', 
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3
      }
    );

    // Scroll animations for cards
    gsap.utils.toArray('.glass-card').forEach((card, i) => {
      gsap.fromTo(card, 
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out'
        }
      );
    });

    gsap.utils.toArray('.process-step').forEach((step, i) => {
      gsap.fromTo(step, 
        { scale: 0.8, opacity: 0 },
        {
          scrollTrigger: {
            trigger: step,
            start: 'top 90%',
            once: true
          },
          scale: 1,
          opacity: 1,
          duration: 0.6,
          delay: i * 0.15,
          ease: 'back.out(1.7)'
        }
      );
    });

    gsap.utils.toArray('.product-card').forEach((card, i) => {
      gsap.fromTo(card, 
        { y: 80, opacity: 0 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out'
        }
      );
    });

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();

    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
      gsap.fromTo(card, 
        { x: i % 2 === 0 ? -50 : 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            once: true
          },
          x: 0,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.15,
          ease: 'power3.out'
        }
      );
    });

    // Scroll listener for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const { 
    cart, addToCart, removeFromCart, updateQuantity, clearCart,
    cartTotal, cartCount, isCartOpen, setIsCartOpen, checkout 
  } = useCart();
  
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

  const [currentPage, setCurrentPage] = useState('home');
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const scrollToSection = (id) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  // Enhanced product catalog - Miraa infused with fruit flavors
  const products = [
    { id: 1, img: 'images/1777179962734.png', name: 'Miraa Mango Fusion', desc: 'Premium miraa infused with sweet Kenyan mangoes. Smooth energy with tropical vibes.', price: '$6.99', category: 'tropical', badge: 'Bestseller', badgeColor: 'bg-orange-500/80', rating: 4.9 },
    { id: 2, img: 'images/1777740719094.png', name: 'Khat Passion Blast', desc: 'Miraa blended with exotic passion fruit. Perfect balance of energy and tangy sweetness.', price: '$7.49', category: 'tropical', badge: 'New', badgeColor: 'bg-purple-500/80', rating: 4.8 },
    { id: 3, img: 'images/1777741812263.png', name: 'Citrus Jaba Zing', desc: 'Miraa infused with zesty oranges and tangerines. A refreshing energy kick for your morning.', price: '$5.99', category: 'citrus', badge: null, badgeColor: '', rating: 4.7 },
    { id: 4, img: 'images/1778168369746.png', name: 'Berry Miraa Mix', desc: 'Miraa with strawberry and raspberry fusion. Sweet energy boost with antioxidant berries.', price: '$8.99', category: 'berry', badge: null, badgeColor: '', rating: 4.9 },
    { id: 5, img: 'images/1778168391740.png', name: 'Pineapple Miraa Gold', desc: 'Miraa meets premium Kenyan pineapples. Smooth, sweet energy without the bitter bite.', price: '$6.49', category: 'tropical', badge: 'Limited', badgeColor: 'bg-yellow-500/80', rating: 4.8 },
    { id: 6, img: 'images/landing1.png', name: 'Watermelon Jaba Cooler', desc: 'Miraa infused with refreshing watermelon and lime. The ultimate summer energy drink.', price: '$5.49', category: 'tropical', badge: null, badgeColor: '', rating: 4.6 },
    { id: 7, img: 'images/original.jpg', name: 'Tamarind Miraa Twist', desc: 'Classic miraa with authentic Kenyan tamarind. Sweet, sour, and naturally energizing.', price: '$6.99', category: 'traditional', badge: 'Popular', badgeColor: 'bg-green-500/80', rating: 4.7 },
    { id: 8, img: 'images/poster.png', name: 'Guava Miraa Burst', desc: 'Miraa blended with aromatic guava. Vitamin C packed energy with a tropical twist.', price: '$6.49', category: 'tropical', badge: null, badgeColor: '', rating: 4.8 },
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'tropical', name: 'Tropical', icon: Apple },
    { id: 'citrus', name: 'Citrus', icon: Sparkles },
    { id: 'berry', name: 'Berry', icon: Heart },
    { id: 'traditional', name: 'Traditional', icon: Award },
  ];

  const testimonials = [
    { name: 'Mike Kipchoge', location: 'Nairobi, Kenya', initials: 'MK', gradient: 'from-orange-400 to-red-400', text: 'The mango miraa fusion is incredible! Natural energy that actually tastes amazing. Perfect for my morning runs and long work days.' },
    { name: 'Jane Akinyi', location: 'Mombasa, Kenya', initials: 'JA', gradient: 'from-blue-400 to-purple-400', text: 'Finally, miraa that tastes good! No more bitter chewing. The passion fruit blend gives me the focus I need without the harsh taste.' },
    { name: 'David Ochieng', location: 'Kisumu, Kenya', initials: 'DO', gradient: 'from-green-400 to-teal-400', text: 'I was skeptical about miraa drinks, but Jaba Boost changed my mind. Natural energy, great taste, and no crash. Game changer!' },
  ];

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'price-low': return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
      case 'price-high': return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
      case 'rating': return b.rating - a.rating;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  return (
    <div className="text-white">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-40" 
          preload="auto"
        >
          <source src="background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>
      </div>

      {/* Animated Background Elements */}
      <div ref={orb1Ref} className="liquid-bg w-96 h-96 bg-orange-500 top-20 -left-48"></div>
      <div ref={orb2Ref} className="liquid-bg w-80 h-80 bg-yellow-500 bottom-40 right-0 animation-delay-2000"></div>
      <div ref={orb3Ref} className="liquid-bg w-64 h-64 bg-red-500 top-1/2 left-1/3 animation-delay-4000"></div>

      {/* Enhanced Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-12 py-3 transition-all duration-300 bg-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => { setCurrentPage('home'); scrollToSection('#home'); }} className="flex items-center">
            <img src="images/logo.png" alt="Jaba Boost" className="h-16 w-16 lg:h-20 lg:w-20 rounded-full object-cover shadow-2xl" loading="lazy" />
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => { setCurrentPage('home'); scrollToSection('#home'); }} className="nav-link text-sm font-medium text-white/90 hover:text-white">Home</button>
            <button onClick={() => { setCurrentPage('home'); setTimeout(() => scrollToSection('#about'), 100); }} className="nav-link text-sm font-medium text-white/90 hover:text-white">Our Story</button>
            <button onClick={() => setCurrentPage('shop')} className="nav-link text-sm font-medium text-white/90 hover:text-white">Shop</button>
            <button onClick={() => { setCurrentPage('home'); setTimeout(() => scrollToSection('#process'), 100); }} className="nav-link text-sm font-medium text-white/90 hover:text-white">Process</button>
            <button onClick={() => { setCurrentPage('home'); setTimeout(() => scrollToSection('#contact'), 100); }} className="nav-link text-sm font-medium text-white/90 hover:text-white">Contact</button>
          </div>

          <div className="flex items-center gap-3">
            {/* Wishlist Button */}
            <button 
              onClick={() => setWishlistOpen(true)}
              className="relative p-2 glass rounded-full hover:bg-white/20 transition-all"
              aria-label="View wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-red-400 text-red-400' : 'text-white'}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 glass rounded-full hover:bg-white/20 transition-all"
              aria-label="View cart"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button className="md:hidden p-2.5 glass rounded-full border border-white/30 hover:bg-white/20 transition-all" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#1a1a2e] h-full overflow-y-auto shadow-2xl animate-slide-in-right">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1a2e] z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Cart ({cartCount})
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60">Your cart is empty</p>
                  <button 
                    onClick={() => { setIsCartOpen(false); setCurrentPage('shop'); }}
                    className="mt-4 btn-primary text-sm"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="glass-card p-4 flex gap-4">
                        <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-lg" loading="lazy" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <p className="text-orange-400 font-bold">{item.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 glass rounded hover:bg-white/20"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 glass rounded hover:bg-white/20"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto p-1 text-red-400 hover:bg-red-400/20 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-gradient">${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <button 
                      onClick={checkout}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
                    >
                      <Phone className="w-5 h-5" />
                      Checkout via WhatsApp
                    </button>
                    
                    <button 
                      onClick={clearCart}
                      className="w-full glass py-3 text-sm hover:bg-white/10 transition-all"
                    >
                      Clear Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Sidebar */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWishlistOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#1a1a2e] h-full overflow-y-auto shadow-2xl animate-slide-in-right">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1a2e] z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Your Wishlist ({wishlist.length})
              </h2>
              <button onClick={() => setWishlistOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60">Your wishlist is empty</p>
                  <button 
                    onClick={() => { setWishlistOpen(false); setCurrentPage('shop'); }}
                    className="mt-4 btn-primary text-sm"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map(item => (
                    <div key={item.id} className="glass-card p-4 flex gap-4">
                      <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-lg" loading="lazy" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-orange-400 font-bold">{item.price}</p>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => { addToCart(item); setWishlistOpen(false); setIsCartOpen(true); }}
                            className="flex-1 btn-primary text-xs py-2"
                          >
                            Add to Cart
                          </button>
                          <button 
                            onClick={() => toggleWishlist(item)}
                            className="p-2 text-red-400 hover:bg-red-400/20 rounded transition-all"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
            <button onClick={() => { setCurrentPage('home'); scrollToSection('#home'); }} className="text-2xl font-medium py-3 px-8 glass rounded-full hover:bg-white/10 transition-all">Home</button>
            <button onClick={() => { setCurrentPage('home'); setTimeout(() => scrollToSection('#about'), 100); }} className="text-2xl font-medium py-3 px-8 glass rounded-full hover:bg-white/10 transition-all">Our Story</button>
            <button onClick={() => { setCurrentPage('shop'); setMobileMenuOpen(false); }} className="text-2xl font-medium py-3 px-8 glass rounded-full hover:bg-white/10 transition-all">Shop</button>
            <button onClick={() => { setCurrentPage('home'); setTimeout(() => scrollToSection('#process'), 100); }} className="text-2xl font-medium py-3 px-8 glass rounded-full hover:bg-white/10 transition-all">Process</button>
            <button onClick={() => { setCurrentPage('home'); setTimeout(() => scrollToSection('#contact'), 100); }} className="text-2xl font-medium py-3 px-8 glass rounded-full hover:bg-white/10 transition-all">Contact</button>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setWishlistOpen(true); setMobileMenuOpen(false); }} className="glass px-5 py-3 rounded-full flex items-center gap-2 hover:bg-white/10 transition-all">
                <Heart className="w-5 h-5" /> <span className="text-sm">Wishlist ({wishlist.length})</span>
              </button>
              <button onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }} className="glass px-5 py-3 rounded-full flex items-center gap-2 hover:bg-white/10 transition-all">
                <ShoppingCart className="w-5 h-5" /> <span className="text-sm">Cart ({cartCount})</span>
              </button>
            </div>
          </div>
          <button className="absolute top-6 right-6 glass p-3 rounded-full hover:bg-white/20 transition-all" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative z-10 min-h-screen flex items-center px-6 lg:px-12 pt-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 hero-content">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold text-white">Premium Miraa Infused with Fruits</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-8xl font-bold leading-tight font-display drop-shadow-2xl" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              Energy Meets <br />
              <span className="text-gradient">Tropical Flavor</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white font-medium max-w-xl leading-relaxed" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>
              Authentic Kenyan miraa (khat) infused with delicious fruit flavors. Natural energy that tastes amazing — no bitter aftertaste, just pure refreshment.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollToSection('#products')} className="btn-primary pulse-glow">Explore Flavors</button>
              <button onClick={() => scrollToSection('#about')} className="glass px-8 py-4 rounded-full font-medium text-white/90 hover:bg-white/10 transition-all flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Our Story
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4">
              <div className="text-center sm:text-left">
                <p className="text-3xl sm:text-4xl font-bold text-gradient drop-shadow-lg">50K+</p>
                <p className="text-sm sm:text-base font-semibold text-white drop-shadow-md">Energized Daily</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/40"></div>
              <div className="text-center sm:text-left">
                <p className="text-3xl sm:text-4xl font-bold text-gradient drop-shadow-lg">8+</p>
                <p className="text-sm sm:text-base font-semibold text-white drop-shadow-md">Fruit Infusions</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/40"></div>
              <div className="text-center sm:text-left">
                <p className="text-3xl sm:text-4xl font-bold text-gradient drop-shadow-lg">100%</p>
                <p className="text-sm sm:text-base font-semibold text-white drop-shadow-md">Authentic Miraa</p>
              </div>
            </div>
          </div>
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 glass-card rounded-full scale-75 opacity-50"></div>
            <div className="absolute inset-0 glass-card rounded-full scale-90 opacity-30"></div>
            <img src="images/landing2.png" alt="Jaba Boost Premium Miraa Juice" className="relative z-10 w-full max-w-lg floating drop-shadow-2xl" loading="lazy" />
            <div className="absolute top-10 right-10 glass px-4 py-2 rounded-xl floating" style={{ animationDelay: '1s' }}>
              <Leaf className="w-5 h-5 text-green-400" />
            </div>
            <div className="absolute bottom-20 left-10 glass px-4 py-2 rounded-xl floating" style={{ animationDelay: '2s' }}>
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div className="absolute top-1/2 -right-4 glass px-4 py-2 rounded-xl floating" style={{ animationDelay: '3s' }}>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator">
          <ChevronDown className="w-6 h-6 text-white/50" />
        </div>
      </section>

      {/* About Section */}
      {/* Miraa Benefits Section */}
      <section id="benefits" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-orange-400 tracking-wider uppercase">Why Miraa</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6 font-display">Benefits of <span className="text-gradient">Miraa Juice</span></h2>
            <p className="text-white/60 max-w-2xl mx-auto">Traditional Kenyan miraa (khat) has been used for centuries. Now infused with fruits for a delicious energy boost.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Natural Energy</h3>
              <p className="text-white/60 text-sm">Contains natural alkaloids that provide sustained energy without the crash of caffeine.</p>
            </div>
            <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Mental Clarity</h3>
              <p className="text-white/60 text-sm">Traditionally used to enhance focus, concentration, and mental alertness.</p>
            </div>
            <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Fruit Infused</h3>
              <p className="text-white/60 text-sm">Natural fruit flavors neutralize miraa's bitterness while adding vitamins and antioxidants.</p>
            </div>
            <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">100% Natural</h3>
              <p className="text-white/60 text-sm">No artificial additives or preservatives. Just pure miraa and fresh fruit extracts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-orange-400 tracking-wider uppercase">Our Heritage</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6 font-display">The Art of <span className="text-gradient">Miraa Infusion</span></h2>
            <p className="text-white/60 max-w-2xl mx-auto">We've revolutionized traditional miraa by infusing it with delicious fruit flavors, creating an energy drink that's both effective and enjoyable.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 group hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Meru Highlands</h3>
              <p className="text-white/60 text-sm leading-relaxed">Our miraa is sourced directly from the renowned Meru region, where the best Kenyan miraa has been cultivated for generations.</p>
            </div>
            <div className="glass-card p-8 group hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fruit Fusion</h3>
              <p className="text-white/60 text-sm leading-relaxed">Each blend combines premium miraa with carefully selected fruits to neutralize bitterness while enhancing the natural energy boost.</p>
            </div>
            <div className="glass-card p-8 group hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Traditional Craft</h3>
              <p className="text-white/60 text-sm leading-relaxed">We respect centuries-old miraa traditions while innovating with modern extraction techniques for the perfect balance.</p>
            </div>
          </div>
          <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-3xl blur-xl"></div>
              <img src="images/poster.png" alt="Miraa and Fresh Fruits Fusion" className="relative rounded-3xl shadow-2xl" loading="lazy" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold font-display">Redefining <span className="text-gradient">Energy Drinks</span></h3>
              <p className="text-white/70 leading-relaxed">
                Jaba Boost was born from a simple idea: make miraa taste amazing. For centuries, miraa (also known as khat) has been chewed for its natural energizing properties, but its bitter taste was a barrier for many.
              </p>
              <p className="text-white/70 leading-relaxed">
                We spent years perfecting the art of miraa extraction and fruit infusion. The result? A smooth, delicious energy drink that delivers all the benefits of traditional miraa without the harsh bitterness. Now everyone can experience the natural energy that Kenyans have enjoyed for generations.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="glass p-4 rounded-xl">
                  <p className="text-2xl font-bold text-gradient">50+</p>
                  <p className="text-sm text-white/60">Miraa Varieties Tested</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-2xl font-bold text-gradient">100%</p>
                  <p className="text-sm text-white/60">Customer Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Home Page */}
      {currentPage === 'home' && (
      <section id="products" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-orange-400 tracking-wider uppercase">Our Collection</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6 font-display">Miraa Meets <span className="text-gradient">Fruit Fusion</span></h2>
            <p className="text-white/60 max-w-2xl mx-auto">Premium Meru miraa infused with delicious tropical fruits. Natural energy that tastes amazing - no bitterness, just refreshment.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Products - First 5 */}
            {products.slice(0, 5).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
              />
            ))}
            
            {/* Subscribe & Save Card */}
            <SubscribeCard onClick={() => alert('Subscription feature coming soon!')} />
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => setCurrentPage('shop')}
              className="btn-primary pulse-glow inline-flex items-center gap-2"
            >
              View All Products
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Full Shop Page - Modal Overlay */}
      {currentPage === 'shop' && (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0a] overflow-y-auto animate-slide-in-right">
          {/* Shop Header - Fixed */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 px-6 lg:px-12 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-all glass px-4 py-2 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back to Home</span>
                </button>
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold font-display">Jaba Boost <span className="text-gradient">Shop</span></h1>
                </div>
              </div>
              
              {/* Search & Filter Bar */}
              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 glass rounded-full w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white placeholder:text-white/40 text-sm"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 glass rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white bg-transparent cursor-pointer text-sm"
                >
                  <option value="featured" className="bg-[#1a1a2e]">Sort: Featured</option>
                  <option value="price-low" className="bg-[#1a1a2e]">Price: Low to High</option>
                  <option value="price-high" className="bg-[#1a1a2e]">Price: High to Low</option>
                  <option value="rating" className="bg-[#1a1a2e]">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shop Content */}
          <div className="px-6 lg:px-12 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Mobile Search */}
              <div className="sm:hidden mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search juices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 glass rounded-full w-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm ${filterCategory === cat.id ? 'bg-orange-500 text-white shadow-lg' : 'glass hover:bg-white/20'}`}
                  >
                    <cat.icon className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <p className="text-white/60 mb-6">{filteredProducts.length} products available</p>

              {/* Products Grid - 3 columns like original */}
              {filteredProducts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isInWishlist={isInWishlist(product.id)}
                    />
                  ))}
                  {/* Subscribe & Save Card at the end */}
                  <SubscribeCard onClick={() => alert('Subscription feature coming soon!')} />
                </div>
              ) : (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-white/60">Try adjusting your search or filter</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}
                    className="mt-4 btn-primary text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp CTA Section */}
      <section className="relative z-10 py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 lg:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Phone className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-display">Order Directly on <span className="text-green-400">WhatsApp</span></h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
              Skip the forms! Chat with us directly on WhatsApp for instant orders, quick responses, and personalized service.
            </p>
            <a 
              href="https://wa.me/25421648001?text=Hello%20Story%20Za%20Jaba!%20I'm%20interested%20in%20ordering%20your%20natural%20juices." 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-green-500/30"
            >
              <Phone className="w-6 h-6" />
              Chat Now: +254 216 480 01
            </a>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-orange-400 tracking-wider uppercase">How We Do It</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6 font-display">From Farm to <span className="text-gradient">Bottle</span></h2>
            <p className="text-white/60 max-w-2xl mx-auto">Our meticulous process ensures every bottle captures the peak freshness and nutrition of Kenyan fruits.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative process-step">
              <div className="glass-card p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <Apple className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Select</h3>
                <p className="text-white/60 text-sm">Hand-picked fruits at peak ripeness from certified Kenyan farms.</p>
              </div>
            </div>
            <div className="relative process-step">
              <div className="glass-card p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <Droplets className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Extract</h3>
                <p className="text-white/60 text-sm">Cold-pressed extraction preserves nutrients and natural flavors.</p>
              </div>
            </div>
            <div className="relative process-step">
              <div className="glass-card p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <FlaskConical className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Test</h3>
                <p className="text-white/60 text-sm">Rigorous quality testing for purity, taste, and nutritional value.</p>
              </div>
            </div>
            <div className="relative process-step">
              <div className="glass-card p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-4 relative">
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <Package className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Deliver</h3>
                <p className="text-white/60 text-sm">Flash-pasteurized and bottled to lock in freshness for delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-orange-400 tracking-wider uppercase">Testimonials</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 mb-6 font-display">Loved by <span className="text-gradient">Thousands</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-8 testimonial-card">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-white/60">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-display">Ready to Taste <span className="text-gradient">Africa?</span></h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">Join thousands of juice lovers who have discovered the authentic taste of Kenya. Order now and experience the difference.</p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
                <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-orange-400 transition-colors" />
                <button type="submit" className="btn-primary whitespace-nowrap">Subscribe</button>
              </form>
              <div className="flex items-center justify-center gap-6">
                <a href="#" className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 lg:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center">
                <img src="images/logo.png" alt="Jaba Boost" className="h-20 w-20 rounded-full object-cover shadow-xl" />
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                Kenya's first premium miraa-infused fruit juice brand. We combine authentic Meru miraa with 
                delicious tropical fruits for a natural energy boost without the bitter taste. Experience 
                traditional energy in a refreshing new way.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/jaba_boost/" target="_blank" rel="noopener noreferrer" className="p-2 glass rounded-full hover:bg-white/20 transition-all" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com/storyzajaba" target="_blank" rel="noopener noreferrer" className="p-2 glass rounded-full hover:bg-white/20 transition-all" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/storyzajaba" target="_blank" rel="noopener noreferrer" className="p-2 glass rounded-full hover:bg-white/20 transition-all" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://wa.me/25421648001" target="_blank" rel="noopener noreferrer" className="p-2 glass rounded-full hover:bg-green-500/20 hover:text-green-400 transition-all" aria-label="WhatsApp">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-400">Our Juices</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><button onClick={() => setCurrentPage('shop')} className="hover:text-white transition-colors text-left">Tropical Mango Juice</button></li>
                <li><button onClick={() => setCurrentPage('shop')} className="hover:text-white transition-colors text-left">Passion Fruit Juice</button></li>
                <li><button onClick={() => setCurrentPage('shop')} className="hover:text-white transition-colors text-left">Citrus Orange Juice</button></li>
                <li><button onClick={() => setCurrentPage('shop')} className="hover:text-white transition-colors text-left">Berry Fusion Juice</button></li>
                <li><button onClick={() => setCurrentPage('shop')} className="hover:text-white transition-colors text-left">Pineapple Gold Juice</button></li>
                <li><button onClick={() => setCurrentPage('shop')} className="hover:text-white transition-colors text-left">View All Products →</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-400">Contact Us</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <a href="tel:+25421648001" className="hover:text-white transition-colors">+254 216 480 01</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>Nairobi, Kenya</span>
                </li>
                <li className="flex items-start gap-2">
                  <Send className="w-4 h-4 text-orange-400 mt-0.5" />
                  <span>Order via WhatsApp for fastest delivery</span>
                </li>
              </ul>
              <a 
                href="https://wa.me/25421648001?text=Hello%20Story%20Za%20Jaba!%20I'm%20interested%20in%20your%20natural%20juices." 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                <Phone className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              2026 Jaba Boost. All rights reserved. | Miraa Infused Energy | Kenya's Original
            </p>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <button onClick={() => setCurrentPage('shop')} className="hover:text-white transition-colors">Shop</button>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wrap App with Providers
function AppWithProviders() {
  return (
    <CartProvider>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </CartProvider>
  );
}

export default AppWithProviders;
