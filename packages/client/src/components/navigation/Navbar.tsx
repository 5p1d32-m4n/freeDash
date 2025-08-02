import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

    return (
        <nav className="navbar">
            <div className="navbar-container">

                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo">
                        FreeDash Logo
                    </Link>
                </div>

                {/* Nav links that change based on the auth state */}

                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashbaord</Link>
                            <Link to="/profile" className="nav-link">Profile</Link>
                            <div className="user-section">
                                {user?.picture && (
                                    <img
                                        className="profile-pic"
                                        src={user.picture}
                                        alt="Profile"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <button
                                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                                    className="logout-btn"
                                >
                                    Log Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/about" className="nav-link">About</Link>
                            <Link to="/pricing" className="nav-link">Pricing</Link>
                            <button
                                onClick={() => loginWithRedirect()}
                                className="login-btn"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => loginWithRedirect()}
                                className="signup-btn"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar;