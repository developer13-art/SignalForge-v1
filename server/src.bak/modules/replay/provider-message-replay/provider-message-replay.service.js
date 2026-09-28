/**
 * Provider Message Replay Service
 *
 * Reconstructs the journey of a single provider message from receipt
 * to whatever signal it produced. Useful for debugging parse issues.
 *
 * @module server/modules/replay/provider-message-replay/provider-message-replay.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { replayRepository } from '../replay.repository';

function parseEnvelope(envelope) {
  if (!envelope) {
    return null;
  }
  if (typeof envelope === 'string') {
    try {
      return JSON.parse(envelope);
    } catch (err) {
      return null;
    }
  }
  return envelope;
}

export async function buildProviderMessageReplay({ providerId, sourceId, externalMessageId, userId }) {
  if (!providerId || !externalMessageId) {
    throw new AppError('providerId and externalMessageId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const messages = await replayRepository.listSourceMessages({
    providerId,
    limit: 50,
  });

  const matchingMessage = messages.find(
    (m) => String(m.external_message_id) === String(externalMessageId),
  );

  if (!matchingMessage) {
    throw new AppError('Provider message not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const envelope = parseEnvelope(matchingMessage.envelope);

  const parsedSignalId = envelope && envelope.signalId ? envelope.signalId : null;

  let signalTimeline = null;
  if (parsedSignalId) {
    const signalEvents = await replayRepository.listSignalEvents({ signalId: parsedSignalId });
    signalTimeline = signalEvents.map((row) => ({
      id: row.id,
      source: 'signal_event',
      eventType: row.event_type,
      actorType: row.actor_type,
      actorId: row.actor_id,
      occurredAt: row.created_at,
      details: row.details,
    }));
  }

  return {
    message: {
      id: matchingMessage.id,
      sourceType: matchingMessage.source_type,
      sourceId: matchingMessage.source_id,
      externalMessageId: matchingMessage.external_message_id,
      text: matchingMessage.text,
      receivedAt: matchingMessage.created_at,
      envelope,
    },
    parsedSignalId,
    signalTimeline,
  };
}

export const providerMessageReplayService = {
  buildProviderMessageReplay,
};