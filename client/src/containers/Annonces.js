import React from 'react';
import { Form, Button,
         Container, Row, Col } from 'react-bootstrap';
import { Trans } from 'react-i18next';

const SUJET_CHARS_MAX = 70, TEXTE_CHARS_MAX = 400;

const subscriptions_annonces = [
  'evenement.Plume.document.annonces_recentes'
]

export default class Annonces extends React.Component {

  state = {
    sujetNouvelleAnnonce: '',
    texteNouvelleAnnonce: '',
    compteCharsRestantsSujet: SUJET_CHARS_MAX,
    compteCharsRestantsTexte: TEXTE_CHARS_MAX,
    annoncesRecentes: null,
  }

  componentDidMount() {
    this.props.rootProps.websocketApp.subscribe(subscriptions_annonces, this._recevoirMessageAnnoncesRecentes);
    this.chargerAnnoncesRecentes();
  }

  componentWillUnmount() {
    this.props.rootProps.websocketApp.unsubscribe(subscriptions_annonces);
  }

  render() {
    return(
      <Container>

        <RenderNouvelleAnnonce
          actions={this.actions}
          update={this.update}
          {...this.props}
          {...this.state} />

        <RenderAnnoncesRecentes
          annoncesRecentes={this.state.annoncesRecentes}
          supprimerAnnonce={this.actions.supprimerAnnonce}
          {...this.props} />

      </Container>
    );
  }

  actions = {
    publierAnnonce: () => {
      if(this.state.texteNouvelleAnnonce && this.state.texteNouvelleAnnonce !== '') {
        const transaction = {
          texte: this.state.texteNouvelleAnnonce,
        }
        if(this.state.sujetNouvelleAnnonce && this.state.sujetNouvelleAnnonce !== '') {
          transaction.sujet = this.state.sujetNouvelleAnnonce;
        }

        let domaine = 'Posteur.creerAnnonce';
        this.props.rootProps.websocketApp.transmettreTransaction(domaine, transaction)
        .then(reponse=>{
          if(reponse.err) {
            console.error("Erreur transaction");
          }

          // Reset formulaire
          this.setState({
            sujetNouvelleAnnonce: '',
            texteNouvelleAnnonce: '',
            compteCharsRestantsSujet: SUJET_CHARS_MAX,
            compteCharsRestantsTexte: TEXTE_CHARS_MAX,
          })
        })
        .catch(err=>{
          console.error("Erreur sauvegarde");
          console.error(err);
        });
      } else {
        console.error("Publier annonce, erreur: texte vide");
      }
    },
    supprimerAnnonce: event => {
      const uuid = event.currentTarget.value;
      let domaine = 'Posteur.supprimerAnnonce';

      let transaction = {uuid};
      this.props.rootProps.websocketApp.transmettreTransaction(domaine, transaction)
      .then(reponse=>{
        if(reponse.err) {
          console.error("Erreur transaction");
        }
      })
      .catch(err=>{
        console.error("Erreur suppression transaction");
        console.error(err);
      });
    }
  }

  update = {
    changerSujetNouvelleAnnonce: event => {
      let sujetNouvelleAnnonce = event.currentTarget.value;
      let compteCharsRestantsSujet = SUJET_CHARS_MAX - sujetNouvelleAnnonce.length;
      if(compteCharsRestantsSujet >= 0) {
        this.setState({sujetNouvelleAnnonce, compteCharsRestantsSujet});
      }
    },
    changerTexteNouvelleAnnonce: event => {
      let texteNouvelleAnnonce = event.currentTarget.value;
      let compteCharsRestantsTexte = TEXTE_CHARS_MAX - texteNouvelleAnnonce.length;
      if(compteCharsRestantsTexte >= 0) {
        this.setState({texteNouvelleAnnonce, compteCharsRestantsTexte});
      }
    }
  }

  chargerAnnoncesRecentes() {
    console.debug("Charger annonces existantes")
    let routingKey = 'Posteur.chargerAnnoncesRecentes';
    this.props.rootProps.websocketApp.transmettreRequete(routingKey, {})
    .then(annoncesRecentes => {
      this.setState({annoncesRecentes});
    })
    .catch(err=>{
      console.error("Erreur requete annonces recentes");
      console.error(err);
    });
  }

  _recevoirMessageAnnoncesRecentes = (routingKey, message) => {
    this.setState({annoncesRecentes: message});
  }

}

class RenderNouvelleAnnonce extends React.Component {

  state = {
    ouvrir: false,
  }

  render() {
    return (
      <Container className="w3-card w3-round w3-white w3-card_BR">
        <Row>
          <Col>
            <p><Trans>posteur.annonces.descriptionNouvelleAnnonce</Trans></p>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form className="formNouvelleAnnonce">
              <Form.Group controlId="formSujetAnnonce">
                <Form.Label><Trans>posteur.annonces.sujetNouvelleAnnonce</Trans></Form.Label>
                <Form.Control type="plaintext" placeholder="Un sujet (optionnel)"
                              value={this.props.sujetNouvelleAnnonce}
                              onChange={this.props.update.changerSujetNouvelleAnnonce} />
                <Form.Text className="text-muted">
                  <Trans values={{
                    restants: this.props.compteCharsRestantsSujet,
                    max: SUJET_CHARS_MAX
                  }}>
                    posteur.annonces.sujetNouvelleAnnonceInfo
                  </Trans>
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="formTexteAnnonce">
                <Form.Label><Trans>posteur.annonces.texteNouvelleAnnonce</Trans></Form.Label>
                <Form.Control type="plaintext" placeholder="Texte de l'annonce"
                              as="textarea" rows="4"
                              value={this.props.texteNouvelleAnnonce}
                              onChange={this.props.update.changerTexteNouvelleAnnonce} />
                <Form.Text className="text-muted">
                  <Trans values={{
                    restants: this.props.compteCharsRestantsTexte,
                    max: TEXTE_CHARS_MAX
                  }}>
                    posteur.annonces.texteNouvelleAnnonceInfo
                  </Trans>
                </Form.Text>
              </Form.Group>
              <Button onClick={this.props.actions.publierAnnonce} disabled={!this.props.rootProps.modeProtege}>
                <Trans>posteur.annonces.nouvelleAnnonceBoutonPublier</Trans>
              </Button>
            </Form>
          </Col>
        </Row>

      </Container>
    )
  }
}

function RenderAnnoncesRecentes(props) {

  const annonces = [];
  if(props.annoncesRecentes) {
    for(let idx in props.annoncesRecentes.annonces) {
      let annonce = props.annoncesRecentes.annonces[idx];

      var sujet, texte, dateElement;
      if(annonce.sujet) {
        sujet = (
          <h3 className="sujet-message">
            {annonce.sujet}
          </h3>
        );
      }
      if(annonce.texte) {
        texte = (
          <p className="texte-message">
            {annonce.texte}
          </p>
        );
      }
      if(annonce['_mg-creation']) {
        dateElement = renderDateModifiee(annonce['_mg-creation']);
      }

      annonces.push(
        <Row key={annonce.uuid} className="message">
          <Col sm={2}>
            {dateElement}
          </Col>
          <Col sm={9}>
            {sujet}
            {texte}
          </Col>
          <Col sm={1}>
            <Button onClick={props.supprimerAnnonce} value={annonce.uuid} disabled={!props.rootProps.modeProtege} variant="danger">
              <i className="fa fa-remove" />
            </Button>
          </Col>
        </Row>
      );
    }
  }

  return (
    <Container className="w3-card w3-round w3-white w3-card_BR">
      <Row>
        <Col>
          <h2 className="w3-opacity"><Trans>posteur.annonces.recentes</Trans></h2>
        </Col>
      </Row>

      {annonces}

    </Container>
  );
}

function renderDateModifiee(dateModifieeEpoch) {
  const anneeCourante = new Date().getFullYear();
  const dateModifiee = new Date(dateModifieeEpoch * 1000);
  let labelDate;
  if(dateModifiee.getFullYear() === anneeCourante) {
    labelDate = 'global.dateModifiee';
  } else {
    labelDate = 'global.dateAnneeModifiee';
  }

  var dateElement = (
    <div className="date-message">
      <div className="date-modifiee">
        <Trans values={{date: dateModifiee}}>{labelDate}</Trans>
      </div>
      <div className="heure-modifiee">
        <Trans values={{date: dateModifiee}}>global.heureModifiee</Trans>
      </div>
    </div>
  )

  return dateElement;
}
