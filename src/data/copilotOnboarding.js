export const PLATFORMS = [
  {
    id: 'windows',
    label: 'Windows',
  },
  {
    id: 'macos',
    label: 'macOS',
  },
];

export const STORAGE_VERSION = 2;
export const STORAGE_KEY = 'copilot-onboarding-progress';

export const STEPS = [
  {
    id: 'readiness',
    eyebrow: 'Step 1',
    title: 'Check your readiness',
    description:
      'Confirm your account, access, and local tools before installing anything.',
    common: {
      requirements: [
        'A GitHub.com account that you can sign in to in a browser.',
        'Access to GitHub Copilot through an individual plan or an organization that has assigned you a seat.',
        'Git installed for the GitHub Copilot app to work with repositories.',
        'Permission to install applications and command-line tools on this computer.',
        'A working internet connection to GitHub.com and GitHub services.',
      ],
      actions: [
        {
          kind: 'link',
          label: 'Review GitHub Copilot access',
          href: 'https://docs.github.com/en/copilot/get-started/plans',
          primary: true,
        },
        {
          kind: 'link',
          label: 'Create a GitHub account',
          href: 'https://github.com/signup',
          note: 'Skip this if you already have a GitHub.com account.',
        },
        {
          kind: 'link',
          label: 'Install Git',
          href: 'https://github.com/git-guides/install-git',
          note: 'Skip this if `git --version` already succeeds.',
        },
      ],
      instructions: [
        'Sign in to GitHub.com and confirm that you can access your account.',
        'If your organization manages Copilot, confirm that it has assigned access to your account before continuing.',
      ],
      verification: {
        instruction:
          'You can sign in to GitHub.com, your Copilot access is active, and you can install software on this computer.',
        expected: 'All readiness checks are confirmed.',
      },
    },
    windows: {
      requirements: [
        'Windows with PowerShell 6 or later for Copilot CLI.',
        'WinGet for the recommended command-line installs.',
      ],
      actions: [
        {
          kind: 'link',
          label: 'Review WinGet installation',
          href: 'https://learn.microsoft.com/windows/package-manager/winget/',
        },
      ],
      instructions: [
        'Open Windows Terminal and run commands in PowerShell or Command Prompt.',
      ],
    },
    macos: {
      requirements: [
        'A supported macOS release with Terminal available.',
        'Homebrew for the recommended installs.',
      ],
      actions: [
        {
          kind: 'link',
          label: 'Install Homebrew',
          href: 'https://brew.sh/',
        },
      ],
      instructions: ['Open Terminal before continuing.'],
    },
    managedNote:
      'An organization can control Copilot seat assignment, feature availability, policies, and software installation. Contact your administrator if access or installation is blocked.',
    troubleshooting: [
      'If Copilot is unavailable on GitHub.com, confirm that you are signed in to the account that received access.',
      'If this is a managed device, ask your administrator which installation methods are allowed.',
    ],
  },
  {
    id: 'github-cli-install',
    platformActionsFirst: true,
    eyebrow: 'Step 2',
    title: 'Install GitHub CLI',
    description:
      'Install the official GitHub command-line client, then confirm that your terminal can find it.',
    common: {
      actions: [
        {
          kind: 'link',
          label: 'GitHub CLI installation documentation',
          href: 'https://github.com/cli/cli#installation',
        },
      ],
      verification: {
        command: 'gh --version',
        instruction: 'Run the command in a new terminal session.',
        expected: 'The command prints the installed GitHub CLI version.',
      },
    },
    windows: {
      actions: [
        {
          kind: 'command',
          label: 'Install with WinGet',
          value: 'winget install --id GitHub.cli --source winget',
          primary: true,
        },
        {
          kind: 'link',
          label: 'Download the latest GitHub CLI release',
          href: 'https://github.com/cli/cli/releases/latest',
          note: 'Use the official release only if WinGet is unavailable.',
        },
      ],
      instructions: [
        'Run the WinGet command in Windows Terminal.',
        'Close every open Terminal window after installation, then open a new one so the updated PATH is available.',
      ],
    },
    macos: {
      actions: [
        {
          kind: 'command',
          label: 'Install with Homebrew',
          value: 'brew install gh',
          primary: true,
        },
        {
          kind: 'link',
          label: 'Download the latest GitHub CLI release',
          href: 'https://github.com/cli/cli/releases/latest',
          note: 'Use the official release if Homebrew is unavailable.',
        },
      ],
      instructions: ['Run the Homebrew command in Terminal.'],
    },
    managedNote:
      'Managed devices may require an approved software catalog or administrator installation.',
    troubleshooting: [
      'If `gh` is not found, open a new terminal and run the verification again.',
      'If a package manager is blocked, use only an installation method approved by your organization.',
    ],
  },
  {
    id: 'github-cli-auth',
    eyebrow: 'Step 3',
    title: 'Authenticate and configure GitHub CLI',
    description:
      'Connect GitHub CLI to GitHub.com and choose how it should work with Git on this computer.',
    common: {
      requirements: [
        'GitHub CLI is installed and `gh --version` succeeds.',
        'You can complete authentication in a browser.',
      ],
      actions: [
        {
          kind: 'command',
          label: 'Start GitHub CLI sign-in',
          value: 'gh auth login',
          primary: true,
        },
        {
          kind: 'link',
          label: 'GitHub CLI authentication reference',
          href: 'https://cli.github.com/manual/gh_auth_login',
        },
      ],
      instructions: [
        'Select GitHub.com when prompted.',
        'Choose HTTPS or SSH for Git operations based on your existing setup or organization guidance.',
        'Follow the browser authentication flow and return to the terminal when it completes.',
      ],
      verification: {
        command: 'gh auth status',
        instruction: 'Check the active account and authentication state.',
        expected: 'GitHub CLI reports that you are logged in to GitHub.com.',
      },
    },
    managedNote:
      'Your organization may require SAML single sign-on, an approved Git protocol, or additional authorization before repositories are accessible.',
    troubleshooting: [
      'If the browser does not open, copy the one-time code and URL shown by GitHub CLI into your browser.',
      'If the wrong account is active, use `gh auth logout` and then run `gh auth login` again.',
      'If organization resources remain unavailable, complete any required single sign-on authorization or contact your administrator.',
    ],
  },
  {
    id: 'copilot-cli',
    platformActionsFirst: true,
    eyebrow: 'Step 4',
    title: 'Install and authenticate Copilot CLI',
    description:
      'Install Copilot CLI with the recommended method for your platform, sign in, and verify the active user.',
    common: {
      requirements: [
        'Active GitHub Copilot access for the GitHub.com account you intend to use.',
        'GitHub CLI authentication is recommended so Copilot CLI can use it as an authentication fallback.',
        'Node.js 22 or later is required only when using the npm alternative.',
      ],
      actions: [
        {
          kind: 'command',
          label: 'Sign in directly from Copilot CLI',
          value: 'copilot login',
          note: 'Use this if Copilot CLI cannot use your GitHub CLI authentication.',
        },
        {
          kind: 'link',
          label: 'Copilot CLI documentation',
          href: 'https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli',
        },
      ],
      instructions: [
        'Install Copilot CLI using one method for your operating system.',
        'Run `copilot` to start the interactive session.',
        'If you are not authenticated through GitHub CLI, exit and run `copilot login`, then complete the browser flow.',
        'In Copilot CLI, enter `/user` to confirm the active GitHub account.',
      ],
      verification: {
        command: 'copilot --version',
        instruction:
          'Confirm the command prints a version, then start `copilot` and enter `/user`.',
        expected:
          'Copilot CLI starts successfully and `/user` shows the intended GitHub.com account.',
      },
    },
    windows: {
      actions: [
        {
          kind: 'link',
          label: 'Install Copilot CLI from Microsoft Store',
          href: 'https://apps.microsoft.com/detail/xpdc8mmrvcf73p',
          primary: true,
        },
        {
          kind: 'command',
          label: 'Install Copilot CLI with WinGet',
          value: 'winget install GitHub.Copilot',
        },
        {
          kind: 'command',
          label: 'Install Copilot CLI with npm',
          value: 'npm install -g @github/copilot',
          note: 'Requires Node.js 22 or later.',
        },
        {
          kind: 'link',
          label: 'Download the latest Copilot CLI release',
          href: 'https://github.com/github/copilot-cli/releases/latest',
        },
      ],
      instructions: [
        'Use the Microsoft Store as the primary installation method, or choose one official alternative.',
        'After installation, close all Terminal windows and open a new one before verifying.',
      ],
    },
    macos: {
      actions: [
        {
          kind: 'command',
          label: 'Install Copilot CLI with Homebrew',
          value: 'brew install --cask copilot-cli',
          primary: true,
        },
        {
          kind: 'command',
          label: 'Install with the official script',
          value: 'curl -fsSL https://gh.io/copilot-install | bash',
        },
        {
          kind: 'command',
          label: 'Install Copilot CLI with npm',
          value: 'npm install -g @github/copilot',
          note: 'Requires Node.js 22 or later.',
        },
        {
          kind: 'link',
          label: 'Download the latest Copilot CLI release',
          href: 'https://github.com/github/copilot-cli/releases/latest',
        },
      ],
      instructions: [
        'Use Homebrew as the primary installation method, or choose one official alternative.',
      ],
    },
    managedNote:
      'Copilot CLI availability and behavior can be limited by organization policy. Authentication does not override a missing seat or a disabled feature.',
    troubleshooting: [
      'If `copilot` is not found, open a new terminal and verify the installation again.',
      'If npm reports an engine error, install Node.js 22 or later or use the primary platform installer.',
      'If sign-in succeeds but Copilot remains unavailable, verify your seat and organization policy with an administrator.',
    ],
  },
  {
    id: 'copilot-app',
    platformActionsFirst: true,
    eyebrow: 'Step 5',
    title: 'Install and sign in to the GitHub Copilot app',
    description:
      'Install the desktop app from an official source and connect it to the same GitHub.com account.',
    common: {
      requirements: [
        'Active GitHub Copilot access.',
        'A browser session that can authenticate to GitHub.com.',
      ],
      actions: [
        {
          kind: 'link',
          label: 'GitHub Copilot app setup documentation',
          href: 'https://docs.github.com/en/copilot/how-tos/github-copilot-app/getting-started',
        },
      ],
      instructions: [
        'Install and open the GitHub Copilot app.',
        'Choose the option to sign in with GitHub.',
        'Complete the GitHub.com authorization flow in your browser.',
        'Return to the app and confirm that it shows your signed-in account.',
      ],
      verification: {
        instruction:
          'Open the app and confirm that it is signed in with the intended GitHub.com account.',
        expected: 'The app is ready and no sign-in prompt remains.',
      },
    },
    windows: {
      actions: [
        {
          kind: 'link',
          label: 'Install the GitHub Copilot app from Microsoft Store',
          href: 'https://apps.microsoft.com/detail/xpdck2l0r6v76j',
          primary: true,
        },
        {
          kind: 'link',
          label: 'Use the official GitHub download',
          href: 'https://github.com/features/ai/github-app',
        },
      ],
    },
    macos: {
      actions: [
        {
          kind: 'link',
          label: 'Download the GitHub Copilot app for macOS',
          href: 'https://github.com/features/ai/github-app',
          primary: true,
        },
      ],
    },
    managedNote:
      'Your organization may block the app, require a managed installer, or restrict features after sign-in.',
    troubleshooting: [
      'If the browser authorizes a different account, sign out in the app and repeat the flow with the intended GitHub.com account.',
      'If the app is blocked by device policy, use your organization software portal or contact your administrator.',
      'If the app reports no Copilot access, confirm seat assignment and organization policy on GitHub.com.',
    ],
  },
  {
    id: 'completion',
    eyebrow: 'Step 6',
    title: 'Finish your setup',
    description:
      'Review each verification and keep the official references nearby for your next session.',
    common: {
      requirements: [
        '`gh auth status` confirms the intended GitHub.com account.',
        '`copilot --version` succeeds and `/user` confirms the intended account.',
        'The GitHub Copilot app opens without a sign-in prompt.',
      ],
      actions: [
        {
          kind: 'link',
          label: 'Start Copilot CLI: Zero to Hero',
          href: '/labs/copilot-cli-zero-to-hero',
          primary: true,
        },
        {
          kind: 'link',
          label: 'Start GitHub Copilot App: Zero to Hero',
          href: '/labs/copilot-app-zero-to-hero',
        },
        {
          kind: 'link',
          label: 'Browse all hands-on labs',
          href: '/labs',
        },
        {
          kind: 'link',
          label: 'Explore GitHub CLI',
          href: 'https://cli.github.com/manual/',
        },
        {
          kind: 'link',
          label: 'Explore Copilot CLI',
          href: 'https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli',
        },
        {
          kind: 'link',
          label: 'Explore the GitHub Copilot app',
          href: 'https://docs.github.com/en/copilot/how-tos/github-copilot-app/getting-started',
        },
      ],
      instructions: [
        'Re-run any incomplete verification before marking setup complete.',
        'Keep your selected platform accurate if you revisit this guide on another computer.',
        'You can reset this browser-only progress without affecting GitHub, GitHub CLI, Copilot CLI, or the app.',
      ],
      verification: {
        instruction:
          'Confirm that every earlier step is complete and each tool uses the intended GitHub.com account.',
        expected: 'GitHub CLI, Copilot CLI, and the GitHub Copilot app are ready to use.',
      },
    },
    managedNote:
      'A completed guide confirms local setup only. Organization policy can still change which Copilot features are available.',
    troubleshooting: [
      'Return to the first incomplete step and repeat its verification.',
      'Use the linked official documentation for current product guidance.',
      'Contact your organization administrator for seat, policy, single sign-on, or managed-device issues.',
    ],
  },
];
