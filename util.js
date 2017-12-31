module.exports = {
    all_true: function (arr) {
        return arr.filter((x) => x == true).length == arr.length;
    },
    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}