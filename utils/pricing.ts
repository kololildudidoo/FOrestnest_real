
export const PRICING = {
    BASE_PRICE: 120,
    EXTRA_PERSON: 15,
    PET_FEE: 20,
    FIREWOOD: 10,
    LATE_CHECKOUT: 40,
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
    
    const basePriceTotal = nights * PRICING.BASE_PRICE;
    const extraPersonTotal = extraGuests * PRICING.EXTRA_PERSON * nights;
    const petTotal = hasPets ? PRICING.PET_FEE : 0;
    const extrasTotal = (extras.firewood ? PRICING.FIREWOOD : 0) + (extras.lateCheckout ? PRICING.LATE_CHECKOUT : 0);
    
    return {
        finalPrice: basePriceTotal + extraPersonTotal + petTotal + extrasTotal,
        breakdown: {
            basePriceTotal,
            extraPersonTotal,
            petTotal,
            extrasTotal,
            extraGuests
        }
    };
};
