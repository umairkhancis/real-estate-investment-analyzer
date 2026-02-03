import './Hero.css';

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Should You Really Buy That Property?</h1>
        <p className="subtitle">Most investors rely on gut feeling or developer promises.</p>
        <p className="description">
          What if you could see the true value of your investment before committing hundreds of thousands?
          Let's help you understand what your money will really be worth.
        </p>
        <a href="#calculator" className="cta-button">Show Me How</a>
      </div>
    </section>
  );
}
