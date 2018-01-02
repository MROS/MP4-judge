#include <dlfcn.h>
#include <stdio.h>

struct User {
	char name[33];
	unsigned int age;
	char gender[7];
	char introduction[1025];
};

int main() {
    void *handle = dlopen("./libfilter.so", RTLD_LAZY);
    int (*filter_function)(struct User) = (int (*)(struct User)) dlsym(handle, "filter_function");

    const char *dlsym_error = dlerror();
    if (dlsym_error) {
      fprintf(stderr, "Cannot load symbol 'filter_function': %s\n",
              dlsym_error);
      dlclose(handle);
      return 1;
    }

    struct User user;
    filter_function(user);
}