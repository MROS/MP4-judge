module.exports = {
    always_true: "int filter_function(struct User user) { return 1; }",
    always_false: "int filter_function(struct User user) { return 0; }",
    match_with_age: function(age) {
        return `int filter_function(struct User user) { return user.age == ${age}; }`
    }
}