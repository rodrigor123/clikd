function logPageView(page) {
  window.cordova.plugins.firebase.analytics.logEvent("page_view", {page: page});
  window.cordova.plugins.firebase.analytics.setCurrentScreen(page);
};

function setUserProperty(name, value) {
  if (name == 'id') {
    window.cordova.plugins.firebase.analytics.setUserId(value);
  } else {
    window.cordova.plugins.firebase.analytics.setUserProperty(name, value);
  }
}

export default {
  logPageView,
  setUserProperty,
};