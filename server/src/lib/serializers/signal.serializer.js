/**
 * Signal Serializer
 *
 * @module server/lib/serializers/signal.serializer
 */

export function serializeSignal(signal) {
  if (!signal) {
    return null;
  }

  return {
    signalId: signal.id,
    providerId: signal.provider_id,
    symbol: signal.symbol,
    direction: signal.direction,
    entryType: signal.entry_type,
    entryPrice: signal.entry_price,
    stopLoss: signal.stop_loss,
    takeProfits: signal.take_profits ? (typeof signal.take_profits === 'string' ? JSON.parse(signal.take_profits) : signal.take_profits) : [],
    confidence: signal.confidence,
    classification: signal.classification,
    status: signal.status,
    parserType: signal.parser_type,
    aiModel: signal.ai_model,
    dnaVersion: signal.dna_version,
    createdAt: signal.created_at,
  };
}

export default serializeSignal;