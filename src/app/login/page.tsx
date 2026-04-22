"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import GoogleLoginModal from '@/components/GoogleLoginModal';
import styles from './page.module.css';

export default function LoginPage() {
    const { login, register, error: authError } = useAuth(); // Get error from context
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    // Add authError to local errors if present
    const [errors, setErrors] = useState({
        confirmPassword: '',
        otp: '',
        phone: '',
        auth: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // For sign-up, check if OTP is verified
        if (!isLogin && !otpVerified) {
            setErrors(prev => ({
                ...prev,
                otp: 'Please verify your phone number with OTP',
            }));
            return;
        }

        // Validate passwords match for registration
        if (!isLogin && formData.password !== formData.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: 'Passwords do not match',
            }));
            return;
        }

        // Clear errors
        setErrors({ confirmPassword: '', otp: '', phone: '', auth: '' });

        if (isLogin) {
            await login(formData.email, formData.password);
        } else {
            await register(formData.email, formData.name, formData.password, formData.phone);
        }
    };
    const handleSendOTP = () => {
        // Validate phone number
        if (!formData.phone || formData.phone.length !== 10) {
            setErrors(prev => ({
                ...prev,
                phone: 'Please enter a valid 10-digit phone number',
            }));
            return;
        }

        // Clear phone error
        setErrors(prev => ({ ...prev, phone: '' }));

        // TODO: Implement actual OTP sending logic
        // In production, this would call an API to send SMS
        console.log('Sending OTP to:', formData.phone);

        // Simulate OTP sent
        setOtpSent(true);
        setTimer(60); // 60 seconds countdown

        // Start countdown
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        alert(`OTP sent to ${formData.phone}! (Demo: use 123456)`);
    };

    const handleVerifyOTP = () => {
        // TODO: Implement actual OTP verification logic
        // In production, this would call an API to verify OTP

        // Demo: Accept 123456 as valid OTP
        if (otp === '123456') {
            setOtpVerified(true);
            setErrors(prev => ({ ...prev, otp: '' }));
            alert('Phone number verified successfully!');
        } else {
            setErrors(prev => ({
                ...prev,
                otp: 'Invalid OTP. Please try again.',
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user starts typing
        if (e.target.name === 'confirmPassword') {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
        if (e.target.name === 'phone') {
            setErrors(prev => ({ ...prev, phone: '' }));
            // Reset OTP state when phone number changes
            setOtpSent(false);
            setOtpVerified(false);
            setOtp('');
        }
    };

    const handleModeSwitch = () => {
        setIsLogin(!isLogin);
        // Reset OTP state when switching modes
        setOtpSent(false);
        setOtpVerified(false);
        setOtp('');
        setErrors({ confirmPassword: '', otp: '', phone: '', auth: '' });
    };

    const [showGoogleModal, setShowGoogleModal] = useState(false);

    const handleGoogleLogin = () => {
        setShowGoogleModal(true);
    };

    const handleGoogleAccountSelect = (account: { name: string; email: string }) => {
        setShowGoogleModal(false);
        login(account.email, undefined, account.name);
    };

    return (
        <div className={styles.container}>
            <GoogleLoginModal
                isOpen={showGoogleModal}
                onClose={() => setShowGoogleModal(false)}
                onSelectAccount={handleGoogleAccountSelect}
            />
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p>{isLogin ? 'Login to access your portfolio' : 'Join TradeVision today'}</p>
                </div>

                <button className={styles.googleBtn} onClick={handleGoogleLogin}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                        <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                        <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                        <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className={styles.divider}>
                    <span>or</span>
                </div>

                {/* Login Method Toggle - Only for Login */}
                {isLogin && (
                    <div className={styles.methodToggle}>
                        <button
                            type="button"
                            className={`${styles.methodBtn} ${loginMethod === 'email' ? styles.activeMethod : ''}`}
                            onClick={() => setLoginMethod('email')}
                        >
                            <Mail size={18} />
                            Email
                        </button>
                        <button
                            type="button"
                            className={`${styles.methodBtn} ${loginMethod === 'phone' ? styles.activeMethod : ''}`}
                            onClick={() => setLoginMethod('phone')}
                        >
                            <Phone size={18} />
                            Phone
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {(errors.auth || authError) && (
                        <div className={styles.error} style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            {errors.auth || authError}
                        </div>
                    )}
                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <User size={20} className={styles.icon} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {/* For Sign Up: Show both email and phone */}
                    {!isLogin ? (
                        <>
                            <div className={styles.inputGroup}>
                                <Mail size={20} className={styles.icon} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Phone Number with OTP */}
                            <div className={styles.inputGroup}>
                                <Phone size={20} className={styles.icon} />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number (10 digits)"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    disabled={otpVerified}
                                />
                                {!otpVerified && (
                                    <button
                                        type="button"
                                        className={styles.otpBtn}
                                        onClick={handleSendOTP}
                                        disabled={timer > 0}
                                    >
                                        {timer > 0 ? `${timer}s` : otpSent ? 'Resend' : 'Send OTP'}
                                    </button>
                                )}
                                {otpVerified && (
                                    <span className={styles.verifiedBadge}>✓ Verified</span>
                                )}
                            </div>

                            {errors.phone && (
                                <div className={styles.error}>{errors.phone}</div>
                            )}

                            {/* OTP Input - Show only after OTP is sent */}
                            {otpSent && !otpVerified && (
                                <div className={styles.inputGroup}>
                                    <Lock size={20} className={styles.icon} />
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                    />
                                    <button
                                        type="button"
                                        className={styles.verifyBtn}
                                        onClick={handleVerifyOTP}
                                        disabled={otp.length !== 6}
                                    >
                                        Verify
                                    </button>
                                </div>
                            )}

                            {errors.otp && (
                                <div className={styles.error}>{errors.otp}</div>
                            )}
                        </>
                    ) : (
                        /* For Login: Show based on selected method */
                        loginMethod === 'email' ? (
                            <div className={styles.inputGroup}>
                                <Mail size={20} className={styles.icon} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        ) : (
                            <div className={styles.inputGroup}>
                                <Phone size={20} className={styles.icon} />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                />
                            </div>
                        )
                    )}

                    <div className={styles.inputGroup}>
                        <Lock size={20} className={styles.icon} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <Lock size={20} className={styles.icon} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                className={styles.eyeBtn}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    )}

                    {errors.confirmPassword && (
                        <div className={styles.error}>{errors.confirmPassword}</div>
                    )}

                    {isLogin && (
                        <div className={styles.forgotPassword}>
                            <Link href="/forgot-password">Forgot Password?</Link>
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn}>
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={handleModeSwitch}
                            className={styles.toggleBtn}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
