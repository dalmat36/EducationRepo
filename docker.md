# Docker Education

## Basic Docker operations and commands:

### Create detached and interactive containers   

The following command runs a container with the latest nginx as a daemon background service. 

`docker run --detach --name web nginx:latest`

The following command runs a busybox container with the standard input stream open (stdin), with the --interactive option, and creates a virtual terminal, with the --tty option.

`docker run --interactive --tty --link web:web --name web_test busybox:1.29 /bin/sh`

### List containers on your system                  
### View container logs                  
### Stop and restart containers                  
### Reattach a terminal to a container                  
### Detach from an attached container

### Isolating programs from each other and injecting configuration

### Running multiple programs in a container 

### Durable containers and the container life cycle  

### Cleaning up

