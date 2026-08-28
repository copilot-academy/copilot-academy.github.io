import Layout from '@theme/Layout';
import OnboardingGuide from '../components/onboarding/OnboardingGuide';
import styles from './onboarding.module.css';

const designContract =
  'THESIS: A guided setup journey, not static installation docs. OWN-WORLD: The existing Primer/GitHub palette, sharpened with a focused step rail and terminal surfaces. STORY: Detect or select an OS, complete three products, then verify the setup. FIRST VIEWPORT: A concise introduction with visible platform and progress controls plus the first step. FORM: The whole surface remains inside the established academy world, using a sticky journey rail on desktop and compact progress on mobile.';

export default function OnboardingPage() {
  return (
    <Layout
      title="GitHub Copilot onboarding"
      description="Set up GitHub Copilot across your editor, terminal, and GitHub account."
    >
      <main className={styles.root} data-design-contract={designContract}>
        <OnboardingGuide />
      </main>
    </Layout>
  );
}
