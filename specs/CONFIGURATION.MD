# Configuration

Some parameters of the application should be configurable.
- The base URL to Github, by default is the public Github, should be able to be configured to an Enterprise Github instance.
- The cache folder is by default `/tmp/.cache/issues-collector`, but it should be possible to be modified.
- The Github token is another configurable parameter.

All the configuration should be able to be modified by environment variables.

A convenient way to specify configurations will be the use of .env files. They will be defined at the application level. 
