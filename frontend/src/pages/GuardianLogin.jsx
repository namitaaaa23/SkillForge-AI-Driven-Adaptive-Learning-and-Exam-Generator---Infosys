import { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuardianLogin() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [resetMessage, setResetMessage] = useState('');
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const validateForm = () => {
        const newErrors = {};
        if (isSignUp && !formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';

        if (isSignUp) {
            if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        } else if (formData.password.length < 1) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            if (isSignUp) {
                const registerData = {
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    role: 'GUARDIAN'
                };
                const result = await register(registerData);

                if (result.success) {
                    const userProfile = {
                        userName: result.data.fullName || formData.fullName,
                        email: result.data.email,
                        id: result.data.id,
                        guardianId: `GRD${result.data.id}`,
                        relationship: 'Parent'
                    };
                    navigate('/guardian-dashboard', { state: { userProfile } });
                } else {
                    setErrors({ password: result.message || 'Registration failed' });
                }
            } else {
                const result = await login(formData.email, formData.password);

                if (result.success) {
                    // Check if user is guardian
                    if (result.data.role !== 'GUARDIAN') {
                        const actualRole = result.data.role === 'STUDENT' ? 'Learner' : 'Admin';
                        setErrors({ password: `You are an ${actualRole}. Please login at the ${actualRole} login page.` });
                        return;
                    }

                    const userProfile = {
                        userName: result.data.fullName,
                        email: result.data.email,
                        id: result.data.id,
                        guardianId: `GRD${result.data.id}`,
                        relationship: 'Parent'
                    };
                    navigate('/guardian-dashboard', { state: { userProfile } });
                } else {
                    setErrors({ password: result.message || 'Invalid email or password' });
                }
            }
        } catch (error) {
            setErrors({ password: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card" onKeyPress={handleKeyPress}>
                <h2 className="login-title">Guardian</h2>

                {isSignUp && (
                    <>
                        <input
                            type="text"
                            placeholder="Full Name *"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={errors.fullName ? 'error' : ''}
                        />
                        {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                    </>
                )}

                <input
                    type="email"
                    placeholder="Guardian Email *"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={errors.email || errors.general ? 'error' : ''}
                />
                {(errors.email || errors.general) && <span className="error-text">{errors.email || errors.general}</span>}

                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password *"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                    <span
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </span>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}

                {isSignUp && (
                    <div className="password-field">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password *"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        <span
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </span>
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                    </div>
                )}

                <button
                    className="login-btn"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : (isSignUp ? "Sign Up" : "Sign In")}
                </button>

                <p className="toggle-text">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <span className="toggle-link" onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? " Sign In" : " Sign Up"}
                    </span>
                </p>

                {!isSignUp && (
                    <span
                        className="forgot-password-link"
                        onClick={() => setShowForgotPassword(true)}
                    >
                        Forgot Password?
                    </span>
                )}

                <Link to="/" className="back-link">← Back to Home</Link>

                {showForgotPassword && (
                    <div className="forgot-password-modal" onClick={() => setShowForgotPassword(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Forgot Password</h3>
                            <p style={{ marginBottom: '1rem', color: '#666' }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                style={{ marginBottom: '1rem' }}
                            />
                            {resetMessage && (
                                <p className={resetMessage.includes('sent') ? 'success-message' : 'error-text'}
                                    style={{ marginBottom: '1rem' }}>
                                    {resetMessage}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={async () => {
                                        if (!formData.email || !formData.email.includes('@')) {
                                            setResetMessage('Please enter a valid email address');
                                            return;
                                        }
                                        setLoading(true);
                                        setResetMessage('');
                                        try {
                                            const response = await fetch('http://localhost:8082/auth/forgot-password', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ email: formData.email })
                                            });
                                            const data = await response.json();
                                            if (response.ok) {
                                                setResetMessage('Password reset link sent to your email!');
                                                setTimeout(() => {
                                                    setShowForgotPassword(false);
                                                    setResetMessage('');
                                                }, 3000);
                                            } else {
                                                setResetMessage(data.message || 'Failed to send reset link');
                                            }
                                        } catch (error) {
                                            setResetMessage('Error: Unable to connect to server');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setResetMessage('');
                                    }}
                                    style={{ flex: 1, background: '#6c757d' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
