import { Keyboard, Key } from 'telegram-keyboard';
import { BUTTONS } from './action_resolver.js';

// This function returns keyboards as before.
const getKeyboards = (action = null) => {
  switch (action) {
    case 'start':
      return Keyboard.make([BUTTONS.SEARCH], { columns: 1 }).reply();
    case 'searching':
      return Keyboard.make([BUTTONS.STOP_SEARCH], { columns: 1 }).reply();
    case 'google_form':
      return Keyboard.make(
        [Key.url('Feedback/Suggestion', 'https://forms.gle/oc1V5op8Rgemhg219')],
        { columns: 1 }
      ).inline();
    case 'builtin_replies':
      return Keyboard.make([BUTTONS.MALE, BUTTONS.FEMALE], { columns: 2 }).reply();
    default:
      return { reply_markup: { remove_keyboard: true } };
  }
};

/**
 * Sends a message using native fetch.
 * @param {object} messageObj - The Telegram message object containing chat id.
 * @param {string} messageText - The text to send.
 * @param {object|null} keyboard - The keyboard object.
 * @param {object} env - The environment object containing TELEGRAM_BOT_TOKEN.
 */
const sendMessage = async (messageObj, messageText, keyboard = null, env) => {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  let body = {
    chat_id: messageObj.chat.id,
    text: messageText,
    reply_markup: keyboard ? keyboard.reply_markup : undefined,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
};

/**
 * Sends media using native fetch.
 * @param {object} messageObj - The Telegram message object containing chat id.
 * @param {string} mediaType - The type of media to send.
 * @param {any} media - The media data.
 * @param {object} env - The environment object containing TELEGRAM_BOT_TOKEN.
 * @param {object} [options] - Optional parameters for the send operation.
 * @param {string} [caption] - Optional caption text.
 */
const sendMedia = async (
  messageObj,
  mediaType,
  media,
  env,
  options = {},
  caption = null
) => {
  let endpoint = '';
  let data = { chat_id: messageObj.chat.id };

  switch (mediaType) {
    case 'sticker':
      endpoint = 'sendSticker';
      data.sticker = media;
      break;
    case 'animation':
      endpoint = 'sendAnimation';
      data.animation = media;
      break;
    case 'photo':
      endpoint = 'sendPhoto';
      // Assuming media is an array, choose the photo with the largest file size.
      let photoId = media.reduce(
        (prev, current) => (prev.file_size > current.file_size ? prev : current)
      ).file_id;
      data.photo = photoId;
      if (options.has_spoiler) {
        data.has_spoiler = true;
      }
      break;
    case 'video':
      endpoint = 'sendVideo';
      data.video = media;
      break;
    case 'videoNote':
      endpoint = 'sendVideoNote';
      data.video_note = media;
      break;
    case 'voice':
      endpoint = 'sendVoice';
      data.voice = media;
      break;
    case 'audio':
      endpoint = 'sendAudio';
      data.audio = media;
      break;
    case 'document':
      endpoint = 'sendDocument';
      data.document = media;
      break;
    case 'contact':
      endpoint = 'sendContact';
      Object.keys(media).forEach(key => {
        data[key] = media[key];
      });
      break;
    case 'location':
      endpoint = 'sendLocation';
      Object.keys(media).forEach(key => {
        data[key] = media[key];
      });
      break;
    default:
      throw new Error('Unsupported media type');
  }

  if (
    caption &&
    ['photo', 'video', 'animation', 'document', 'audio'].includes(mediaType)
  ) {
    data.caption = caption;
  }

  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export { sendMessage, sendMedia, getKeyboards };
