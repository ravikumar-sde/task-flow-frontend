import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, AlertCircle, Loader2, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import authService from '../services/authService';
import '../styles/Auth.css';

const ResetPassword = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter code, 2: Enter new password
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const email = location.state?.email;

  useEffect(() => {
    // Redirect to forgot password if no email is provided
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleCodeChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newCode[index] = char;
      }
    });
    setCode(newCode);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    const resetCode = code.join('');
    if (resetCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyResetCode(email, resetCode);
      setSuccess('Code verified! Please enter your new password.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const resetCode = code.join('');
      await authService.resetPassword(email, resetCode, newPassword);

      setSuccess('Password reset successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Password reset successful! Please login with your new password.'
          }
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSuccess('New reset code sent to your email!');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };



  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="reset-icon">
            <KeyRound size={48} color="#667eea" />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {step === 1
              ? `Enter the 6-digit code sent to ${email}`
              : 'Enter your new password'
            }
          </p>
        </div>

        {success && (
          <div className="success-message">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyCode} className="auth-form">
            <div className="otp-input-group">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="otp-input"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Verify Code
                </>
              )}
            </button>

            <div className="reset-footer">
              <p className="resend-text">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="resend-btn"
                  disabled={resending}
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Resetting...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Reset Password
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
