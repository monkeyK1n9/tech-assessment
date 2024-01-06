class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    // discard invalid criteria
    if(typeof criteria !== "object" || Array.isArray(criteria)) return false;

    // iterate over criteria object and check for conditions with cart
    let isConditionValid = [];
    for(let i = 0; i < Object.entries(criteria).length; i++) {
      const obj = {
        [Object.entries(criteria)[i][0]] : Object.entries(criteria)[i][1]
      };
      // if obj key contains ".", we do the check down the chain
      if(Object.entries(criteria)[i][0].includes(".")) {
        const criteriaKey = Object.entries(criteria)[i][0].split(".");

        if(!Array.isArray(cart[criteriaKey[0]])) {
          if(!cart[criteriaKey[0]]) {
            isConditionValid.push(false);
            continue;
          }

          isConditionValid.push(this._checkCondition(cart[criteriaKey[0]][criteriaKey[1]], Object.entries(criteria)[i][1]))
          console.log(Object.entries(criteria)[i][0], Object.entries(criteria)[i][1])
        }
        else {
          // we loop over the array to perform the checks
          let arrChecks = [];
          for(let j = 0; j < cart[criteriaKey[0]].length; j++) {
            if(!cart[criteriaKey[0]][j]) {
              arrChecks.push(false);
              continue
            }
            arrChecks.push(this._checkCondition(cart[criteriaKey[0]][j][criteriaKey[1]], Object.entries(criteria)[i][1]))
          }

          // Now we reduce the arrChecks to validate check
          isConditionValid.push(arrChecks.reduce((accumulator, currentValue) => accumulator || currentValue, false));
          console.log(Object.entries(criteria)[i][0], Object.entries(criteria)[i][1])
        }
      } 
      else {
        if(cart[Object.entries(criteria)[i][0]] == undefined) {
          isConditionValid.push(false);
          continue;
        }
        isConditionValid.push(this._checkCondition(cart[Object.entries(criteria)[i][0]], Object.entries(criteria)[i][1]))
        console.log(Object.entries(criteria)[i][0], Object.entries(criteria)[i][1])
      }
    }
    const result = isConditionValid.reduce((accumulator, currentValue) => accumulator && currentValue, true);
    console.log("Checks: " + isConditionValid);
    return result;
  }

  /**
   * Step comparison of cart property and criteria value
   * @param {string | number} cartProperty 
   * @param {string | number | object} criteriaValue 
   * @returns {boolean} if cart property satisfies criteria
   */
  _checkCondition(cartProperty, criteriaValue) {
    // 1- Basic condition (eg: total: 20) matches when total == 20;
    if(
      typeof criteriaValue !== "object" && 
      typeof criteriaValue !== "function" && 
      typeof criteriaValue !== "symbol" && 
      typeof criteriaValue !== "undefined"
    ) {
      // this means criteriaValue is a number, string, boolean or bigint

      return cartProperty == criteriaValue
      
    }

    // 2- and, or and in checks
    const criteriaArr = Object.entries(criteriaValue);
    let tempChecks = [];

    for(let i = 0; i < criteriaArr.length; i++) {
      if(criteriaArr[i][0] == 'in') {
        tempChecks.push(criteriaArr[i][1].includes(cartProperty));
      }
      else if(criteriaArr[i][0] == 'and') {
        let andChecks = [];
        const andCheckArr = Object.entries(criteriaArr[i][1]);

        // now validate the gt, gte, lt, lte conditions
        for(let j = 0; j < andCheckArr.length; j++) {
          if(andCheckArr[i][0] !== 'in') {
            andChecks.push(this._validateInequality(andCheckArr[j][0], cartProperty, andCheckArr[j][1]));
          }
          else if(andCheckArr[j][0] == 'in') {
            andChecks.push(andCheckArr[j][1].includes(cartProperty));
          }
        }

        //push the and-result to the tempChecks
        tempChecks.push(andChecks.reduce((accumulator, currentValue) => accumulator && currentValue, true));
      }
      else if(criteriaArr[i][0] == 'or') {
        let orChecks = [];
        const orCheckArr = Object.entries(criteriaArr[i][1]);

        // now validate the gt, gte, lt, lte conditions
        for(let j = 0; j < orCheckArr.length; j++) {
          if(orCheckArr[j][0] !== 'in') {
            orChecks.push(this._validateInequality(orCheckArr[j][0], cartProperty, orCheckArr[j][1]));
          }
          else if(orCheckArr[j][0] == 'in') {
            orChecks.push(orCheckArr[j][1].includes(cartProperty));
          }
        }

        //push the and-result to the tempChecks
        tempChecks.push(orChecks.reduce((accumulator, currentValue) => accumulator || currentValue, false));
      }

      // 3- gt, gte, lt, lte checks
      else {
        tempChecks.push(this._validateInequality(criteriaArr[i][0], cartProperty, criteriaArr[i][1]))
      }
    }

    // after and, or and in checks, we return the result for this check
    return tempChecks.reduce((accumulator, currentValue) => accumulator && currentValue, true)
  }

  /**
   * Checks for the validity of the inequalities gt, gte, lt and lte
   * @param {string} type 
   * @param {string | number} valueChecked 
   * @param {number} limit 
   * @returns {boolean} inequality validity
   */
  _validateInequality(type, valueChecked, limit) {
    switch(type) {
      case "gt": return valueChecked > limit;
      case "gte": return valueChecked >= limit;
      case "lt": return valueChecked < limit;
      case "lte": return valueChecked <= limit;
      default: return false;
    }
  }

}

module.exports = {
  EligibilityService,
};

