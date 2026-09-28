/**
 * Ticket Matcher
 *
 * @module signalforge/server/modules/trade-matching/matchers/ticket
 */

export class TicketMatcher {
  extractTicketFromMessage(message) {
    if (!message) {
      return null;
    }
    return (
      message.ticket ||
      message.brokerTicket ||
      message.broker_ticket ||
      message.positionId ||
      message.position_id ||
      null
    );
  }

  scoreTrade(trade, ticket) {
    if (!trade || !ticket) {
      return 0;
    }
    const target = String(ticket);
    const candidates = [
      trade.broker_ticket,
      trade.broker_position_id,
      trade.broker_order_id,
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (String(candidate) === target) {
        return 1;
      }
    }
    return 0;
  }

  scoreTrades(trades, ticket) {
    if (!Array.isArray(trades)) {
      return [];
    }
    return trades.map((trade) => {
      const score = this.scoreTrade(trade, ticket);
      return { trade, score, factors: { ticket: score } };
    });
  }
}

export default TicketMatcher;