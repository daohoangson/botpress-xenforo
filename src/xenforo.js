import { apiFactory } from "tinhte-api";

const now = () => Math.round(new Date().getTime() / 1000);

// refresh token a bit early to avoid issue with server time differences
const getTokenExpiresAtOffset = 30;

export default class XenForo {
  constructor(bp, config) {
    if (!bp || !config) {
      throw new Error("You need to specify botpress and config");
    }

    this.setConfig(config);
    this.bp = bp;

    this.api = null;
    this.token = {};
    this.userId = 0;
  }

  init() {
    this.api = apiFactory(this.config);
    return this.subscribeUserNotification();
  }

  getConfig() {
    return this.config;
  }

  getToken() {
    const { api, config, token } = this;
    const { expiresAt, json } = token;
    const doDebug = this._getTokenDoDebug.bind(this);
    const doSave = this._getTokenDoSave.bind(this);

    if (expiresAt) {
      const refreshAt = expiresAt - getTokenExpiresAtOffset;
      if (refreshAt > now()) {
        this._log(
          "Reusing token %s, will refresh in %ds",
          json.access_token,
          refreshAt - now()
        );
        return Promise.resolve(json);
      }

      const { refresh_token: refreshToken } = json;
      if (refreshToken) {
        return api
          .refreshToken(config.clientSecret, refreshToken)
          .then(doDebug)
          .then(doSave);
      }
    }

    return api
      .login(config.clientSecret, config.username, config.password)
      .then(doDebug)
      .then(doSave);
  }

  getTopic() {
    return "user_notification_" + this.userId;
  }

  getUserId() {
    return this.userId;
  }

  setConfig(config) {
    this.config = Object.assign({}, this.config, config);
  }

  subscribeUserNotification() {
    const { api } = this;
    const { callbackUrl } = this.config;
    if (!callbackUrl) {
      throw new Error("Callback URL config is missing");
    }

    return this.getToken().then(token =>
      api
        .get({
          uri: "notifications",
          params: {
            oauth_token: token.access_token
          }
        })
        .then(json => {
          const { subscription_callback: jsonCallbackUrl } = json;
          if (jsonCallbackUrl === callbackUrl) {
            this._log(
              "Callback URL %s has already been setup",
              jsonCallbackUrl
            );
            return jsonCallbackUrl;
          }

          return api
            .post({
              uri: "subscriptions",
              params: {
                "hub.callback": callbackUrl,
                "hub.mode": "subscribe",
                "hub.topic": this.getTopic(),
                oauth_token: token.access_token
              },
              parseJson: false
            })
            .then(response => {
              if (response.status !== 202) {
                return response.text().then(text => {
                  throw new Error(response.status + " " + text);
                });
              }

              this._log(
                "Callback URL %s has been setup successfully",
                callbackUrl
              );
              return callbackUrl;
            });
        })
    );
  }

  fetchOne(...args) {
    return this.api.fetchOne.apply(this, args);
  }

  fetchMultiple(...args) {
    return this.api.fetchMultiple.apply(this, args);
  }

  _getTokenDoDebug(json) {
    this._log(json);
    return json;
  }

  _getTokenDoSave(json) {
    const { expires_in: expiresIn, user_id: userId } = json;
    if (!expiresIn || !userId) {
      throw new Error(
        "Token json does not contain expected data " + JSON.stringify(json)
      );
    }

    const expiresAt = now() + parseInt(expiresIn);
    this.token = { expiresAt, json };
    this.userId = parseInt(userId);

    return json;
  }

  _log(...args) {
    if (!this.config.debug) {
      return;
    }

    console.log.apply(this, args);
  }
}
