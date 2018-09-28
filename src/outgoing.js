export async function sendMessage(xf, convoId, message) {
  xf.getToken()
    .then(token =>
      xf.fetchOne({
        method: "POST",
        uri: "conversation-messages",
        params: {
          conversation_id: convoId,
          fields_include: "message_id",
          message_body: message,
          oauth_token: token.access_token
        }
      })
    )
    .then(
      json =>
        xf._log(
          "Sent message %d for convo %d",
          json.message.message_id,
          convoId
        ),
      reason => console.error(reason)
    );
}
