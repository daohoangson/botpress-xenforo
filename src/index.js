import XenForo from "./xenforo";
import * as actions from "./actions";
import * as incoming from "./incoming";
import * as outgoing from "./outgoing";
import * as umm from "./umm";

let xf = null;

const outgoingMiddleware = (event, next) => {
  if (event.platform !== "xenforo") {
    return next();
  }

  switch (event.type) {
    case "message": {
      if (!event.convoId) {
        return next("Conversation ID missing in message event");
      }
      outgoing.sendMessage(xf, event.convoId, event.text);
      break;
    }
    default: {
      return next(`Unsupported event type: ${event.type}`);
    }
  }
};

module.exports = {
  config: {
    apiRoot: {
      type: "string",
      default: "",
      env: "XENFORO_API_ROOT",
      required: true
    },
    callbackUrl: {
      type: "string",
      default: "",
      env: "XENFORO_CALLBACK_URL",
      required: true
    },
    clientId: {
      type: "string",
      default: "",
      env: "XENFORO_CLIENT_ID",
      required: true
    },
    clientSecret: {
      type: "string",
      default: "",
      env: "XENFORO_CLIENT_SECRET",
      required: true
    },
    debug: {
      type: "bool",
      default: false,
      env: "XENFORO_DEBUG",
      required: false
    },
    username: {
      type: "string",
      default: "",
      env: "XENFORO_USERNAME",
      required: true
    },
    password: {
      type: "string",
      default: "",
      env: "XENFORO_PASSSWORD",
      required: true
    }
  },

  // eslint-disable-next-line no-unused-vars
  init: async (bp, configurator, helpers) => {
    bp.middlewares.register({
      description:
        "Sends out messages that targets platform = xenforo." +
        " This middleware should be placed at the end as it swallows events once sent.",
      handler: outgoingMiddleware,
      module: "botpress-xenforo",
      name: "xenforo.sendMessages",
      order: 100,
      type: "outgoing"
    });

    bp.xenforo = {};
    bp.xenforo.sendMessage = async (convoId, message) =>
      bp.middlewares.sendOutgoing(
        actions.createMessageOutgoingEvent(convoId, message)
      );
    bp.xenforo.createMessage = actions.createMessageOutgoingEvent;

    umm.registerUmmConnector(bp);
  },

  // eslint-disable-next-line no-unused-vars
  ready: async (bp, configurator, helpers) => {
    const config = await configurator.loadAll();
    xf = new XenForo(bp, config);

    const router = bp.getRouter("botpress-xenforo");
    router.get("/config", (_, res) => res.send(config));
    router.get("/token", (_, res) => xf.getToken().then(t => res.send(t)));

    incoming.setupIncomingEvents(bp, xf);
    await xf.init();
  }
};
