/**
 * Consensus Service
 *
 * Combines signals from multiple providers on the same symbol into a
 * single voted decision.
 *
 * @module signalforge/server/modules/consensus/service
 */

import { ConsensusRepository } from './consensus.repository.js';
import { VotingService } from './voting.service.js';
import { AgreementCalculatorService } from './agreement-calculator.service.js';
import { ConflictResolverService } from './conflict-resolver.service.js';
import { StrategyService } from './strategy.service.js';
import {
  CONSENSUS_OUTCOMES,
  CONSENSUS_DIRECTIONS,
  VOTING_STRATEGIES,
  DEFAULT_MINIMUM_PARTICIPANTS,
  DEFAULT_MINIMUM_AGREEMENT,
  DEFAULT_CONSENSUS_WINDOW_MINUTES,
} from './consensus.constants.js';
import {
  InsufficientParticipantsError,
  ConsensusConflictError,
  NoConsensusError,
  ConsensusComputationError,
} from './consensus.errors.js';
import {
  emitConsensusStarted,
  emitConsensusReached,
  emitConsensusFailed,
  emitConsensusConflictDetected,
  emitConsensusInsufficientParticipants,
  emitConsensusMemberAdded,
  emitConsensusDecisionMade,
} from './consensus.events.js';
import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';

export class ConsensusService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ConsensusRepository();
    this.voting = dependencies.voting || new VotingService();
    this.agreement = dependencies.agreement || new AgreementCalculatorService();
    this.conflictResolver = dependencies.conflictResolver || new ConflictResolverService();
    this.strategy = dependencies.strategy || new StrategyService();
  }

  async computeConsensus(signals, options = {}) {
    if (!Array.isArray(signals) || signals.length === 0) {
      throw new ConsensusComputationError('Signals array is required');
    }

    const symbol = options.symbol
      ? normalizeSymbol(options.symbol)
      : normalizeSymbol(signals[0].symbol);
    if (!symbol) {
      throw new ConsensusComputationError('Symbol could not be determined');
    }

    await emitConsensusStarted(symbol, { participantCount: signals.length });

    const minimumParticipants = options.minimumParticipants ?? DEFAULT_MINIMUM_PARTICIPANTS;
    if (signals.length < minimumParticipants) {
      await emitConsensusInsufficientParticipants(symbol, signals.length, minimumParticipants);
      throw new InsufficientParticipantsError(
        `At least ${minimumParticipants} participants are required`,
        { participantCount: signals.length, minimumParticipants },
      );
    }

    const members = signals.map((signal) => ({
      signalId: signal.signalId || signal.id || null,
      providerId: signal.providerId,
      direction: signal.direction,
      confidence: signal.confidence ?? 0.5,
      reputation: signal.providerReputation ?? 1.0,
      weight: 1,
    }));

    const votingStrategy = options.votingStrategy || VOTING_STRATEGIES.WEIGHTED_BY_CONFIDENCE;
    const vote = this.voting.tally(members, votingStrategy);
    const agreementDetails = this.agreement.compute(members);

    const conflict = this.conflictResolver.detect(members);
    if (conflict.conflicting) {
      await emitConsensusConflictDetected(symbol, conflict);
    }

    const windowStart = options.windowStart || new Date(Date.now() - DEFAULT_CONSENSUS_WINDOW_MINUTES * 60 * 1000);
    const windowEnd = options.windowEnd || new Date();

    const outcome =
      vote.direction !== CONSENSUS_DIRECTIONS.NO_CONSENSUS &&
      vote.agreement >= (options.minimumAgreement ?? DEFAULT_MINIMUM_AGREEMENT)
        ? CONSENSUS_OUTCOMES.REACHED
        : CONSENSUS_OUTCOMES.FAILED;

    const stored = await this.repository.createConsensus({
      symbol,
      normalizedSymbol: symbol,
      direction: vote.direction,
      agreementScore: vote.agreement,
      confidenceScore: agreementDetails.averageConfidence,
      result: outcome,
      participantCount: members.length,
      windowStart,
      windowEnd,
      strategy: votingStrategy,
      weights: {
        buyWeight: vote.buyWeight,
        sellWeight: vote.sellWeight,
        totalWeight: vote.totalWeight,
      },
      metadata: {
        conflict,
        consensusStrength: agreementDetails.consensusStrength,
      },
    });

    for (const member of members) {
      await this.repository.addMember({
        consensusId: stored.id,
        signalId: member.signalId,
        providerId: member.providerId,
        direction: member.direction,
        weight: member.weight,
        confidence: member.confidence,
        reputation: member.reputation,
      });
      await emitConsensusMemberAdded(stored.id, member.providerId, member.direction);
    }

    if (outcome === CONSENSUS_OUTCOMES.REACHED) {
      await emitConsensusReached(symbol, stored.id, {
        direction: vote.direction,
        agreementScore: vote.agreement,
        confidenceScore: agreementDetails.averageConfidence,
      });
      await emitConsensusDecisionMade(stored.id, {
        direction: vote.direction,
        agreement: vote.agreement,
      });
    } else {
      await emitConsensusFailed(symbol, 'AGREEMENT_BELOW_THRESHOLD', {
        agreement: vote.agreement,
      });
    }

    return {
      consensusId: stored.id,
      symbol,
      direction: vote.direction,
      agreement: vote.agreement,
      confidenceScore: agreementDetails.averageConfidence,
      participantCount: members.length,
      result: outcome,
      votingStrategy,
      vote,
      agreementDetails,
      conflict,
      windowStart,
      windowEnd,
    };
  }

  async getById(consensusId) {
    const row = await this.repository.findConsensusById(consensusId);
    if (!row) {
      throw new NoConsensusError('Consensus record not found');
    }
    const members = await this.repository.listMembers(consensusId);
    return { consensus: this.serialize(row), members: members.map((m) => this.serializeMember(m)) };
  }

  async listMembers(consensusId) {
    const members = await this.repository.listMembers(consensusId);
    return members.map((m) => this.serializeMember(m));
  }

  async list(filters, pagination) {
    const result = await this.repository.listConsensus(filters, pagination);
    return {
      consensus: result.consensus.map((c) => this.serialize(c)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async stats(filters) {
    const [byResult, byDirection] = await Promise.all([
      this.repository.countByResult(filters),
      this.repository.countByDirection(filters),
    ]);
    return { byResult, byDirection };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      symbol: row.symbol,
      normalizedSymbol: row.normalized_symbol,
      direction: row.direction,
      agreementScore: row.agreement_score,
      confidenceScore: row.confidence_score,
      result: row.result,
      participantCount: row.participant_count,
      windowStart: row.window_start,
      windowEnd: row.window_end,
      strategy: row.strategy,
      weights: row.weights,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }

  serializeMember(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      consensusId: row.consensus_id,
      signalId: row.signal_id,
      providerId: row.provider_id,
      direction: row.direction,
      weight: row.weight,
      confidence: row.confidence,
      reputation: row.reputation,
      createdAt: row.created_at,
    };
  }
}

export default ConsensusService;