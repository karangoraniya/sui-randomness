module sui_random::sui_random;

    use sui::random::{Self,Random};
    use sui::event;

    // ERRORS CODES
    const E_NO_ADDRESS: u64 = 1;
    const E_DUPLICATE_ADDRESS: u64 = 2;
    const E_INVALID_WINNER_COUNT: u64 = 3;


     // EVENT
    public struct WinnersSelected has copy, drop {
        num_winners: u64,
        winner_addresses: vector<address>
    }


    fun has_duplicates(addresses: &vector<address>): bool {
        let len = vector::length(addresses);
        let mut i = 0;
        while (i < len) {
            let mut j = i + 1;
            while (j < len) {
                if (*vector::borrow(addresses, i) == *vector::borrow(addresses, j)) {
                    return true
                };
                j = j + 1;
            };
            i = i + 1;
        };
        false
    }

    #[allow(lint(public_random))]
    public fun select_winners(
        addresses: &mut vector<address>,
        num_winners: u64,
        r: &Random,
        ctx: &mut TxContext
    ): vector<address> {
        let mut address_count = vector::length(addresses);
        assert!(address_count > 0, E_NO_ADDRESS);
        assert!(num_winners <= address_count, E_INVALID_WINNER_COUNT);

        assert!(!has_duplicates(addresses), E_DUPLICATE_ADDRESS);

        let mut generator = random::new_generator(r, ctx);
        let mut winners = vector::empty();

        let mut i = 0;
        while (i < num_winners) {
            if (address_count == 0) break;
            let index = random::generate_u64_in_range(&mut generator, 0, address_count - 1);
            let winner = vector::swap_remove(addresses, index);
            vector::push_back(&mut winners, winner);
            address_count = address_count - 1;
            i = i + 1;
        };
        

     // Emit the event with the selected winners
        event::emit(WinnersSelected {
             num_winners:num_winners, 
             winner_addresses: winners });

        winners
    }

   

