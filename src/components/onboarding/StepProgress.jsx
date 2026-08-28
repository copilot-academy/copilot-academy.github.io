import React from 'react';

export default function StepProgress({steps, completedStepIds}) {
  const completed = new Set(completedStepIds);
  const currentStepId = steps.find(({id}) => !completed.has(id))?.id;

  return (
    <nav className="onboarding-step-progress" aria-label="Onboarding progress">
      <ol className="onboarding-step-progress__list">
        {steps.map((step, index) => (
          <li
            className="onboarding-step-progress__item"
            key={step.id}
            data-complete={completed.has(step.id) ? 'true' : 'false'}>
            <a
              className="onboarding-step-progress__link"
              href={`#onboarding-step-${step.id}`}
              aria-current={currentStepId === step.id ? 'step' : undefined}>
              <span className="onboarding-step-progress__number">
                {index + 1}
              </span>
              <span>{step.title}</span>
              <span className="onboarding-step-progress__status">
                {completed.has(step.id) ? 'Complete' : 'Not complete'}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
