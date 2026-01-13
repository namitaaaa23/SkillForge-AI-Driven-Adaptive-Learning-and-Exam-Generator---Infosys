import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">SkillForge AI</Link>

          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* HERO (Pastel Gradient) */}
      <section className="hero">
        <h1>Transform Education with AI-Powered Learning</h1>
        <p>
          Advanced adaptive learning platform delivering personalized education experiences
          through intelligent content delivery and comprehensive progress tracking.
        </p>

        <div className="login-buttons">
          <Link to="/learner-login" className="btn learner-btn">Learner</Link>
          <Link to="/admin-login" className="btn admin-btn">Admin</Link>
          <Link to="/guardian-login" className="btn guardian-btn">Guardian</Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <h2>Core Platform Capabilities</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Intelligent Content Adaptation</h3>
            <p>Dynamic curriculum adjustment based on individual learning patterns and performance metrics.</p>
          </div>

          <div className="feature-card">
            <h3>Automated Assessment Generation</h3>
            <p>AI-powered evaluation tools with real-time feedback and comprehensive analytics.</p>
          </div>

          <div className="feature-card">
            <h3>Advanced Analytics Dashboard</h3>
            <p>Comprehensive performance insights with predictive learning outcome analysis.</p>
          </div>
        </div>
      </section>

      {/* ABOUT + TESTIMONIALS */}
      <section className="about" id="about">
        <h2>About SkillForge AI</h2>

        <p className="about-text">
          SkillForge AI represents the next generation of educational technology, combining
          machine learning algorithms with pedagogical expertise to deliver scalable,
          personalized learning solutions for educational institutions worldwide.
        </p>

        <h3 className="test-title">Stakeholder Testimonials</h3>

        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"The adaptive learning system significantly improved my academic performance and engagement."</p>
            <span>— Student, Grade 10</span>
          </div>

          <div className="testimonial-card">
            <p>"Comprehensive insights into my child's learning progress enable better educational support."</p>
            <span>— Parent & Guardian</span>
          </div>

          <div className="testimonial-card">
            <p>"Streamlined administration tools have transformed our institutional efficiency and student outcomes."</p>
            <span>— Academic Administrator</span>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <h2>Infosys Springboard</h2>
        <p>Email: Infosys@skillforge.ai</p>
        <p>Phone: +1 1800 55 2424</p>
      </section>
    </>
  );
}
