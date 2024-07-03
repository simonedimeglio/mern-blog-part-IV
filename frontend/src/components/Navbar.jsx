// Importa il componente Link da react-router-dom per la navigazione
import { Link } from "react-router-dom";
// Importa il file CSS per gli stili specifici di questo componente
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Container per centrare e limitare la larghezza del contenuto */}
      <div className="container">
        {/* Link al brand/logo dell'app, che porta alla home page */}
        <Link to="/" className="navbar-brand">
          Blog App
        </Link>

        {/* Menu */}
        <ul className="navbar-nav">
          {/* Link alla home page */}
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>

          {/* Link alla pagina di creazione del post */}
          <li className="nav-item">
            <Link to="/create" className="nav-link">
              Nuovo Post
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
