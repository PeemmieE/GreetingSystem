import { Container, Nav, Navbar, NavDropdown, Button } from 'react-bootstrap'
import { useNavigate,Link, NavLink } from 'react-router-dom';
import React, { useState } from "react";
import { useUserAuth } from '../../context/UserAuthContext';
import '../style/Nav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'


function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useUserAuth();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    logout();
    navigate('/');
  }
  // return (
  //   <>
  //     <Navbar bg="dark" data-bs-theme="dark">
  //       <Container>

  //         {/* brand */}
  //         <Navbar.Brand href="/home">Home</Navbar.Brand>

  //         <Nav className="me-auto">

  //           {/* menu */}
  //           <Nav.Link href="/album">Album</Nav.Link>
  //           <Nav.Link href="/history">History</Nav.Link>
  //           <Nav.Link href="/searchbyimg">Search By Image</Nav.Link>

  //           {/* owner */}
  //           <Nav.Link href="/personnel">Personnel</Nav.Link>

  //           {/* dropdown */}
  //           <NavDropdown title="Kiosk setting" id="navbarScrollingDropdown">

  //             <NavDropdown.Item href="/kioskDisplaySetting">
  //               Display setting
  //             </NavDropdown.Item>

  //             <NavDropdown.Divider />

  //             <NavDropdown.Item href="/kioskGreetingSystem">
  //               Greeting setting
  //             </NavDropdown.Item>

  //           </NavDropdown>

  //           <Button variant='danger' onClick={handleLogOut} >Log out</Button>
  //         </Nav>
  //       </Container>
  //     </Navbar>
  //   </>
  // );

  return (
    <nav>
      <Link to="/home" className="title">
        Greeting System
      </Link>
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
        <li>
          <NavLink to="/album">Album</NavLink>
        </li>
        <li>
          <NavLink to="/conclude">Conclude</NavLink>
        </li>
        <li>
          <NavLink to="/searchbyimg">Search By Image</NavLink>
        </li>
        <li>
          <NavLink to="/allhistory">All Detection</NavLink>
        </li>
        <li>
          <NavLink to="/greeting">Edit Greeting</NavLink>
        </li>
        <li>
        <Button variant='danger' onClick={handleLogOut} ><FontAwesomeIcon icon={faRightFromBracket} /></Button>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar; 