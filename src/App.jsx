import './App.css'
import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  reload,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import ClickSpark from './components/ClickSpark'
import SplashCursor from './components/SplashCursor'
import { auth, googleProvider } from './firebaseClient'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MAX_NAME_LENGTH = 80
const MAX_PASSWORD_LENGTH = 128
function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [signupVerificationState, setSignupVerificationState] = useState('unverified')
  const [authMessage, setAuthMessage] = useState('')
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false)
  const [isEmailAuthLoading, setIsEmailAuthLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem('ia_current_user')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      localStorage.removeItem('ia_current_user')
      return null
    }
  })
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  const getPasswordRules = (value) => {
    return {
      minLength: value.length >= 8,
      hasNumber: /\d/.test(value),
      hasSymbol: /[^A-Za-z0-9]/.test(value),
      hasUppercase: /[A-Z]/.test(value),
    }
  }

  const getPasswordStrength = (value) => {
    if (!value) return { label: 'Weak', level: 0 }
    const rules = getPasswordRules(value)
    const passed = Object.values(rules).filter(Boolean).length
    if (passed <= 1) return { label: 'Weak', level: 1 }
    if (passed === 2 || passed === 3) return { label: 'Medium', level: 2 }
    return { label: 'Strong', level: 3 }
  }

  const mapAuthErrorToMessage = (error, mode) => {
    const code = error?.code || ''

    if (mode === 'login') {
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        return 'Invalid email or password.'
      }
      if (code === 'auth/too-many-requests') {
        return 'Too many attempts. Please try again later.'
      }
      return 'Login failed. Please try again.'
    }

    if (mode === 'signup') {
      if (code === 'auth/email-already-in-use') return 'Email is already in use.'
      if (code === 'auth/weak-password') return 'Password does not meet the required strength.'
      if (code === 'auth/invalid-email') return 'Please enter a valid email address.'
      if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.'
      if (code === 'auth/operation-not-allowed') {
        return 'Email/Password sign-up is disabled in Firebase. Enable it in Authentication > Sign-in method.'
      }
      if (code === 'auth/network-request-failed') return 'Network error. Check your internet connection and try again.'
      return 'Sign up failed. Please check your details and try again.'
    }

    if (mode === 'google') {
      if (code === 'auth/popup-closed-by-user') return 'Google sign-in was cancelled.'
      return 'Google sign-in failed. Please try again.'
    }

    return 'Authentication failed.'
  }

  const validateEmail = (email) => {
    const normalized = email.trim().toLowerCase()
    if (!normalized) return 'Email is required.'
    if (normalized.length > MAX_EMAIL_LENGTH) return 'Email is too long.'
    if (!EMAIL_REGEX.test(normalized)) return 'Please enter a valid email address.'
    return null
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required.'
    if (password.length > MAX_PASSWORD_LENGTH) return 'Password is too long.'
    return null
  }

  const isSignupEmailVerified = signupVerificationState === 'verified'
  const isSignupVerificationPending = signupVerificationState === 'sent'

  const checkSignupVerificationStatus = async ({ silent = false } = {}) => {
    const normalizedEmail = signupEmail.trim().toLowerCase()
    if (!normalizedEmail || !signupPassword) return false

    try {
      const credentials = await signInWithEmailAndPassword(auth, normalizedEmail, signupPassword)
      await reload(credentials.user)
      const verified = Boolean(credentials.user.emailVerified)
      await signOut(auth)

      if (verified) {
        setSignupVerificationState('verified')
        if (!silent) {
          setAuthMessage('Email already verified. You can now Sign Up.')
        }
        return true
      }

      return false
    } catch {
      return false
    }
  }

  const finalizeAuthenticatedSession = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken()

    const backendResponse = await fetch(`${backendBaseUrl}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    })

    if (!backendResponse.ok) {
      throw new Error('Backend token verification failed')
    }

    const payload = await backendResponse.json()
    const name = payload?.data?.name || firebaseUser.displayName || firebaseUser.email
    const signedUser = {
      uid: payload?.data?.uid || firebaseUser.uid,
      name,
      email: payload?.data?.email || firebaseUser.email,
      picture: payload?.data?.picture || firebaseUser.photoURL || '',
    }

    setCurrentUser(signedUser)
    localStorage.setItem('ia_current_user', JSON.stringify(signedUser))
    localStorage.setItem('ia_id_token', idToken)
    setAuthMessage(`Welcome, ${name}`)
    setShowAuthModal(false)
    navigate('/dashboard')
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true)
      setAuthMessage('')

      const result = await signInWithPopup(auth, googleProvider)
      await finalizeAuthenticatedSession(result.user)
    } catch (error) {
      setAuthMessage(mapAuthErrorToMessage(error, 'google'))
    } finally {
      setIsGoogleSigningIn(false)
    }
  }

  const handleEmailLogin = async (event) => {
    event.preventDefault()
    try {
      setIsEmailAuthLoading(true)
      setAuthMessage('')

      const loginEmailError = validateEmail(loginEmail)
      if (loginEmailError) {
        setAuthMessage(loginEmailError)
        return
      }

      const loginPasswordError = validatePassword(loginPassword)
      if (loginPasswordError) {
        setAuthMessage(loginPasswordError)
        return
      }

      const normalizedEmail = loginEmail.trim().toLowerCase()
      const credentials = await signInWithEmailAndPassword(auth, normalizedEmail, loginPassword)
      await reload(credentials.user)

      if (!credentials.user.emailVerified) {
        setAuthMessage('Please verify your email first. We sent a verification link.')
        await sendEmailVerification(credentials.user)
        await signOut(auth)
        return
      }

      await finalizeAuthenticatedSession(credentials.user)
    } catch (error) {
      setAuthMessage(mapAuthErrorToMessage(error, 'login'))
    } finally {
      setIsEmailAuthLoading(false)
    }
  }

  const handleEmailSignUp = async (event) => {
    event.preventDefault()
    try {
      setIsEmailAuthLoading(true)
      setAuthMessage('')

      const safeName = signupName.trim()
      if (safeName.length > MAX_NAME_LENGTH) {
        setAuthMessage('Full name is too long.')
        return
      }

      const signupEmailError = validateEmail(signupEmail)
      if (signupEmailError) {
        setAuthMessage(signupEmailError)
        return
      }

      const signupPasswordError = validatePassword(signupPassword)
      if (signupPasswordError) {
        setAuthMessage(signupPasswordError)
        return
      }

      const passwordRules = getPasswordRules(signupPassword)
      if (!Object.values(passwordRules).every(Boolean)) {
        setAuthMessage('Password must be 8+ chars with uppercase, number, and symbol.')
        return
      }

      if (signupPassword !== signupConfirmPassword) {
        setAuthMessage('Password and confirm password do not match.')
        return
      }

      const normalizedEmail = signupEmail.trim().toLowerCase()
      if (isSignupEmailVerified) {
        const credentials = await signInWithEmailAndPassword(auth, normalizedEmail, signupPassword)
        await reload(credentials.user)

        if (!credentials.user.emailVerified) {
          setSignupVerificationState('sent')
          setAuthMessage('Email is not verified yet. Please verify your email, then click Verify.')
          await signOut(auth)
          return
        }

        if (safeName && !credentials.user.displayName) {
          await updateProfile(credentials.user, { displayName: safeName })
        }

        await finalizeAuthenticatedSession(credentials.user)
        return
      }

      if (isSignupVerificationPending) {
        const verified = await checkSignupVerificationStatus()
        if (verified) {
          return
        }
        setAuthMessage('Verification link already sent. Please verify your email first.')
        return
      }

      try {
        const credentials = await signInWithEmailAndPassword(auth, normalizedEmail, signupPassword)
        await reload(credentials.user)

        if (credentials.user.emailVerified) {
          setSignupVerificationState('verified')
          setAuthMessage('Email verified. Click Sign Up to continue.')
          await signOut(auth)
          return
        }

        await sendEmailVerification(credentials.user)
        await signOut(auth)
        setSignupVerificationState('sent')
        setAuthMessage('Verification email sent. Check your inbox, then click Verify again.')
      } catch (signInError) {
        if (signInError?.code === 'auth/invalid-credential' || signInError?.code === 'auth/user-not-found') {
          const created = await createUserWithEmailAndPassword(auth, normalizedEmail, signupPassword)
          if (safeName) {
            await updateProfile(created.user, { displayName: safeName })
          }
          await sendEmailVerification(created.user)
          await signOut(auth)
          setSignupVerificationState('sent')
          setAuthMessage('Verification email sent. Check your inbox, then click Verify again.')
          return
        }

        throw signInError
      }
    } catch (error) {
      setAuthMessage(mapAuthErrorToMessage(error, 'signup'))
    } finally {
      setIsEmailAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.removeItem('ia_current_user')
    localStorage.removeItem('ia_id_token')
    setCurrentUser(null)
    setAuthMessage('You have been logged out')
    navigate('/')
  }

  useEffect(() => {
    if (location.pathname === '/dashboard' && !currentUser) {
      navigate('/')
    }
  }, [location.pathname, currentUser, navigate])

  useEffect(() => {
    if (isLogin) return
    if (isSignupEmailVerified) return

    const emailOk = !validateEmail(signupEmail)
    const passwordOk = !validatePassword(signupPassword)
    if (!emailOk || !passwordOk) return

    const timer = setTimeout(() => {
      checkSignupVerificationStatus({ silent: true })
    }, 600)

    return () => clearTimeout(timer)
  }, [isLogin, signupEmail, signupPassword, isSignupEmailVerified])

  if (location.pathname === '/dashboard' && currentUser) {
    return (
      <ClickSpark
        sparkColor="#42FCFF"
        sparkSize={12}
        sparkRadius={25}
        sparkCount={12}
        duration={600}
        easing="ease-out"
        extraScale={1.2}
        className="page-shell dashboard-shell"
      >
        <SplashCursor RAINBOW_MODE={false} COLOR="#42FCFF" />
        <div className="ambient ambient-a" aria-hidden="true" />
        <div className="ambient ambient-b" aria-hidden="true" />

        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark">
              <span />
            </div>
            <div>
              <p className="eyebrow">Information Assurance</p>
            </div>
          </div>
          <button onClick={handleLogout} className="auth-link login-btn">
            Logout
          </button>
        </header>

        <main className="dashboard-main">
          <section className="dashboard-card">
            <h1>Dashboard</h1>
            <p className="dashboard-subcopy">Signed in successfully.</p>
            <div className="dashboard-user">
              {currentUser.picture ? <img src={currentUser.picture} alt={currentUser.name} /> : null}
              <div>
                <strong>{currentUser.name || 'User'}</strong>
                <p>{currentUser.email || 'No email available'}</p>
              </div>
            </div>
          </section>
        </main>

        {authMessage && <div className="auth-toast">{authMessage}</div>}
      </ClickSpark>
    )
  }

  return (
    <ClickSpark
      sparkColor="#42FCFF"
      sparkSize={12}
      sparkRadius={25}
      sparkCount={12}
      duration={600}
      easing="ease-out"
      extraScale={1.2}
      className="page-shell"
    >
      <SplashCursor RAINBOW_MODE={false} COLOR="#42FCFF" />
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <span />
          </div>
          <div>
            <p className="eyebrow">Information Assurance</p>
          </div>
        </div>

        <nav className="topnav" aria-label="Primary">
          <button 
            onClick={() => setShowAuthModal(true)} 
            className="auth-link login-btn"
          >
            Login
          </button>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="pill">Live defense. Clear oversight. Faster response.</span>
          <h1 className="shine-text">Information Assurance Final Project</h1>
          <p className="lede">Information Assurance Final Project</p>
        </div>
      </section>

      {/* feature-cards removed per user request */}

      <footer className="footer" id="contact">
        <div className="footer-brand">
          <div className="brand-lockup footer-lockup">
            <div className="brand-mark">
              <span />
            </div>
            <div>
              <p className="eyebrow">Information Assurance</p>
            </div>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h3>Team</h3>
            <a href="#contact">Abdu, Mohammad Azeem S.</a>
            <a href="#contact">Arobie, Mohammad Rashdy L</a>
            <a href="#contact">Lagoyo, Shadia</a>
            <a href="#contact">Libradilla, Eric Jr</a>
            <a href="#contact">Mamiala, Den Abhar</a>
          </div>

          <div className="footer-col">
            <h3>Details</h3>
            <a href="#contact">Course: Information Assurance</a>
            <a href="#contact">Section: 3C</a>
            <a href="#contact">Status: Submitted</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Information Assurance Final Project</p>
          <p>Abdu, Mohammad Azeem S. · Arobie, Mohammad Rashdy L · Lagoyo, Shadia · Libradilla, Eric Jr · Mamiala, Den Abhar</p>
        </div>
      </footer>

      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-orb orb-a" aria-hidden="true" />
            <div className="auth-orb orb-b" aria-hidden="true" />
            <button 
              className="modal-close" 
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>

            {isLogin ? (
              <form className="auth-form" onSubmit={handleEmailLogin}>
                <div>
                  <h2>Welcome Back</h2>
                  <p className="auth-subcopy">Enter your credentials to continue</p>
                </div>

                <div className="input-group">
                  <label className="sr-only" htmlFor="login-email">Email</label>
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 7l9 6 9-6" />
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                    </svg>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="password-row">
                  <div className="input-group">
                    <label className="sr-only" htmlFor="login-password">Password</label>
                    <span className="input-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 10V8a5 5 0 0110 0v2" />
                        <rect x="5" y="10" width="14" height="10" rx="2" />
                      </svg>
                    </span>
                    <input
                      id="login-password"
                      placeholder="Enter your password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowLoginPassword((value) => !value)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>

                  {loginPassword.length > 0 && (
                    <div className="password-feedback" aria-live="polite">
                      {(() => {
                        const strength = getPasswordStrength(loginPassword)
                        const rules = getPasswordRules(loginPassword)
                        const showWarning = strength.level === 1

                        return (
                          <>
                            <div className="strength-row">
                              <span>Password strength</span>
                              <strong className={`strength-label strength-${strength.label.toLowerCase()}`}>
                                {strength.label}
                              </strong>
                            </div>
                            <div className={`strength-meter strength-${strength.label.toLowerCase()}`}>
                              <span />
                            </div>
                            <div className="rule-list">
                              <span className={rules.minLength ? 'rule-ok' : 'rule-bad'}>8+ characters</span>
                              <span className={rules.hasUppercase ? 'rule-ok' : 'rule-bad'}>Uppercase letter</span>
                              <span className={rules.hasNumber ? 'rule-ok' : 'rule-bad'}>Number</span>
                              <span className={rules.hasSymbol ? 'rule-ok' : 'rule-bad'}>Symbol</span>
                            </div>
                            {showWarning && (
                              <p className="inline-warning">
                                Password is weak. Add more characters, a number, and a symbol.
                              </p>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                <div className="auth-row">
                  <label className="checkbox">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="link-button">Forgot password?</button>
                </div>

                <button type="submit" className="auth-submit" disabled={isEmailAuthLoading}>
                  {isEmailAuthLoading ? 'Logging in...' : 'Login'}
                </button>

                <div className="auth-divider">
                  <span>Or continue with</span>
                </div>

                <div className="social-row">
                  <button
                    type="button"
                    className="social-btn"
                    aria-label="Continue with Google"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleSigningIn}
                  >
                    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 10.2v3.6h5.06c-.24 1.35-1.66 3.95-5.06 3.95a5.79 5.79 0 0 1 0-11.58c1.65 0 2.76.7 3.4 1.31l2.31-2.22A8.97 8.97 0 1 0 12 21c5.2 0 8.64-3.64 8.64-8.78 0-.6-.07-1.06-.15-1.52H12z"
                      />
                    </svg>
                    <span className="social-label">
                      {isGoogleSigningIn ? 'Signing in...' : 'Sign in with Google'}
                    </span>
                  </button>
                </div>

                <p className="auth-footer">Don't have an account? <button type="button" className="link-button" onClick={() => setIsLogin(false)}>Sign up</button></p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleEmailSignUp}>
                <div>
                  <h2>Create Account</h2>
                  <p className="auth-subcopy">Join the project workspace in seconds</p>
                </div>

                <div className="input-group">
                  {/* <label className="sr-only" htmlFor="signup-name">Full Name</label> */}
                  {/* <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c2.5-4 13.5-4 16 0" />
                    </svg>
                  </span> */}
                  {/* <input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupName}
                    onChange={(event) => setSignupName(event.target.value)}
                    required
                  /> */}
                </div>

                <div className="input-group">
                  <label className="sr-only" htmlFor="signup-email">Email</label>
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 7l9 6 9-6" />
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                    </svg>
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(event) => {
                      setSignupEmail(event.target.value)
                      setSignupVerificationState('unverified')
                    }}
                    required
                  />
                  <span
                    className={`email-verify-icon ${isSignupEmailVerified ? 'verified' : 'not-verified'}`}
                    aria-label={isSignupEmailVerified ? 'Email verified' : 'Email not verified'}
                    title={isSignupEmailVerified ? 'Email verified' : 'Email not verified'}
                  >
                    {isSignupEmailVerified ? '✓' : '✕'}
                  </span>
                </div>

                <div className="password-row">
                  <div className="input-group">
                    <label className="sr-only" htmlFor="signup-password">Password</label>
                    <span className="input-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 10V8a5 5 0 0110 0v2" />
                        <rect x="5" y="10" width="14" height="10" rx="2" />
                      </svg>
                    </span>
                    <input
                      id="signup-password"
                      placeholder="Enter your password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(event) => {
                        setSignupPassword(event.target.value)
                        setSignupVerificationState('unverified')
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowSignupPassword((value) => !value)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>

                  {signupPassword.length > 0 && (
                    <div className="password-feedback" aria-live="polite">
                      {(() => {
                        const strength = getPasswordStrength(signupPassword)
                        const rules = getPasswordRules(signupPassword)
                        const showWarning = strength.level === 1
                        return (
                          <>
                            <div className="strength-row">
                              <span>Password strength</span>
                              <strong className={`strength-label strength-${strength.label.toLowerCase()}`}>
                                {strength.label}
                              </strong>
                            </div>
                            <div className={`strength-meter strength-${strength.label.toLowerCase()}`}>
                              <span />
                            </div>
                            <div className="rule-list">
                              <span className={rules.minLength ? 'rule-ok' : 'rule-bad'}>8+ characters</span>
                              <span className={rules.hasUppercase ? 'rule-ok' : 'rule-bad'}>Uppercase letter</span>
                              <span className={rules.hasNumber ? 'rule-ok' : 'rule-bad'}>Number</span>
                              <span className={rules.hasSymbol ? 'rule-ok' : 'rule-bad'}>Symbol</span>
                            </div>
                            {showWarning && (
                              <p className="inline-warning">
                                Password is weak. Add more characters, a number, and a symbol.
                              </p>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="sr-only" htmlFor="signup-confirm">Confirm Password</label>
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 10V8a5 5 0 0110 0v2" />
                      <rect x="5" y="10" width="14" height="10" rx="2" />
                    </svg>
                  </span>
                  <input
                    id="signup-confirm"
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(event) => {
                      setSignupConfirmPassword(event.target.value)
                      setSignupVerificationState('unverified')
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirmPassword((value) => !value)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>

                <button type="submit" className="auth-submit" disabled={isEmailAuthLoading}>
                  {isEmailAuthLoading
                    ? (isSignupEmailVerified ? 'Signing up...' : 'Verifying...')
                    : (isSignupEmailVerified ? 'Sign Up' : (isSignupVerificationPending ? 'Verifying...' : 'Verify'))}
                </button>
                {authMessage && <p className="auth-inline-message">{authMessage}</p>}

                <div className="auth-divider">
                  <span>Or continue with</span>
                </div>

                <div className="social-row">
                  <button
                    type="button"
                    className="social-btn"
                    aria-label="Continue with Google"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleSigningIn}
                  >
                    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 10.2v3.6h5.06c-.24 1.35-1.66 3.95-5.06 3.95a5.79 5.79 0 0 1 0-11.58c1.65 0 2.76.7 3.4 1.31l2.31-2.22A8.97 8.97 0 1 0 12 21c5.2 0 8.64-3.64 8.64-8.78 0-.6-.07-1.06-.15-1.52H12z"
                      />
                    </svg>
                    <span className="social-label">
                      {isGoogleSigningIn ? 'Signing in...' : 'Sign in with Google'}
                    </span>
                  </button>
                </div>

                <p className="auth-footer">Already have an account? <button type="button" className="link-button" onClick={() => setIsLogin(true)}>Login</button></p>
              </form>
            )}
          </div>
        </div>
      )}
      {authMessage && <div className="auth-toast">{authMessage}</div>}
    </ClickSpark>
  )
}

export default App
