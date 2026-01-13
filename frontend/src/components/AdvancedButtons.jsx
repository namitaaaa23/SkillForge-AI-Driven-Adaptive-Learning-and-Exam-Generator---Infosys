import React, { useState } from 'react';
import './AdvancedButtons.css';

// Advanced Button Component with Multiple Variants
export function AdvancedButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  tooltip,
  badge,
  onClick,
  ripple = true,
  glow = true,
  pulse = false,
  animated = true,
  className = '',
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const handleRipple = (e) => {
    if (!ripple) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = { x, y, id: Date.now() };
    setRipples([...ripples, ripple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);
  };

  const handleClick = (e) => {
    handleRipple(e);
    onClick?.(e);
  };

  return (
    <div className="button-wrapper" title={tooltip}>
      <button
        className={`advanced-btn btn-${variant} btn-${size} ${pulse ? 'pulse' : ''} ${animated ? 'animated' : ''} ${className}`}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Glow effect */}
        {glow && <div className="btn-glow"></div>}
        
        {/* Ripple effect */}
        <div className="ripple-container">
          {ripples.map(r => (
            <span
              key={r.id}
              className="ripple"
              style={{
                left: r.x,
                top: r.y
              }}
            ></span>
          ))}
        </div>

        {/* Loading spinner */}
        {loading && <span className="btn-spinner"></span>}

        {/* Icon */}
        {icon && <span className="btn-icon">{icon}</span>}

        {/* Content */}
        <span className="btn-content">{children}</span>

        {/* Badge */}
        {badge && <span className="btn-badge">{badge}</span>}
      </button>
    </div>
  );
}

// Floating Action Button
export function FloatingActionButton({
  icon,
  onClick,
  variant = 'primary',
  tooltip,
  mini = false,
  actions = []
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`fab-container ${expanded ? 'expanded' : ''}`}>
      <button
        className={`fab fab-${variant} ${mini ? 'mini' : ''}`}
        onClick={() => {
          if (actions.length > 0) {
            setExpanded(!expanded);
          } else {
            onClick?.();
          }
        }}
        title={tooltip}
      >
        <span className="fab-icon">{icon}</span>
      </button>

      {actions.length > 0 && expanded && (
        <div className="fab-actions">
          {actions.map((action, idx) => (
            <button
              key={idx}
              className={`fab-action fab-action-${idx}`}
              onClick={() => {
                action.onClick?.();
                setExpanded(false);
              }}
              title={action.tooltip}
            >
              <span className="fab-action-icon">{action.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Split Button with Dropdown
export function SplitButton({
  label,
  icon,
  options = [],
  onSelect,
  variant = 'primary',
  size = 'md'
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="split-button-container">
      <button className={`split-btn-main btn-${variant} btn-${size}`}>
        {icon && <span className="btn-icon">{icon}</span>}
        <span>{label}</span>
      </button>
      <button
        className={`split-btn-toggle btn-${variant} btn-${size}`}
        onClick={() => setOpen(!open)}
      >
        ▼
      </button>
      {open && (
        <div className="split-dropdown">
          {options.map((opt, idx) => (
            <button
              key={idx}
              className="split-option"
              onClick={() => {
                onSelect?.(opt);
                setOpen(false);
              }}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Icon Button with Tooltip
export function IconButton({
  icon,
  onClick,
  tooltip,
  variant = 'primary',
  size = 'md',
  badge,
  animated = true
}) {
  return (
    <div className="icon-button-wrapper" title={tooltip}>
      <button
        className={`icon-btn btn-${variant} btn-${size} ${animated ? 'animated' : ''}`}
        onClick={onClick}
      >
        <span className="icon-content">{icon}</span>
        {badge && <span className="icon-badge">{badge}</span>}
      </button>
    </div>
  );
}

// Toggle Button
export function ToggleButton({
  label,
  icon,
  checked = false,
  onChange,
  variant = 'primary'
}) {
  return (
    <button
      className={`toggle-btn btn-${variant} ${checked ? 'checked' : ''}`}
      onClick={() => onChange?.(!checked)}
    >
      <span className="toggle-track">
        <span className="toggle-thumb"></span>
      </span>
      {icon && <span className="toggle-icon">{icon}</span>}
      <span className="toggle-label">{label}</span>
    </button>
  );
}

// Group Button
export function ButtonGroup({ children, variant = 'primary' }) {
  return (
    <div className={`button-group btn-group-${variant}`}>
      {children}
    </div>
  );
}

// Animated Counter Button
export function CounterButton({
  count = 0,
  onIncrement,
  onDecrement,
  label,
  variant = 'primary'
}) {
  return (
    <div className={`counter-btn btn-${variant}`}>
      <button className="counter-dec" onClick={onDecrement}>−</button>
      <div className="counter-display">
        <span className="counter-label">{label}</span>
        <span className="counter-value">{count}</span>
      </div>
      <button className="counter-inc" onClick={onIncrement}>+</button>
    </div>
  );
}

// Progress Button
export function ProgressButton({
  label,
  progress = 0,
  onClick,
  variant = 'primary',
  size = 'md'
}) {
  return (
    <button
      className={`progress-btn btn-${variant} btn-${size}`}
      onClick={onClick}
      style={{
        '--progress': `${progress}%`
      }}
    >
      <span className="progress-fill"></span>
      <span className="progress-label">{label}</span>
      {progress > 0 && <span className="progress-text">{progress}%</span>}
    </button>
  );
}

// Gradient Button
export function GradientButton({
  children,
  icon,
  onClick,
  gradient = 'primary',
  size = 'md',
  animated = true
}) {
  return (
    <button
      className={`gradient-btn gradient-${gradient} btn-${size} ${animated ? 'animated' : ''}`}
      onClick={onClick}
    >
      <span className="gradient-bg"></span>
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  );
}

// Morphing Button
export function MorphingButton({
  initialLabel,
  finalLabel,
  icon,
  onClick,
  variant = 'primary',
  size = 'md'
}) {
  const [morphed, setMorphed] = useState(false);

  const handleClick = () => {
    setMorphed(!morphed);
    onClick?.();
  };

  return (
    <button
      className={`morphing-btn btn-${variant} btn-${size} ${morphed ? 'morphed' : ''}`}
      onClick={handleClick}
    >
      <span className="morph-content">
        <span className="morph-initial">{icon} {initialLabel}</span>
        <span className="morph-final">{icon} {finalLabel}</span>
      </span>
    </button>
  );
}

// Neon Button
export function NeonButton({
  children,
  icon,
  onClick,
  color = 'blue',
  size = 'md'
}) {
  return (
    <button
      className={`neon-btn neon-${color} btn-${size}`}
      onClick={onClick}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
      <span className="neon-glow"></span>
    </button>
  );
}

// Neumorphic Button
export function NeumorphicButton({
  children,
  icon,
  onClick,
  pressed = false,
  size = 'md'
}) {
  return (
    <button
      className={`neumorphic-btn btn-${size} ${pressed ? 'pressed' : ''}`}
      onClick={onClick}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  );
}

// Glass Morphism Button
export function GlassButton({
  children,
  icon,
  onClick,
  size = 'md'
}) {
  return (
    <button
      className={`glass-btn btn-${size}`}
      onClick={onClick}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  );
}

// Animated Icon Button with Hover Effect
export function AnimatedIconButton({
  icon,
  hoverIcon,
  onClick,
  tooltip,
  variant = 'primary'
}) {
  return (
    <button
      className={`animated-icon-btn btn-${variant}`}
      onClick={onClick}
      title={tooltip}
    >
      <span className="icon-main">{icon}</span>
      <span className="icon-hover">{hoverIcon || icon}</span>
    </button>
  );
}

// Pulse Button
export function PulseButton({
  children,
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  intensity = 'normal'
}) {
  return (
    <button
      className={`pulse-btn btn-${variant} btn-${size} pulse-${intensity}`}
      onClick={onClick}
    >
      <span className="pulse-ring"></span>
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  );
}

// Shimmer Button
export function ShimmerButton({
  children,
  icon,
  onClick,
  variant = 'primary',
  size = 'md'
}) {
  return (
    <button
      className={`shimmer-btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      <span className="shimmer-effect"></span>
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  );
}

// Expandable Button
export function ExpandableButton({
  label,
  icon,
  expandedContent,
  onClick,
  variant = 'primary'
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`expandable-btn-container ${expanded ? 'expanded' : ''}`}>
      <button
        className={`expandable-btn btn-${variant}`}
        onClick={() => {
          setExpanded(!expanded);
          onClick?.();
        }}
      >
        {icon && <span className="btn-icon">{icon}</span>}
        <span className="btn-content">{label}</span>
        <span className="expand-arrow">›</span>
      </button>
      {expanded && (
        <div className="expandable-content">
          {expandedContent}
        </div>
      )}
    </div>
  );
}
