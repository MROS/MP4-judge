struct User {
	char name[33];
	unsigned int age;
	char gender[7];
	char introduction[1025];
};

int filter_function(struct User user) {
    unsigned long long int x = 1;
    for (unsigned long long int i = 0; i < 2e8; i++) {
        x = x ^ i;
    }
    return (x == 0);
}