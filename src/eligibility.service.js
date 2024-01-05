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
    let isConditionValid = false;
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
        isConditionValid = this.checkCondition(cart, Object.entries(criteria)[i][0], Object.entries(criteria)[i][1])
        console.log(cart, Object.entries(criteria)[i][0], Object.entries(criteria)[i][1])
        console.log("Check without . : " + isConditionValid);
        return isConditionValid;
      }

    }

    console.log(this.unflattenObject(criteria));
    return false;
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

  checkCondition(cart, criteriaKey, criteriaValue) {
    // 1- Basic condition (eg: total: 20) matches when total == 20;
    if(
      typeof criteriaValue !== "object" && 
      typeof criteriaValue !== "function" && 
      typeof criteriaValue !== "symbol" && 
      typeof criteriaValue !== "undefined"
    ) {
      // this means criteriaValue is a number, string, boolean or bigint
      if(
        criteriaKey !== "and" ||
        criteriaKey !== "or" ||
        criteriaKey !== "in" ||
        criteriaKey !== "gt" ||
        criteriaKey !== "gte" ||
        criteriaKey !== "lt" ||
        criteriaKey !== "lte"
      ) {

        return cart?.criteriaKey == criteriaValue
      }
    }

    // 2- gt, lt, gte, lte condition matches respectively when cart value is greater, lower, greater or equal, lower or equal;
    // we recursively check for down conditions
    let tempChecks = [];
    for(let i = 0; i < Object.entries(criteriaValue).length; i++) {
      if(typeof Object.entries(criteriaValue)[i][1] !== "object") {
        switch (Object.entries(criteriaValue)[i][0]) {
          case "gt":
            tempChecks.push(Object.entries(criteriaValue)[i][1] > cart?.criteriaKey);
            break;
          case "lt":
            tempChecks.push(Object.entries(criteriaValue)[i][1] < cart?.criteriaKey);
            break;
          case "gte":
            tempChecks.push(Object.entries(criteriaValue)[i][1] >= cart?.criteriaKey);
            break;
          case "lte":
            tempChecks.push(Object.entries(criteriaValue)[i][1] <= cart?.criteriaKey);
            break;
          default:
            tempChecks.push(false);
            break;
        }

        if(criteriaKey == 'and') return tempChecks.reduce((accumulator, currentValue) => accumulator && currentValue, true);
        if(criteriaKey == 'or') return tempChecks.reduce((accumulator, currentValue) => accumulator || currentValue, false);
        
      }
      else {
        if (!Array.isArray(Object.entries(criteriaValue)[i][1])) {
          switch (Object.entries(criteriaValue)[i][0]) {
            case "and":
              tempChecks.push(this.checkCondition(cart?.Object.entries(criteriaValue)[i][0], Object.entries(criteriaValue)[i][0], Object.entries(criteriaValue)[i][1]));
              break;
            case "or":
              tempChecks.push(this.checkCondition(cart?.Object.entries(criteriaValue)[i][0], Object.entries(criteriaValue)[i][0], Object.entries(criteriaValue)[i][1]));
              break;
            case "in":
              tempChecks.push(Object.entries(criteriaValue)[i][1].includes(cart?.Object.entries(criteriaValue)[i][0]));
              break;
            default:
              break;
          }
        }
      }
    }

    return false;
  }

}

module.exports = {
  EligibilityService,
};

