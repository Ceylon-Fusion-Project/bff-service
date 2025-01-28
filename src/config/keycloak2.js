const Keycloak = require('keycloak-connect');
let _keycloak;

module.exports = {
  initKeycloak: (app, config) => {
    if (_keycloak){
        console.warn("Trying to init Keycloak again!");
        return _keycloak;
    } 
        
    console.log("Initializing Keycloak...");
    _keycloak = new Keycloak({
      store: app.sessionStore}, config);

    // Token refresh middleware
    app.use((req, res, next) => {
      if (req.session?.keycloak?.token) {
        const token = req.session.keycloak.token;
        if (token.isExpired(5)) {
          _keycloak.grantManager.refresh(token)
            .then(grant => {
              req.session.keycloak = grant;
              next();
            })
            .catch(() => _keycloak.accessDenied(req, res));
          return;
        }
      }
      next();
    });

    return _keycloak;
  },

  getKeycloak: () => _keycloak
};