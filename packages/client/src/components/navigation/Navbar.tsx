import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ()=>{
    const {isAuthenticated, loginWithRedirect, logout, user} = useAuth0();

    return(
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Logo</Link>
            </div>

            <div className="navbar-links">
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>
            </div>

            <div className="navbar-buttons">
                <Link to=""></Link>
                <Link to=""></Link>
            </div>
        </nav>
    )
}

export default Navbar;