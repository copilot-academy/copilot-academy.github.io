import {useCallback, useEffect, useMemo, useState} from 'react';

function isPlatform(value, platforms) {
  return getPlatformIds(platforms).includes(value);
}

function getPlatformIds(platforms) {
  return Array.isArray(platforms)
    ? platforms
        .map((platform) =>
          typeof platform === 'string' ? platform : platform.id,
        )
        .filter(Boolean)
    : Object.keys(platforms);
}

function detectPlatform(platforms) {
  const platform =
    navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;

  if (/win/i.test(platform) && isPlatform('windows', platforms)) {
    return 'windows';
  }

  return isPlatform('macos', platforms)
    ? 'macos'
    : getPlatformIds(platforms)[0] || null;
}

function validateStoredState(value, platforms, stepIds, storageVersion) {
  const platformIds = getPlatformIds(platforms);

  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    value.version !== storageVersion ||
    !isPlatform(value.platform, platforms) ||
    !value.completedByPlatform ||
    typeof value.completedByPlatform !== 'object' ||
    Array.isArray(value.completedByPlatform)
  ) {
    return null;
  }

  const completedByPlatform = {};
  for (const platformId of platformIds) {
    const completedStepIds = value.completedByPlatform[platformId] || [];
    if (
      !Array.isArray(completedStepIds) ||
      !completedStepIds.every(
        (id) => typeof id === 'string' && stepIds.has(id),
      )
    ) {
      return null;
    }
    completedByPlatform[platformId] = [...new Set(completedStepIds)];
  }

  return {
    platform: value.platform,
    completedByPlatform,
  };
}

export default function useOnboardingProgress({
  platforms,
  steps,
  storageKey,
  storageVersion,
}) {
  const initialPlatform = getPlatformIds(platforms)[0] || null;
  const [platform, setPlatformState] = useState(initialPlatform);
  const [completedByPlatform, setCompletedByPlatform] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [storageFeedback, setStorageFeedback] = useState('');
  const stepIds = useMemo(() => new Set(steps.map(({id}) => id)), [steps]);

  useEffect(() => {
    let nextPlatform = detectPlatform(platforms);
    let nextCompletedByPlatform = {};

    try {
      const storedValue = window.localStorage.getItem(storageKey);
      if (storedValue !== null) {
        const parsedValue = JSON.parse(storedValue);
        const validatedValue = validateStoredState(
          parsedValue,
          platforms,
          stepIds,
          storageVersion,
        );

        if (validatedValue) {
          nextPlatform = validatedValue.platform;
          nextCompletedByPlatform = validatedValue.completedByPlatform;
        } else {
          setStorageFeedback(
            'Saved onboarding progress was incompatible and was not restored.',
          );
        }
      }
    } catch (error) {
      setStorageFeedback(
        `Saved onboarding progress could not be read: ${
          error instanceof Error ? error.message : 'unknown storage error'
        }`,
      );
    }

    setPlatformState(nextPlatform);
    setCompletedByPlatform(nextCompletedByPlatform);
    setHydrated(true);
  }, [platforms, stepIds, storageKey, storageVersion]);

  useEffect(() => {
    if (!hydrated || !platform) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          version: storageVersion,
          platform,
          completedByPlatform,
        }),
      );
    } catch (error) {
      setStorageFeedback(
        `Onboarding progress could not be saved: ${
          error instanceof Error ? error.message : 'unknown storage error'
        }`,
      );
    }
  }, [
    completedByPlatform,
    hydrated,
    platform,
    storageKey,
    storageVersion,
  ]);

  const setPlatform = useCallback(
    (nextPlatform) => {
      if (isPlatform(nextPlatform, platforms)) {
        setPlatformState(nextPlatform);
        setStorageFeedback('');
      }
    },
    [platforms],
  );

  const toggleStep = useCallback(
    (stepId) => {
      if (!platform || !stepIds.has(stepId)) {
        return;
      }

      setCompletedByPlatform((currentByPlatform) => {
        const currentIds = currentByPlatform[platform] || [];
        return {
          ...currentByPlatform,
          [platform]: currentIds.includes(stepId)
            ? currentIds.filter((id) => id !== stepId)
            : [...currentIds, stepId],
        };
      });
      setStorageFeedback('');
    },
    [platform, stepIds],
  );

  const reset = useCallback(() => {
    setCompletedByPlatform({});
    setStorageFeedback('Onboarding progress was reset.');
  }, []);

  const completedStepIds = platform
    ? completedByPlatform[platform] || []
    : [];

  return {
    platform,
    setPlatform,
    hydrated,
    completedStepIds,
    completedCount: completedStepIds.length,
    toggleStep,
    reset,
    storageFeedback,
  };
}
