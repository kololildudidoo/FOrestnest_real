
export const PRICING = {
    BASE_PRICE: 120,
    EXTRA_ADULT: 15,
    EXTRA_CHILD: 10,
    PET_FEE: 20,
    FIREWOOD: 10,
    LATE_CHECKOUT: 20,
    INCLUDED_GUESTS: 2
};
  
export const calculateTotal = (
    nights: number, 
    adults: number, 
    children: number, 
    hasPets: boolean, 
    extras: { firewood: boolean; lateCheckout: boolean }
) => {
    const totalGuests = adults + children;
    const extraGuests = Math.max(0, totalGuests - PRICING.INCLUDED_GUESTS);
    const includedAdults = Math.min(adults, PRICING.INCLUDED_GUESTS);
    const remainingIncluded = Math.max(0, PRICING.INCLUDED_GUESTS - includedAdults);
    const includedChildren = Math.min(children, remainingIncluded);
    const extraAdults = Math.max(0, adults - includedAdults);
    const extraChildren = Math.max(0, children - includedChildren);
    
    const basePriceTotal = nights * PRICING.BASE_PRICE;
    const extraAdultTotal = extraAdults * PRICING.EXTRA_ADULT;
    const extraChildTotal = extraChildren * PRICING.EXTRA_CHILD;
    const extraPersonTotal = extraAdultTotal + extraChildTotal;
    const petTotal = hasPets ? PRICING.PET_FEE : 0;
    const extrasTotal = (extras.firewood ? PRICING.FIREWOOD : 0) + (extras.lateCheckout ? PRICING.LATE_CHECKOUT : 0);
    
    return {
        finalPrice: basePriceTotal + extraPersonTotal + petTotal + extrasTotal,
        breakdown: {
            basePriceTotal,
            extraPersonTotal,
            extraAdultTotal,
            extraChildTotal,
            petTotal,
            extrasTotal,
            extraGuests,
            extraAdults,
            extraChildren
        }
    };
};
