import Layout from '@theme/Layout';
import OnboardingGuide from '../components/onboarding/OnboardingGuide';
import styles from './onboarding.module.css';

export default function OnboardingPage() {
  return (
    <Layout
      title="GitHub Copilot onboarding"
      description="Set up GitHub Copilot across your editor, terminal, and GitHub account."
    >
      <main className={styles.root}>
        <OnboardingGuide />
      </main>
    </Layout>
  );
}
