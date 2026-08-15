import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Two limiting algorithms",
    body:
      "Token bucket for bursty traffic, sliding window for strict per-window caps. Pick whichever fits a given endpoint, per rule.",
  },
  {
    title: "Per-key rules",
    body:
      "Attach limits to a specific endpoint + method for each API key — one key can have different limits on different routes.",
  },
  {
    title: "One check endpoint",
    body:
      "A single public /api/v1/check call tells you allowed, remaining, and reset — call it from any backend before you serve a request.",
  },
  {
    title: "Live dashboard",
    body:
      "Total, allowed, and blocked requests, hourly traffic, top endpoints, and the keys getting throttled the most — all in one view.",
  },
  {
    title: "Key lifecycle built in",
    body:
      "Create, rename, revoke, or delete keys anytime. Revoked keys are rejected immediately, no redeploy needed.",
  },
  {
    title: "A test console",
    body:
      "Fire requests at your own rules right from the dashboard and watch them get allowed or blocked in real time.",
  },
];

const steps = [
  {
    label: "1. Create an API key",
    body:
      "Sign up, then head to API Keys and create one. The raw key is shown right away.",
    code: `# The key travels in the x-api-key header on every request

curl -X POST http://localhost:4000/api-key/register \\
-H "Authorization: Bearer YOUR_JWT" \\
-H "Content-Type: application/json" \\
-d '{"name":"Production backend"}'`,
  },
  {
    label: "2. Add a rate limit rule",
    body:
      "Rules are scoped to a key + endpoint + method. Choose token-bucket or sliding-window.",
    code: `curl -X POST http://localhost:4000/rule \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "endpoint": "/orders",
  "method": "POST",
  "algorithm": "slidingWindow",
  "limit": 100,
  "window": 60
}'`,
  },
  {
    label: "3. Check the limit before serving requests",
    body:
      "Call RateGate before your protected endpoint. It returns allowed, remaining, and reset.",
    code: `// Example middleware

app.use(async (req, res, next) => {
  const response = await fetch(
    \`\${RATEGATE_URL}/api/v1/check\`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.RATEGATE_API_KEY
      },
      body: JSON.stringify({
        resource: req.path,
        method: req.method,
        clientId: req.ip
      })
    }
  );

  const data = await response.json();

  if (!data.allowed) {
    return res.status(429).json({
      message: "Too many requests"
    });
  }

  next();
});`,
  },
  {
    label: "4. Watch it in the dashboard",
    body:
      "Every check call updates stats in real time — requests, blocks, traffic, and throttled keys.",
    code: null,
  },
];

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-toolbar">
        <span>snippet</span>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={copy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function useRevealOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Step({ step, index }) {
  const [ref, visible] = useRevealOnScroll();

  return (
    <div
      ref={ref}
      className={`landing-step ${visible ? "is-visible" : ""}`}
      style={{
        transitionDelay: `${index * 60}ms`,
      }}
    >
      <div className="landing-step-label">
        {step.label}
      </div>

      <p className="landing-step-body">
        {step.body}
      </p>

      {step.code && <CodeBlock code={step.code} />}
    </div>
  );
}

export default function Home() {
  return (
    <div className="landing">

      <header className="landing-nav">

        <div className="sidebar-brand">
          <div
            className="sidebar-brand-mark"
            style={{ color: "#fff" }}
          >
            RG
          </div>

          <span className="landing-brand-name">
            RateGate
          </span>
        </div>


        <div className="landing-nav-actions">

          <Link
            to="/login"
            className="btn btn-secondary btn-sm"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="btn btn-primary btn-sm"
          >
            Sign up
          </Link>

        </div>

      </header>


      <section className="landing-hero">

        <span className="badge badge-neutral">
          Rate limiting as a service
        </span>

        <h1>
          Stop worrying about who's hammering your API.
        </h1>

        <p>
          RateGate sits in front of your endpoints with a single
          check call. Token bucket or sliding window, per key and
          per route, with a live dashboard.
        </p>


        <div className="landing-hero-actions">

          <Link
            to="/signup"
            className="btn btn-primary"
          >
            Get started free
          </Link>


          <a
            href="#how-it-works"
            className="btn btn-secondary"
          >
            See how it works
          </a>

        </div>

      </section>


      <section className="landing-features">

        <div className="landing-section-heading">
          <h2>
            What you get
          </h2>

          <p>
            Everything you need to protect an API without building it yourself.
          </p>
        </div>


        <div className="landing-feature-grid">

          {features.map((feature) => (
            <div
              className="card card-pad landing-feature-card"
              key={feature.title}
            >
              <h3>
                {feature.title}
              </h3>

              <p>
                {feature.body}
              </p>
            </div>
          ))}

        </div>

      </section>


      <section
        id="how-it-works"
        className="landing-how"
      >

        <div className="landing-section-heading">

          <h2>
            How to wire it into your project
          </h2>

          <p>
            Four steps, start to finish.
          </p>

        </div>


        <div className="landing-steps">

          {steps.map((step, index) => (
            <Step
              step={step}
              index={index}
              key={step.label}
            />
          ))}

        </div>

      </section>


      <section className="landing-cta">

        <h2>
          Ready to protect your API?
        </h2>

        <p>
          Create an account, generate a key, and you're rate limited in minutes.
        </p>


        <Link
          to="/signup"
          className="btn btn-primary"
        >
          Create your account
        </Link>

      </section>


      <footer className="landing-footer">

        <span>
          RateGate
        </span>

        <Link to="/login">
          Log in
        </Link>

      </footer>

    </div>
  );
}