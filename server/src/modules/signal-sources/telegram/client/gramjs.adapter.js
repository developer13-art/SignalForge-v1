'use strict';

const { EventEmitter } = require('node:events');
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage, EditedMessage, DeletedMessage } = require('telegram/events');

function toUserFields(user) {
  return {
    telegramUserId: user?.id?.toString?.() || null,
    telegramUsername: user?.username || null,
  };
}

function createGramJsTelegramAdapter({ apiId, apiHash, userId, session = '' }) {
  if (!apiId || !apiHash) {
    throw new Error('Telegram API ID and API hash are required');
  }

  const credentials = { apiId: Number(apiId), apiHash };
  let sessionString = typeof session === 'string' ? session : '';
  let client = new TelegramClient(new StringSession(sessionString), credentials.apiId, apiHash, {
    connectionRetries: 5,
  });
  let connected = false;

  async function ensureConnected() {
    if (!connected) {
      await client.connect();
      connected = true;
    }
  }

  async function replaceSession(nextSession) {
    if (typeof nextSession !== 'string' || nextSession === sessionString) {
      return;
    }
    if (connected) {
      await client.disconnect();
    }
    sessionString = nextSession;
    client = new TelegramClient(new StringSession(sessionString), credentials.apiId, apiHash, {
      connectionRetries: 5,
    });
    connected = false;
  }

  async function signIn({ phoneNumber, phoneCodeHash, code, password }) {
    await ensureConnected();
    let user;

    if (password) {
      user = await client.signInWithPassword(credentials, {
        password: async () => password,
        onError: async (error) => {
          throw error;
        },
      });
    } else {
      try {
        const authorization = await client.invoke(
          new Api.auth.SignIn({ phoneNumber, phoneCodeHash, phoneCode: code }),
        );
        if (authorization instanceof Api.auth.AuthorizationSignUpRequired) {
          throw new Error('Telegram account registration is required before connecting');
        }
        user = authorization.user;
      } catch (error) {
        if (error?.errorMessage === 'SESSION_PASSWORD_NEEDED' || error?.message?.includes('SESSION_PASSWORD_NEEDED')) {
          return { requiresPassword: true };
        }
        throw error;
      }
    }

    sessionString = client.session.save();
    return { sessionData: sessionString, ...toUserFields(user) };
  }

  return {
    async sendCode({ phoneNumber }) {
      await ensureConnected();
      return client.sendCode(credentials, phoneNumber);
    },
    signIn,
    async checkPassword({ password }) {
      return signIn({ password });
    },
    async isPasswordNeeded() {
      await ensureConnected();
      try {
        const result = await client.invoke(new Api.account.GetPassword());
        return Boolean(result?.hasPassword);
      } catch (_error) {
        return false;
      }
    },
    async listDialogs() {
      await ensureConnected();
      const dialogs = await client.getDialogs({});
      return dialogs.map((dialog) => ({
        id: dialog.id?.toString?.() || String(dialog.id),
        title: dialog.title || dialog.name || 'Telegram conversation',
        isChannel: Boolean(dialog.isChannel),
        isGroup: Boolean(dialog.isGroup),
      }));
    },
    async openListenerConnection({ sessionData, channelIds = [] }) {
      await replaceSession(sessionData);
      await ensureConnected();
      const emitter = new EventEmitter();
      const chats = channelIds.map(String);
      const onMessage = (event) => {
        const message = event.message;
        const channelId = message.peerId?.channelId || message.chatId || message.peerId?.chatId;
        emitter.emit('message', {
          messageId: message.id?.toString?.() || String(message.id),
          channelId: channelId?.toString?.() || String(channelId || ''),
          senderId: message.senderId?.toString?.() || null,
          text: message.message || '',
          timestamp: message.date ? new Date(Number(message.date) * 1000).toISOString() : new Date().toISOString(),
          media: message.media ? [message.media] : [],
        });
      };
      const onEdited = (event) => onMessage(event);
      const onDeleted = (event) => emitter.emit('deletedMessage', event);
      client.addEventHandler(onMessage, new NewMessage({ chats }));
      client.addEventHandler(onEdited, new EditedMessage({ chats }));
      client.addEventHandler(onDeleted, new DeletedMessage({ chats }));
      emitter.close = async () => {
        client.removeEventHandler(onMessage, new NewMessage({ chats }));
        client.removeEventHandler(onEdited, new EditedMessage({ chats }));
        client.removeEventHandler(onDeleted, new DeletedMessage({ chats }));
        await client.disconnect();
        connected = false;
        emitter.emit('close');
      };
      return emitter;
    },
    async downloadMedia(media) {
      await ensureConnected();
      return client.downloadMedia(media);
    },
    async destroy() {
      if (connected) {
        await client.disconnect();
        connected = false;
      }
    },
    get client() {
      return client;
    },
  };
}

module.exports = { createGramJsTelegramAdapter };