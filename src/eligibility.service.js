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
        const unflattenObject = this.unflattenObject(obj);

        continue;
      } 
      else {
        isConditionValid.push(this.checkCondition(cart[Object.entries(criteria)[i][0]], Object.entries(criteria)[i][1]))
        console.log(Object.entries(criteria)[i][0], Object.entries(criteria)[i][1])
        console.log("Check without . : " + isConditionValid);
      }
    }
    const result = isConditionValid.reduce((accumulator, currentValue) => accumulator && currentValue, true);
    return result;
  }

  // flattenObject(obj) {
  //   let result = {};

  //   for(const i in obj) {
  //     // We check the type of the i using
  //     // typeof() function and recursively
  //     // call the function again
  //     if ((typeof obj[i]) === 'object' && !Array.isArray(obj[i])) {
  //       const temp = this.flattenObject(obj[i]);
  //       for (const j in temp) {

  //         // Store temp in result
  //         result[i + '.' + j] = temp[j];
  //       }
  //     }

  //     // Else store obj[i] in result directly
  //     else {
  //       result[i] = obj[i];
  //     }
  //   }
  //   return result;
  // }

  unflattenObject(obj, delimiter = ".") {
    const result = Object.keys(obj).reduce((res, k) => {
      k.split(delimiter).reduce(
        (acc, e, i, keys) =>
          acc[e] ||
          (acc[e] = isNaN(Number(keys[i + 1]))
            ? keys.length - 1 === i
              ? obj[k]
              : {}
            : []),
        res
      );
      return res;
    }, {});

    return result;
  }

  checkCondition(cartProperty, criteriaValue) {
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
            andChecks.push(this.validateInequality(andCheckArr[i][0], cartProperty, andCheckArr[i][1]));
          }
          else if(andCheckArr[i][0] == 'in') {
            andChecks.push(andCheckArr[i][1].includes(cartProperty));
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
          if(orCheckArr[i][0] !== 'in') {
            orChecks.push(this.validateInequality(orCheckArr[i][0], cartProperty, orCheckArr[i][1]));
          }
          else if(orCheckArr[i][0] == 'in') {
            orChecks.push(orCheckArr[i][1].includes(cartProperty));
          }
        }

        //push the and-result to the tempChecks
        tempChecks.push(orChecks.reduce((accumulator, currentValue) => accumulator || currentValue, false));
      }

      // 3- gt, gte, lt, lte checks
      else if(criteriaArr[i][0] == 'gt') {
        tempChecks.push(this.validateInequality("gt", cartProperty, orCheckArr[i][1]))
      }
      else if(criteriaArr[i][0] == 'gte') {
        tempChecks.push(this.validateInequality("gte", cartProperty, orCheckArr[i][1]))
      }
      else if(criteriaArr[i][0] == 'lt') {
        tempChecks.push(this.validateInequality("lt", cartProperty, orCheckArr[i][1]))
      }
      else if(criteriaArr[i][0] == 'lte') {
        tempChecks.push(this.validateInequality("lte", cartProperty, orCheckArr[i][1]))
      }
    }

    // after and, or and in checks, we return the result for this check
    return tempChecks.reduce((accumulator, currentValue) => accumulator && currentValue, true)
  }

  validateInequality(type, valueChecked, limit) {
    switch(type) {
      case "gt":
        return valueChecked > limit;
      case "gte":
        return valueChecked >= limit;
      case "lt":
        return valueChecked < limit;
      case "lte":
        return valueChecked <= limit;
      default:
        return false;
    }
  }

}

module.exports = {
  EligibilityService,
};

