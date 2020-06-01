const debug = require('debug')('millegrilles:posteur:route')
const express = require('express')
const path = require('path')

const {WebSocketApp} = require('millegrilles.common/lib/websocketsapp')
const {SessionManagement} = require('millegrilles.common/lib/sessionManagement')

var _idmg = null
var _modeHebergement = false

// Demarrer gestion de sessions websockets
var _sessionManagement = null

// Application de gestion des evenements de Socket.IO
var _webSocketApp = null

const _info = {
  modeHebergement: false,
};

function initialiser(fctRabbitMQParIdmg, opts) {
  if(!opts) opts = {}

  if(opts.idmg) {
    // Pour mode sans hebergement, on conserve le IDMG de reference local
    _info.idmg = opts.idmg
  } else {
    // Pas d'IDMG de reference, on est en mode hebergement
    _info.modeHebergement = true
  }

  // Session management, utilise par /info.json et Socket.IO
  _sessionManagement = new SessionManagement(fctRabbitMQParIdmg);
  _sessionManagement.start();

  // Demarrer application qui s'occupe de Socket.IO pour Coup D'Oeil
  _webSocketApp = new WebSocketApp(_sessionManagement);

  const route = express()

  // Aucune fonctionnalite n'est disponible via REST, tout est sur socket.io
  route.get('/info.json', routeInfo)

  // Lien vers code React de CoupDoeil
  ajouterStaticRoute(route)

  // catch 404 and forward to error handler
  route.use(function(req, res, next) {
    res.status(404);
    res.end()
  });

  // error handler
  route.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.error(" ************** Unhandled error begin ************** ");
    console.error(err);
    console.error(" ************** Unhandled error end   ************** ");

    // render the error page
    res.status(err.status || 500);
    res.end()
  });

  // Ajouter parametres pour Socket.IO
  const socketio = {addSocket}

  return {route, socketio}
}

function ajouterStaticRoute(route) {
  var folderStatic =
    process.env.MG_POSTEUR_STATIC_RES ||
    '/usr/src/app/static/posteur'

  debug("Folder static pour posteur : %s", folderStatic)

  route.use(express.static(folderStatic))
}

// Fonction qui permet d'activer Socket.IO pour l'application
async function addSocket(socket) {
  await _webSocketApp.addSocket(socket);
}

function routeInfo(req, res, next) {

  const reponse = JSON.stringify(_info);
  res.setHeader('Content-Type', 'application/json');
  res.end(reponse);

};

module.exports = {initialiser};
