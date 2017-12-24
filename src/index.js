const axios = require('axios');

export default class MessengerClient {
  static get DEFAULT_API_VERSION() {
    return '2.11';
  }

  static get MESSAGING_TYPE_RESPONSE() {
    return 'RESPONSE';
  }

  static get MESSAGING_TYPE_UPDATE() {
    return 'UPDATE';
  }

  static get MESSAGING_TYPE_MESSAGE_TAG() {
    return 'MESSAGE_TAG';
  }

  static get MESSAGING_TYPE_NON_PROMOTIONAL_SUBSCRIPTION() {
    return 'NON_PROMOTIONAL_SUBSCRIPTION';
  }

  constructor({
    pageAccessToken,
    apiVersion = MessengerClient.DEFAULT_API_VERSION
  } = {}) {
    if (!pageAccessToken) {
      throw new Error('The pageAccessToken parameter is required.');
    }

    this.pageAccessToken = pageAccessToken;
    this.apiVersion = apiVersion;
    this.uri = `https://graph.facebook.com/v${this.apiVersion}/me/messages`;
  }

  sendText(
    recipientId,
    text,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendMessage(recipientId, { text }, messagingType);
  }

  sendImage(
    recipientId,
    url,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendAttachment(recipientId, url, 'image', messagingType);
  }

  sendAudio(
    recipientId,
    url,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendAttachment(recipientId, url, 'audio', messagingType);
  }

  sendVideo(
    recipientId,
    url,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendAttachment(recipientId, url, 'video', messagingType);
  }

  sendFile(
    recipientId,
    url,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendAttachment(recipientId, url, 'file', messagingType);
  }

  sendQuickReply(
    recipientId,
    text,
    replies,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendMessage(
      recipientId,
      {
        text,
        quick_replies: replies
      },
      messagingType
    );
  }

  sendButtonTemplate(
    recipientId,
    text,
    buttons,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendTemplate(
      recipientId,
      {
        template_type: 'button',
        text,
        buttons
      },
      messagingType
    );
  }

  sendGenericTemplate(
    recipientId,
    elements,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendTemplate(
      recipientId,
      {
        template_type: 'generic',
        elements
      },
      messagingType
    );
  }

  sendListTemplate(
    recipientId,
    topElementStyle,
    elements,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendTemplate(
      recipientId,
      {
        template_type: 'list',
        top_element_style: topElementStyle,
        elements
      },
      messagingType
    );
  }

  sendOpenGraphTemplate(
    recipientId,
    elements,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendTemplate(
      recipientId,
      {
        template_type: 'open_graph',
        elements
      },
      messagingType
    );
  }

  sendReceiptTemplate(
    recipientId,
    payload,
    elements,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendTemplate(
      recipientId,
      {
        ...payload,
        template_type: 'receipt',
        elements
      },
      messagingType
    );
  }

  sendMediaTemplate(
    recipientId,
    elements,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendTemplate(
      recipientId,
      {
        template_type: 'media',
        elements
      },
      messagingType
    );
  }

  sendReadReceipt(
    recipientId,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendAction(recipientId, 'mark_seen', messagingType);
  }

  sendTypingOn(
    recipientId,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendAction(recipientId, 'typing_on', messagingType);
  }

  sendTypingOff(
    recipientId,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendAction(recipientId, 'typing_off', messagingType);
  }

  sendAction(
    recipientId,
    action,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.send({
      messaging_type: messagingType,
      recipient: {
        id: recipientId
      },
      sender_action: action
    });
  }

  sendAttachment(
    recipientId,
    url,
    type = 'file',
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendMessage(
      recipientId,
      {
        attachment: {
          type,
          payload: { url }
        }
      },
      messagingType
    );
  }

  sendTemplate(
    recipientId,
    payload,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.sendMessage(
      recipientId,
      {
        attachment: {
          type: 'template',
          payload
        }
      },
      messagingType
    );
  }

  sendMessage(
    recipientId,
    message,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  ) {
    return this.send({
      messaging_type: messagingType,
      recipient: {
        id: recipientId
      },
      message
    });
  }

  send(data) {
    return new Promise((resolve, reject) => {
      axios
        .post(
          `https://graph.facebook.com/v${this.apiVersion}/me/messages`,
          data,
          {
            headers: {
              Authorization: `Bearer ${this.pageAccessToken}`
            }
          }
        )
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx.
            const { message, type, code } = error.response.data.error;
            reject(
              new Error(
                `Failed calling send API: [${code}][${type}] ${message}`
              )
            );
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and
            // an instance of http.ClientRequest in node.js
            reject(
              new Error('Failed calling send API, no response was received.')
            );
          } else {
            reject(error);
          }
        });
    });
  }
}
