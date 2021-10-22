class EligibilityService {
  _checkField(actualValue, expectedValue) {
    return actualValue == expectedValue;
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
      if (cart[field] === undefined) {
        return false;
      }

      if (!this._checkField(cart[field], criteria[field])) {
        return false;
      }
    }

    return true;
  }
}

module.exports = {
  EligibilityService,
};
