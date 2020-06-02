import React from 'react';
import { Container, Form, Button, ListGroup, Row, Col } from 'react-bootstrap';
import { Trans } from 'react-i18next';

import { DateTimeFormatter } from '../components/reactFormatters';
import { InputTextMultilingue } from '../components/inputMultilingue';

const PREFIX_DATA_URL = 'data:image/jpeg;base64,';

export default class PlumeBlogs extends React.Component {

  state = {
    uuidBlogpost: '',
    nouveauBlogpost: false,
  }

  render() {
    if(this.state.uuidBlogpost || this.state.nouveauBlogpost) {
      return (
        <BlogPost
          uuidBlogpost={this.state.uuidBlogpost}
          setUuidBlogpost={this._setUuidBlogpost}
          retour={this._retour}
          {...this.props} />
      )
    } else {
      return (
        <ListeBlogposts
          nouveau={this._nouveauBlogpost}
          chargerBlogpost={this._chargerBlogpost}
          {...this.props} />
      );
    }
  }

  _nouveauBlogpost = event => {
    this.setState({uuidBlogpost: '', nouveauBlogpost: true});
  }

  _chargerBlogpost = event => {
    const uuidBlogpost = event.currentTarget.value;
    this.setState({uuidBlogpost});
  }

  _setUuidBlogpost = uuidBlogpost => {
    this.setState({uuidBlogpost});
  }

  _retour = event => {
    this.setState({uuidBlogpost: null, nouveauBlogpost: false})
  }

}

class ListeBlogposts extends React.Component {

  state = {
    startingIndex: 0,
    blogposts: [],
  }

  componentDidMount() {
    this.chargerListeBlogposts()
  }

  render() {
    return (
      <div>
        <Container>
          <Row>
            <Col>
              <h2 className="w3-opacity"><Trans>posteur.blogs.titre</Trans></h2>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button onClick={this.props.nouveau}>
                <Trans>posteur.blogs.nouveauBlogpost</Trans>
              </Button>
            </Col>
          </Row>
        </Container>

        <ListeBlogpostsDetail
          chargerListeBlogposts={this.chargerListeBlogposts}
          blogposts={this.state.blogposts}
          chargerBlogpost={this.props.chargerBlogpost}
          retirerBlogpost={this.retirerBlogpost}
          supprimerBlogpost={this.supprimerBlogpost}
          publierBlogpost={this.publierBlogpost}
          rootProps={this.props.rootProps} />

      </div>
    )
  }

  chargerListeBlogposts = async (event) => {

    let limit = 5;

    const currentIndex = this.state.startingIndex;
    const domaine = 'Posteur.chargerBlogposts';
    const requete = {currentIndex, limit};
    const resultBlogposts = await this.props.rootProps.websocketApp.transmettreRequete(domaine, requete)
    console.debug("Resultats requete");
    console.debug(resultBlogposts);

    let startingIndex = resultBlogposts.length + currentIndex;

    const blogposts = [...this.state.blogposts, ...resultBlogposts];
    this.setState({startingIndex, blogposts});
  }

  publierBlogpost = event => {
    let uuidBlogpost = event.currentTarget.value;
    // console.debug("Publier blogpost " + uuidBlogpost);
    const transaction = {
      uuid: uuidBlogpost
    }
    const domaine = 'Posteur.publierBlogpostVitrine';
    this.props.rootProps.websocketApp.transmettreTransaction(domaine, transaction)
    .then(reponse=>{
      if(reponse.err) {
        console.error("Erreur transaction");
      } else {
        const blogposts = this.state.blogposts.map(bp=>{
          // Enlever la date de publication du blogpost
          if(bp.uuid === uuidBlogpost) {
            let bpUpdated = Object.assign({}, bp);
            bpUpdated.datePublication = new Date().getTime();
            return bpUpdated;
          }
          return bp;
        })

        // Reset formulaire
        this.setState({blogposts});
      }
    })
    .catch(err=>{
      console.error("Erreur sauvegarde");
      console.error(err);
    });
  }

  retirerBlogpost = event => {
    let uuidBlogpost = event.currentTarget.value;
    // console.debug("Retirer blogpost " + uuidBlogpost);
    const transaction = {
      uuid: uuidBlogpost
    }
    const domaine = 'Posteur.retirerBlogpostVitrine';
    this.props.rootProps.websocketApp.transmettreTransaction(domaine, transaction)
    .then(reponse=>{
      if(reponse.err) {
        console.error("Erreur transaction");
      } else {
        const blogposts = this.state.blogposts.map(bp=>{
          // Enlever la date de publication du blogpost
          if(bp.uuid === uuidBlogpost) {
            let bpUpdated = Object.assign({}, bp);
            bpUpdated.datePublication = null;
            return bpUpdated;
          }
          return bp;
        })

        // Reset formulaire
        this.setState({blogposts});
      }
    })
    .catch(err=>{
      console.error("Erreur sauvegarde");
      console.error(err);
    });
  }

  supprimerBlogpost = event => {
    let uuidBlogpost = event.currentTarget.value;
    console.debug("Supprimer blogpost " + uuidBlogpost);

    const transaction = {
      uuid: uuidBlogpost
    }
    const domaine = 'Posteur.supprimerBlogpostVitrine';
    this.props.rootProps.websocketApp.transmettreTransaction(domaine, transaction)
    .then(reponse=>{
      if(reponse.err) {
        console.error("Erreur transaction");
      } else {
        const blogposts = this.state.blogposts.filter(bp=>{
          return bp.uuid !== uuidBlogpost
        })

        // Reset formulaire
        this.setState({blogposts});
      }
    })
    .catch(err=>{
      console.error("Erreur sauvegarde");
      console.error(err);
    });

  }

}

function ListeBlogpostsDetail(props) {

  var liste = null;
  if(props.blogposts) {
    liste = props.blogposts.map(bp=>{

      let boutonPublierRetirer;
      if(bp.datePublication) {
        // Deja publie, on affiche le bouton retirer
        boutonPublierRetirer = (
          <Button onClick={props.retirerBlogpost} value={bp.uuid} disabled={!props.rootProps.modeProtege}>
            <i className="fa fa-remove"/>
          </Button>
        );
      } else {
        // Pas publie, on affiche le bouton publier
        boutonPublierRetirer = (
          <Button onClick={props.publierBlogpost} value={bp.uuid} disabled={!props.rootProps.modeProtege}>
            <i className="fa fa-cloud-upload"/>
          </Button>
        );
      }

      return (
        <ListGroup.Item key={bp.uuid}>
          <Row>
            <Col sm={3} md={2}>
              <DateTimeFormatter date={bp['_mg-derniere-modification']}/>
            </Col>
            <Col sm={7} md={9}>
              <Button variant="link" onClick={props.chargerBlogpost} value={bp.uuid}>
                {bp.titre}
              </Button>
            </Col>
            <Col sm={2} md={1}>
              {boutonPublierRetirer}
              <Button variant="danger" onClick={props.supprimerBlogpost} value={bp.uuid} disabled={!props.rootProps.modeProtege}>
                <i className="fa fa-trash"/>
              </Button>
            </Col>
          </Row>
        </ListGroup.Item>
      )
    })
  }

  // console.debug('Liste');
  // console.debug(liste);

  return (
    <Container>
      <Row>
        <Col><h3>Liste blogposts</h3></Col>
      </Row>

      <ListGroup>
        {liste}
      </ListGroup>

      <Button onClick={props.chargerListeBlogposts}>
        <Trans>posteur.blogs.chargerBlogposts</Trans>
      </Button>

    </Container>
  );
}

class BlogPost extends React.Component {

  state = {
  }

  componentDidMount() {
    this.chargerBlogpost()
  }

  async chargerBlogpost() {
    if(this.props.uuidBlogpost) {
      console.debug("Chargement blogpost %s", this.props.uuidBlogpost)
      const domaine = 'Posteur.chargerBlogpost'
      const requete = {'uuidBlogpost': this.props.uuidBlogpost}

      const blogpost = await this.props.rootProps.websocketApp.transmettreRequete(domaine, requete)

      console.debug("Resultats requete chargement blogpost %s", this.props.uuidBlogpost);
      console.debug(blogpost);

      var champs = [
        'uuid', 'texte', 'titre', 'image', 'datePublication'
      ]

      const blogpostFiltre = {}
      for(let champ in blogpost) {
        var champsInclus = champs
          .filter(c=>{
            return champ.startsWith(c)
          })
          .forEach(champ=>{
            blogpost[champ] = blogpost[champ]
          })
      }

      this.setState({...blogpost})
    }
  }

  render() {

    return (
      <div>
        <Container>

          <Row>
            <Col><h2>Blogpost</h2></Col>
          </Row>

          <Row>
            <Col>
              <Button onClick={this.props.retour}>
                <Trans>global.retour</Trans>
              </Button>
            </Col>
          </Row>

          <Row>
            Publication:
            <DateTimeFormatter date={this.state.datePublication}/>
            <Button onClick={this.sauvegarder} variant='danger' value='publier' disabled={!this.props.rootProps.modeProtege}>
              <Trans>global.publier</Trans>
            </Button>
          </Row>

        </Container>

        <EntreeBlog blogpost={this.state}
          documentIdMillegrille={this.props.documentIdMillegrille}
          image={this.state.image}
          onTextChange={this._changerTexte}
          sauvegarder={this.sauvegarder}
          changerImage={this._changerImage} retirerImage={this._retirerImage}
          rootProps={this.props.rootProps} />

      </div>
    )
  }

  _changerTexte = event => {
    const {name, value} = event.currentTarget;
    const maj = {};
    maj[name] = value;
    this.setState(maj);
  }

  _retirerImage = event => {
    this.setState({image: null});
  }

  sauvegarder = event => {
    console.debug("Sauvegarder")
    // console.debug(this.state);

    let operation = event.currentTarget.value;
    let domaine = 'Posteur.majBlogpostVitrine'

    let transaction = {operation} // Cloner l'etat
    for(let key in this.state) {
      if( ! key.startsWith('_') ) transaction[key] = this.state[key]
    }

    console.debug(transaction)

    this.props.rootProps.websocketApp.transmettreTransaction(domaine, transaction)
    .then(reponse=>{
      if(reponse.err) {
        console.error("Erreur transaction majBlogpostVitrine");
      } else {
        if(!this.state.uuid) {
          // console.debug("Sauvegarder nouveau uuid");
          // console.debug(reponse);
          this.setUuidBlogpost(reponse['uuid-transaction']);
        }

        if(operation === 'publier') {
          // console.debug("Reponse publication")
          // console.debug(reponse);
          this.setState({datePublication: reponse.datePublication})
        }
      }
    })
    .catch(err=>{
      console.error("Erreur transaction majBlogpostVitrine");
      console.error(err);
    });
  }

  setUuidBlogpost = uuid => {
    this.setState({uuid})
  }

  _changerImage = event => {
    const form = event.currentTarget.form;
    const fuuidImage = form['image'].value;

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

      const image = {fuuid_preview, mimetype_preview, thumbnail};

      this.setState({image});
    });

  }

}

class EntreeBlog extends React.Component {

  render() {
    const blogpost = this.props.blogpost;
    const languePrincipale = this.props.rootProps.langue;
    const languesAdditionnelles = this.props.rootProps.languesAdditionnelles;

    return (
      <Container>
        <Row>
          <Col>
            <Form>

              <InputTextMultilingue
                controlId="titre" valuePrefix='titre'
                onChange={this.props.onTextChange}
                languePrincipale={languePrincipale}
                languesAdditionnelles={languesAdditionnelles}
                placeholder='Sans titre'
                contenu={blogpost}
                />

              <InputTextMultilingue
                controlId="texte" valuePrefix='texte'
                languePrincipale={languePrincipale}
                languesAdditionnelles={languesAdditionnelles}
                onChange={this.props.onTextChange}
                placeholder='Texte'
                contenu={blogpost}
                rows={15}
                />

              <AfficherImage controlId="image"
                image={this.props.image}
                changerImage={this.props.changerImage}
                retirerImage={this.props.retirerImage}
                rootProps={this.props.rootProps} />

              <Form.Row>
                <Col>
                  <Button onClick={this.props.sauvegarder} disabled={!this.props.rootProps.modeProtege}>
                    <Trans>global.sauvegarder</Trans>
                  </Button>
                </Col>
              </Form.Row>

            </Form>
          </Col>
        </Row>
      </Container>
    )
  }

}

// props :
//  - image
//  - controlId
//  - changerImage
//  - retirerImage
function AfficherImage(props) {

  var image;
  if(props.image) {
    image = (<img src={PREFIX_DATA_URL + props.image.thumbnail} alt="Thumbnail" />);
  }

  return (
    <div>
      <Form.Row>
        <Col sm={8}>
          <Form.Group controlId={props.controlId}>
          <Form.Label><Trans>posteur.vitrine.selectionnerImage</Trans></Form.Label>
            <Form.Control name="fuuid_image"
              placeholder="e.g. 90d22a60-3bea-11ea-a889-e7d8115f598f" />
          </Form.Group>
          <Form.Text>
            <Button onClick={props.changerImage} disabled={!props.rootProps.modeProtege}>
              <Trans>posteur.vitrine.changerImage</Trans>
            </Button>
            <Button onClick={props.retirerImage} variant="secondary" disabled={!props.rootProps.modeProtege}>
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
