import './App.css'
import { useState } from 'react'
import ClickSpark from './components/ClickSpark'
import SplashCursor from './components/SplashCursor'

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginPassword, setLoginPassword] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

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
              <form className="auth-form">
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
                  <input id="login-email" type="email" required />
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

                <button type="submit" className="auth-submit">Login</button>

                <div className="auth-divider">
                  <span>Or continue with</span>
                </div>

                <div className="social-row">
                  <button type="button" className="social-btn" aria-label="Continue with Google">
                    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 10.2v3.6h5.06c-.24 1.35-1.66 3.95-5.06 3.95a5.79 5.79 0 0 1 0-11.58c1.65 0 2.76.7 3.4 1.31l2.31-2.22A8.97 8.97 0 1 0 12 21c5.2 0 8.64-3.64 8.64-8.78 0-.6-.07-1.06-.15-1.52H12z"
                      />
                    </svg>
                    <span className="social-label">Sign in with Google</span>
                  </button>
                </div>

                <p className="auth-footer">Don't have an account? <button type="button" className="link-button" onClick={() => setIsLogin(false)}>Sign up</button></p>
              </form>
            ) : (
              <form className="auth-form">
                <div>
                  <h2>Create Account</h2>
                  <p className="auth-subcopy">Join the project workspace in seconds</p>
                </div>

                <div className="input-group">
                  <label className="sr-only" htmlFor="signup-name">Full Name</label>
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c2.5-4 13.5-4 16 0" />
                    </svg>
                  </span>
                  <input id="signup-name" type="text" required />
                </div>

                <div className="input-group">
                  <label className="sr-only" htmlFor="signup-email">Email</label>
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 7l9 6 9-6" />
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                    </svg>
                  </span>
                  <input id="signup-email" type="email" required />
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
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
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
                    type={showConfirmPassword ? 'text' : 'password'}
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

                <button type="submit" className="auth-submit">Sign Up</button>

                <div className="auth-divider">
                  <span>Or continue with</span>
                </div>

                <div className="social-row">
                  <button type="button" className="social-btn" aria-label="Continue with Google">
                    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 10.2v3.6h5.06c-.24 1.35-1.66 3.95-5.06 3.95a5.79 5.79 0 0 1 0-11.58c1.65 0 2.76.7 3.4 1.31l2.31-2.22A8.97 8.97 0 1 0 12 21c5.2 0 8.64-3.64 8.64-8.78 0-.6-.07-1.06-.15-1.52H12z"
                      />
                    </svg>
                    <span className="social-label">Sign in with Google</span>
                  </button>
                </div>

                <p className="auth-footer">Already have an account? <button type="button" className="link-button" onClick={() => setIsLogin(true)}>Login</button></p>
              </form>
            )}
          </div>
        </div>
      )}
    </ClickSpark>
  )
}

export default App
