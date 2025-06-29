import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';

export interface ToggleButtonProps {
  id?: string;
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  id,
  enabled,
  setEnabled,
  disabled = false,
}) => {
  return (
    <button
      id={id}
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full
        ${enabled ? 'bg-green-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => {
        if (!disabled) {
          setEnabled(prev => !prev);
        }
      }}
      disabled={disabled}
      aria-checked={enabled}
      role="switch"
    >
      <span className="sr-only">{enabled ? 'Enabled' : 'Disabled'}</span>
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </button>
  );
};

export default ToggleButton;
