import LRU from "lru-cache";

import { EventTypes } from "./events";

const messagesCache = LRU({
  max: 10000,
  maxAge: 60 * 60 * 1000
});

export function setupIncomingEvents(bp, xf) {
  const router = bp.getRouter("botpress-xenforo");

  router.get("/callback", (req, res) => {
    if (
      req.query["hub.mode"] === "subscribe" &&
      req.query["hub.topic"] === xf.getTopic()
    ) {
      res.status(200).send(req.query["hub.challenge"]);
    } else {
      xf._log("Failed validation", req.query);
      res.sendStatus(403);
    }
  });

  router.post("/callback", (req, res) => {
    const pings = req.body;
    if (!Array.isArray(pings)) {
      return;
    }

    const { clientId } = xf.getConfig();
    const topic = xf.getTopic();
    pings.forEach(ping => {
      if (ping.client_id !== clientId || ping.topic !== topic) {
        return;
      }

      const { object_data: d } = ping;
      if (!d || d.content_type !== "conversation") {
        return;
      }

      const { content_id: convoId, creator_user_id: userId, message } = d;
      if (!convoId || !userId || !message) {
        return;
      }

      const { message: text, message_id: messageId } = message;
      if (!text || !messageId) {
        return;
      }
      if (messagesCache.has(messageId)) {
        xf._log(
          "Skipped processing message %d from convo %d again",
          messageId,
          convoId
        );
        return;
      }
      messagesCache.set(messageId, true);

      const user = {
        first_name: d.creator_username,
        gender: null,
        id: `xenforo:${userId}`,
        last_name: null,
        locale: null,
        picture_url: d && d.links ? d.links.creator_avatar : null,
        platform: "xenforo",
        timezone: null
      };

      bp.middlewares.sendIncoming({
        convoId,
        messageId,
        platform: "xenforo",
        raw: ping,
        text,
        type: "message",
        user
      });

      xf._log("Incoming message %d from convo %d", messageId, convoId);
    });

    res.status(200).end();
  });
}
