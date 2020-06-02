import React from 'react';
import { Container, Form, Button, ListGroup, InputGroup,
         Row, Col, Tabs, Tab } from 'react-bootstrap';
import { Trans } from 'react-i18next';

const ROUTING_VITRINE_ACCUEIL = 'evenement.Posteur.document.vitrine_accueil';
const subscriptions_plumeVitrine = [
  ROUTING_VITRINE_ACCUEIL
]

const PREFIX_DATA_URL = 'data:image/jpeg;base64,'

export default class PlumeVitrine extends React.Component {

  render() {
    return (
      <div>
        <TitreVitrine/>
        <SectionAccueil {...this.props}/>
      </div>
    )
  }

}

function TitreVitrine(props) {
  return (
    <Container>
      <Row>
        <Col>
          <h2 className="w3-opacity"><Trans>posteur.vitrine.titre</Trans></h2>
        </Col>
      </Row>
    </Container>
  )
}

class SectionAccueil extends React.Component {

  constructor(props) {
    super(props);

    this.languePrincipale = this.props.rootProps.langue
    this.languesAdditionnelles = this.props.rootProps.languesAdditionnelles

    this.languesListHelper = [
      '', ...this.languesAdditionnelles
    ]

    const state = {
      colonne: '',
      colonnes: [],
    }

    this.languesListHelper.forEach(l=>{
      let suffixe = ''
      if(l !== '') suffixe += '_' + l
      state['messageBienvenue' + suffixe] = ''
    })

    this.state = state;
  }

  componentDidMount() {
    this.props.rootProps.websocketApp.subscribe(subscriptions_plumeVitrine, this._recevoirMessageAccueil);
    this.chargerDocumentAccueil();
  }

  componentWillUnmount() {
    this.props.rootProps.websocketApp.unsubscribe(subscriptions_plumeVitrine);
  }

  render() {

    const messageBienvenue = this.languesListHelper.map(l=>{
      let suffixe = '', languePrepend = 'langues.' + l;
      if(l==='') {
        languePrepend = 'langues.' + this.languePrincipale;
      } else {
        suffixe = '_' + l;
      }

      return (
        <Form.Group key={languePrepend} controlId={"formMessageBienvenue" + suffixe}>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Text>
                <Trans>{languePrepend}</Trans>
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control name={'messageBienvenue' + suffixe}
                          value={this.state['messageBienvenue' + suffixe]}
                          onChange={this._changerBienvenue}
                          placeholder="Bienvenue sur Vitrine" />
          </InputGroup>
        </Form.Group>
      );
    })

    return (
      <Container>
        <Row><Col><h3><Trans>posteur.vitrine.sectionAccueil</Trans></h3></Col></Row>

        <Form>

          <p><Trans>posteur.vitrine.messageBienvenue</Trans></p>
          {messageBienvenue}

          <Row>
            <Col>
              <Button onClick={this.ajouterColonne}>
                <Trans>posteur.vitrine.ajouterColonne</Trans>
              </Button>
            </Col>
          </Row>

          <Tabs activeKey={this.state.colonne} onSelect={this._setColonne}>
            {this._renderAccueilColonnes()}
          </Tabs>

          <Form.Group controlId="formMessageBienvenue">
            <Button onClick={this.soumettre} value="sauvegarder" disabled={!this.props.rootProps.modeProtege}>
              <Trans>global.sauvegarder</Trans>
            </Button>
            <Button onClick={this.soumettre} variant="danger" value="publier" disabled={!this.props.rootProps.modeProtege}>
              <Trans>global.publier</Trans>
            </Button>
          </Form.Group>

        </Form>

      </Container>
    );
  }

  chargerDocumentAccueil() {
    const domaine = 'Posteur.chargerAccueil'
    return this.props.rootProps.websocketApp.transmettreRequete(domaine, {})
    .then( accueilVitrine => {
      this.extraireContenuAccueilVitrine(accueilVitrine)
    });
  }

  _recevoirMessageAccueil = (routingKey, doc) => {
    // console.debug("Recevoir fichier update");
    if(routingKey === ROUTING_VITRINE_ACCUEIL) {
      this.extraireContenuAccueilVitrine(doc)
    }
  }

  extraireContenuAccueilVitrine(accueilVitrine) {
    const majState = {};

    const champsMultilingue = ['messageBienvenue'];

    // Copier les champs multilingues "flat"
    for(let champ in accueilVitrine) {
      champsMultilingue.forEach(champMultilingue=>{
        if(champ.startsWith(champMultilingue)) {
          majState[champ] = accueilVitrine[champ];
        }
      })
    }

    if(accueilVitrine.portail) {
      for(let idxPortail in accueilVitrine.portail) {
        let section = accueilVitrine.portail[idxPortail];

        if(section.type === 'deck') {
          majState.colonnes = section.cartes;

          if(this.state.colonne === '') {
            majState.colonne = 'col0';
          }
        }
      }
    }

    // console.debug("MAJ state");
    // console.debug(majState);
    this.setState({...majState});
  }

  _renderAccueilColonnes() {
    const colonnes = [];
    for(let i in this.state.colonnes) {
      const colonne = this.state.colonnes[i];

      const inputGroupsTitre = [], inputGroupsTexte = [];
      this.languesListHelper.forEach(l => {
        let langue = l, suffix = l?'_'+l:'';
        if(!l) {
          langue = this.languePrincipale;
        }
        inputGroupsTitre.push(
          <InputGroupColonneTexte key={langue} col={i} texte={colonne['titre' + suffix]}
                             colname="titre" langue={langue} suffix={l}
                             changerTexteAccueil={this._changerTexteAccueil} />
        );
        inputGroupsTexte.push(
          <InputGroupColonneTexte key={langue} col={i} texte={colonne['texte' + suffix]}
                             langue={langue} suffix={l} rows={15}
                             changerTexteAccueil={this._changerTexteAccueil} />
        );
      })

      var liens = null;
      if(colonne.liens) {
        liens = colonne.liens.map((lien, idx)=>{
          return (
            <LiensColonne key={idx} idx={idx} col={i} lien={lien}
              languePrincipale={this.languePrincipale}
              languesAdditionnelles={this.languesAdditionnelles}
              changerTexteLien={this._changerTexteLien}
              supprimerLien={this._supprimerLien}
              {...this.props}
              />
          )
        });
      }

      const noCol = parseInt(i) + 1;
      colonnes.push(
        <Tab key={i} eventKey={"col" + i} title={"Colonne " + noCol}>
          <p><Trans>posteur.vitrine.accueilImage</Trans></p>
          <ImageColonne col={i} image={colonne.image}
            changerImage={this._changerImage}
            retirerImage={this._retirerImage}
            {...this.props} />

          <p><Trans>posteur.vitrine.accueilTitre</Trans></p>
          {inputGroupsTitre}

          <p><Trans>posteur.vitrine.accueilTexte</Trans></p>
          {inputGroupsTexte}

          <p><Trans>posteur.vitrine.accueilLiens</Trans></p>
          <ListGroup>
            {liens}
          </ListGroup>
          <Row>
            <Col>
              <Button onClick={this.ajouterLien} value={i}>
                <Trans>posteur.vitrine.ajouterLien</Trans>
              </Button>
            </Col>
          </Row>

        </Tab>
      )
    }

    return colonnes;
  }

  _setColonne = colonne => {
    this.setState({colonne});
  }

  _changerTexteAccueil = event => {
    let name = event.currentTarget.name;
    let col = event.currentTarget.dataset.col;
    let value = event.currentTarget.value;

    let colonnes = [...this.state.colonnes]; // Cloner
    let colonne = colonnes[col];
    colonne[name] = value;

    this.setState({colonnes});
  }

  _changerBienvenue = event => {
    let name = event.currentTarget.name;
    let value = event.currentTarget.value;

    let dictUpdate = {};
    dictUpdate[name] = value;

    this.setState(dictUpdate);
  }

  soumettre = event => {
    let operation = event.currentTarget.value;
    let domaine = 'Posteur.majAccueilVitrine';
    let transaction = {...this.state, operation}; // Cloner l'etat
    delete transaction.colonne; // Colonne est une valeur interne

    this.props.rootProps.websocketApp.transmettreTransaction(domaine, transaction)
    .then(reponse=>{
      if(reponse.err) {
        console.error("Erreur transaction majAccueilVitrine");
      }
    })
    .catch(err=>{
      console.error("Erreur transaction majAccueilVitrine");
      console.error(err);
    });
  }

  ajouterColonne = event => {
    var colonnes = this.state.colonnes;
    const champs = [
      'titre', 'texte'
    ]

    // Max de 3 colonnes
    if(colonnes.length < 3) {
      // Initialiser les valeurs
      const contenuColonne = {};
      this.languesListHelper.forEach(l=>{
        if(l !== '') l = '_' + l;
        champs.forEach(champ => contenuColonne[champ + l] = '' )
      })

      colonnes.push(contenuColonne);
    }

    // console.debug("Colonnes");
    // console.debug(colonnes);
    this.setState(colonnes);
  }

  ajouterLien = event => {
    var col = event.currentTarget.value;

    const colonnes = [...this.state.colonnes];  // Cloner colonnes
    var colonne = colonnes[col];

    if(!colonne.liens) {
      colonne.liens = [];
    }

    const contenuLien = {
      'url': ''
    };
    const champs = ['texte'];
    this.languesListHelper.forEach(l=>{
      if(l !== '') l = '_' + l;
      champs.forEach(champ => contenuLien[champ + l] = '' )
    })
    colonne.liens.push(contenuLien);

    // console.debug("Lien ajoute");
    // console.debug(colonnes);

    this.setState({colonnes});
  }

  _changerTexteLien = event => {
    const {name, value} = event.currentTarget;
    const {col, idx} = event.currentTarget.dataset;

    // console.debug("Changer texte lien " + name + ", col " + col + " no " + idx + " = " + value);

    const colonnes = [...this.state.colonnes];  // Cloner colonnes
    const colonne = colonnes[col];
    const lien = colonne.liens[idx];
    lien[name] = value;

    this.setState({colonnes});
  }

  _supprimerLien = event => {
    const {col, idx} = event.currentTarget.dataset;
    // console.debug("Supprimer lien " + idx + " de colonne " + col);

    const colonnes = [...this.state.colonnes];  // Cloner colonnes
    const colonne = colonnes[col];
    const liens = colonne.liens.filter((elem, idxElem) => {
      return ''+idxElem !== idx;
    });
    // console.debug(liens);

    if(liens.length > 0) {
      colonne.liens = liens;
    } else {
      delete colonne.liens
    }

    this.setState({colonnes});
  }

  _changerImage = event => {
    const {col} = event.currentTarget.dataset;
    const form = event.currentTarget.form;
    const fuuidImage = form['formImage' + col].value;

    if(!fuuidImage || fuuidImage === '') {
      return;  // Rien a faire, aucun fuuid
    }
    // console.debug("fuuid image ");
    // console.debug(fuuidImage);

    const domaine = 'GrosFichiers';
    const requete = {'requetes': [{
      'filtre': {
        '_mg-libelle': 'fichier',
        ['versions.' + fuuidImage]: {'$exists': true},
        'securite': '1.public',
      }
    }]};

    // console.debug("Requete");
    // console.debug(requete);

    return this.props.rootProps.websocketApp.transmettreRequete(domaine, requete)
    .then( docsRecu => {
      // console.debug("Resultats requete");
      let documentImage = docsRecu[0][0];
      const versionImage = documentImage.versions[fuuidImage];
      // console.debug(versionImage);
      const {fuuid_preview, mimetype_preview, thumbnail} = versionImage;

      const infoImage = {fuuid_preview, mimetype_preview, thumbnail};

      const colonnes = [...this.state.colonnes];  // Cloner colonnes
      const colonne = colonnes[col];
      colonne.image = infoImage;

      this.setState({colonnes});
    });

  }

  _retirerImage = event => {
    const {col} = event.currentTarget.dataset;
    const colonnes = [...this.state.colonnes];  // Cloner colonnes
    const colonne = colonnes[col];
    delete colonne.image;

    this.setState({colonnes});
  }

}

function InputGroupColonneTexte(props) {
  let texteColName = props.colname || 'texte';
  if(props.suffix && props.suffix !== '') {
    texteColName = texteColName + '_' + props.suffix;
  }

  let formControl;
  if(props.rows) {
    formControl = (
      <Form.Control placeholder="Sans Nom" as="textarea" rows={props.rows}
                  name={texteColName} value={props.texte} data-col={props.col}
                  onChange={props.changerTexteAccueil} />
    );
  } else {
    formControl = (
      <Form.Control placeholder="Sans Nom"
                    name={texteColName} value={props.texte}
                    onChange={props.changerTexteAccueil} data-col={props.col}/>
    );
  }

  return (
    <Form.Group controlId={"form" + texteColName + props.col}>
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text>
            <Trans>{'langues.' + props.langue}</Trans>
          </InputGroup.Text>
        </InputGroup.Prepend>
        {formControl}
      </InputGroup>
    </Form.Group>
  )
}

function LiensColonne(props) {
  const listeLangues = [props.languePrincipale, ...props.languesAdditionnelles]

  const listeTexte = listeLangues.map(l=>{
    let suffixe = l===props.languePrincipale?'':'_'+l;
    return (
      <Form.Group key={l} controlId={"formLienTexteCol" + props.col + '_' + l + "No" + props.idx}>
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text>
              <Trans>{'langues.' + l}</Trans>
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control placeholder="Description lien"
                      name={'texte' + suffixe} value={props.lien['texte'+suffixe]}
                      data-col={props.col} data-idx={props.idx}
                      onChange={props.changerTexteLien} />
        </InputGroup>
      </Form.Group>
    )
  })

  return (
    <ListGroup.Item>
      <Row>
        <Col sm={10}>
          {listeTexte}
          <Form.Group controlId={"formLienUrl" +  props.col + "No" + props.idx}>
            <InputGroup className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <Trans>global.url</Trans>
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control placeholder="https://millegrilles.com"
                          name="url" value={props.lien.url}
                          data-col={props.col} data-idx={props.idx}
                          onChange={props.changerTexteLien} />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col sm={1}>
          <Button variant="danger" onClick={props.supprimerLien}
              data-col={props.col} data-idx={props.idx}>
            <i className="fa fa-close"/>
          </Button>
        </Col>
      </Row>
    </ListGroup.Item>
  )
}

function ImageColonne(props) {

  var fuuid, image;
  if(props.image) {
    fuuid = props.image.fuuid;
    image = (<img src={PREFIX_DATA_URL + props.image.thumbnail} alt="Thumbnail" />);
  }

  return (
    <div>
      <Form.Row>
        <Col sm={8}>
          <Form.Group controlId={"formImage" +  props.col}>
          <Form.Label><Trans>posteur.vitrine.selectionnerImage</Trans></Form.Label>
            <Form.Control placeholder="e.g. 90d22a60-3bea-11ea-a889-e7d8115f598f"
                        name="fuuid" value={fuuid} data-col={props.col}
                        onChange={props.changerTexteLien} />
          </Form.Group>
          <Form.Text>
            <Button onClick={props.changerImage} data-col={props.col} disabled={!props.rootProps.modeProtege}>
              <Trans>posteur.vitrine.changerImage</Trans>
            </Button>
            <Button onClick={props.retirerImage} variant="secondary"
                data-col={props.col} disabled={!props.rootProps.modeProtege}>
              <Trans>posteur.vitrine.retirerImage</Trans>
            </Button>
          </Form.Text>
        </Col>
        <Col sm={4}>
          {image}
        </Col>
      </Form.Row>
    </div>
  );
}
