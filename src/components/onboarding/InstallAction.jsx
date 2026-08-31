import React from 'react';

import CommandCard from './CommandCard';

export default function InstallAction({action}) {
  if (action.kind === 'command') {
    return (
      <CommandCard
        label={action.label}
        command={action.value}
        note={action.note}
        primary={action.primary}
      />
    );
  }

  if (action.kind === 'link') {
    const isExternal = /^https?:\/\//.test(action.href);

    return (
      <div
        className="onboarding-install-action onboarding-install-action--link">
        <a
          className={
            action.primary
              ? 'onboarding-install-action__link onboarding-install-action__link--primary'
              : 'onboarding-install-action__link'
          }
          href={action.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}>
          {action.label}
          {isExternal ? (
            <span className="onboarding-install-action__external">
              {' '}
              (opens in a new tab)
            </span>
          ) : null}
        </a>
        {action.note ? (
          <p className="onboarding-install-action__note">{action.note}</p>
        ) : null}
      </div>
    );
  }

  return null;
}
