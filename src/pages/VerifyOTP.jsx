import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import '../styles/Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  const { setUser, setIsAuthenticated } = useAuth();

  const email = location.state?.email;

  useEffect(() => {
    // Redirect to signup if no email is provided
    if (!email) {
      navigate('/signup');
      return;
    }

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const verificationCode = otp.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyEmail(email, verificationCode);

      // User is automatically logged in after verification
      // Set user and authentication state
      if (response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setResending(true);
    setError('');

    try {
      await authService.resendVerification(email);

      // Reset timer
      setCanResend(false);
      setResendTimer(60);

      // Start new timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="otp-icon">
            <Mail size={48} color="#667eea" />
          </div>
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
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
                Verify Email
              </>
            )}
          </button>
        </form>

        <div className="otp-footer">
          <p className="resend-text">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                onClick={handleResendCode}
                className="resend-btn"
                disabled={resending}
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            ) : (
              <span className="timer-text">Resend in {resendTimer}s</span>
            )}
          </p>
        </div>

        <div className="auth-footer">
          <p>
            Wrong email?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="auth-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Go back to signup
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

