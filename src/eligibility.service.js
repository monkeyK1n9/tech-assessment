class EligibilityService {
  _applyInConditions(actualValue, inExpectedValues) {
    console.log('_applyInConditions', actualValue, inExpectedValues);
    if (!Array.isArray(inExpectedValues)) {
      throw new Error('"In" condition should be an array.')
    }
    const actualValueArray = Array.isArray(actualValue) ? actualValue : [actualValue];
    for (const value of actualValueArray) {
      if (inExpectedValues.includes(value)) {
        return true;
      }
    }
    return false;
  }

  _applyAndConditions(actualValue, andExpectedConditions) {
    console.log('_applyAndConditions', actualValue, andExpectedConditions);
    for (const conditionType in andExpectedConditions) {
      const expectedCondition = {};
      expectedCondition[conditionType] = andExpectedConditions[conditionType];
      if (!this._checkComplexConditions(actualValue, expectedCondition)) {
        return false;
      }
    }
    return true;
  }

  _applyOrConditions(actualValue, orExpectedConditions) {
    console.log('_applyOrConditions', actualValue, orExpectedConditions);
    for (const conditionType in orExpectedConditions) {
      const expectedCondition = {};
      expectedCondition[conditionType] = orExpectedConditions[conditionType];
      if (this._checkComplexConditions(actualValue, expectedCondition)) {
        return true;
      }
    }
    return false;
  }

  _applyConditions(actualValue, conditionType, expectedValue) {
    console.log('_applyConditions', actualValue, conditionType, expectedValue);
    switch (conditionType) {
      case 'gt': return actualValue > expectedValue;
      case 'gte': return actualValue >= expectedValue;
      case 'lt': return actualValue < expectedValue;
      case 'lte': return actualValue <= expectedValue;
      case 'in': return this._applyInConditions(actualValue, expectedValue);
      case 'and': return this._applyAndConditions(actualValue, expectedValue);
      case 'or': return this._applyOrConditions(actualValue, expectedValue);
      default: return false;
    }
  }

  _checkComplexConditions(actualValue, expectedCondition) {
    console.log('_checkComplexConditions', actualValue, expectedCondition);
    for (const conditionType in expectedCondition) {
      if (!this._applyConditions(actualValue, conditionType, expectedCondition[conditionType])) {
        return false;
      }
    }
    return true;
  }

  _checkField(actualValue, expectedValue) {
    console.log('_checkField', actualValue, expectedValue);
    if (typeof expectedValue === 'object') {
      return this._checkComplexConditions(actualValue, expectedValue);
    }

    return actualValue == expectedValue;
  }

  _findObjectValue(object, field) {
    const keys = field.split('.');
    if (keys.length === 1) {
      if (Array.isArray(object)) {
        return object.map((element) => element[field]);
      } else {
        return object[field];
      }
    } else {
      const firstKey = keys.shift();
      if (object[firstKey] === undefined) {
        return undefined;
      } else {
        return this._findObjectValue(object[firstKey], keys.join('.'));
      }
    }
  }

  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    for (const field in criteria) {
      console.log('field', field);
      const actualValue = this._findObjectValue(cart, field);
      if (actualValue === undefined) {
        console.log(`Undefined field ${field}.`);
        return false;
      }

      const expectedValue = criteria[field]
      if (!this._checkField(actualValue, expectedValue)) {
        console.log(`Wrong value for field ${field}.`);
        return false;
      }
    }

    return true;
  }
}

module.exports = {
  EligibilityService,
};
