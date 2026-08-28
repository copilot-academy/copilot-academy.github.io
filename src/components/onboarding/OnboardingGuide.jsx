import React, {useMemo, useState} from 'react';

import {
  PLATFORMS,
  STORAGE_VERSION,
  STORAGE_KEY,
  STEPS,
} from '../../data/copilotOnboarding';
import InstallAction from './InstallAction';
import PlatformSelector from './PlatformSelector';
import StepProgress from './StepProgress';
import useOnboardingProgress from './useOnboardingProgress';

function mergeSections(
  common = {},
  platform = {},
  platformActionsFirst = false,
) {
  return {
    requirements: [
      ...(common.requirements || []),
      ...(platform.requirements || []),
    ],
    actions: platformActionsFirst
      ? [...(platform.actions || []), ...(common.actions || [])]
      : [...(common.actions || []), ...(platform.actions || [])],
    instructions: [
      ...(common.instructions || []),
      ...(platform.instructions || []),
    ],
    verification:
      common.verification || platform.verification
        ? {...(common.verification || {}), ...(platform.verification || {})}
        : null,
  };
}

function RequirementList({requirements}) {
  if (!requirements.length) {
    return null;
  }

  return (
    <section className="onboarding-step__section">
      <h3 className="onboarding-step__section-heading">Before you begin</h3>
      <ul className="onboarding-step__requirements">
        {requirements.map((requirement, index) => (
          <li key={`${index}-${requirement}`}>{requirement}</li>
        ))}
      </ul>
    </section>
  );
}

function InstructionList({instructions}) {
  if (!instructions.length) {
    return null;
  }

  return (
    <section className="onboarding-step__section">
      <h3 className="onboarding-step__section-heading">Instructions</h3>
      <ol className="onboarding-step__instructions">
        {instructions.map((instruction, index) => (
          <li key={`${index}-${instruction}`}>{instruction}</li>
        ))}
      </ol>
    </section>
  );
}

function Verification({verification}) {
  if (!verification) {
    return null;
  }

  return (
    <section className="onboarding-step__section">
      <h3 className="onboarding-step__section-heading">Verify your setup</h3>
      <p>{verification.instruction}</p>
      {verification.command ? (
        <InstallAction
          action={{
            kind: 'command',
            label: 'Verification command',
            value: verification.command,
          }}
        />
      ) : null}
      {verification.expected ? (
        <p className="onboarding-step__expected">
          <strong>Expected result:</strong> {verification.expected}
        </p>
      ) : null}
    </section>
  );
}

export default function OnboardingGuide() {
  const {
    platform,
    setPlatform,
    hydrated,
    completedStepIds,
    completedCount,
    toggleStep,
    reset,
    storageFeedback,
  } = useOnboardingProgress({
    platforms: PLATFORMS,
    steps: STEPS,
    storageKey: STORAGE_KEY,
    storageVersion: STORAGE_VERSION,
  });
  const [confirmingReset, setConfirmingReset] = useState(false);
  const completed = useMemo(
    () => new Set(completedStepIds),
    [completedStepIds],
  );
  const progressValue = STEPS.length
    ? Math.round((completedCount / STEPS.length) * 100)
    : 0;

  function confirmReset() {
    reset();
    setConfirmingReset(false);
  }

  return (
    <div className="onboarding-guide">
      <header className="onboarding-guide__header">
        <h1 className="onboarding-guide__title">Set up GitHub Copilot</h1>
        <p className="onboarding-guide__intro">
          Follow these steps to install, configure, and verify GitHub Copilot.
          Commands are provided for you to run; this guide does not inspect or
          change your computer.
        </p>
      </header>

      <PlatformSelector
        platforms={PLATFORMS}
        selectedPlatform={platform}
        onSelect={setPlatform}
        disabled={!hydrated}
      />
      {!hydrated ? (
        <p className="onboarding-guide__detecting" role="status">
          Detecting your operating system…
        </p>
      ) : null}

      <section
        className="onboarding-guide__progress"
        aria-labelledby="onboarding-progress-heading">
        <h2 id="onboarding-progress-heading">Your progress</h2>
        <p>
          {completedCount} of {STEPS.length} steps complete
        </p>
        <progress
          className="onboarding-guide__progress-bar"
          value={completedCount}
          max={STEPS.length}
          aria-label={`${progressValue}% complete`}>
          {progressValue}%
        </progress>
        <StepProgress
          steps={STEPS}
          completedStepIds={completedStepIds}
        />
      </section>

      {platform ? (
        <ol className="onboarding-guide__steps">
          {STEPS.map((step, index) => {
            const section = mergeSections(
              step.common,
              step[platform],
              step.platformActionsFirst,
            );
            const isComplete = completed.has(step.id);

            return (
              <li
                className={
                  isComplete
                    ? 'onboarding-step onboarding-step--complete'
                    : 'onboarding-step'
                }
                id={`onboarding-step-${step.id}`}
                key={step.id}
                data-complete={isComplete ? 'true' : 'false'}>
                <article aria-labelledby={`onboarding-step-title-${step.id}`}>
                  <p className="onboarding-step__eyebrow">
                    {step.eyebrow || `Step ${index + 1}`}
                  </p>
                  <h2
                    className="onboarding-step__title"
                    id={`onboarding-step-title-${step.id}`}>
                    {step.title}
                  </h2>
                  <p className="onboarding-step__description">
                    {step.description}
                  </p>

                  <RequirementList requirements={section.requirements} />
                  {section.actions.length ? (
                    <section className="onboarding-step__section">
                      <h3 className="onboarding-step__section-heading">
                        Actions
                      </h3>
                      <div className="onboarding-step__actions">
                        {section.actions.map((action, actionIndex) => (
                          <InstallAction
                            action={action}
                            key={`${action.kind}-${action.label}-${actionIndex}`}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}
                  <InstructionList instructions={section.instructions} />
                  <Verification verification={section.verification} />

                  {step.managedNote ? (
                    <aside className="onboarding-step__managed-note">
                      <h3>Managed environments</h3>
                      <p>{step.managedNote}</p>
                    </aside>
                  ) : null}
                  {step.troubleshooting ? (
                    <details className="onboarding-step__troubleshooting">
                      <summary>Troubleshooting</summary>
                      {Array.isArray(step.troubleshooting) ? (
                        <ul>
                          {step.troubleshooting.map((item, itemIndex) => (
                            <li key={`${itemIndex}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{step.troubleshooting}</p>
                      )}
                    </details>
                  ) : null}

                  <button
                    className="onboarding-step__complete"
                    type="button"
                    aria-pressed={isComplete}
                    onClick={() => toggleStep(step.id)}>
                    {isComplete ? 'Mark as not complete' : 'Mark as complete'}
                  </button>
                </article>
              </li>
            );
          })}
        </ol>
      ) : null}

      <section
        className="onboarding-guide__reset"
        aria-labelledby="onboarding-reset-heading">
        <h2 id="onboarding-reset-heading">Reset progress</h2>
        {confirmingReset ? (
          <div className="onboarding-guide__reset-confirmation" role="group">
            <p>Reset all completed steps?</p>
            <button type="button" onClick={confirmReset}>
              Yes, reset progress
            </button>
            <button type="button" onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmingReset(true)}>
            Reset progress
          </button>
        )}
      </section>

      <p className="onboarding-guide__feedback" aria-live="polite">
        {storageFeedback}
      </p>
    </div>
  );
}
