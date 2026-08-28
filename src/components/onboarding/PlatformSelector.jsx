import React from 'react';

export default function PlatformSelector({
  platforms,
  selectedPlatform,
  onSelect,
  disabled = false,
}) {
  const platformEntries = Array.isArray(platforms)
    ? platforms.map((platform) => [
        typeof platform === 'string' ? platform : platform.id,
        platform,
      ])
    : Object.entries(platforms);

  return (
    <fieldset className="onboarding-platform-selector" disabled={disabled}>
      <legend className="onboarding-platform-selector__legend">
        Choose your operating system
      </legend>
      <div className="onboarding-platform-selector__options">
        {platformEntries.map(([id, platform]) => (
          <button
            className="onboarding-platform-selector__option"
            type="button"
            key={id}
            aria-pressed={selectedPlatform === id}
            onClick={() => onSelect(id)}>
            {typeof platform === 'string'
              ? platform
              : platform.label || platform.name || id}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
