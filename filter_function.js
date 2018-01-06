module.exports = {
    always_true: "int filter_function(struct User user) { return 1; }",
    always_false: "int filter_function(struct User user) { return 0; }",
    match_with_age: function(age) {
        return `int filter_function(struct User user) { return user.age == ${age}; }`
    },
    busy_then_false: function(amount) {
        return `
int filter_function(struct User user) {
    unsigned long long int x = 1;
    for (unsigned long long int i = 0; i < ${amount}; i++) {
        x = x ^ i;
    }
    return (x == 0);
}
`;
    },
    busy_then_true: function(amount) {
        return `
int filter_function(struct User user) {
    unsigned long long int x = 1;
    for (unsigned long long int i = 0; i < ${amount}; i++) {
        x = x ^ i;
    }
    return !(x == 0);
}
`;
    },
    crash_between: function(left, right) {
        return `
int filter_function(struct User user) {
    int sum = 0;

    for (int i = ${left}; i <= ${right}; i++) {
        int a = 1000000 / (user.age - i);
        sum += a;
    }
    return sum;
}
`;
        
    }
}