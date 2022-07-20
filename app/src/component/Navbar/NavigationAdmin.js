import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import "./Navbar.css";

export default function NavbarAdmin() {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <div className="header">
        <NavLink to="/">
          <i className="fab fa-hive" /> Editor
        </NavLink>
      </div>
      <ul
        className="navbar-links"
        style={{ transform: open ? "translateX(0px)" : "" }}
      >
        <li>
          <NavLink to="/Verification" activeClassName="nav-active">
         <i className="fa-regular fa-cloud-check" /> Authenticate Evaluators
          </NavLink>
        </li>
        <li>
          <NavLink to="/AddNews" activeClassName="nav-active">
          <i className="fa-solid fa-plus" /> Add news
          </NavLink>
        </li>
        <li>
          <NavLink to="/Registration" activeClassName="nav-active">
            <i className="far fa-thin fa-registered" /> Evaluator Registration
          </NavLink>
        </li>
        <li>
          <NavLink to="/Voting" activeClassName="nav-active">
            <i className="fas fa-vote-yea" /> Verify News
          </NavLink>
        </li>
        <li>
          <NavLink to="/Outcomes" activeClassName="nav-active">
            <i className="fas fa-poll-h" /> Outcome
          </NavLink>
        </li>
      </ul>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}
