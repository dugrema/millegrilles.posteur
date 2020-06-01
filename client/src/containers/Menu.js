import React from 'react'
import { Nav, Navbar, NavDropdown, NavLink, NavItem, Dropdown, Container, Row, Col} from 'react-bootstrap';
import { Trans, Translation, withTranslation } from 'react-i18next';

export function Menu(props) {

  let boutonProtege
  if(props.rootProps.modeProtege) {
    boutonProtege = <i className="fa fa-lg fa-lock protege"/>
  } else {
    boutonProtege = <i className="fa fa-lg fa-unlock"/>
  }

  return (
    <Navbar collapseOnSelect expand="md" bg="info" variant="dark" fixed="top">
      <Navbar.Brand href='/'><i className="fa fa-home"/></Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-menu" />
      <Navbar.Collapse id="responsive-navbar-menu">
        <MenuItems changerPage={props.changerPage} />
        <Nav className="justify-content-end">
          <Nav.Link onClick={props.rootProps.toggleProtege}>{boutonProtege}</Nav.Link>
          <Nav.Link onClick={props.rootProps.changerLanguage}><Trans>menu.changerLangue</Trans></Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

function MenuItems(props) {
  return (
    <Nav className="mr-auto" activeKey={props.section} onSelect={props.changerPage}>
      <Nav.Item>
        <Nav.Link eventKey='Blogs'>
          <Trans>menu.blogs</Trans>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey='Annonces'>
          <Trans>menu.annonces</Trans>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey='Vitrine'>
          <Trans>menu.vitrine</Trans>
        </Nav.Link>
      </Nav.Item>
    </Nav>
  )
}
