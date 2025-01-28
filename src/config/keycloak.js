const Keycloak = require("keycloak-connect");
require("dotenv").config();

// Declare a variable to hold the Keycloak instance
let _keycloak;

// Function to initialize Keycloak
function initKeycloak(memoryStore, keycloakConfig) {
  if (_keycloak) {
    console.warn("Trying to init Keycloak again!");
    return _keycloak;
  } else {
    console.log("Initializing Keycloak...");
    
    _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
    return _keycloak;
  }
}

// Function to get the Keycloak instance
function getKeycloak() {
  if (!_keycloak) {
    console.error(
      "Keycloak has not been initialized. Please call init first."
    );
  }
  return _keycloak;
}

// Export the functions
module.exports = {
  initKeycloak,
  getKeycloak,
};
