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

  sendText({
    recipientId,
    text,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendMessage({
      recipientId,
      message: { text },
      messagingType
    });
  }

  sendImage({
    recipientId,
    url,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAttachmentFromUrl({
      recipientId,
      url,
      type: 'image',
      messagingType
    });
  }

  sendAudio({
    recipientId,
    url,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAttachmentFromUrl({
      recipientId,
      url,
      type: 'audio',
      messagingType
    });
  }

  sendVideo({
    recipientId,
    url,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAttachmentFromUrl({
      recipientId,
      url,
      type: 'video',
      messagingType
    });
  }

  sendFile({
    recipientId,
    url,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAttachmentFromUrl({
      recipientId,
      url,
      type: 'file',
      messagingType
    });
  }

  sendReadReceipt({
    recipientId,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAction({ recipientId, action: 'mark_seen', messagingType });
  }

  sendTypingOn({
    recipientId,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAction({ recipientId, action: 'typing_on', messagingType });
  }

  sendTypingOff({
    recipientId,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAction({
      recipientId,
      action: 'typing_off',
      messagingType
    });
  }

  sendQuickReplies({
    recipientId,
    text,
    replies,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendMessage({
      recipientId,
      message: {
        text,
        quick_replies: replies
      },
      messagingType
    });
  }

  sendButtons({
    recipientId,
    text,
    buttons,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendTemplate({
      recipientId,
      type: 'button',
      payload: {
        text,
        buttons
      },
      messagingType
    });
  }

  sendGeneric({
    recipientId,
    elements,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendTemplate({
      recipientId,
      type: 'generic',
      payload: {
        elements
      },
      messagingType
    });
  }

  sendList({
    recipientId,
    elements,
    topElementStyle = null,
    button = null,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    const payload = { elements };

    if (topElementStyle) {
      payload.top_element_style = topElementStyle;
    }

    if (button) {
      payload.buttons = [button];
    }

    return this.sendTemplate({
      recipientId,
      type: 'list',
      payload,
      messagingType
    });
  }

  sendMedia({
    recipientId,
    type,
    url,
    attachmentId,
    button,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    const payload = {
      elements: [
        {
          media_type: type,
          buttons: [button]
        }
      ]
    };

    if (url) {
      payload.elements[0].url = url;
    } else {
      payload.elements[0].attachment_id = attachmentId;
    }

    return this.sendTemplate({
      recipientId,
      type: 'media',
      payload,
      messagingType
    });
  }

  sendOpenGraph({
    recipientId,
    url,
    buttons,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendTemplate({
      recipientId,
      type: 'open_graph',
      payload: {
        elements: [
          {
            url,
            buttons
          }
        ]
      },
      messagingType
    });
  }

  sendReceipt({
    recipientId,
    recipientName,
    orderNumber,
    paymentMethod,
    summary,
    currency = 'USD',
    sharable = false,
    merchantName = null,
    timestamp = null,
    elements = null,
    address = null,
    adjustments = null,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    const payload = {
      recipient_name: recipientName,
      order_number: orderNumber,
      payment_method: paymentMethod,
      summary,
      currency,
      sharable
    };

    if (merchantName) {
      payload.merchant_name = merchantName;
    }

    if (timestamp) {
      payload.timestamp = timestamp;
    }

    if (elements) {
      payload.elements = elements;
    }

    if (address) {
      payload.address = address;
    }

    if (adjustments) {
      payload.adjustments = adjustments;
    }

    return this.sendTemplate({
      recipientId,
      type: 'receipt',
      payload,
      messagingType
    });
  }

  sendTemplate({
    recipientId,
    type,
    payload,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAttachment({
      recipientId,
      attachment: {
        type: 'template',
        payload: {
          template_type: type,
          ...payload
        }
      },
      messagingType
    });
  }

  sendAttachmentFromUrl({
    recipientId,
    url,
    type = 'file',
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendAttachment({
      recipientId,
      attachment: { type, payload: { url } },
      messagingType
    });
  }

  sendAttachment({
    recipientId,
    attachment,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.sendMessage({
      recipientId,
      message: { attachment },
      messagingType
    });
  }

  sendAction({
    recipientId,
    action,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
    return this.send({
      messaging_type: messagingType,
      recipient: {
        id: recipientId
      },
      sender_action: action
    });
  }

  sendMessage({
    recipientId,
    message,
    messagingType = MessengerClient.MESSAGING_TYPE_RESPONSE
  }) {
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
        .post(this.uri, data, this.getRequestConfig())
        .then(response => resolve(response.data))
        .catch(error => reject(MessengerClient.castToError(error)));
    });
  }

  getRequestConfig() {
    return {
      headers: {
        Authorization: `Bearer ${this.pageAccessToken}`
      }
    };
  }

  static castToError(error) {
    if (error.response) {
      const { message, type, code } = error.response.data.error;

      return new Error(
        `Failed calling send API: [${code}][${type}] ${message}`
      );
    }

    if (error.request) {
      return new Error('Failed calling send API, no response was received.');
    }

    return error;
  }
}
