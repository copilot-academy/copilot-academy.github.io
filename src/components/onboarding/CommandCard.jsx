import React, {useRef, useState} from 'react';

export default function CommandCard({label, command, note, primary = false}) {
  const commandRef = useRef(null);
  const [feedback, setFeedback] = useState('');

  function selectCommand() {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(commandRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function copyCommand() {
    try {
      if (!navigator.clipboard?.writeText) {
        selectCommand();
        setFeedback('Copy is unavailable. The command is selected for you.');
        return;
      }

      await navigator.clipboard.writeText(command);
      setFeedback('Command copied to the clipboard.');
    } catch (error) {
      selectCommand();
      setFeedback(
        `The command could not be copied${
          error instanceof Error ? `: ${error.message}` : ''
        }. It is selected for you.`,
      );
    }
  }

  return (
    <div
      className={
        primary
          ? 'onboarding-command-card onboarding-command-card--primary'
          : 'onboarding-command-card'
      }>
      <div className="onboarding-command-card__header">
        <span className="onboarding-command-card__label">
          {primary ? 'Recommended: ' : ''}
          {label}
        </span>
        <button
          className="onboarding-command-card__copy"
          type="button"
          onClick={copyCommand}
          aria-label={`Copy ${label}`}>
          Copy
        </button>
      </div>
      <pre className="onboarding-command-card__command">
        <code ref={commandRef}>{command}</code>
      </pre>
      {note ? <p className="onboarding-command-card__note">{note}</p> : null}
      <p className="onboarding-command-card__feedback" aria-live="polite">
        {feedback}
      </p>
    </div>
  );
}
