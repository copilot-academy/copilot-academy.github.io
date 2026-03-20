import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const workshops = [
  {
    title: 'Copilot Customization',
    description:
      'A comprehensive workshop covering instructions, prompts, agents, skills, orchestration, integrations, and agentic workflows.',
    modules: 8,
    duration: 'Full day',
    level: 'Beginner → Advanced',
    link: '/workshops/copilot-customization',
  },
  {
    title: 'Immersive Experience',
    description:
      'A scenario-based workshop where you tackle real development problems using Planning Mode, Agent Mode, custom agents, security tools, and more.',
    modules: 13,
    duration: 'Full day',
    level: 'Beginner → Advanced',
    link: '/workshops/immersive-experience',
  },
];

const labs = [
  {
    title: 'Build Your First Skill',
    description: 'Create a Hello World agent skill from scratch.',
    duration: '~20 min',
    level: 'Beginner',
    link: '/labs/build-your-first-skill',
  },
  {
    title: 'Create a Custom Agent',
    description: 'Build a custom agent with tools and instructions.',
    duration: '~20 min',
    level: 'Beginner',
    link: '/labs/create-a-custom-agent',
  },
  {
    title: 'Agent with Tools',
    description: 'Build an agent with tool restrictions and MCP integrations.',
    duration: '~30 min',
    level: 'Intermediate',
    link: '/labs/agent-with-tools',
  },
];

function HeroBanner() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero-banner">
      <div className="container">
        <h1 className="hero-banner__title">{siteConfig.title}</h1>
        <p className="hero-banner__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

function WorkshopCard({title, description, modules, duration, level, link}) {
  return (
    <div className="col col--6">
      <Link to={link} className="card-link">
        <div className="card">
          <div className="card__header">
            <div className="card__icon">📘</div>
            <h3>{title}</h3>
          </div>
          <div className="card__body">
            <p>{description}</p>
          </div>
          <div className="card__footer">
            <span className="badge badge--primary">{modules} modules</span>
            <span className="badge badge--secondary">{duration}</span>
            <span className="badge badge--info">{level}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function LabCard({title, description, duration, level, link}) {
  return (
    <div className="col col--4">
      <Link to={link} className="card-link">
        <div className="card card--lab">
          <div className="card__header">
            <div className="card__icon">🧪</div>
            <h3>{title}</h3>
          </div>
          <div className="card__body">
            <p>{description}</p>
          </div>
          <div className="card__footer">
            <span className="badge badge--secondary">{duration}</span>
            <span className="badge badge--info">{level}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <HeroBanner />
      <main className="landing-main">
        <section id="workshops" className="landing-section">
          <div className="container">
            <h2 className="landing-section__title">Workshops</h2>
            <p className="landing-section__subtitle">
              Structured, multi-module learning paths that guide you from fundamentals to advanced topics.
            </p>
            <div className="row">
              {workshops.map((props, idx) => (
                <WorkshopCard key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
        <section id="labs" className="landing-section landing-section--alt">
          <div className="container">
            <h2 className="landing-section__title">Hands-on Labs</h2>
            <p className="landing-section__subtitle">
              Focused, self-contained exercises you can complete in 15–30 minutes.
            </p>
            <div className="row">
              {labs.map((props, idx) => (
                <LabCard key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
