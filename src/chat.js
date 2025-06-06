import { sendMessage, sendMedia, getKeyboards } from './lib/telegram.js';
import { isValidAction, getActionCommand } from './lib/action_resolver.js';
import { MESSAGES } from './default_msgs.js';

/**
 * Helper: Fetch the partner for a given chat from the Durable Object.
 */
const getChatPartnerId = async (chatId, env) => {
  const objectId = env.MATCHMAKER.idFromName("main");
  const matchmaker = env.MATCHMAKER.get(objectId);
  const response = await matchmaker.fetch(
    new Request("https://dummy", {
      method: "POST",
      body: JSON.stringify({ type: "get_partner", chatId })
    })
  );
  const result = await response.json();
  return result.partnerId;
};

/**
 * Handles built-in replies (/male and /female).
 */
const builtInReplies = async (messageObj, type, env) => {
  const self_chat_id = messageObj.chat.id;
  const partner_chat_id = await getChatPartnerId(self_chat_id, env);
  if (partner_chat_id) {
    let msg = "";
    if (type === 'male') {
      msg = MESSAGES.male_reply;
    } else if (type === 'female') {
      msg = MESSAGES.female_reply;
    }
    await Promise.all([
      sendMessage(
        { chat: { id: self_chat_id } },
        `Bot 🤖 sent message to your partner: ${msg}`,
        getKeyboards(),
        env
      ),
      sendMessage(
        { chat: { id: partner_chat_id } },
        msg,
        undefined,
        env
      )
    ]);
  }
};

/**
 * Stops the current dialog by calling the Durable Object.
 */
const stop_current_dialog = async (messageObj, env) => {
  const self_chat_id = messageObj.chat.id;
  const partner_chat_id = await getChatPartnerId(self_chat_id, env);
  if (partner_chat_id) {
    const objectId = env.MATCHMAKER.idFromName("main");
    const matchmaker = env.MATCHMAKER.get(objectId);
    await matchmaker.fetch(
      new Request("https://dummy", {
        method: "POST",
        body: JSON.stringify({ type: "stop_dialog", chatId: self_chat_id })
      })
    );
    await sendMessage({ chat: { id: self_chat_id } }, MESSAGES.stop_a, getKeyboards('start'), env);
    await sendMessage({ chat: { id: partner_chat_id } }, MESSAGES.stop_b, getKeyboards('start'), env);
    await sendMessage({ chat: { id: self_chat_id } }, MESSAGES.feedback, getKeyboards('google_form'), env);
    await sendMessage({ chat: { id: partner_chat_id } }, MESSAGES.feedback, getKeyboards('google_form'), env);
  } else {
    await sendMessage(messageObj, MESSAGES.not_matched, getKeyboards('start'), env);
  }
};

/**
 * Stops search by calling the Durable Object.
 */
const stop_search = async (messageObj, env) => {
  const objectId = env.MATCHMAKER.idFromName("main");
  const matchmaker = env.MATCHMAKER.get(objectId);
  const self_chat_id = messageObj.chat.id;
  await matchmaker.fetch(
    new Request("https://dummy", {
      method: "POST",
      body: JSON.stringify({ type: "stop_search", chatId: self_chat_id })
    })
  );
  await sendMessage(messageObj, MESSAGES.stop_search, getKeyboards('start'), env);
};

/**
 * Initiates a search for a partner using the Durable Object.
 */
const searchAndMatchPartner = async (messageObj, env) => {
  const self_chat_id = messageObj.chat.id;

  await sendMessage(messageObj, MESSAGES.searching, getKeyboards('searching'), env);
  
  const objectId = env.MATCHMAKER.idFromName("main");
  const matchmaker = env.MATCHMAKER.get(objectId);
  const response = await matchmaker.fetch(
    new Request("https://dummy", {
      method: "POST",
      body: JSON.stringify({ type: "search", chatId: self_chat_id })
    })
  );
  
  const result = await response.json();
  
  if (result.status === "matched") {
    // If matched, send found message to both users.
    await sendMessage({ chat: { id: self_chat_id } }, MESSAGES.found, getKeyboards('builtin_replies'), env);
    await sendMessage({ chat: { id: result.partner } }, MESSAGES.found, getKeyboards('builtin_replies'), env);
  } else if (result.status === "waiting") {
    // User is waiting; they've already been informed.
  } else if (result.status === "already_matched") {
    await sendMessage(messageObj, MESSAGES.already_matched, getKeyboards('start'), env);
  }
};

/**
 * Forwards conversation messages to the matched partner.
 */
const handleConversation = async (messageObj, env) => {
  const chat_id = messageObj.chat.id;
  const partner_chat_id = await getChatPartnerId(chat_id, env);
  if (partner_chat_id) {
    if ('text' in messageObj) {
      await sendMessage({ chat: { id: partner_chat_id } }, messageObj.text, getKeyboards(), env);
    } else if ('sticker' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'sticker',
        messageObj.sticker.file_id,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined
      );
    } else if ('animation' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'animation',
        messageObj.animation.file_id,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined,
        messageObj.caption
      );
    } else if ('photo' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'photo',
        messageObj.photo,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined,
        messageObj.caption
      );
    } else if ('video' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'video',
        messageObj.video.file_id,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined,
        messageObj.caption
      );
    } else if ('video_note' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'videoNote',
        messageObj.video_note.file_id,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined
      );
    } else if ('voice' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'voice',
        messageObj.voice.file_id,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined
      );
    } else if ('audio' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'audio',
        messageObj.audio.file_id,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined,
        messageObj.caption
      );
    } else if ('document' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'document',
        messageObj.document.file_id,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined,
        messageObj.caption
      );
    } else if ('contact' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'contact',
        messageObj.contact,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined
      );
    } else if ('location' in messageObj) {
      await sendMedia(
        { chat: { id: partner_chat_id } },
        'location',
        messageObj.location,
        env,
        messageObj.has_media_spoiler ? { has_spoiler: true } : undefined
      );
    } else if ('poll' in messageObj) {
      await sendMessage(
        messageObj,
        MESSAGES.poll_not_supported,
        getKeyboards(),
        env
      );
    }
  } else {
    await sendMessage(messageObj, MESSAGES.not_matched, getKeyboards('start'), env);
  }
};

/**
 * Main chat handler for all Telegram updates.
 *
 * @param {object} messageObj - Raw message object received from Telegram.
 * @param {object} env - Cloudflare environment containing bindings such as
 *   `TELEGRAM_BOT_TOKEN` and the `MATCHMAKER` Durable Object stub.
 * @returns {Promise<void>} Resolves when the update has been processed.
 */
const chatHandler = async (messageObj, env) => {
  if (messageObj) {
    const messageText = (messageObj.text || '').trim().normalize('NFC');
    if (messageText.charAt(0) === '/') {
      const command = messageText.substr(1);
      switch (command) {
        case 'start':
          await sendMessage(messageObj, MESSAGES.start, getKeyboards('start'), env);
          await sendMessage(messageObj, MESSAGES.feedback, getKeyboards('google_form'), env);
          break;
        case 'search':
          return searchAndMatchPartner(messageObj, env);
        case 'stop_search':
          return stop_search(messageObj, env);
        case 'stop':
          await stop_current_dialog(messageObj, env);
          break;
        case 'next':
          await stop_current_dialog(messageObj, env);
          await searchAndMatchPartner(messageObj, env);
          break;
        case 'male':
          await builtInReplies(messageObj, 'male', env);
          break;
        case 'female':
          await builtInReplies(messageObj, 'female', env);
          break;
      }
      } else if (isValidAction(messageText)) {
        messageObj.text = `/${getActionCommand(messageText)}`;
        // Recursive call must pass env.
        return chatHandler(messageObj, env);
      } else if (messageText.startsWith('dev:shrikansh')) {
        if (messageText === "dev:shrikansh:stats") {
          return sendMessage(messageObj, `Stats not available in DO setup`, getKeyboards(), env);
        }
    } else {
      return handleConversation(messageObj, env);
    }
  }
};

export { chatHandler };
