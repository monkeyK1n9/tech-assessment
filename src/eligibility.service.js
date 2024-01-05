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
      return cart?.criteriaKey == criteriaValue
    }



    return false;
  }

}

module.exports = {
  EligibilityService,
};

