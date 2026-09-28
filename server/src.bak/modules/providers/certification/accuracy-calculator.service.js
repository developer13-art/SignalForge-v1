/**
 * Certification Accuracy Calculator Service
 *
 * @module signalforge/server/modules/providers/certification/accuracy
 */

export class AccuracyCalculatorService {
  calculateParsingAccuracy(parsed, total) {
    const totalNum = Number(total || 0);
    if (totalNum === 0) {
      return 0;
    }
    const parsedNum = Number(parsed || 0);
    return Number((parsedNum / totalNum).toFixed(4));
  }

  calculateManagementAccuracy(managed, total) {
    const totalNum = Number(total || 0);
    if (totalNum === 0) {
      return 0;
    }
    const managedNum = Number(managed || 0);
    return Number((managedNum / totalNum).toFixed(4));
  }

  calculateValidationRate(validated, detected) {
    const detectedNum = Number(detected || 0);
    if (detectedNum === 0) {
      return 0;
    }
    const validatedNum = Number(validated || 0);
    return Number((validatedNum / detectedNum).toFixed(4));
  }

  summarize({
    historicalMessagesImported,
    signalsDetected,
    signalsParsed,
    signalsValidated,
    managementInstructionsDetected,
    managementInstructionsMatched,
  }) {
    const parsingAccuracy = this.calculateParsingAccuracy(
      signalsParsed,
      signalsDetected,
    );
    const managementAccuracy = this.calculateManagementAccuracy(
      managementInstructionsMatched,
      managementInstructionsDetected,
    );
    const validationRate = this.calculateValidationRate(
      signalsValidated,
      signalsDetected,
    );

    const overall = Number(
      ((parsingAccuracy + managementAccuracy + validationRate) / 3).toFixed(4),
    );

    return {
      parsingAccuracy,
      managementAccuracy,
      validationRate,
      overallAccuracy: overall,
      historicalMessagesImported: Number(historicalMessagesImported || 0),
      signalsDetected: Number(signalsDetected || 0),
      signalsValidated: Number(signalsValidated || 0),
    };
  }
}

export default AccuracyCalculatorService;