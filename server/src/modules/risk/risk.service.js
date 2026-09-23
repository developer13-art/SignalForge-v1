/**
 * Risk Service (facade)
 *
 * @module signalforge/server/modules/risk/service
 */

import { RiskRepository } from './risk.repository.js';
import { DecisionService } from './decision/decision.service.js';
import { DecisionRepository } from './decision/decision.repository.js';
import { RiskProfileService } from './profile/risk-profile.service.js';
import { PositionSizeService } from './calculator/position-size.service.js';
import { LotSizeCalculatorService } from './calculator/lot-size-calculator.service.js';
import { ExposureCalculatorService } from './calculator/exposure-calculator.service.js';
import { PipValueService } from './calculator/pip-value.service.js';
import { SymbolSpecService } from './market-data/symbol-spec.service.js';
import { SpreadService } from './market-data/spread.service.js';
import { SessionService } from './market-data/session.service.js';
import { NewsCalendarService } from './news/news-calendar.service.js';
import { NewsFilterService } from './news/news-filter.service.js';

export class RiskService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new RiskRepository();
    this.profileService = dependencies.profileService || new RiskProfileService();
    this.decisionService = dependencies.decisionService || new DecisionService({
      repository: new DecisionRepository(),
      profileService: this.profileService,
      positionSize: new PositionSizeService(),
    });

    this.lotSize = dependencies.lotSize || new LotSizeCalculatorService();
    this.positionSize = dependencies.positionSize || new PositionSizeService();
    this.exposure = dependencies.exposure || new ExposureCalculatorService();
    this.pipValue = dependencies.pipValue || new PipValueService();
    this.symbolSpec = dependencies.symbolSpec || new SymbolSpecService();
    this.spread = dependencies.spread || new SpreadService();
    this.session = dependencies.session || new SessionService();
    this.newsCalendar = dependencies.newsCalendar || new NewsCalendarService();
    this.newsFilter = dependencies.newsFilter || new NewsFilterService(this.newsCalendar);
  }

  async evaluate(signal, context) {
    return this.decisionService.evaluate(signal, context);
  }

  async getDecisionById(decisionId) {
    return this.decisionService.getById(decisionId);
  }

  async listDecisionsBySignal(signalId) {
    return this.decisionService.listBySignal(signalId);
  }

  async listDecisions(filters, pagination) {
    return this.decisionService.list(filters, pagination);
  }

  async decisionStats(filters) {
    return this.decisionService.stats(filters);
  }

  async listRiskEvents(filters, pagination) {
    const result = await this.repository.listRiskEvents(filters, pagination);
    return {
      events: result.events,
      limit: result.limit,
      offset: result.offset,
    };
  }

  calculateLotSize(params) {
    return this.lotSize.calculate(params);
  }

  calculatePositionSize(params) {
    return this.positionSize.calculate(params);
  }

  calculateExposure(openTrades, newTrade) {
    return this.exposure.calculate(openTrades, newTrade);
  }

  calculatePipDistance(symbol, price1, price2) {
    return this.pipValue.calculateDistanceInPips(symbol, price1, price2);
  }

  getSymbolSpec(symbol) {
    return this.symbolSpec.getSpec(symbol);
  }

  updateSpread(symbol, spreadPips) {
    this.spread.setSpread(symbol, spreadPips);
  }

  getSpread(symbol) {
    return this.spread.getSpread(symbol);
  }

  getActiveSessions(date) {
    return this.session.getActiveSessions(date);
  }

  setNewsEvents(events) {
    this.newsCalendar.setEvents(events);
  }
}

export default RiskService;