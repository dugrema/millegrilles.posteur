import React from 'react'
import { Nav, Navbar, NavDropdown, NavLink, NavItem, Dropdown, Container, Row, Col} from 'react-bootstrap';
import { Trans, Translation, withTranslation } from 'react-i18next';

export default function Menu(props) {

  let boutonProtege
  if(props.rootProps.modeProtege) {
    boutonProtege = <i className="fa fa-lg fa-lock protege"/>
  } else {
    boutonProtege = <i className="fa fa-lg fa-unlock"/>
  }

  const iconeHome = <span><i className="fa fa-home"/> {props.rootProps.nomMilleGrille}</span>

  return (
    <Navbar collapseOnSelect expand="md" bg="info" variant="dark" fixed="top">
      <Nav.Link className="navbar-brand" onClick={props.changerPage} eventKey='A'>
        <Trans>application.nom</Trans>
      </Nav.Link>
      <Navbar.Toggle aria-controls="responsive-navbar-menu" />
      <Navbar.Collapse id="responsive-navbar-menu">
        <Nav>
          <Nav.Link href='/'></Nav.Link>
        </Nav>
        <MenuItems changerPage={props.changerPage} rootProps={props.rootProps}/>
        <Nav className="justify-content-end">
          <Nav.Link href='/'>{iconeHome}</Nav.Link>
          <Nav.Link onClick={props.rootProps.toggleProtege}>{boutonProtege}</Nav.Link>
          <Nav.Link onClick={props.rootProps.changerLanguage}><Trans>menu.changerLangue</Trans></Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

function MenuItems(props) {
  return (
    <Nav className="mr-auto" activeKey={props.rootProps.page} onSelect={props.changerPage}>
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
