/**
 * PasswordInput — DevVerse Desktop
 *
 * A reusable password input component featuring:
 * • Toggleable show/hide password (type="password" ⇄ type="text")
 * • Lucide React Eye & EyeOff icons
 * • Accessible aria-label ("Show password" / "Hide password")
 * • Smooth icon animation & keyboard navigation support
 */

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  labelRight?: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  label,
  labelRight,
  containerStyle,
  placeholder = '••••••••',
  required = false,
  style,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', ...containerStyle }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label htmlFor={id} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {label}
          </label>
          {labelRight}
        </div>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            padding: '9px 38px 9px 12px',
            borderRadius: 8,
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-primary-subtle)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...rest}
        />

        <button
          type="button"
          onClick={toggleShowPassword}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: showPassword ? 'var(--accent-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            borderRadius: 4,
            transition: 'color 0.15s ease, transform 0.15s ease',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = showPassword ? 'var(--accent-primary)' : 'var(--text-muted)';
          }}
        >
          {showPassword ? (
            <EyeOff size={16} style={{ transition: 'transform 0.15s ease' }} />
          ) : (
            <Eye size={16} style={{ transition: 'transform 0.15s ease' }} />
          )}
        </button>
      </div>
    </div>
  );
};
