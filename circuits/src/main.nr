global N = 8;

fn main(price: [u64; N],  positions: [u64; N],cash: u64, total: pub u64) {
    let mut t: u64 = 0;
    for i in 0..N {
      t += price[i] * positions[i];
    };
    t += cash;
    assert(t == total);
}

#[test]
fn test_main() {
    let price = [10,20,30,0,0,0,0,0];
    let positions = [0,0,10,0,0,0,0,0];
    let cash = 0;
    let total = 300;
    main(price, positions, cash, total);
}

#[test]
fn test_main2() {
    let price = [0,4585,0,1650,7956,7649,0,39];
    let positions = [0,0,0,110,0,0,0,0];
    let cash = 1177565;
    let total = 1359065;
    main(price, positions, cash, total);
}

#[test(should_fail)]
fn test_main_failed() {
    let price = [10,20,30,0,0,0,0,0];
    let positions = [0,0,10,0,0,0,0,0];
    let cash = 0;
    let total = 0;
    main(price, positions, cash, total);
}

fn test_main_failed2() {
    let price = [10,20,30,0,0,0,0,0];
    let positions = [10000,0,10,0,30,0,40,70];
    let cash = 100;
    let total = 100300;
    main(price, positions, cash, total);
}