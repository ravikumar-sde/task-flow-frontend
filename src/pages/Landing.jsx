import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Users, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import '../styles/Landing.css';

const Landing = () => {
  const features = [
    {
      icon: <Zap size={24} />,
      title: 'Lightning Fast',
      description: 'Built with modern tech stack for blazing fast performance'
    },
    {
      icon: <Users size={24} />,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your team in real-time'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Track Progress',
      description: 'Visualize your workflow and monitor project progress'
    }
  ];

  const benefits = [
    'Organize tasks with boards and lists',
    'Drag & drop interface',
    'Real-time collaboration',
    'Workspace management',
    'Invite team members',
    'Track project progress'
  ];

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-content">
          <div className="nav-logo">
            <Sparkles size={28} className="logo-icon" />
            <span className="logo-text">TaskFlow</span>
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-button">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Modern Task Management</span>
          </div>
          <h1 className="hero-title">
            Organize Your Work,<br />
            <span className="gradient-text">Achieve Your Goals</span>
          </h1>
          <p className="hero-description">
            TaskFlow helps teams move work forward. Collaborate, manage projects,
            and reach new productivity peaks with our intuitive task management platform.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="primary-button">
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="secondary-button">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose TaskFlow?</h2>
          <p className="section-description">
            Everything you need to manage projects and collaborate with your team
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2 className="benefits-title">
              Everything you need to<br />
              stay organized
            </h2>
            <p className="benefits-description">
              TaskFlow provides all the tools you need to manage your projects
              efficiently and collaborate with your team seamlessly.
            </p>
            <ul className="benefits-list">
              {benefits.map((benefit, index) => (
                <li key={index} className="benefit-item">
                  <CheckCircle size={20} className="benefit-icon" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="cta-button">
              Get Started Now
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="benefits-visual">
            <div className="visual-card card-1">
              <div className="card-header">
                <div className="card-dot"></div>
                <div className="card-dot"></div>
                <div className="card-dot"></div>
              </div>
              <div className="card-content">
                <div className="card-line"></div>
                <div className="card-line short"></div>
                <div className="card-line medium"></div>
              </div>
            </div>
            <div className="visual-card card-2">
              <div className="card-header">
                <div className="card-dot"></div>
                <div className="card-dot"></div>
                <div className="card-dot"></div>
              </div>
              <div className="card-content">
                <div className="card-line"></div>
                <div className="card-line medium"></div>
                <div className="card-line short"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2024 TaskFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;

