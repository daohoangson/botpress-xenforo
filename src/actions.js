import { EventTypes } from "./events";

export function createMessageOutgoingEvent(convoId, text) {
  const event = {
    convoId,
    platform: "xenforo",
    raw: { convoId, text },
    text,
    type: EventTypes.message
  };

  return event;
}
