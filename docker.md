# Docker Education

## Basic Docker operations and commands:

### Create detached and interactive containers   

The following command runs a container with the latest nginx as a daemon background service. 

`docker run --detach --name web nginx:latest`

The following command runs a busybox container with the standard input stream open (stdin), with the --interactive option, and creates a virtual terminal, with the --tty option.

`docker run --interactive --tty --link web:web --name web_test busybox:1.29 /bin/sh`
Note: to exit the interactive terminal use: CTRL P then Q

What is [Busybox](https://hub.docker.com/_/busybox)? "The Swiss Army Knife of Embedded Linux"
[nginx](https://hub.docker.com/_/nginx) is a popular web server

### List containers on your system
The [docker ps](https://docs.docker.com/engine/reference/commandline/ps/) command will list currently running containers on the system

`docker ps`



### View container logs    
The [docker logs](https://docs.docker.com/engine/reference/commandline/logs/) command will display the current logs of the specified container. "Anything that the program writes to the stdout or stderr output streams will be recorded in this log. The problem with this pattern is that the log is never rotated or truncated by default, so the data written to the log for a container will remain and grow as long as the container exists." DockerInAction Ch2

`docker logs web`
### Stop and restart containers                  
### Reattach a terminal to a container                  
### Detach from an attached container

### Isolating programs from each other and injecting configuration

### Running multiple programs in a container 

### Durable containers and the container life cycle  

### Cleaning up

