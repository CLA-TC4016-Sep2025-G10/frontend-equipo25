import React from 'react';
import { Link } from 'react-router-dom';

const PricingCard = ({ tier, price, features }) => (
  <div className="pricing-card">
    <h3>{tier}</h3>
    <p className="price">{price}</p>
    <ul>
      {features.map((f, i) => <li key={i}>{f}</li>)}
    </ul>
    <Link to="/register" className="cta-button">Get started</Link>
  </div>
);

const LandingPage = () => {
  return (
    <div className="landing-root">
      <section className="hero">
        <div className="hero-inner">
          <h1>SecureRAG — Retrieval-Augmented Generation for private knowledge</h1>
          <p className="lead">SecureRAG combines secure document ingestion, fast semantic search, and LLM-based answers so your teams can query internal knowledge with confidence.</p>
          <div className="hero-cta">
            <Link className="cta-primary" to="/register">Start free trial</Link>
            <Link className="cta-outline" to="/login">Sign in</Link>
          </div>
        </div>
      </section>

      <section className="description">
        <div className="container">
          <h2>Platform description</h2>
          <p>SecureRAG enables organizations to ingest documents, create privacy-aware vector indexes, and run contextually-grounded queries over their data. We support document upload, access controls, and streaming query responses for interactive workflows.</p>
        </div>
      </section>

      <section className="pricing container">
        <h2>Pricing</h2>
        <div className="pricing-grid">
          <PricingCard tier="Starter" price="$0 / mo" features={["Up to 5 users","5GB storage","Community support"]} />
          <PricingCard tier="Business" price="$99 / mo" features={["Up to 50 users","100GB storage","Email support","SAML SSO"]} />
          <PricingCard tier="Enterprise" price="Contact us" features={["Unlimited users","Custom SLA","On-prem or VPC","Dedicated support"]} />
        </div>
      </section>

      <section className="industries container">
        <h2>Industries</h2>
        <div className="industry-grid">
          <div className="industry-card">
            <h4>Healthcare</h4>
            <p>Secure medical records search, policy compliance and patient support automation.</p>
          </div>
          <div className="industry-card">
            <h4>Finance</h4>
            <p>Regulatory research, contract retrieval, and internal knowledge discovery for analysts.</p>
          </div>
          <div className="industry-card">
            <h4>Legal</h4>
            <p>Case law lookup, clause extraction, and faster due-diligence using indexed documents.</p>
          </div>
          <div className="industry-card">
            <h4>Manufacturing</h4>
            <p>Operational manuals search, troubleshooting assistants and process documentation access.</p>
          </div>
        </div>
      </section>

      <section className="applications container">
        <h2>Applications in industries</h2>
        <div className="app-grid">
          <article>
            <h4>Clinical assistant (Healthcare)</h4>
            <p>Doctors can query patient records and treatment guidelines, receiving summarized, source-cited answers to speed decision making.</p>
          </article>
          <article>
            <h4>Compliance reviewer (Finance)</h4>
            <p>Automate document review for regulatory changes and quickly locate relevant contract clauses tied to specific rules.</p>
          </article>
          <article>
            <h4>Legal research helper (Legal)</h4>
            <p>Find relevant precedents and extract citations with links back to the original documents for rapid brief drafting.</p>
          </article>
          <article>
            <h4>Field service guide (Manufacturing)</h4>
            <p>Technicians can ask natural language questions and receive step-by-step instructions pulled from manuals and change logs.</p>
          </article>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} SecureRAG — Built for the course</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
